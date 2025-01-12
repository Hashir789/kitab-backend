import { IsNumber } from 'class-validator';

export class DeedDeleteDto {

  @IsNumber()
  id: number;

  @IsNumber()
  count_in_days: number;

}