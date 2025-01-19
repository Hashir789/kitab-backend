import { IsNumber } from 'class-validator';

export class ScaleDeleteDto {

  @IsNumber()
  id: number;

}