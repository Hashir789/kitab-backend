import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedRequest } from './auth.interface';
import { Logger } from 'src/logger/logger.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  private readonly excludedUrls: string[] = [
    '/api/health-check',
    '/api/auth/email/available',
    '/api/auth/signup/request-otp',
    '/api/auth/signup/verify-otp',
    '/api/auth/login'
  ];
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly loggerService: Logger
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.loggerService.log('canActivate {guard}');
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
  
    // Extract the base URL path without query parameters
    const baseUrl = request.url.split('?')[0];
  
    if (this.excludedUrls.includes(baseUrl)) {
      return true; // Skip JWT verification for excluded URLs
    }
  
    const authHeader: string | undefined = request.headers['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header not found or malformed');
    }
  
    const token: string = authHeader.split(' ')[1];
  
    try {
      const publicKey: string = this.configService.get<string>('JWT_PUBLIC_KEY') ?? '';
      const payload: { 
        id: string,
        name: string,
        email: string
      } = await this.jwtService.verifyAsync(token, {
        publicKey,
        algorithms: ['RS256'],
      });
  
      request.user = payload; // Attach user payload to the request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }  
}