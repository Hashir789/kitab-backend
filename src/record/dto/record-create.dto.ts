import { Type } from 'class-transformer';
import { IsNotEmpty, IsDate, IsNumber, IsPositive } from 'class-validator';

export class CreateRecordDto {

  @IsNumber()
  @IsPositive()
  item_id: number;

  @IsNumber()
  @IsPositive()
  scale_id: number;

  @IsNumber()
  @IsPositive()
  count: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;
}