import { IsNumber } from 'class-validator';

export class DeedDeleteDto {

  @IsNumber()
  id: number;

}