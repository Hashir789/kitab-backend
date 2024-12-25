import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class OtpVerifyDto {

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otp: string;
  
}