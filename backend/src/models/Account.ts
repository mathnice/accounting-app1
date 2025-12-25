import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';

export interface IAccount {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  icon: string;
  is_default: number;
  created_at: string;
  updated_at: string;
}

// 获取用户账户列表
export const getAccountsByUser = (userId: string): IAccount[] => {
  return db.prepare('SELECT * FROM accounts WHERE user_id = ? ORDER BY is_default DESC, created_at').all(userId) as IAccount[];
};

// 根据ID获取账户
export const getAccountById = (id: string, userId: string): IAccount | null => {
  return db.prepare('SELECT * FROM accounts WHERE id = ? AND user_id = ?').get(id, userId) as IAccount | null;
};

// 创建账户
export const createAccount = (userId: string, data: { name: string; initialBalance?: number; icon?: string }): IAccount => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const balance = data.initialBalance || 0;
  
  const count = (db.prepare('SELECT COUNT(*) as count FROM accounts WHERE user_id = ?').get(userId) as { count: number }).count;
  const isDefault = count === 0 ? 1 : 0;

  db.prepare(`
    INSERT INTO accounts (id, user_id, name, initial_balance, current_balance, icon, is_default, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, data.name, balance, balance, data.icon || 'wallet', isDefault, now, now);

  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as IAccount;
};

// 更新账户
export const updateAccount = (id: string, userId: string, data: { name?: string; initialBalance?: number; icon?: string }): IAccount | null => {
  const account = getAccountById(id, userId);
  if (!account) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (data.name) { fields.push('name = ?'); values.push(data.name); }
  if (data.icon) { fields.push('icon = ?'); values.push(data.icon); }
  if (data.initialBalance !== undefined) {
    const diff = data.initialBalance - account.initial_balance;
    fields.push('initial_balance = ?', 'current_balance = current_balance + ?');
    values.push(data.initialBalance, diff);
  }

  if (fields.length === 0) return account;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString(), id, userId);

  db.prepare(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as IAccount;
};

// 删除账户
export const deleteAccount = (id: string, userId: string): boolean => {
  const result = db.prepare('DELETE FROM accounts WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
};

// 更新账户余额
export const updateAccountBalance = (accountId: string, amount: number): void => {
  db.prepare('UPDATE accounts SET current_balance = current_balance + ?, updated_at = ? WHERE id = ?')
    .run(amount, new Date().toISOString(), accountId);
};

// 设置默认账户
export const setDefaultAccount = (id: string, userId: string): IAccount | null => {
  db.prepare('UPDATE accounts SET is_default = 0 WHERE user_id = ?').run(userId);
  db.prepare('UPDATE accounts SET is_default = 1, updated_at = ? WHERE id = ? AND user_id = ?')
    .run(new Date().toISOString(), id, userId);
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as IAccount;
};

// 转换为前端格式
export const toAccount = (acc: IAccount) => ({
  _id: acc.id,
  userId: acc.user_id,
  name: acc.name,
  initialBalance: acc.initial_balance,
  currentBalance: acc.current_balance,
  icon: acc.icon,
  isDefault: !!acc.is_default,
  createdAt: acc.created_at,
  updatedAt: acc.updated_at
});

// 初始化默认账户（补充缺少的默认账户）
export const initializeDefaultAccounts = (userId: string): IAccount[] => {
  const existing = getAccountsByUser(userId);
  const existingNames = existing.map(a => a.name);
  
  const defaultAccounts = [
    { name: 'Cash', icon: 'wallet' },
    { name: 'Bank Card', icon: 'bank' },
    { name: 'WeChat', icon: 'wechat' },
    { name: 'Alipay', icon: 'alipay' }
  ];
  
  // Only create accounts that don't exist yet
  const toCreate = defaultAccounts.filter(acc => !existingNames.includes(acc.name));
  return toCreate.map(acc => createAccount(userId, { ...acc, initialBalance: 0 }));
};
