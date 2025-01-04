import { DeedsService } from './deeds.service';
import { DeedsCreateDto } from './dto/deed-create.dto';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { Controller, HttpCode, HttpStatus, Req, Body, Post } from '@nestjs/common';

@Controller('deed')
export class DeedsController {
  
  constructor(private readonly deedsService: DeedsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createDeed(@Req() request: AuthenticatedRequest, @Body() body: DeedsCreateDto) {
    return this.deedsService.createDeed(request, body);
  }
}