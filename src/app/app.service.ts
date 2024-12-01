import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  constructor() {}
  
  healthCheck(): { message: string, statusCode: number } {
    return { message: 'Api is healthy', statusCode: 200 };
  }
}