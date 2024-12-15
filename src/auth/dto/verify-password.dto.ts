import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyPasswordDto {

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}