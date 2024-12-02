import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { LoggerModule } from 'src/logger/logger.module';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { ProtectedController } from 'src/protected/protected.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    } as ConfigModuleOptions),
    LoggerModule
  ],
  controllers: [AppController, ProtectedController],
  providers: [AppService],
})

export class AppModule {}