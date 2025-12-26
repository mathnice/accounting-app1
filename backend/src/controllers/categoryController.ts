import { Request, Response, NextFunction } from 'express';
import * as CategoryModel from '../models/CategoryInsforge';
import { successResponse } from '../utils/response';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as CategoryModel.CategoryType | undefined;
    const categories = await CategoryModel.getCategoriesByUser(req.user!.userId, type);
    return successResponse(res, { categories: categories.map(CategoryModel.toCategory) });
  } catch (error) { next(error); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, icon, color } = req.body;
    const category = await CategoryModel.createCategory(req.user!.userId, { name, type, icon, color });
    if (!category) {
      return res.status(500).json({ success: false, error: { message: 'Failed to create category' } });
    }
    return successResponse(res, { category: CategoryModel.toCategory(category) }, 201);
  } catch (error) { next(error); }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, icon, color } = req.body;
    const category = await CategoryModel.updateCategory(req.params.id, req.user!.userId, { name, icon, color });
    return successResponse(res, { category: category ? CategoryModel.toCategory(category) : null });
  } catch (error) { next(error); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await CategoryModel.deleteCategory(req.params.id, req.user!.userId);
    return successResponse(res, { message: 'Category deleted' });
  } catch (error) { next(error); }
};

export const initializeCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await CategoryModel.initializeDefaultCategories(req.user!.userId);
    // 如果没有新建分类，获取现有分类
    if (categories.length === 0) {
      const existingCategories = await CategoryModel.getCategoriesByUser(req.user!.userId);
      return successResponse(res, { 
        categories: existingCategories.map(CategoryModel.toCategory),
        message: 'Categories already exist'
      });
    }
    return successResponse(res, { 
      categories: categories.map(CategoryModel.toCategory),
      message: 'Default categories initialized'
    });
  } catch (error) { next(error); }
};
