import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  
  user?: {
    id: String,
    name: String,
    email: String,
    two_fa: Boolean,
    join_date: Date
  };
}