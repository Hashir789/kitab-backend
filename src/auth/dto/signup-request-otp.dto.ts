import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsUrl, Length } from 'class-validator';

export class SignupRequestOtpDto {

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

}