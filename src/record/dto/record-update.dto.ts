import { Type } from 'class-transformer';
import { IsNotEmpty, IsDate, IsNumber, IsPositive } from 'class-validator';

export class updateRecordDto {

  @IsNumber()
  @IsPositive()
  id: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

}