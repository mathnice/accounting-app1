import { v4 as uuidv4 } from 'uuid';
import { insforge } from '../config/insforgeDb';

export interface IAccount {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  icon: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Default accounts
export const defaultAccounts = [
  { name: '现金', icon: 'cash', is_default: true },
  { name: '微信', icon: 'wechat', is_default: false },
  { name: '支付宝', icon: 'alipay', is_default: false },
  { name: '银行卡', icon: 'bank', is_default: false },
];

// 初始化用户默认账户
export const initializeDefaultAccounts = async (userId: string): Promise<IAccount[]> => {
  // 检查是否已有账户
  const { data: existing } = await insforge.database
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) {
    return [];
  }

  // 创建默认账户
  const now = new Date().toISOString();
  const accountsToInsert = defaultAccounts.map(acc => ({
    id: uuidv4(),
    user_id: userId,
    name: acc.name,
    initial_balance: 0,
    current_balance: 0,
    icon: acc.icon,
    is_default: acc.is_default,
    created_at: now,
    updated_at: now,
  }));

  const { data, error } = await insforge.database
    .from('accounts')
    .insert(accountsToInsert)
    .select();

  if (error) {
    console.error('[Account] Error initializing accounts:', error);
    return [];
  }

  return data || [];
};

// 获取用户账户列表
export const getAccountsByUser = async (userId: string): Promise<IAccount[]> => {
  const { data, error } = await insforge.database
    .from('accounts')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('[Account] Error fetching accounts:', error);
    return [];
  }

  return data || [];
};

// 获取单个账户
export const getAccountById = async (id: string, userId: string): Promise<IAccount | null> => {
  const { data, error } = await insforge.database
    .from('accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[Account] Error fetching account:', error);
    return null;
  }

  return data;
};

// 创建账户
export const createAccount = async (userId: string, data: { name: string; initialBalance?: number; icon?: string }): Promise<IAccount | null> => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const initialBalance = data.initialBalance || 0;

  const { data: result, error } = await insforge.database
    .from('accounts')
    .insert({
      id,
      user_id: userId,
      name: data.name,
      initial_balance: initialBalance,
      current_balance: initialBalance,
      icon: data.icon || 'wallet',
      is_default: false,
      created_at: now,
      updated_at: now,
    })
    .select();

  if (error) {
    console.error('[Account] Error creating account:', error);
    return null;
  }

  return result?.[0] || null;
};

// 更新账户余额
export const updateAccountBalance = async (accountId: string, change: number): Promise<void> => {
  // 先获取当前余额
  const { data: account } = await insforge.database
    .from('accounts')
    .select('current_balance')
    .eq('id', accountId)
    .single();

  if (account) {
    const newBalance = (account.current_balance || 0) + change;
    await insforge.database
      .from('accounts')
      .update({ 
        current_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);
  }
};

// 更新账户
export const updateAccount = async (id: string, userId: string, data: { name?: string; icon?: string }): Promise<IAccount | null> => {
  const updateData: any = { updated_at: new Date().toISOString() };
  if (data.name) updateData.name = data.name;
  if (data.icon) updateData.icon = data.icon;

  const { data: result, error } = await insforge.database
    .from('accounts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('[Account] Error updating account:', error);
    return null;
  }

  return result?.[0] || null;
};

// 删除账户
export const deleteAccount = async (id: string, userId: string): Promise<boolean> => {
  const { error } = await insforge.database
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[Account] Error deleting account:', error);
    return false;
  }

  return true;
};

// 转换为前端格式
export const toAccount = (acc: IAccount) => ({
  _id: acc.id,
  userId: acc.user_id,
  name: acc.name,
  initialBalance: acc.initial_balance,
  currentBalance: acc.current_balance,
  icon: acc.icon,
  isDefault: acc.is_default,
  createdAt: acc.created_at,
  updatedAt: acc.updated_at
});
