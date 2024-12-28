import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { Toggle2FaDto } from './dto/toggle-2-fa.dto';
import { AuthenticatedRequest } from './auth.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { SignupVerifyOtpDto } from './dto/signup-verify-otp.dto';
import { SignupRequestOtpDto } from './dto/signup-request-otp.dto';
import { IsEmailAvailableDto } from './dto/is-email-available.dto';
import { sendPasswordResetOtpDto } from './dto/send-password-reset-otp.dto';
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async signupRequestOtp(@Body() body: SignupRequestOtpDto) {
   await this.authService.signupRequestOtp(body);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyPassword(@Req() request: AuthenticatedRequest, @Body() body: VerifyPasswordDto) {
    await this.authService.verifyPassword(request, body);
  }

  @Patch('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Req() request: AuthenticatedRequest, @Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(request, body);
  }

  @Patch('2fa/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  async toggle2fa(@Req() request: AuthenticatedRequest, @Body() body: Toggle2FaDto) {
    await this.authService.toggle2fa(request, body);
  }

  @Post('email/send/password/otp')
  @HttpCode(HttpStatus.OK)
  async sendPasswordResetOtp(@Body() body: sendPasswordResetOtpDto) {
    return this.authService.sendPasswordResetOtp(body);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifiedOtp(@Body() body: OtpVerifyDto) {
    await this.authService.verifiedOtp(body);
  }
}