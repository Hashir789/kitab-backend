import { IsInt, IsOptional, IsBoolean, IsString, IsNotEmpty } from 'class-validator';

export class DeedUpdateDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  hasanaat?: boolean;

}