import { Type } from 'class-transformer';
import { IsNotEmpty, IsDate } from 'class-validator';

export class ReadRecordDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;
}