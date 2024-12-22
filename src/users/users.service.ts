import { Logger } from 'src/logger/logger.service';
import { PostgresService } from 'src/postgres/postgres.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {

  constructor(
    private readonly postgresService: PostgresService,
    private readonly loggerService: Logger
  ) {}

  async createUser(payload: { name: string, email: string, password: string, secret: string }): Promise<{ id: number; name: string, email: string; }> {
    this.loggerService.log('createUser {query}');
    const result : { id: number; name: string, email: string; }[] = await this.postgresService.query(`
      INSERT INTO users (name, email, password, secret) VALUES ($1, $2, $3, $4) RETURNING id, name, email;`,
      [ payload.name, payload.email, payload.password, payload.secret ]
    );
    if (result.length !== 1)
      throw new BadRequestException('Failed to register user')
    return result[0];
  }

  async getUser(email: string): Promise<{ id: number; name: string, email: string; password: string; }> {
    this.loggerService.log('createUser {query}');
    const result : { id: number; name: string, email: string; password: string; }[] = await this.postgresService.query(`
      SELECT * FROM users WHERE email = $1`,
      [ email ]
    )
    if (!result.length)
      throw new NotFoundException('Invalid email or credentials');
    return result[0];
  }

  async checkEmailAvailability(email: String): Promise<boolean> {
    this.loggerService.log('checkEmailAvailability {query}');
    const result : { email: string }[] = await this.postgresService.query(`
      SELECT email FROM users WHERE email = $1`,
      [email]
    );
    return !!result.length
  }

  async getPasswordByEmail(email: String): Promise<string> {
    this.loggerService.log('getPasswordByEmail {query}');
    const result : { password: string }[] = await this.postgresService.query(`
      SELECT password FROM users WHERE email = $1`,
      [email]
    );
    if (!result.length)
      throw new NotFoundException('Invalid email or credentials');
    return result[0].password
  }

  async updatePassword(email: String, password: string): Promise<void> {
    this.loggerService.log('updatePassword {query}');
    const result: { id: number }[] = await this.postgresService.query(`
      UPDATE users SET password = $2 WHERE email = $1 RETURNING id;`,
      [email, password]
    );
    if (!result.length)
      throw new NotFoundException('Invalid email or credentials');
  }
  async update2fa(email: String, toggle: boolean): Promise<void> {
    this.loggerService.log('update2fa {query}');
    const result: { two_fa: boolean }[] = await this.postgresService.query(`
        UPDATE users SET two_fa = $2 WHERE email = $1 RETURNING id;`,
        [email, toggle],
      );
    if (!result.length)
      throw new NotFoundException('Invalid email or credentials');
  }
}