import { Module } from '@nestjs/common';
import { DeedsService } from './deeds.service';
import { DeedsController } from './deeds.controller';

@Module({
  controllers: [DeedsController],
  providers: [DeedsService]
})

export class DeedsModule {}