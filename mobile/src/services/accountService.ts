import api, { ApiResponse } from './api';

export interface Account {
  _id: string;
  userId: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  icon: string;
  isDefault: boolean;
}

export const getAccounts = (): Promise<ApiResponse<{ accounts: Account[] }>> => {
  return api.get('/accounts');
};

export const createAccount = (data: { name: string; initialBalance?: number }): Promise<ApiResponse<{ account: Account }>> => {
  return api.post('/accounts', data);
};

export const initializeAccounts = (): Promise<ApiResponse<{ accounts: Account[] }>> => {
  return api.post('/accounts/initialize');
};
