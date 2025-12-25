import { body, query, param, ValidationChain } from 'express-validator';

const validCategoryTypes = ['income', 'expense'];

// 创建分类验证
export const createCategoryValidation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty().withMessage('分类名称不能为空')
    .isLength({ max: 20 }).withMessage('分类名称不能超过20个字符'),
  body('type')
    .trim()
    .notEmpty().withMessage('分类类型不能为空')
    .isIn(validCategoryTypes).withMessage('分类类型不正确'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('图标标识不能超过50个字符'),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('颜色格式不正确')
];

// 更新分类验证
export const updateCategoryValidation: ValidationChain[] = [
  param('id')
    .isUUID().withMessage('分类ID格式不正确'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('分类名称不能为空')
    .isLength({ max: 20 }).withMessage('分类名称不能超过20个字符'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('图标标识不能超过50个字符'),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('颜色格式不正确'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('排序号必须是非负整数')
];

// 删除分类验证
export const deleteCategoryValidation: ValidationChain[] = [
  param('id')
    .isUUID().withMessage('分类ID格式不正确'),
  query('reassignTo')
    .optional()
    .isUUID().withMessage('目标分类ID格式不正确')
];

// 查询分类验证
export const getCategoriesValidation: ValidationChain[] = [
  query('type')
    .optional()
    .isIn(validCategoryTypes).withMessage('分类类型不正确')
];
