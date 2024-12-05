import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'src/logger/logger.service';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PostgresService implements  OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: Logger
  ) {
    this.pool = new Pool({
      user: this.configService.get<string>('POSTGRES_USER'),
      host: this.configService.get<string>('POSTGRES_HOST'),
      database: this.configService.get<string>('POSTGRES_NAME'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      port: this.configService.get<number>('POSTGRES_PORT') ?? 5432
    });
  }

  async onModuleInit() : Promise<void> {
    this.loggerService.log('postgresql {config}');
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(15),
        email VARCHAR(40) UNIQUE NOT NULL,
        password VARCHAR(70) NOT NULL,
        secret VARCHAR(32) NOT NULL
      );`
    );
  }

  private formatQuery(text: string, params?: unknown[]): string {
    if (!params || params.length === 0) {
      return text;
    }

    let formattedQuery: string = text;
    params.forEach((param: unknown, index: number) => {
      const placeholder: string = `$${index + 1}`;
      const formattedParam: string =
        typeof param === 'string' ? `'${param}'` : String(param);
      formattedQuery = formattedQuery.replace(placeholder, formattedParam);
    });
    return formattedQuery;
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const formattedQuery: string = this.formatQuery(text, params);
    this.loggerService.log(`Executing query: ${formattedQuery}`);
    const result = await this.pool.query<T>(text, params);
    return result.rows;
  }

  async onModuleDestroy() : Promise<void> {
    await this.pool.end();
  }
}