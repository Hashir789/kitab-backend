import { IsBoolean, IsNumber } from 'class-validator';

export class DeedHideDto {

  @IsNumber()
  id: number;
  
  @IsBoolean()
  hide: boolean;

}