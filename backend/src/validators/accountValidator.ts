import { body, param, ValidationChain } from 'express-validator';

// 创建账户验证
export const createAccountValidation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty().withMessage('账户名称不能为空')
    .isLength({ max: 20 }).withMessage('账户名称不能超过20个字符'),
  body('initialBalance')
    .optional()
    .isInt().withMessage('初始余额必须是整数（单位：分）'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('图标标识不能超过50个字符')
];

// 更新账户验证
export const updateAccountValidation: ValidationChain[] = [
  param('id')
    .isMongoId().withMessage('账户ID格式不正确'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('账户名称不能为空')
    .isLength({ max: 20 }).withMessage('账户名称不能超过20个字符'),
  body('initialBalance')
    .optional()
    .isInt().withMessage('初始余额必须是整数（单位：分）'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('图标标识不能超过50个字符')
];

// 删除账户验证
export const deleteAccountValidation: ValidationChain[] = [
  param('id')
    .isMongoId().withMessage('账户ID格式不正确')
];

// 获取账户详情验证
export const getAccountValidation: ValidationChain[] = [
  param('id')
    .isMongoId().withMessage('账户ID格式不正确')
];
