import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse, ErrorCodes } from '../utils/response';
import config from '../config';

// 全局错误处理中间件
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 开发环境打印错误堆栈
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
  }

  // 处理自定义业务错误
  if (err instanceof AppError) {
    return errorResponse(res, err.code, err.message, err.statusCode, err.details);
  }

  // 处理 Mongoose 验证错误
  if (err.name === 'ValidationError') {
    return errorResponse(
      res,
      ErrorCodes.VALIDATION_ERROR,
      '数据验证失败',
      400
    );
  }

  // 处理 Mongoose 重复键错误
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return errorResponse(
      res,
      ErrorCodes.CONFLICT,
      '数据已存在',
      409
    );
  }

  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(
      res,
      ErrorCodes.UNAUTHORIZED,
      '无效的令牌',
      401
    );
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(
      res,
      ErrorCodes.UNAUTHORIZED,
      '令牌已过期',
      401
    );
  }

  // 其他未知错误
  return errorResponse(
    res,
    ErrorCodes.INTERNAL_ERROR,
    config.nodeEnv === 'production' ? '服务器内部错误' : err.message,
    500
  );
};

// 404 处理中间件
export const notFoundHandler = (_req: Request, res: Response) => {
  return errorResponse(res, ErrorCodes.NOT_FOUND, '接口不存在', 404);
};
