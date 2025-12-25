import { db } from '../config/database';

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
export const getSummary = (userId: string, period?: TimePeriod, startDate?: string, endDate?: string) => {
  const range = startDate && endDate ? { startDate, endDate } : getDateRange(period || 'month');

  // Use substr to extract date part from ISO datetime string
  const result = db.prepare(`
    SELECT type, SUM(amount) as total FROM transactions 
    WHERE user_id = ? AND substr(date, 1, 10) >= ? AND substr(date, 1, 10) <= ?
    GROUP BY type
  `).all(userId, range.startDate, range.endDate) as { type: string; total: number }[];

  let income = 0, expense = 0;
  for (const r of result) {
    if (r.type === 'income') income = r.total;
    else expense = r.total;
  }

  return { income, expense, balance: income - expense, startDate: range.startDate, endDate: range.endDate };
};

// 获取分类统计
export const getCategoryStats = (userId: string, type: string, period?: TimePeriod, startDate?: string, endDate?: string) => {
  const range = startDate && endDate ? { startDate, endDate } : getDateRange(period || 'month');

  // Use substr to extract date part from ISO datetime string
  const result = db.prepare(`
    SELECT t.category_id, c.name, c.icon, c.color, SUM(t.amount) as amount, COUNT(*) as count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.type = ? AND substr(t.date, 1, 10) >= ? AND substr(t.date, 1, 10) <= ?
    GROUP BY t.category_id
    ORDER BY amount DESC
  `).all(userId, type, range.startDate, range.endDate) as any[];

  const total = result.reduce((sum, r) => sum + r.amount, 0);

  return result.map(r => ({
    categoryId: r.category_id,
    categoryName: r.name,
    categoryIcon: r.icon,
    categoryColor: r.color,
    amount: r.amount,
    percentage: total > 0 ? Math.round((r.amount / total) * 10000) / 100 : 0,
    count: r.count
  }));
};

// 获取趋势数据
export const getTrendData = (userId: string, period: TimePeriod) => {
  const now = new Date();
  let startDate: string;
  let groupBy: string;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      groupBy = "substr(date, 1, 10)";
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      groupBy = "substr(date, 1, 10)";
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      groupBy = "substr(date, 1, 7)";
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      groupBy = "substr(date, 1, 10)";
  }

  const result = db.prepare(`
    SELECT ${groupBy} as date, type, SUM(amount) as amount
    FROM transactions
    WHERE user_id = ? AND substr(date, 1, 10) >= ?
    GROUP BY ${groupBy}, type
    ORDER BY date
  `).all(userId, startDate) as { date: string; type: string; amount: number }[];

  const dataMap = new Map<string, { income: number; expense: number }>();
  for (const r of result) {
    if (!dataMap.has(r.date)) dataMap.set(r.date, { income: 0, expense: 0 });
    const d = dataMap.get(r.date)!;
    if (r.type === 'income') d.income = r.amount;
    else d.expense = r.amount;
  }

  return Array.from(dataMap.entries()).map(([date, data]) => ({ date, ...data }));
};
