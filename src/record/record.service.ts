import { format } from 'date-fns';
import { Logger } from 'src/logger/logger.service';
import { ReadRecordDto } from './dto/record-read.dto';
import { CreateRecordDto } from './dto/record-create.dto';
import { PostgresService } from 'src/postgres/postgres.service';
import { Injectable, HttpException, BadRequestException } from '@nestjs/common';

@Injectable()
export class RecordsService {

  constructor(
    private readonly postgresService: PostgresService,
    private readonly loggerService: Logger
  ) {}

  // controller functions

  async readRecord(query: ReadRecordDto): Promise<{ id: number, item_id: number, scale_id: number, count: number, date: Date }> {
    try {
      const { date } = query;
      this.loggerService.log('readRecord {controller}');
      const record = await this.readRecordQuery(date);
      return record;
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  async createRecord(query: CreateRecordDto): Promise<{ id: number, item_id: number, scale_id: number, count: number, date: Date }> {
    try {
      const { item_id, scale_id, count, date } = query;
      this.loggerService.log('createRecord {controller}');
      const record = await this.createRecordQuery(item_id, scale_id, count, date);
      return record;
    } catch(error) {
      this.loggerService.error(error.message, error.status ?? 500);
      throw new HttpException(error.message, error.status ?? 500);
    }
  }

  // helper functions

  async readRecordQuery(date: Date): Promise<{ id: number, item_id: number, scale_id: number, count: number, date: Date }> {
    this.loggerService.log('readRecordQuery {query}');
    const formattedDate = format(date, 'yyyy-MM-dd 00:00:00');
    const result: { id: number, item_id: number, scale_id: number, count: number, date: Date }[] = await this.postgresService.query(`
        SELECT * FROM records WHERE date = $1;
      `,
      [formattedDate],
    );
    if (!result.length) {
      throw new BadRequestException('No records found for the given date');
    }
    return result[0];
  }

  async createRecordQuery(item_id: number, scale_id: number, count: number, date: Date): Promise<{ id: number, item_id: number, scale_id: number, count: number, date: Date }> {
    this.loggerService.log('createRecordQuery {query}');
    const formattedDate = format(date, 'yyyy-MM-dd 00:00:00');
    const result: { id: number, item_id: number, scale_id: number, count: number, date: Date }[] = await this.postgresService.query(`
        INSERT INTO records (item_id, scale_id, count, date) VALUES ($1, $2, $3, $4) RETURNING *;
      `,
      [item_id, scale_id, count, formattedDate]
    );
    if (!result.length) {
      throw new BadRequestException('Invalid email or credentials');
    }
    return result[0];
  }
}