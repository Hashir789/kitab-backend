import * as speakeasy from 'speakeasy';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { SignupVerifyOtpDto } from './dto/signup-verify-otp.dto';
import { SignupRequestOtpDto } from './dto/signup-request-otp.dto';
import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';


@Injectable()
export class AuthService {

  private readonly users = [
    { id: '1', username: 'testuser1', password: 'password1', email: "testuser1@gmail.com" },
    { id: '2', username: 'testuser2', password: 'password2', email: "testuser2@gmail.com" }
  ];

  private readonly transporter: nodemailer.Transporter;
  private readonly secret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
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

  // controller functions

  async signupRequestOtp(body: SignupRequestOtpDto) {
    const user = this.users.find(
      (user) => user.email === body.email
    );
    if (user) {
      throw new ConflictException('User with the given email already exists')
    }
    const emailResponse = await this.sendEmail(
      body.email,
      'OTP Code for Kitaab',
      `Thank you for signing up. Your OTP code is ${this.generateOtp()}`,
    );
    if (!emailResponse.success) {
      throw new InternalServerErrorException('Failed to send OTP');
    }
    return { message: 'OTP sent successfully', statusCode: 200 };
  }

  async signupVerifyOtp(body: SignupVerifyOtpDto) {
    if (!this.verifyOtp(body.otp)) {
    throw new BadRequestException('Invalid OTP');
    }
    body.password = await this.hashPassword(body.password)
    const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY') ?? '';
    return { message: 'User registered successfully', accessToken: this.jwtService.sign(body, { privateKey, algorithm: 'RS256' }), statusCode: 200 };
  }

  async login(body: LoginDto) {
    const user = await this.validateUser(body.email, body.password);
    const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY') ?? '';
    return {
      message: 'User login successfully', access_token: this.jwtService.sign(user, { privateKey, algorithm: 'RS256' }), statusCode: 200
    };
  }

  // helper functions

  async validateUser(email: string, password: string): Promise<{ id: string; username: string; password: string; email: string }> {
    const user = this.users.find(
      (u) => u.email === email && password
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async sendEmail(to: string, subject: string, text: string): Promise<{ success: boolean; }> {
    const mailOptions = {
      from: `"Hashir Malik" <${this.configService.get<string>('EMAIL_USER') ?? ''}>`,
      to,
      subject,
      text,
    };
    await this.transporter.sendMail(mailOptions);
    return { success: true }
  }

  generateOtp(): string {
    const otp = speakeasy.totp({
      secret: this.secret,
      encoding: 'base32',
      step: 60,
    });  
    return otp;
  }

  verifyOtp(enteredOtp: string): boolean {
    return speakeasy.totp.verify({
      secret: this.secret,
      encoding: 'base32',
      token: enteredOtp,
      step: 60,
    });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 14;
    return hash(password, saltRounds);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return compare(plainPassword, hashedPassword);  
  }
}