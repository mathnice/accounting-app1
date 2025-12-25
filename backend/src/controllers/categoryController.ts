import { Request, Response, NextFunction } from 'express';
import * as CategoryModel from '../models/Category';
import { successResponse } from '../utils/response';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as CategoryModel.CategoryType | undefined;
    const categories = CategoryModel.getCategoriesByUser(req.user!.userId, type);
    return successResponse(res, { categories: categories.map(CategoryModel.toCategory) });
  } catch (error) { next(error); }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, icon, color } = req.body;
    const category = CategoryModel.createCategory(req.user!.userId, { name, type, icon, color });
    return successResponse(res, { category: CategoryModel.toCategory(category) }, 201);
  } catch (error) { next(error); }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, icon, color } = req.body;
    const category = CategoryModel.updateCategory(req.params.id, req.user!.userId, { name, icon, color });
    return successResponse(res, { category: category ? CategoryModel.toCategory(category) : null });
  } catch (error) { next(error); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    CategoryModel.deleteCategory(req.params.id, req.user!.userId);
    return successResponse(res, { message: 'Category deleted' });
  } catch (error) { next(error); }
};

export const initializeCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = CategoryModel.initializeDefaultCategories(req.user!.userId);
    return successResponse(res, { 
      categories: categories.map(CategoryModel.toCategory),
      message: categories.length > 0 ? 'Default categories initialized' : 'Categories already exist'
    });
  } catch (error) { next(error); }
};
