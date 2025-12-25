import { Response } from 'express';

// 统一成功响应
export const successResponse = <T>(res: Response, data: T, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

// 统一错误响应
export const errorResponse = (
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: Array<{ field: string; message: string }>
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  });
};

// 错误码定义
export const ErrorCodes = {
  // 400 参数错误
  VALIDATION_ERROR: '400001',
  INVALID_VERIFICATION_CODE: '400002',
  INVALID_PHONE_FORMAT: '400003',
  
  // 401 认证错误
  UNAUTHORIZED: '401001',
  INVALID_PASSWORD: '401002',
  
  // 403 权限错误
  FORBIDDEN: '403001',
  
  // 404 资源不存在
  NOT_FOUND: '404001',
  
  // 409 冲突
  CONFLICT: '409001',
  
  // 500 服务器错误
  INTERNAL_ERROR: '500001'
};
