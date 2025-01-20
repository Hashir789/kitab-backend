import { IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class ReadRecordDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;
}