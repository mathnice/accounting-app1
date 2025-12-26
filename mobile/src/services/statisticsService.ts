import { insforgeDb } from './insforgeDb';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SummaryResult {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryStatResult {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface TrendDataResult {
  date: string;
  income: number;
  expense: number;
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

// 获取日期范围
const getDateRange = (period: string): { startDate: string; endDate: string } => {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

export const getSummary = async (params: { period: string }): Promise<{ data: SummaryResult }> => {
  const userId = await getUserId();
  if (!userId) {
    return { data: { income: 0, expense: 0, balance: 0 } };
  }

  const { startDate, endDate } = getDateRange(params.period);

  const { data, error } = await insforgeDb
    .from('transactions')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .execute();

  if (error) {
    console.error('[StatisticsService] Error fetching summary:', error);
    return { data: { income: 0, expense: 0, balance: 0 } };
  }

  let income = 0;
  let expense = 0;

  (data || []).forEach((t: any) => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });

  return {
    data: {
      income,
      expense,
      balance: income - expense,
    },
  };
};

export const getCategoryStats = async (params: { type: string; period: string }): Promise<{ data: { categories: CategoryStatResult[] } }> => {
  const userId = await getUserId();
  if (!userId) {
    return { data: { categories: [] } };
  }

  const { startDate, endDate } = getDateRange(params.period);

  // 获取交易
  const { data: transactions } = await insforgeDb
    .from('transactions')
    .eq('user_id', userId)
    .eq('type', params.type)
    .gte('date', startDate)
    .lte('date', endDate)
    .execute();

  // 获取分类
  const { data: categories } = await insforgeDb
    .from('categories')
    .eq('user_id', userId)
    .eq('type', params.type)
    .execute();

  const categoryMap = new Map((categories || []).map((c: any) => [c.id, c]));

  // 按分类汇总
  const categoryTotals = new Map<string, number>();
  let total = 0;

  (transactions || []).forEach((t: any) => {
    const current = categoryTotals.get(t.category_id) || 0;
    categoryTotals.set(t.category_id, current + t.amount);
    total += t.amount;
  });

  const result: CategoryStatResult[] = [];
  categoryTotals.forEach((amount, categoryId) => {
    const category = categoryMap.get(categoryId);
    if (category) {
      result.push({
        categoryId,
        categoryName: category.name,
        categoryColor: category.color,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      });
    }
  });

  // 按金额排序
  result.sort((a, b) => b.amount - a.amount);

  return { data: { categories: result } };
};

export const getTrendData = async (params: { period: string }): Promise<{ data: { data: TrendDataResult[] } }> => {
  const userId = await getUserId();
  if (!userId) {
    return { data: { data: [] } };
  }

  const { startDate, endDate } = getDateRange(params.period);

  const { data: transactions } = await insforgeDb
    .from('transactions')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .execute();

  // 按日期汇总
  const dailyData = new Map<string, { income: number; expense: number }>();

  (transactions || []).forEach((t: any) => {
    const date = t.date;
    const current = dailyData.get(date) || { income: 0, expense: 0 };
    if (t.type === 'income') {
      current.income += t.amount;
    } else {
      current.expense += t.amount;
    }
    dailyData.set(date, current);
  });

  const result: TrendDataResult[] = [];
  dailyData.forEach((value, date) => {
    result.push({
      date,
      income: value.income,
      expense: value.expense,
    });
  });

  return { data: { data: result } };
};
