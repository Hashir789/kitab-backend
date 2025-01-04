import { DeedsService } from './deeds.service';
import { DeedCreateDto } from './dto/deed-create.dto';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { Controller, HttpCode, HttpStatus, Req, Body, Post } from '@nestjs/common';
import { DeedHideDto } from './dto/deed-hide.dto';

@Controller('deed')
export class DeedsController {
  
  constructor(private readonly deedsService: DeedsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createDeed(@Req() request: AuthenticatedRequest, @Body() body: DeedCreateDto) {
    return this.deedsService.createDeed(request, body);
  }

  @Post('hide')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hideDeed(@Req() request: AuthenticatedRequest, @Body() body: DeedHideDto) {
    return this.deedsService.hideDeed(request, body);
  }
}