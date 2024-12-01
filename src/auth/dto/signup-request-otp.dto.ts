import { IsEmail } from 'class-validator';

export class SignupRequestOtpDto {

  @IsEmail()
  email: string;

}