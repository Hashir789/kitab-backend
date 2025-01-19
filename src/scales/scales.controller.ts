import { ScalesService } from './scales.service';
import { ScaleCreateDto } from './dto/scale-create.dto';
import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';

@Controller('scale')
export class ScalesController {
  
  constructor(private readonly scalesService: ScalesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createScale(@Body() body: ScaleCreateDto) {
    return this.scalesService.createScale(body);
  }
}