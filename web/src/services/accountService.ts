import api, { ApiResponse } from './api';
import { Transaction } from './transactionService';

export interface Account {
  _id: string;
  userId: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  icon: string;
  isDefault: boolean;
}

// 获取账户列表
export const getAccounts = (): Promise<ApiResponse<{ accounts: Account[] }>> => {
  return api.get('/accounts');
};

// 获取账户详情
export const getAccount = (id: string): Promise<ApiResponse<{ account: Account }>> => {
  return api.get(`/accounts/${id}`);
};

// 获取账户流水
export const getAccountTransactions = (
  id: string,
  page?: number,
  limit?: number
): Promise<ApiResponse<{ transactions: Transaction[]; total: number }>> => {
  return api.get(`/accounts/${id}/transactions`, { params: { page, limit } });
};

// 创建账户
export const createAccount = (data: {
  name: string;
  initialBalance?: number;
  icon?: string;
}): Promise<ApiResponse<{ account: Account }>> => {
  return api.post('/accounts', data);
};

// 更新账户
export const updateAccount = (
  id: string,
  data: {
    name?: string;
    initialBalance?: number;
    icon?: string;
  }
): Promise<ApiResponse<{ account: Account }>> => {
  return api.put(`/accounts/${id}`, data);
};

// 删除账户
export const deleteAccount = (id: string): Promise<ApiResponse<{ message: string }>> => {
  return api.delete(`/accounts/${id}`);
};

// 设置默认账户
export const setDefaultAccount = (id: string): Promise<ApiResponse<{ account: Account }>> => {
  return api.put(`/accounts/${id}/default`);
};

// 初始化默认账户
export const initializeAccount = (): Promise<ApiResponse<{ account: Account | null; message: string }>> => {
  return api.post('/accounts/initialize');
};
