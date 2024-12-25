import * as speakeasy from 'speakeasy';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'src/logger/logger.service';
import { Toggle2FaDto } from './dto/toggle-2-fa.dto';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { AuthenticatedRequest } from './auth.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { SignupVerifyOtpDto } from './dto/signup-verify-otp.dto';
import { SignupRequestOtpDto } from './dto/signup-request-otp.dto';
import { IsEmailAvailableDto } from './dto/is-email-available.dto';
import { sendPasswordResetOtpDto } from './dto/send-password-reset-otp.dto';
import { Injectable, UnauthorizedException, BadRequestException, HttpException } from '@nestjs/common';
@Injectable()
export class AuthService {

  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly loggerService: Logger,
    private readonly redisService: RedisService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      }
    });
  }

  // Controller functions

  async isEmailAvailable(query: IsEmailAvailableDto): Promise<{ available: boolean, statusCode: number; message: string }> {
    try {
      const { email } = query;
      this.loggerService.log('isEmailAvailable {controller}');
      const result = await this.usersService.checkEmailAvailability(email);
      if (result)
        return { available: false, statusCode: 200, message: "Email is already taken" };
      return { available: true, statusCode: 200, message: "Email is available for use" };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async signupRequestOtp(body: SignupRequestOtpDto): Promise<{ message: string; statusCode: number }> {
    try {
      const { name, email, password } = body;
      this.loggerService.log('signupRequestOtp {controller}');
      const [otp, secret] = this.generateOtp();
      const userInstance: { name: string, email: string, password: string, secret: string } = {
        name, email, password, secret
      }
      const html: string = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #7d7dfa; text-align: center;">Your One-Time Password</h2>
          <p>Dear ${name},</p>
          <p>We received a request to secure your account with a One-Time Password (OTP). Please use the code below to complete your action:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #7d7dfa; background-color: #f9f9f9; padding: 10px 20px; border: 1px solid #ddd; border-radius: 4px;">${otp}</span>
          </div>
          <p><strong>Note:</strong> This OTP is valid for <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
          <p>If you did not request this OTP, please contact our support team immediately.</p>
          <p>Best regards,</p>
          <p><strong>${this.configService.get<string>('EMAIL_NAME')}</strong></p>
        </div>
      `;
      await Promise.all([
        this.redisService.set(`user:${email}`, JSON.stringify(userInstance)),
        this.sendEmail(body.email, 'OTP Code for Kitab', name, otp)
      ]);
      return { statusCode: 200, message: 'OTP sent successfully' };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async signupVerifyOtp(body: SignupVerifyOtpDto): Promise<{ message: string; accessToken: string; statusCode: number }> {
    try {
      const { email, otp } = body;
      this.loggerService.log('signupVerifyOtp {controller}');
      const userInstance = await this.redisService.get(`user:${email}`);
      await this.verifyOtp(userInstance.secret, otp);
      userInstance.password = await this.hashPassword(userInstance.password);
      const newUser = await this.usersService.createUser(userInstance);
      const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY');
      const accessToken = this.generateAccessToken(newUser, privateKey);
      return { accessToken, statusCode: 201, message: 'User registered successfully' };
    } catch (error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async login(body: LoginDto): Promise<{ message: string; accessToken: string; statusCode: number }> {
    try{
      const { email, password } = body;
      this.loggerService.log('login {controller}');
      const userInstance = await this.usersService.getUser(email);
      await this.comparePasswords(password, userInstance.password);
      const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY');
      const accessToken = this.generateAccessToken(userInstance, privateKey);
      return { accessToken, statusCode: 200, message: 'User logged in successfully' };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async verifyPassword(request: AuthenticatedRequest, body: VerifyPasswordDto): Promise<{ verified: boolean; statusCode: number; message: string }> {
    try {
      const { password } = body;
      const { email } = request.user;
      this.loggerService.log('verifyPassword {controller}');
      const userPassword: string = await this.usersService.getPasswordByEmail(email);
      const comparison = await this.comparePasswords(password, userPassword);
      if (comparison)
        return { verified: true, statusCode: 200, message: "Password verified successfully" };
      throw new BadRequestException('Invalid email or credentials');
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);    
    }
  }

  async resetPassword(request: AuthenticatedRequest, body: ResetPasswordDto): Promise<{ reset: boolean; statusCode: number; message: string }> {
    try {
      const { email } = request.user;
      const { password } = body;
      this.loggerService.log('resetPassword {controller}');
      const hashedPassword = await this.hashPassword(password);
      await this.usersService.updatePassword(email, hashedPassword);
      return { reset: true, statusCode: 200, message: "Password has been reset successfully" };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);    
    }
  }

  async toggle2fa(request: AuthenticatedRequest, body: Toggle2FaDto): Promise<{ toggle: boolean; statusCode: number; message: string }> {
    try {
      const { email, two_fa } = request.user;
      const { toggle } = body;
      this.loggerService.log('toggle2fa {controller}');
      if (toggle === two_fa) 
        return { toggle, statusCode: 200, message: `2FA has been ${ toggle ? 'enabled' : 'disabled' } successfully` };
      await this.usersService.update2fa(email, toggle);
      return { toggle, statusCode: 200, message: `2FA has been ${ toggle ? 'enabled' : 'disabled' } successfully` };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);    
    }
  }

  async sendPasswordResetOtp(query: sendPasswordResetOtpDto): Promise<{ email: string; statusCode: number; message: string }> {
    try {
      const { email } = query;
      this.loggerService.log('sendPasswordResetOtp {controller}');
      const userInstance = await this.usersService.getUserSecret(email);
      const otp = this.generateOtpBySecret(userInstance.secret);
      await this.redisService.set(`secret:${email}`, userInstance.secret);
      this.sendEmail(email, 'OTP Code for Kitab', userInstance.name, otp);
      return { email, statusCode: 200, message: "Email has been sent successfully" };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  // Helper functions

  async sendEmail(to: string, subject: string, name: string, otp: string): Promise<void> {
    this.loggerService.log('sendEmail {helper}');
    const html: string = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #7d7dfa; text-align: center;">Your One-Time Password</h2>
        <p>Dear ${name},</p>
        <p>We received a request to secure your account with a One-Time Password (OTP). Please use the code below to complete your action:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #7d7dfa; background-color: #f9f9f9; padding: 10px 20px; border: 1px solid #ddd; border-radius: 4px;">${otp}</span>
        </div>
        <p><strong>Note:</strong> This OTP is valid for <strong>5 minutes</strong>. For your security, please do not share this code with anyone.</p>
        <p>If you did not request this OTP, please contact our support team immediately.</p>
        <p>Best regards,</p>
        <p><strong>${this.configService.get<string>('EMAIL_NAME')}</strong></p>
      </div>
    `;
    const mailOptions = {
      from: `"${this.configService.get<string>('EMAIL_NAME')}" <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject,
      html
    };
    await this.transporter.sendMail(mailOptions);
  }

  generateOtp(): [string, string] {
    this.loggerService.log('generateOtp {helper}');
    let secret = speakeasy.generateSecret({ length: 20 }).base32;
    let otp = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      digits: 4,
      step: 60,
      window: 1
    });
    return [otp, secret];
  }

  generateOtpBySecret(secret: string): string {
    this.loggerService.log('generateOtp {helper}');
    let otp = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      digits: 4,
      step: 60,
      window: 1
    });
    return otp;
  }

  async verifyOtp(secret: string, otp: string): Promise<void> {
    this.loggerService.log('verifyOtp {helper}');
    const isOtpValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: otp,
      digits: 4,
      step: 60,
      window: 1
    });
    if ( !isOtpValid ) {
      throw new BadRequestException('Invalid OTP');
    }
  }

  async hashPassword(password: string): Promise<string> {
    this.loggerService.log('hashPassword {helper}');
    const saltRounds = 14;
    return hash(password, saltRounds);
  }

  generateAccessToken(newUser: { id: number; name: string; email: string }, privateKey: string): string {
    return this.jwtService.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      { privateKey, algorithm: 'RS256' }
    );
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    this.loggerService.log('comparePasswords {helper}');
    const comparePasswords = compare(plainPassword, hashedPassword);
    if (!comparePasswords) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return comparePasswords;
  }
}