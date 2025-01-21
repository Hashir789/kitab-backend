import { RecordsService } from './record.service';
import { ReadRecordDto } from './dto/record-read.dto';
import { CreateRecordDto } from './dto/record-create.dto';
import { Controller, HttpCode, HttpStatus, Get, Query, Body, Post } from '@nestjs/common';

@Controller('record')
export class RecordsController {
  
  constructor(private readonly recordsService: RecordsService) {}

  @Get('read')
  @HttpCode(HttpStatus.OK)
  async readRecord(@Query() query: ReadRecordDto) {
    return this.recordsService.readRecord(query);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createRecord(@Body() body: CreateRecordDto) {
    return this.recordsService.createRecord(body);
  }
}