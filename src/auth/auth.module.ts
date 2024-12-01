import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        privateKey: configService.get<string>('JWT_PRIVATE_KEY') ?? '',
        publicKey: configService.get<string>('JWT_PUBLIC_KEY') ?? '',
        signOptions: { algorithm: 'RS256', expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRATION_TIME') ?? '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService]
})

export class AuthModule {}