import { DeedsService } from './deeds.service';
import { DeedHideDto } from './dto/deed-hide.dto';
import { DeedCreateDto } from './dto/deed-create.dto';
import { DeedUpdateDto } from './dto/deed-update.dto';
import { DeedDeleteDto } from './dto/deed-delete.dto';
import { DeedDateResetDto } from './dto/deed-date-reset.dto';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { Controller, HttpCode, HttpStatus, Req, Body, Post, Delete, Patch } from '@nestjs/common';

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

  @Patch('update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateDeed(@Req() request: AuthenticatedRequest, @Body() body: DeedUpdateDto) {
    await this.deedsService.updateDeed(request, body);
  }

  @Delete('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeed(@Req() request: AuthenticatedRequest, @Body() body: DeedDeleteDto) {
    await this.deedsService.deleteDeed(request, body);
  }

  @Delete('date/reset')
  @HttpCode(HttpStatus.CREATED)
  async dateReset(@Req() request: AuthenticatedRequest, @Body() body: DeedDateResetDto) {
    return this.deedsService.dateReset(request, body);
  }
}