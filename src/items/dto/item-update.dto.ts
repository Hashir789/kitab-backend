import { IsInt, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ItemUpdateDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;

}