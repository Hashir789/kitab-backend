import { ItemsService } from './items.service';
import { ItemCreateDto } from './dto/item-create.dto';
import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';

@Controller('item')
export class ItemsController {
  
  constructor(private readonly itemsService: ItemsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createItem(@Body() body: ItemCreateDto) {
    return this.itemsService.createItem(body);
  }

}