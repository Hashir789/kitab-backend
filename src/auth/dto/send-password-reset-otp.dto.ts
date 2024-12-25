import { IsEmail } from 'class-validator';

export class sendPasswordResetOtpDto {

  @IsEmail()
  email: string;
  
}