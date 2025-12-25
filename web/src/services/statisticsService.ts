import api, { ApiResponse } from './api';
import { TransactionType, PaymentMethod } from './transactionService';

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

export interface SummaryResult {
  income: number;
  expense: number;
  balance: number;
  startDate: string;
  endDate: string;
}

export interface CategoryStatResult {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface TrendDataResult {
  date: string;
  income: number;
  expense: number;
}

// 获取收支汇总
export const getSummary = (params?: {
  period?: TimePeriod;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<SummaryResult>> => {
  return api.get('/statistics/summary', { params });
};

// 获取分类统计
export const getCategoryStats = (params?: {
  type?: TransactionType;
  period?: TimePeriod;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<{ categories: CategoryStatResult[] }>> => {
  return api.get('/statistics/category', { params });
};

// 获取趋势数据
export const getTrendData = (params?: {
  period?: TimePeriod;
  type?: TransactionType;
}): Promise<ApiResponse<{ data: TrendDataResult[] }>> => {
  return api.get('/statistics/trend', { params });
};

// 生成报表
export const generateReport = (data: {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryIds?: string[];
  accountIds?: string[];
  paymentMethods?: PaymentMethod[];
  format?: 'csv' | 'json';
}): Promise<ApiResponse<{ transactions: any[] }> | Blob> => {
  if (data.format === 'csv') {
    return api.post('/statistics/report', data, { responseType: 'blob' });
  }
  return api.post('/statistics/report', data);
};
