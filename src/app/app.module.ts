import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from 'src/redis/redis.module';
import { DeedsModule } from 'src/deeds/deeds.module';
import { ItemsModule } from 'src/items/items.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ScalesModule } from 'src/scales/scales.module';
import { RecordsModule } from 'src/record/record.module';
import { PostgresModule } from 'src/postgres/postgres.module';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';

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
    ItemsModule,
    ScalesModule,
    RecordsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})

export class AppModule {}