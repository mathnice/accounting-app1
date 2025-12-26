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
}

export const getCategories = (type?: CategoryType): Promise<ApiResponse<{ categories: Category[] }>> => {
  return api.get('/categories', { params: { type } });
};

export const createCategory = (data: { name: string; type: CategoryType; icon?: string; color?: string }): Promise<ApiResponse<{ category: Category }>> => {
  return api.post('/categories', data);
};

export const initializeCategories = (): Promise<ApiResponse<{ categories: Category[] }>> => {
  return api.post('/categories/initialize');
};
