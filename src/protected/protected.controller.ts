import { Controller, Get } from '@nestjs/common';
import { Logger } from 'src/logger/logger.service';

@Controller('protected')
export class ProtectedController {
  
  constructor (private readonly loggerService: Logger) {}

  @Get()
  getProtectedData(): string {
    this.loggerService.log('getProtectedData')
    return 'this is a protected route';
  }
}