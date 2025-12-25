import { Request } from 'express';

// 统一的认证用户类型
export interface AuthUser {
  userId: string;
  email?: string;
}

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
