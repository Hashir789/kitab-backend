import { IsNumber } from 'class-validator';

export class ItemDeleteDto {

  @IsNumber()
  id: number;

}