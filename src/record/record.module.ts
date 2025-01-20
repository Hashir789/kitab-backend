import { Module } from '@nestjs/common';
import { RecordsService } from './record.service';
import { RecordsController } from './record.controller';

@Module({
  providers: [RecordsService],
  controllers: [RecordsController]
})

export class RecordsModule {}