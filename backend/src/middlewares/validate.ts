import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { errorResponse, ErrorCodes } from '../utils/response';

// 验证中间件
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 执行所有验证
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // 获取验证结果
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // 格式化错误信息
    const details = errors.array().map(error => ({
      field: (error as any).path || 'unknown',
      message: error.msg
    }));
    
    return errorResponse(
      res,
      ErrorCodes.VALIDATION_ERROR,
      '参数校验失败',
      400,
      details
    );
  };
};
