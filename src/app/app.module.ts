import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from 'src/redis/redis.module';
import { LoggerModule } from 'src/logger/logger.module';
import { PostgresModule } from 'src/postgres/postgres.module';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { ProtectedController } from 'src/protected/protected.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    } as ConfigModuleOptions),
    AuthModule,
    LoggerModule,
    PostgresModule,
    RedisModule,
    UsersModule
  ],
  controllers: [AppController, ProtectedController],
  providers: [AppService]
})

export class AppModule {}