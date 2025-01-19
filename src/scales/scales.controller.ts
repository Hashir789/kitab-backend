import { ScalesService } from './scales.service';
import { ScaleCreateDto } from './dto/scale-create.dto';
import { ScaleUpdateDto } from './dto/scale-update.dto';
import { ScaleRankResetDto } from './dto/scale-rank-reset.dto';
import { Controller, HttpCode, HttpStatus, Post, Body, Patch } from '@nestjs/common';

@Controller('scale')
export class ScalesController {
  
  constructor(private readonly scalesService: ScalesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createScale(@Body() body: ScaleCreateDto) {
    return this.scalesService.createScale(body);
  }

  @Patch('rank/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async ranksReset(@Body() body: ScaleRankResetDto) {
    await this.scalesService.ranksReset(body);
  }

  @Patch('update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateScale(@Body() body: ScaleUpdateDto) {
    await this.scalesService.updateScale(body);
  }

}