import { RecordsService } from './record.service';
import { ReadRecordDto } from './dto/record-read.dto';
import { Controller, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';

@Controller('record')
export class RecordsController {
  
  constructor(private readonly recordsService: RecordsService) {}

  @Get('read')
  @HttpCode(HttpStatus.CREATED)
  async readRecord(@Query() query: ReadRecordDto) {
    return this.recordsService.readRecord(query);
  }
}