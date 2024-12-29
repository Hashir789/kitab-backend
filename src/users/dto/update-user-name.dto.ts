import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUsernameDto {

  @IsString()
  @IsNotEmpty()
  @Length(3, 15)
  name: string;
}