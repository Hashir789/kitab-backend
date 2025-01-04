import { Logger } from 'src/logger/logger.service';
import { DeedHideDto } from './dto/deed-hide.dto';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { PostgresService } from 'src/postgres/postgres.service';
import { DeedCreateDto, ScaleDto, ItemDto } from './dto/deed-create.dto';
import { Injectable, HttpException, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeedsService {

  constructor(
    private readonly postgresService: PostgresService,
    private readonly loggerService: Logger
  ) {}

  async createDeed(request: AuthenticatedRequest, body: DeedCreateDto): Promise<{ 
    id: number; 
    name: string; 
    color: string; 
    scale: string | null; 
    hidden: boolean;
    hasanaat: boolean;
    start_date: Date | null;
    items: {
      id: number;
      name: string;
      color: string;
      hidden: boolean;
    },
    scales?: {
      id: number;
      name: string;
      color: string;
      rank: number;
    }
  }> {
    try {
      const { email } = request.user;
      const { name, color, hasanaat, hidden, items, scale } = body;
      this.loggerService.log('createDeeds {controller}');
      const deed = await this.createDeedQuery(email, name, color, hasanaat, hidden, scale, items);
      return deed;
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }
  
  async hideDeed(request: AuthenticatedRequest, body: DeedHideDto): Promise<void> {
    try {
      const { id: user_id } = request.user;
      const { id, hide } = body;
      this.loggerService.log('createDeeds {controller}');
      await this.hideDeedQuery(id, user_id, hide);
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  // helper function

  async createDeedQuery(email: string, name: string, color: string, hasanaat: boolean, hidden: boolean, scale: ScaleDto[] | string, items: ItemDto[]): Promise<{ 
    id: number; 
    name: string; 
    color: string; 
    scale: string | null; 
    hidden: boolean;
    hasanaat: boolean;
    start_date: Date | null;
    items: {
      id: number;
      name: string;
      color: string;
      hidden: boolean;
    },
    scales?: {
      id: number;
      name: string;
      color: string;
      rank: number;
    }
  }> {
    this.loggerService.log('createDeedQuery {query}');
    const result: {
      deed: {
        id: number; 
        name: string; 
        color: string; 
        scale: string | null; 
        hidden: boolean;
        hasanaat: boolean;
        start_date: Date | null;
        items: {
          id: number;
          name: string;
          color: string;
          hidden: boolean;
        },
        scales?: {
          id: number;
          name: string;
          color: string;
          rank: number;
        }
      } 
    }[] = await this.postgresService.query(
      `
        WITH user_data AS (
          SELECT id AS user_id
          FROM users
          WHERE email = $1
        ),
        new_deed AS (
          INSERT INTO deeds (user_id, name, color, hasanaat, hidden, scale)
          SELECT user_data.user_id, $2, $3, $4, $5, $6
          FROM user_data
          RETURNING *
        ),
        inserted_items AS (
          INSERT INTO items (deed_id, name, color, hidden)
          SELECT
            new_deed.id,
            item->>'name',
            item->>'color',
            COALESCE((item->>'hidden')::boolean, false)
          FROM new_deed, jsonb_array_elements($7::jsonb) AS item
          RETURNING *
        ),
        inserted_scales AS (
          INSERT INTO scales (deed_id, name, color, rank)
          SELECT
            new_deed.id,
            scales->>'name',
            scales->>'color',
            (scales->>'rank')::integer
          FROM new_deed, jsonb_array_elements($8::jsonb) AS scales
          WHERE $8 IS NOT NULL
          RETURNING *
        )
        SELECT jsonb_build_object(
          'id', new_deed.id,
          'name', new_deed.name,
          'color', new_deed.color,
          'items', (SELECT jsonb_agg(jsonb_build_object(
                        'id', inserted_items.id,
                        'name', inserted_items.name,
                        'color', inserted_items.color,
                        'hidden', inserted_items.hidden
                    )) FROM inserted_items),
          'scale', new_deed.scale,
          'hidden', new_deed.hidden,
          'scales', (SELECT jsonb_agg(jsonb_build_object(
                        'id', inserted_scales.id,
                        'name', inserted_scales.name,
                        'rank', inserted_scales.rank,
                        'color', inserted_scales.color
                    )) FROM inserted_scales),
          'hasanaat', new_deed.hasanaat,
          'start_date', new_deed.start_date
        ) AS deed
        FROM new_deed;
      `,
      [ email, name, color, hasanaat, hidden, typeof scale === 'string' ? scale : null, JSON.stringify(items), typeof scale === 'object' ? JSON.stringify(scale) : null ]
    );
    if (Object.keys(result[0].deed).length === 0)
      throw new NotFoundException('Invalid email or credentials');
    return result[0].deed;
  }

  async hideDeedQuery(id: number, user_id: number, hide: boolean): Promise<void> {
    this.loggerService.log('createDeedQuery {query}');
    const result: { id: number }[] = await this.postgresService.query(`
        UPDATE deeds SET hidden = $3 WHERE user_id = $2 AND id = $1 RETURNING id;
      `,
      [id, user_id, hide]
    );
    if (!result.length)
      throw new NotFoundException('Invalid email or credentials');
  }
}