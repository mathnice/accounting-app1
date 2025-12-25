import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/insforgeAuth';
import {
  createCategoryValidation,
  updateCategoryValidation,
  deleteCategoryValidation,
  getCategoriesValidation
} from '../validators/categoryValidator';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// 获取分类列表
router.get('/', validate(getCategoriesValidation), categoryController.getCategories);

// 初始化默认分类
router.post('/initialize', categoryController.initializeCategories);

// 创建分类
router.post('/', validate(createCategoryValidation), categoryController.createCategory);

// 更新分类
router.put('/:id', validate(updateCategoryValidation), categoryController.updateCategory);

// 删除分类
router.delete('/:id', validate(deleteCategoryValidation), categoryController.deleteCategory);

export default router;
