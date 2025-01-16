import { ItemsService } from './items.service';
import { ItemCreateDto } from './dto/item-create.dto';
import { Controller, HttpCode, HttpStatus, Post, Body, Patch } from '@nestjs/common';
import { ItemHideDto } from './dto/item-hide.dto';

@Controller('item')
export class ItemsController {
  
  constructor(private readonly itemsService: ItemsService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createItem(@Body() body: ItemCreateDto) {
    return this.itemsService.createItem(body);
  }

  @Patch('hide')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hideItem(@Body() body: ItemHideDto) {
    await this.itemsService.hideItem(body);
  }

}