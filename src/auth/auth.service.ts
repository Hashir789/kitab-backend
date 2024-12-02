import * as speakeasy from 'speakeasy';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'src/logger/logger.service';
import { UsersService } from 'src/users/users.service';
import { SignupVerifyOtpDto } from './dto/signup-verify-otp.dto';
import { SignupRequestOtpDto } from './dto/signup-request-otp.dto';
import { Injectable, UnauthorizedException, BadRequestException, HttpException } from '@nestjs/common';

@Injectable()
export class AuthService {

  private readonly transporter: nodemailer.Transporter;
  private readonly secret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly loggerService: Logger
  ) {
    this.secret = speakeasy.generateSecret({ length: 20 }).base32;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      }
    });
  }

  // Controller functions

  async signupRequestOtp(body: SignupRequestOtpDto): Promise<{ message: string; statusCode: number }> {
    try {
      this.loggerService.log('signupRequestOtp {controller}');
      await this.usersService.validateEmailAvailability(body.email)
      const otp = this.generateOtp();
      await this.sendEmail(
        body.email,
        'OTP Code for Kitaab',
        `Thank you for signing up. Your OTP code is ${otp}`
      );
      return { message: 'OTP sent successfully', statusCode: 200 };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async signupVerifyOtp(body: SignupVerifyOtpDto): Promise<{ message: string; accessToken: string; statusCode: number }> {
    try {
      this.loggerService.log('signupVerifyOtp {controller}');
      this.verifyOtp(body.otp);
      const hashedPassword = await this.hashPassword(body.password);
      const userInstance = await this.usersService.createUser(body.name, body.email, hashedPassword)
      const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY');
      const accessToken = this.jwtService.sign(
        { id: userInstance.id, name: userInstance.name, email: userInstance.email },
        { privateKey, algorithm: 'RS256' }
      );
      return { accessToken, message: 'User registered successfully', statusCode: 201 };  
    } catch (error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async login(body: LoginDto): Promise<{ message: string; accessToken: string; statusCode: number }> {
    try{
      this.loggerService.log('login {controller}');
      const userInstance = await this.usersService.getUser(body.email)
      await this.comparePasswords(body.password, userInstance.password)
      const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY');
      const accessToken = this.jwtService.sign(
        { id: userInstance.id, name: userInstance.name, email: userInstance.email },
        { privateKey, algorithm: 'RS256' }
      );
      return { accessToken, message: 'User logged in successfully', statusCode: 200 };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  // Helper functions

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    this.loggerService.log('sendEmail {helper}');
    const mailOptions = {
      from: `"${this.configService.get<string>('EMAIL_NAME')}" <${this.configService.get<string>('EMAIL_USER')}>`,
      to,
      subject,
      text,
    };
    await this.transporter.sendMail(mailOptions);
  }

  generateOtp(): string {
    this.loggerService.log('generateOtp {helper}');
    return speakeasy.totp({
      secret: this.secret,
      encoding: 'base32',
      digits: 4,
      step: 60,
      window: 1
    });
  }

  verifyOtp(enteredOtp: string): void {
    this.loggerService.log('verifyOtp {helper}');
    const isOtpValid = speakeasy.totp.verify({
      secret: this.secret,
      encoding: 'base32',
      token: enteredOtp,
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

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    this.loggerService.log('comparePasswords {helper}');
    const comparePasswords = compare(plainPassword, hashedPassword);
    if (!comparePasswords) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return comparePasswords;
  }
}