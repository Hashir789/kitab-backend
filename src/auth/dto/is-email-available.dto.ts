import { IsEmail } from 'class-validator';

export class isEmailAvailableDto {

  @IsEmail()
  email: string;

}