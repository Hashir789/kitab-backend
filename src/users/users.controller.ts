import { UsersService } from './users.service';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { Controller, HttpCode, HttpStatus, Get, Req } from '@nestjs/common';

@Controller('users')
export class UsersController {
  
  constructor(private readonly usersService: UsersService) {}

  @Get('read')
  @HttpCode(HttpStatus.OK)
  async userInfo(@Req() request: AuthenticatedRequest) {
    return this.usersService.userInfo(request);
  }

}