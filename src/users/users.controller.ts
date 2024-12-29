import { UsersService } from './users.service';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { UpdateUsernameDto } from './dto/update-user-name.dto';
import { Controller, HttpCode, HttpStatus, Get, Req, Body, Patch, Delete } from '@nestjs/common';

@Controller('user')
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

  @Delete('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Req() request: AuthenticatedRequest) {
    await this.usersService.deleteUser(request);
  }
}