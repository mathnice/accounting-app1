import api, { ApiResponse } from './api';

export type CategoryType = 'income' | 'expense';

export interface Category {
  _id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
}

// 获取分类列表
export const getCategories = (
  type?: CategoryType
): Promise<ApiResponse<{ categories: Category[] }>> => {
  return api.get('/categories', { params: { type } });
};

// 创建分类
export const createCategory = (data: {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}): Promise<ApiResponse<{ category: Category }>> => {
  return api.post('/categories', data);
};

// 更新分类
export const updateCategory = (
  id: string,
  data: {
    name?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
  }
): Promise<ApiResponse<{ category: Category }>> => {
  return api.put(`/categories/${id}`, data);
};

// 删除分类
export const deleteCategory = (
  id: string,
  reassignTo?: string
): Promise<ApiResponse<{ message: string }>> => {
  return api.delete(`/categories/${id}`, { params: { reassignTo } });
};

// 初始化默认分类
export const initializeCategories = (): Promise<ApiResponse<{ categories: Category[]; message: string }>> => {
  return api.post('/categories/initialize');
};
