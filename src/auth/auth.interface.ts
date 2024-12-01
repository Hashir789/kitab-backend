import { Request } from 'express';

export interface AuthenticatedRequest extends Request {

    user?: {
    id: string,
    name: string,
    username: string,
    email: string,
    password: string
  };
}