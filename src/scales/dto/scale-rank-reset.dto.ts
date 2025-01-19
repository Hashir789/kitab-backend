import { IsArray, IsNumber, ArrayNotEmpty, IsPositive } from 'class-validator';

export class ScaleRankResetDto {
  @IsNumber()
  @IsPositive()
  deed_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ranks: number[];
}