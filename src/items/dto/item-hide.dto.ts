import { IsNumber, IsBoolean } from 'class-validator';

export class ItemHideDto {

  @IsNumber()
  item_id: number;

  @IsBoolean()
  enable: boolean;

}