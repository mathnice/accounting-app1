import { insforgeDb } from './insforgeDb';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Account {
  _id: string;
  userId: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  icon: string;
  isDefault: boolean;
}

// 获取当前用户ID
const getUserId = async (): Promise<string | null> => {
  const userStr = await AsyncStorage.getItem('insforge-auth-user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.id;
  }
  return null;
};

// 默认账户
const DEFAULT_ACCOUNTS = [
  { name: '现金', icon: 'cash', is_default: true },
  { name: '微信', icon: 'wechat', is_default: false },
  { name: '支付宝', icon: 'alipay', is_default: false },
  { name: '银行卡', icon: 'bank', is_default: false },
];

export const getAccounts = async (): Promise<{ data: { accounts: Account[] } }> => {
  const userId = await getUserId();
  if (!userId) {
    console.log('[AccountService] No user ID found');
    return { data: { accounts: [] } };
  }

  const { data, error } = await insforgeDb.from('accounts').eq('user_id', userId).execute();
  
  if (error) {
    console.error('[AccountService] Error fetching accounts:', error);
    return { data: { accounts: [] } };
  }

  const accounts = (data || []).map((a: any) => ({
    _id: a.id,
    userId: a.user_id,
    name: a.name,
    initialBalance: a.initial_balance,
    currentBalance: a.current_balance,
    icon: a.icon,
    isDefault: a.is_default,
  }));

  return { data: { accounts } };
};

export const createAccount = async (data: { name: string; initialBalance?: number }): Promise<{ data: { account: Account } }> => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data: result, error } = await insforgeDb.from('accounts').insert({
    user_id: userId,
    name: data.name,
    initial_balance: data.initialBalance || 0,
    current_balance: data.initialBalance || 0,
    icon: 'wallet',
    is_default: false,
  });

  if (error) {
    console.error('[AccountService] Error creating account:', error);
    throw error;
  }

  const account = result?.[0];
  return {
    data: {
      account: {
        _id: account.id,
        userId: account.user_id,
        name: account.name,
        initialBalance: account.initial_balance,
        currentBalance: account.current_balance,
        icon: account.icon,
        isDefault: account.is_default,
      },
    },
  };
};

export const initializeAccounts = async (): Promise<{ data: { accounts: Account[] } }> => {
  const userId = await getUserId();
  if (!userId) {
    console.log('[AccountService] No user ID for initialization');
    return { data: { accounts: [] } };
  }

  // 检查是否已有账户
  const { data: existing } = await insforgeDb.from('accounts').eq('user_id', userId).limit(1).execute();
  
  if (existing && existing.length > 0) {
    console.log('[AccountService] Accounts already exist');
    return getAccounts();
  }

  // 创建默认账户
  console.log('[AccountService] Creating default accounts for user:', userId);
  const accountsToInsert = DEFAULT_ACCOUNTS.map((a) => ({
    user_id: userId,
    name: a.name,
    initial_balance: 0,
    current_balance: 0,
    icon: a.icon,
    is_default: a.is_default,
  }));

  const { error } = await insforgeDb.from('accounts').insert(accountsToInsert);
  
  if (error) {
    console.error('[AccountService] Error initializing accounts:', error);
  }

  return getAccounts();
};
