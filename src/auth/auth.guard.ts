import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedRequest } from './auth.interface';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  private readonly excludedUrls: string[] = [
    '/api/health-check',
    '/api/auth/signup/request-otp',
    '/api/auth/signup/verify-otp',
    '/api/auth/login'
  ]
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    if (this.excludedUrls.includes(request.url)) {
      return true;
    }
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header not found or malformed');
    }
    const token: string = authHeader.split(' ')[1];
    try {
      const publicKey: string = this.configService.get<string>('JWT_PUBLIC_KEY') ?? '';
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey,
        algorithms: ['RS256'],
      });
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}