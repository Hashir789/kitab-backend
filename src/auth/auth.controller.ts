import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { SignupVerifyOtpDto } from './dto/signup-verify-otp.dto';
import { SignupRequestOtpDto } from './dto/signup-request-otp.dto';
import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { isEmailAvailableDto } from './dto/is-email-available.dto';

@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Get('email/available')
  @HttpCode(HttpStatus.OK)
  async isEmailAvailable(@Query() query: isEmailAvailableDto) {
    return this.authService.isEmailAvailable(query);
  }

  @Post('signup/request-otp')
  @HttpCode(HttpStatus.OK)
  async signupRequestOtp(@Body() body: SignupRequestOtpDto) {
    return this.authService.signupRequestOtp(body);
  }

  @Post('signup/verify-otp')
  @HttpCode(HttpStatus.CREATED)
  async signupVerifyOtp(@Body() body: SignupVerifyOtpDto) {
    return this.authService.signupVerifyOtp(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}