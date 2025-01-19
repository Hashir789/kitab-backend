import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';

export class ScaleCreateDto {

  @IsNumber()
  @IsPositive()
  deed_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  @IsPositive()
  rank: number;
}