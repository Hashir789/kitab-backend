import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from 'src/redis/redis.module';
import { DeedsModule } from 'src/deeds/deeds.module';
import { LoggerModule } from 'src/logger/logger.module';
import { PostgresModule } from 'src/postgres/postgres.module';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { ItemsModule } from 'src/items/items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    } as ConfigModuleOptions),
    AuthModule,
    LoggerModule,
    PostgresModule,
    RedisModule,
    UsersModule,
    DeedsModule,
    ItemsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})

export class AppModule {}