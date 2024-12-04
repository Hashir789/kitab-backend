import { Logger } from 'src/logger/logger.service';
import { PostgresService } from 'src/postgres/postgres.service';
import { ConflictException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {

  constructor(
    private readonly postgresService: PostgresService,
    private readonly loggerService: Logger
  ) {}

  async validateEmailAvailability(email: string): Promise<void> {
    this.loggerService.log('checkIfUserWithEmailExists {query}');
    const result : { email: string }[] = await this.postgresService.query(
      `SELECT email FROM users WHERE email = $1`,
      [email],
    );
    if (result.length > 0) {
      throw new ConflictException('User with the given email already exists');
    }
  }

  async createUser(name: string, email: string, password: string, secret: string): Promise<{ id: number; name: string, email: string; }> {
    this.loggerService.log('createUser {query}');
    const result : { id: number; name: string, email: string; }[] = await this.postgresService.query(`
      INSERT INTO users (name, email, password, secret) VALUES ($1, $2, $3, $4) RETURNING id, name, email;`,
      [ name, email, password, secret ]
    );
    if (result.length !== 1) {
      throw new BadRequestException('Failed to register user')
    }
    return result[0];
  }

  async getUser(email: string): Promise<{ id: number; name: string, email: string; password: string; }> {
    this.loggerService.log('createUser {query}');
    const result : { id: number; name: string, email: string; password: string; }[] = await this.postgresService.query(`
      SELECT * FROM users WHERE email = $1`,
      [ email ]
    )
    if (result.length !== 1) {
      throw new NotFoundException('Invalid username or password')
    }
    return result[0];
  }
}