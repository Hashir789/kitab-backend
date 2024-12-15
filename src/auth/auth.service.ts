import * as speakeasy from 'speakeasy';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'src/logger/logger.service';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { SignupVerifyOtpDto } from './dto/signup-verify-otp.dto';
import { SignupRequestOtpDto } from './dto/signup-request-otp.dto';
import { Injectable, UnauthorizedException, BadRequestException, HttpException } from '@nestjs/common';
import { IsEmailAvailableDto } from './dto/is-email-available.dto';
import { PostgresService } from 'src/postgres/postgres.service';
import { VerifyPasswordDto } from './dto/verify-password.dto';

@Injectable()
export class AuthService {

  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly loggerService: Logger,
    private readonly redisService: RedisService,
    private readonly postgresService: PostgresService
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
      this.loggerService.log('isEmailAvailable {controller}');
      const result : { email: string }[] = await this.postgresService.query(
        `SELECT email FROM users WHERE email = $1`,
        [query.email],
      );
      if (result.length > 0) {
        return { available: false, statusCode: 200, message: "Email is already taken" };
      }
      return { available: true, statusCode: 200, message: "Email is available for use" };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);    
    }
  }

  async signupRequestOtp(body: SignupRequestOtpDto): Promise<{ message: string; statusCode: number }> {
    try {
      this.loggerService.log('signupRequestOtp {controller}');
      const otp = await this.generateOtp(body.email);
      await this.sendEmail(
        body.email,
        'OTP Code for Kitaab',
        `Thank you for signing up. Your OTP code is ${otp}`
      );
      return { statusCode: 200, message: 'OTP sent successfully' };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async signupVerifyOtp(body: SignupVerifyOtpDto): Promise<{ message: string; accessToken: string; statusCode: number }> {
    try {
      this.loggerService.log('signupVerifyOtp {controller}');
      let secret = await this.verifyOtp(body.email, body.otp);
      const hashedPassword = await this.hashPassword(body.password);
      const userInstance = await this.usersService.createUser(body.name, body.email, hashedPassword, secret);
      const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY');
      const accessToken = this.jwtService.sign(
        { id: userInstance.id, name: userInstance.name, email: userInstance.email },
        { privateKey, algorithm: 'RS256' }
      );
      return { accessToken, statusCode: 201, message: 'User registered successfully' };  
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
      return { accessToken, statusCode: 200, message: 'User logged in successfully' };
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async verifyPassword(request, query: VerifyPasswordDto): Promise<{ verified: boolean; statusCode: number; message: string }> {
    try {
      this.loggerService.log('verifyPassword {controller}');
      const result : { password: string }[] = await this.postgresService.query(
        `SELECT password FROM users WHERE email = $1`,
        [request.user.email],
      );
      const comparison = await this.comparePasswords(query.password, result[0].password);
      if (comparison) {
        return { verified: true, statusCode: 200, message: "Password verified successfully" };
      }
      return { verified: false, statusCode: 200, message: "Incorrect password" };
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

  async generateOtp(email: string): Promise<string> {
    this.loggerService.log('generateOtp {helper}');
    let secret = speakeasy.generateSecret({ length: 20 }).base32;
    await this.redisService.set(`secret:${email}`, secret)
    return speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      digits: 4,
      step: 60,
      window: 1
    });
  }

  async verifyOtp(email: string, enteredOtp: string): Promise<string> {
    this.loggerService.log('verifyOtp {helper}');
    let secret = await this.redisService.get(`secret:${email}`);
    const isOtpValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: enteredOtp,
      digits: 4,
      step: 60,
      window: 1
    });
    if ( !isOtpValid ) {
      throw new BadRequestException('Invalid OTP');
    }
    return secret;
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