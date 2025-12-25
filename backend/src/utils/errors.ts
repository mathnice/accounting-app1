// 自定义业务错误类
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(
    code: string,
    message: string,
    statusCode = 400,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 常用错误工厂函数
export const createValidationError = (
  message: string,
  details?: Array<{ field: string; message: string }>
) => new AppError('400001', message, 400, details);

export const createBadRequestError = (message = 'Bad request') => 
  new AppError('400002', message, 400);

export const createUnauthorizedError = (message = 'Unauthorized') => 
  new AppError('401001', message, 401);

export const createForbiddenError = (message = '无权限访问该资源') => 
  new AppError('403001', message, 403);

export const createNotFoundError = (message = '资源不存在') => 
  new AppError('404001', message, 404);

export const createConflictError = (message = '数据冲突') => 
  new AppError('409001', message, 409);

export const createInternalError = (message = '服务器内部错误') => 
  new AppError('500001', message, 500);
