import { DeedsService } from './deeds.service';
import { DeedHideDto } from './dto/deed-hide.dto';
import { DeedCreateDto } from './dto/deed-create.dto';
import { DeedDeleteDto } from './dto/deed-delete.dto';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { Controller, HttpCode, HttpStatus, Req, Body, Post, Delete } from '@nestjs/common';

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
    await this.deedsService.hideDeed(request, body);
  }

  @Delete('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeed(@Req() request: AuthenticatedRequest, @Body() body: DeedDeleteDto) {
    await this.deedsService.deleteDeed(request, body);
  }
}