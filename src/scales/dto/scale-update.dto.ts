import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ScaleUpdateDto {

  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  rank?: number;

}