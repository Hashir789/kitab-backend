import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { IsValidScale } from '../custom-validators/deed-create.custom-validator';

export class ItemDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean = false;

}

export class ScaleDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  rank: number;

}

export class DeedsCreateDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsOptional()
  @IsBoolean()
  hasanaat?: boolean = false;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean = false;

  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsValidScale()
  scale: ScaleDto[] | string;

}