import { Module } from '@nestjs/common';
import { ScalesService } from './scales.service';
import { ScalesController } from './scales.controller';

@Module({
  controllers: [ScalesController],
  providers: [ScalesService]
})

export class ScalesModule {}