import { Logger } from 'src/logger/logger.service';
import { ScaleCreateDto } from './dto/scale-create.dto';
import { ScaleRankResetDto } from './dto/scale-rank-reset.dto';
import { PostgresService } from 'src/postgres/postgres.service';
import { Injectable, HttpException, BadRequestException } from '@nestjs/common';

@Injectable()
export class ScalesService {

  constructor(
    private readonly postgresService: PostgresService,
    private readonly loggerService: Logger
  ) {}

  // controller functions

  async createScale(body: ScaleCreateDto): Promise<{ id: number; deed_id: number; name: string; color: string; rank: number; }> {
    try {
      const { deed_id, name, color, rank } = body;
      this.loggerService.log('createScale {controller}');
      const scale = await this.createScaleQuery(deed_id, name, color, rank);
      return scale;
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async ranksReset(body: ScaleRankResetDto): Promise<any> {
    try {
      const { deed_id, ranks } = body;
      this.loggerService.log('ranksReset {controller}');
      await this.ranksResetQuery(deed_id, ranks);
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  // helper functions

  async createScaleQuery(deed_id: number, name: string, color: string, rank: number): Promise<{ id: number; deed_id: number, name: string, color: string, rank: number; }> {
    this.loggerService.log('createScaleQuery {query}');
    const result: { id: number; deed_id: number, name: string, color: string, rank: number; }[] = await this.postgresService.query(`
        INSERT INTO scales (deed_id, name, color, rank) VALUES ($1, $2, $3, $4) RETURNING *;
      `,
      [deed_id, name, color, rank]
    );
    if (!result.length)
      throw new BadRequestException('Invalid email or credentials');
    return result[0];
  }

  async ranksResetQuery(deed_id: number, ranks: number[]): Promise<void> {
    this.loggerService.log('ranksResetQuery {query}');
    const caseStatements: string = ranks.reduce(
      (acc, id, index) => acc + `WHEN id = ${id} THEN ${index + 1}\n`,
      ""
    );
    const result: { id: number; deed_id: number, name: string, color: string, rank: number; }[] = await this.postgresService.query(`
      UPDATE scales
        SET rank = CASE
          ${caseStatements}
        END
      WHERE deed_id = $1
      RETURNING id;    
      `,
      [deed_id]
    );
    if (!result.length)
      throw new BadRequestException('Invalid email or credentials');
  }
}