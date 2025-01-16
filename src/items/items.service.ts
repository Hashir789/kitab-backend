import { Logger } from 'src/logger/logger.service';
import { ItemCreateDto } from './dto/item-create.dto';
import { PostgresService } from 'src/postgres/postgres.service';
import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { ItemHideDto } from './dto/item-hide.dto';

@Injectable()
export class ItemsService {

  constructor(
    private readonly postgresService: PostgresService,
    private readonly loggerService: Logger
  ) {}

  // controller functions

  async createItem(body: ItemCreateDto): Promise<any> {
    try {
      const { deed_id, name, color } = body;
      this.loggerService.log('createItem {controller}');
      const item = await this.createItemQuery(deed_id, name, color);
      return item;
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async hideItem(body: ItemHideDto): Promise<any> {
    try {
      const { item_id, enable } = body;
      this.loggerService.log('hideItem {controller}');
      await this.hideItemQuery(item_id, enable);
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  // helper functions

  async createItemQuery(deed_id: number, name: string, color: string): Promise<{ id: number; deed_id: number, name: string, color: string, hidden: boolean }> {
    this.loggerService.log('createItemQuery {query}');
    const result: { id: number; deed_id: number, name: string, color: string, hidden: boolean }[] = await this.postgresService.query(`
        INSERT INTO items (deed_id, name, color) VALUES ($1, $2, $3) RETURNING *;
      `,
      [deed_id, name, color]
    );
    if (!result.length)
      throw new BadRequestException('Invalid email or credentials');
    return result[0];
  }

  async hideItemQuery(item_id: number, enable: boolean): Promise<void> {
    this.loggerService.log('hideItemQuery {query}');
    const result: { id: number; }[] = await this.postgresService.query(`
        UPDATE items SET hidden = $2 WHERE id = $1 RETURNING id;
      `,
      [item_id, enable]
    );
    if (!result.length)
      throw new BadRequestException('Invalid email or credentials');
  }

}