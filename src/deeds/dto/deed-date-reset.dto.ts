import { IsNumber } from 'class-validator';

export class DeedDateResetDto {

  @IsNumber()
  id: number;

  @IsNumber()
  count_in_days: number;

}