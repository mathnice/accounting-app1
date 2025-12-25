import api, { ApiResponse } from './api';

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'wechat' | 'alipay' | 'bank';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: { _id: string; name: string; color: string } | string;
  accountId: { _id: string; name: string } | string;
  date: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

export const getTransactions = (params?: { page?: number; limit?: number; type?: TransactionType }): Promise<ApiResponse<{ transactions: Transaction[]; total: number }>> => {
  return api.get('/transactions', { params });
};

export const createTransaction = (data: Omit<Transaction, '_id' | 'userId'>): Promise<ApiResponse<{ transaction: Transaction }>> => {
  return api.post('/transactions', data);
};

export const updateTransaction = (id: string, data: Partial<Transaction>): Promise<ApiResponse<{ transaction: Transaction }>> => {
  return api.put(`/transactions/${id}`, data);
};

export const deleteTransaction = (id: string): Promise<ApiResponse<{ message: string }>> => {
  return api.delete(`/transactions/${id}`);
};
