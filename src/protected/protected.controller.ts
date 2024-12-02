import { Controller, Get, Req } from '@nestjs/common';

@Controller('protected')
export class ProtectedController {

  @Get()
  getProtectedData(@Req() request) {
    return request.user;
  }
}