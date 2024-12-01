import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, IsUrl, Length } from 'class-validator';

export class SignupVerifyOtpDto {
  
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsUrl()
  dp?: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp: string;

}