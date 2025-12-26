import { v4 as uuidv4 } from 'uuid';
import { insforge } from '../config/insforgeDb';
import { updateAccountBalance } from './AccountInsforge';

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
export const getTransactions = async (userId: string, query: TransactionQuery) => {
  const { page = 1, limit = 20, startDate, endDate, type, categoryId, accountId } = query;

  let dbQuery = insforge.database
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  if (startDate) dbQuery = dbQuery.gte('date', startDate);
  if (endDate) dbQuery = dbQuery.lte('date', endDate);
  if (type) dbQuery = dbQuery.eq('type', type);
  if (categoryId) dbQuery = dbQuery.eq('category_id', categoryId);
  if (accountId) dbQuery = dbQuery.eq('account_id', accountId);

  const { data, error } = await dbQuery
    .order('date', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    console.error('[Transaction] Error fetching transactions:', error);
    return { transactions: [], total: 0, page, limit };
  }

  // 获取总数
  const { data: countData } = await insforge.database
    .from('transactions')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  return {
    transactions: data || [],
    total: countData?.length || 0,
    page,
    limit
  };
};

// 获取单个交易
export const getTransactionById = async (id: string, userId: string): Promise<ITransaction | null> => {
  const { data, error } = await insforge.database
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    return null;
  }

  return data;
};

// 创建交易
export const createTransaction = async (userId: string, data: {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
}): Promise<ITransaction | null> => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const date = data.date || now.split('T')[0];

  const { data: result, error } = await insforge.database
    .from('transactions')
    .insert({
      id,
      user_id: userId,
      account_id: data.accountId,
      category_id: data.categoryId,
      type: data.type,
      amount: data.amount,
      date,
      note: data.note || '',
      payment_method: data.paymentMethod || 'cash',
      created_at: now,
      updated_at: now,
    })
    .select();

  if (error) {
    console.error('[Transaction] Error creating transaction:', error);
    return null;
  }

  // 更新账户余额
  const balanceChange = data.type === 'income' ? data.amount : -data.amount;
  await updateAccountBalance(data.accountId, balanceChange);

  return result?.[0] || null;
};

// 更新交易
export const updateTransaction = async (id: string, userId: string, data: Partial<{
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string;
  note: string;
  paymentMethod: PaymentMethod;
}>): Promise<ITransaction | null> => {
  // 获取原交易
  const old = await getTransactionById(id, userId);
  if (!old) return null;

  // 恢复原账户余额
  const oldChange = old.type === 'income' ? -old.amount : old.amount;
  await updateAccountBalance(old.account_id, oldChange);

  const updateData: any = { updated_at: new Date().toISOString() };
  if (data.accountId) updateData.account_id = data.accountId;
  if (data.categoryId) updateData.category_id = data.categoryId;
  if (data.type) updateData.type = data.type;
  if (data.amount) updateData.amount = data.amount;
  if (data.date) updateData.date = data.date;
  if (data.note !== undefined) updateData.note = data.note;
  if (data.paymentMethod) updateData.payment_method = data.paymentMethod;

  const { data: result, error } = await insforge.database
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('[Transaction] Error updating transaction:', error);
    return null;
  }

  const updated = result?.[0];
  if (updated) {
    // 更新新账户余额
    const newChange = updated.type === 'income' ? updated.amount : -updated.amount;
    await updateAccountBalance(updated.account_id, newChange);
  }

  return updated || null;
};

// 删除交易
export const deleteTransaction = async (id: string, userId: string): Promise<boolean> => {
  const tx = await getTransactionById(id, userId);
  if (!tx) return false;

  // 恢复账户余额
  const change = tx.type === 'income' ? -tx.amount : tx.amount;
  await updateAccountBalance(tx.account_id, change);

  const { error } = await insforge.database
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[Transaction] Error deleting transaction:', error);
    return false;
  }

  return true;
};

// 批量删除
export const batchDeleteTransactions = async (ids: string[], userId: string): Promise<number> => {
  let deleted = 0;
  for (const id of ids) {
    if (await deleteTransaction(id, userId)) deleted++;
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
