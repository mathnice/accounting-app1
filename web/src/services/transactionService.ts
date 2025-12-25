import api, { ApiResponse } from './api';

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'wechat' | 'alipay' | 'bank';

export interface Transaction {
  _id: string;
  userId: string;
  accountId: string | { _id: string; name: string; icon: string };
  categoryId: string | { _id: string; name: string; icon: string; color: string };
  type: TransactionType;
  amount: number;
  date: string;
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  paymentMethod?: PaymentMethod;
}

// 获取交易记录列表
export const getTransactions = (
  query?: TransactionQuery
): Promise<ApiResponse<{ transactions: Transaction[]; total: number; page: number; limit: number }>> => {
  return api.get('/transactions', { params: query });
};

// 获取交易记录详情
export const getTransaction = (id: string): Promise<ApiResponse<{ transaction: Transaction }>> => {
  return api.get(`/transactions/${id}`);
};

// 创建交易记录
export const createTransaction = (data: {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
}): Promise<ApiResponse<{ transaction: Transaction }>> => {
  return api.post('/transactions', data);
};

// 更新交易记录
export const updateTransaction = (
  id: string,
  data: Partial<{
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    date: string;
    note: string;
    paymentMethod: PaymentMethod;
  }>
): Promise<ApiResponse<{ transaction: Transaction }>> => {
  return api.put(`/transactions/${id}`, data);
};

// 删除交易记录
export const deleteTransaction = (id: string): Promise<ApiResponse<{ message: string }>> => {
  return api.delete(`/transactions/${id}`);
};

// 批量删除
export const batchDeleteTransactions = (ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> => {
  return api.post('/transactions/batch/delete', { ids });
};

// 批量导出
export const batchExportTransactions = (
  ids?: string[],
  format?: 'csv' | 'json'
): Promise<Blob> => {
  return api.post('/transactions/batch/export', { ids, format }, { responseType: 'blob' });
};
