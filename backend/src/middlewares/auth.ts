import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { createUnauthorizedError } from '../utils/errors';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createUnauthorizedError('未提供认证令牌');
    }
    const token = authHeader.split(' ')[1];
    if (!token) throw createUnauthorizedError('未提供认证令牌');
    req.user = verifyToken(token);
    next();
  } catch (error) { next(error); }
};
