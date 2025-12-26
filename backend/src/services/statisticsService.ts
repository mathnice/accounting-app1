import { insforge } from '../config/insforgeDb';

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

// 获取时间范围
export const getDateRange = (period: TimePeriod) => {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// 获取收支汇总
export const getSummary = async (userId: string, period?: TimePeriod, startDate?: string, endDate?: string) => {
  const range = startDate && endDate ? { startDate, endDate } : getDateRange(period || 'month');

  const { data: transactions } = await insforge.database
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', range.startDate)
    .lte('date', range.endDate);

  let income = 0, expense = 0;
  for (const tx of transactions || []) {
    if (tx.type === 'income') income += tx.amount;
    else expense += tx.amount;
  }

  return { income, expense, balance: income - expense, startDate: range.startDate, endDate: range.endDate };
};

// 获取分类统计
export const getCategoryStats = async (userId: string, type: string, period?: TimePeriod, startDate?: string, endDate?: string) => {
  const range = startDate && endDate ? { startDate, endDate } : getDateRange(period || 'month');

  // 获取交易
  const { data: transactions } = await insforge.database
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .gte('date', range.startDate)
    .lte('date', range.endDate);

  // 获取分类
  const { data: categories } = await insforge.database
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type);

  const categoryMap = new Map((categories || []).map((c: any) => [c.id, c]));

  // 按分类汇总
  const categoryTotals = new Map<string, { amount: number; count: number }>();
  let total = 0;

  for (const tx of transactions || []) {
    const current = categoryTotals.get(tx.category_id) || { amount: 0, count: 0 };
    current.amount += tx.amount;
    current.count += 1;
    categoryTotals.set(tx.category_id, current);
    total += tx.amount;
  }

  const result: any[] = [];
  categoryTotals.forEach((data, categoryId) => {
    const category = categoryMap.get(categoryId);
    if (category) {
      result.push({
        categoryId,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
        amount: data.amount,
        percentage: total > 0 ? Math.round((data.amount / total) * 10000) / 100 : 0,
        count: data.count
      });
    }
  });

  // 按金额排序
  result.sort((a, b) => b.amount - a.amount);

  return result;
};

// 获取趋势数据
export const getTrendData = async (userId: string, period: TimePeriod) => {
  const now = new Date();
  let startDate: string;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }

  const { data: transactions } = await insforge.database
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .order('date', { ascending: true });

  // 按日期汇总
  const dataMap = new Map<string, { income: number; expense: number }>();
  for (const tx of transactions || []) {
    const date = period === 'year' ? tx.date.substring(0, 7) : tx.date.substring(0, 10);
    if (!dataMap.has(date)) dataMap.set(date, { income: 0, expense: 0 });
    const d = dataMap.get(date)!;
    if (tx.type === 'income') d.income += tx.amount;
    else d.expense += tx.amount;
  }

  return Array.from(dataMap.entries()).map(([date, data]) => ({ date, ...data }));
};
