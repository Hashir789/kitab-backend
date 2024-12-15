import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { SignupVerifyOtpDto } from './dto/signup-verify-otp.dto';
import { SignupRequestOtpDto } from './dto/signup-request-otp.dto';
import { IsEmailAvailableDto } from './dto/is-email-available.dto';
import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Req, Patch } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Get('email/available')
  @HttpCode(HttpStatus.OK)
  async isEmailAvailable(@Query() query: IsEmailAvailableDto) {
    return this.authService.isEmailAvailable(query);
  }

  @Post('signup/otp/request')
  @HttpCode(HttpStatus.OK)
  async signupRequestOtp(@Body() body: SignupRequestOtpDto) {
    return this.authService.signupRequestOtp(body);
  }

  @Post('signup/otp/verify')
  @HttpCode(HttpStatus.CREATED)
  async signupVerifyOtp(@Body() body: SignupVerifyOtpDto) {
    return this.authService.signupVerifyOtp(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('password/verify')
  @HttpCode(HttpStatus.OK)
  async verifyPassword(@Req() request, @Body() body: VerifyPasswordDto) {
    return this.authService.verifyPassword(request, body);
  }

  @Patch('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Req() request, @Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(request, body);
  }
}