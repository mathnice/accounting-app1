import { body, query, param, ValidationChain } from 'express-validator';

const validTransactionTypes = ['income', 'expense'];
const validPaymentMethods = ['cash', 'wechat', 'alipay', 'bank'];

// 创建交易验证
export const createTransactionValidation: ValidationChain[] = [
  body('accountId')
    .notEmpty().withMessage('账户ID不能为空')
    .isUUID().withMessage('账户ID格式不正确'),
  body('categoryId')
    .notEmpty().withMessage('分类ID不能为空')
    .isUUID().withMessage('分类ID格式不正确'),
  body('type')
    .notEmpty().withMessage('交易类型不能为空')
    .isIn(validTransactionTypes).withMessage('交易类型不正确'),
  body('amount')
    .notEmpty().withMessage('金额不能为空')
    .isInt({ min: 1 }).withMessage('金额必须是大于0的整数'),
  body('date')
    .optional()
    .isISO8601().withMessage('日期格式不正确'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('备注不能超过200个字符'),
  body('paymentMethod')
    .optional()
    .isIn(validPaymentMethods).withMessage('支付方式不正确'),
  body('localId')
    .optional()
    .trim()
];

// 更新交易验证
export const updateTransactionValidation: ValidationChain[] = [
  param('id')
    .isUUID().withMessage('交易ID格式不正确'),
  body('accountId')
    .optional()
    .isUUID().withMessage('账户ID格式不正确'),
  body('categoryId')
    .optional()
    .isUUID().withMessage('分类ID格式不正确'),
  body('type')
    .optional()
    .isIn(validTransactionTypes).withMessage('交易类型不正确'),
  body('amount')
    .optional()
    .isInt({ min: 1 }).withMessage('金额必须是大于0的整数'),
  body('date')
    .optional()
    .isISO8601().withMessage('日期格式不正确'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('备注不能超过200个字符'),
  body('paymentMethod')
    .optional()
    .isIn(validPaymentMethods).withMessage('支付方式不正确')
];


// 删除交易验证
export const deleteTransactionValidation: ValidationChain[] = [
  param('id')
    .isUUID().withMessage('交易ID格式不正确')
];

// 批量删除验证
export const batchDeleteValidation: ValidationChain[] = [
  body('ids')
    .isArray({ min: 1 }).withMessage('请选择要删除的交易记录')
];

// 查询交易验证
export const getTransactionsValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('开始日期格式不正确'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('结束日期格式不正确'),
  query('type')
    .optional()
    .isIn(validTransactionTypes).withMessage('交易类型不正确'),
  query('categoryId')
    .optional()
    .isUUID().withMessage('分类ID格式不正确'),
  query('accountId')
    .optional()
    .isUUID().withMessage('账户ID格式不正确'),
  query('paymentMethod')
    .optional()
    .isIn(validPaymentMethods).withMessage('支付方式不正确')
];

// 批量导出验证
export const batchExportValidation: ValidationChain[] = [
  body('ids')
    .optional()
    .isArray().withMessage('ID列表格式不正确'),
  body('format')
    .optional()
    .isIn(['csv', 'excel', 'json']).withMessage('导出格式不正确')
];
