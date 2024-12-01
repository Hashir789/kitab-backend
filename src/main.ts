import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from './logger/logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const logger: Logger = app.get<Logger>(Logger);
  app.useLogger(logger);
  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  const port: number = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}

bootstrap();