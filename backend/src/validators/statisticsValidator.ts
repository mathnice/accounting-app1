import { query, body, ValidationChain } from 'express-validator';

const validTransactionTypes = ['income', 'expense'];
const validTimePeriods = ['day', 'week', 'month', 'year'];

// 收支汇总验证
export const summaryValidation: ValidationChain[] = [
  query('period')
    .optional()
    .isIn(validTimePeriods).withMessage('时间周期不正确'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('开始日期格式不正确'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('结束日期格式不正确')
];

// 分类统计验证
export const categoryStatsValidation: ValidationChain[] = [
  query('type')
    .optional()
    .isIn(validTransactionTypes).withMessage('交易类型不正确'),
  query('period')
    .optional()
    .isIn(validTimePeriods).withMessage('时间周期不正确'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('开始日期格式不正确'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('结束日期格式不正确')
];

// 趋势数据验证
export const trendValidation: ValidationChain[] = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'year']).withMessage('时间周期不正确'),
  query('type')
    .optional()
    .isIn(validTransactionTypes).withMessage('交易类型不正确')
];

// 报表生成验证
export const reportValidation: ValidationChain[] = [
  body('startDate')
    .optional()
    .isISO8601().withMessage('开始日期格式不正确'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('结束日期格式不正确'),
  body('type')
    .optional()
    .isIn(validTransactionTypes).withMessage('交易类型不正确'),
  body('categoryIds')
    .optional()
    .isArray().withMessage('分类ID列表格式不正确'),
  body('accountIds')
    .optional()
    .isArray().withMessage('账户ID列表格式不正确'),
  body('paymentMethods')
    .optional()
    .isArray().withMessage('支付方式列表格式不正确'),
  body('format')
    .optional()
    .isIn(['csv', 'excel', 'json']).withMessage('导出格式不正确')
];
