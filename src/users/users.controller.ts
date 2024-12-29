import { UsersService } from './users.service';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { UpdateUsernameDto } from './dto/update-user-name.dto';
import { Controller, HttpCode, HttpStatus, Get, Req, Body, Patch } from '@nestjs/common';

@Controller('users')
export class UsersController {
  
  constructor(private readonly usersService: UsersService) {}

  @Get('read')
  @HttpCode(HttpStatus.OK)
  async userInfo(@Req() request: AuthenticatedRequest) {
    return this.usersService.userInfo(request);
  }

  @Patch('update/name')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateName(@Req() request: AuthenticatedRequest, @Body() body: UpdateUsernameDto) {
    await this.usersService.updateName(request, body);
  }
}