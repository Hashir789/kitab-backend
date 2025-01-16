import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ItemCreateDto {

  @IsNumber()
  @IsNotEmpty()
  deed_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;
}