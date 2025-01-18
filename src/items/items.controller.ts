import { ItemsService } from './items.service';
import { ItemHideDto } from './dto/item-hide.dto';
import { ItemCreateDto } from './dto/item-create.dto';
import { ItemUpdateDto } from './dto/item-update.dto';
import { Controller, HttpCode, HttpStatus, Post, Body, Patch } from '@nestjs/common';

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

  @Patch('update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateItem(@Body() body: ItemUpdateDto) {
    await this.itemsService.updateItem(body);
  }
}