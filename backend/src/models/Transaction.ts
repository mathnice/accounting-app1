import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { updateAccountBalance } from './Account';

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'wechat' | 'alipay' | 'bank';

export interface ITransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  date: string;
  note: string;
  payment_method: PaymentMethod;
  local_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
}

// 获取交易列表
export const getTransactions = (userId: string, query: TransactionQuery) => {
  const { page = 1, limit = 20, startDate, endDate, type, categoryId, accountId } = query;
  
  let sql = 'SELECT * FROM transactions WHERE user_id = ?';
  let countSql = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?';
  const params: any[] = [userId];

  if (startDate) { sql += ' AND date >= ?'; countSql += ' AND date >= ?'; params.push(startDate); }
  if (endDate) { sql += ' AND date <= ?'; countSql += ' AND date <= ?'; params.push(endDate); }
  if (type) { sql += ' AND type = ?'; countSql += ' AND type = ?'; params.push(type); }
  if (categoryId) { sql += ' AND category_id = ?'; countSql += ' AND category_id = ?'; params.push(categoryId); }
  if (accountId) { sql += ' AND account_id = ?'; countSql += ' AND account_id = ?'; params.push(accountId); }

  sql += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
  
  const total = (db.prepare(countSql).get(...params) as { total: number }).total;
  const transactions = db.prepare(sql).all(...params, limit, (page - 1) * limit) as ITransaction[];

  return { transactions, total, page, limit };
};

// 获取单个交易
export const getTransactionById = (id: string, userId: string): ITransaction | null => {
  return db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, userId) as ITransaction | null;
};

// 创建交易
export const createTransaction = (userId: string, data: {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
}): ITransaction => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const date = data.date || now.split('T')[0];

  db.prepare(`
    INSERT INTO transactions (id, user_id, account_id, category_id, type, amount, date, note, payment_method, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, data.accountId, data.categoryId, data.type, data.amount, date, data.note || '', data.paymentMethod || 'cash', now, now);

  // 更新账户余额
  const balanceChange = data.type === 'income' ? data.amount : -data.amount;
  updateAccountBalance(data.accountId, balanceChange);

  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as ITransaction;
};

// 更新交易
export const updateTransaction = (id: string, userId: string, data: Partial<{
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string;
  note: string;
  paymentMethod: PaymentMethod;
}>): ITransaction | null => {
  const old = getTransactionById(id, userId);
  if (!old) return null;

  // 恢复原账户余额
  const oldChange = old.type === 'income' ? -old.amount : old.amount;
  updateAccountBalance(old.account_id, oldChange);

  const fields: string[] = [];
  const values: any[] = [];

  if (data.accountId) { fields.push('account_id = ?'); values.push(data.accountId); }
  if (data.categoryId) { fields.push('category_id = ?'); values.push(data.categoryId); }
  if (data.type) { fields.push('type = ?'); values.push(data.type); }
  if (data.amount) { fields.push('amount = ?'); values.push(data.amount); }
  if (data.date) { fields.push('date = ?'); values.push(data.date); }
  if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }
  if (data.paymentMethod) { fields.push('payment_method = ?'); values.push(data.paymentMethod); }

  fields.push('updated_at = ?');
  values.push(new Date().toISOString(), id, userId);

  db.prepare(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as ITransaction;
  
  // 更新新账户余额
  const newChange = updated.type === 'income' ? updated.amount : -updated.amount;
  updateAccountBalance(updated.account_id, newChange);

  return updated;
};

// 删除交易
export const deleteTransaction = (id: string, userId: string): boolean => {
  const tx = getTransactionById(id, userId);
  if (!tx) return false;

  // 恢复账户余额
  const change = tx.type === 'income' ? -tx.amount : tx.amount;
  updateAccountBalance(tx.account_id, change);

  const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
};

// 批量删除
export const batchDeleteTransactions = (ids: string[], userId: string): number => {
  let deleted = 0;
  for (const id of ids) {
    if (deleteTransaction(id, userId)) deleted++;
  }
  return deleted;
};

// 转换为前端格式
export const toTransaction = (tx: ITransaction, category?: any, account?: any) => ({
  _id: tx.id,
  userId: tx.user_id,
  accountId: account || tx.account_id,
  categoryId: category || tx.category_id,
  type: tx.type,
  amount: tx.amount,
  date: tx.date,
  note: tx.note,
  paymentMethod: tx.payment_method,
  createdAt: tx.created_at,
  updatedAt: tx.updated_at
});
