import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { Logger } from 'src/logger/logger.service';
import { AuthModule } from 'src/auth/auth.module';
import { ProtectedController } from 'src/protected/protected.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    } as ConfigModuleOptions),
    AuthModule
  ],
  controllers: [AppController, ProtectedController],
  providers: [AppService, Logger],
  exports: [Logger]
})

export class AppModule {}