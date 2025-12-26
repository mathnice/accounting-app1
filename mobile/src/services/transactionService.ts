import { insforgeDb } from './insforgeDb';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// 获取当前用户ID
const getUserId = async (): Promise<string | null> => {
  const userStr = await AsyncStorage.getItem('insforge-auth-user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.id;
  }
  return null;
};

export const getTransactions = async (params?: { page?: number; limit?: number; type?: TransactionType }): Promise<{ data: { transactions: Transaction[]; total: number } }> => {
  const userId = await getUserId();
  if (!userId) {
    console.log('[TransactionService] No user ID found');
    return { data: { transactions: [], total: 0 } };
  }

  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const offset = (page - 1) * limit;

  let query = insforgeDb.from('transactions').eq('user_id', userId);
  
  if (params?.type) {
    query = query.eq('type', params.type);
  }

  const { data, error } = await query
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1)
    .execute();

  if (error) {
    console.error('[TransactionService] Error fetching transactions:', error);
    return { data: { transactions: [], total: 0 } };
  }

  // 获取分类和账户信息
  const categoryIds = [...new Set((data || []).map((t: any) => t.category_id))];
  const accountIds = [...new Set((data || []).map((t: any) => t.account_id))];

  // 获取分类
  let categories: any[] = [];
  if (categoryIds.length > 0) {
    const { data: catData } = await insforgeDb.from('categories').execute();
    categories = catData || [];
  }

  // 获取账户
  let accounts: any[] = [];
  if (accountIds.length > 0) {
    const { data: accData } = await insforgeDb.from('accounts').execute();
    accounts = accData || [];
  }

  const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
  const accountMap = new Map(accounts.map((a: any) => [a.id, a]));

  const transactions = (data || []).map((t: any) => {
    const category = categoryMap.get(t.category_id);
    const account = accountMap.get(t.account_id);
    
    return {
      _id: t.id,
      userId: t.user_id,
      type: t.type,
      amount: t.amount,
      categoryId: category ? { _id: category.id, name: category.name, color: category.color } : t.category_id,
      accountId: account ? { _id: account.id, name: account.name } : t.account_id,
      date: t.date,
      paymentMethod: t.payment_method,
      note: t.note,
    };
  });

  return { data: { transactions, total: transactions.length } };
};

export const createTransaction = async (data: Omit<Transaction, '_id' | 'userId'>): Promise<{ data: { transaction: Transaction } }> => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const categoryId = typeof data.categoryId === 'object' ? data.categoryId._id : data.categoryId;
  const accountId = typeof data.accountId === 'object' ? data.accountId._id : data.accountId;

  const { data: result, error } = await insforgeDb.from('transactions').insert({
    user_id: userId,
    type: data.type,
    amount: data.amount,
    category_id: categoryId,
    account_id: accountId,
    date: data.date?.split('T')[0] || new Date().toISOString().split('T')[0],
    payment_method: data.paymentMethod || 'cash',
    note: data.note || '',
  });

  if (error) {
    console.error('[TransactionService] Error creating transaction:', error);
    throw error;
  }

  // 更新账户余额
  const balanceChange = data.type === 'income' ? data.amount : -data.amount;
  await insforgeDb.from('accounts').eq('id', accountId).update({
    current_balance: balanceChange, // 这里需要用 SQL 函数，暂时简化处理
  });

  const transaction = result?.[0];
  return {
    data: {
      transaction: {
        _id: transaction.id,
        userId: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        categoryId: transaction.category_id,
        accountId: transaction.account_id,
        date: transaction.date,
        paymentMethod: transaction.payment_method,
        note: transaction.note,
      },
    },
  };
};

export const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<{ data: { transaction: Transaction } }> => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const updateData: any = {};
  if (data.type) updateData.type = data.type;
  if (data.amount) updateData.amount = data.amount;
  if (data.categoryId) {
    updateData.category_id = typeof data.categoryId === 'object' ? data.categoryId._id : data.categoryId;
  }
  if (data.accountId) {
    updateData.account_id = typeof data.accountId === 'object' ? data.accountId._id : data.accountId;
  }
  if (data.date) updateData.date = data.date.split('T')[0];
  if (data.paymentMethod) updateData.payment_method = data.paymentMethod;
  if (data.note !== undefined) updateData.note = data.note;
  updateData.updated_at = new Date().toISOString();

  const { data: result, error } = await insforgeDb.from('transactions').eq('id', id).eq('user_id', userId).update(updateData);

  if (error) {
    console.error('[TransactionService] Error updating transaction:', error);
    throw error;
  }

  const transaction = result?.[0];
  return {
    data: {
      transaction: {
        _id: transaction.id,
        userId: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        categoryId: transaction.category_id,
        accountId: transaction.account_id,
        date: transaction.date,
        paymentMethod: transaction.payment_method,
        note: transaction.note,
      },
    },
  };
};

export const deleteTransaction = async (id: string): Promise<{ data: { message: string } }> => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await insforgeDb.from('transactions').eq('id', id).eq('user_id', userId).delete();

  if (error) {
    console.error('[TransactionService] Error deleting transaction:', error);
    throw error;
  }

  return { data: { message: 'Transaction deleted successfully' } };
};
