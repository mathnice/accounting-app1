import api, { ApiResponse } from './api';

export interface SummaryResult {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryStatResult {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface TrendDataResult {
  date: string;
  income: number;
  expense: number;
}

export const getSummary = (params: { period: string }): Promise<ApiResponse<SummaryResult>> => {
  return api.get('/statistics/summary', { params });
};

export const getCategoryStats = (params: { type: string; period: string }): Promise<ApiResponse<{ categories: CategoryStatResult[] }>> => {
  return api.get('/statistics/category', { params });
};

export const getTrendData = (params: { period: string }): Promise<ApiResponse<{ data: TrendDataResult[] }>> => {
  return api.get('/statistics/trend', { params });
};
