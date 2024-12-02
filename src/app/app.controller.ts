import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  
  constructor(private readonly appService: AppService) {}

  @Get('/health-check')
  @HttpCode(HttpStatus.OK)
  healthCheck(): { message: string, statusCode: number } {
    return this.appService.healthCheck();
  }
}