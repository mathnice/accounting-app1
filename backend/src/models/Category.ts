import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';

export type CategoryType = 'income' | 'expense';

export interface ICategory {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Default categories
export const defaultCategories = [
  { name: 'Food', type: 'expense' as CategoryType, icon: 'food', color: '#f5222d', sort_order: 1 },
  { name: 'Transport', type: 'expense' as CategoryType, icon: 'car', color: '#fa8c16', sort_order: 2 },
  { name: 'Shopping', type: 'expense' as CategoryType, icon: 'shopping', color: '#eb2f96', sort_order: 3 },
  { name: 'Entertainment', type: 'expense' as CategoryType, icon: 'game', color: '#722ed1', sort_order: 4 },
  { name: 'Medical', type: 'expense' as CategoryType, icon: 'medicine', color: '#13c2c2', sort_order: 5 },
  { name: 'Education', type: 'expense' as CategoryType, icon: 'book', color: '#1890ff', sort_order: 6 },
  { name: 'Rent', type: 'expense' as CategoryType, icon: 'home', color: '#52c41a', sort_order: 7 },
  { name: 'Other Expense', type: 'expense' as CategoryType, icon: 'other', color: '#8c8c8c', sort_order: 99 },
  { name: 'Salary', type: 'income' as CategoryType, icon: 'salary', color: '#52c41a', sort_order: 1 },
  { name: 'Bonus', type: 'income' as CategoryType, icon: 'bonus', color: '#faad14', sort_order: 2 },
  { name: 'Investment', type: 'income' as CategoryType, icon: 'invest', color: '#1890ff', sort_order: 3 },
  { name: 'Other Income', type: 'income' as CategoryType, icon: 'other', color: '#8c8c8c', sort_order: 99 }
];

// 初始化用户默认分类
export const initializeDefaultCategories = (userId: string): ICategory[] => {
  const existing = db.prepare('SELECT COUNT(*) as count FROM categories WHERE user_id = ?').get(userId) as { count: number };
  if (existing.count > 0) return [];

  const stmt = db.prepare(`
    INSERT INTO categories (id, user_id, name, type, icon, color, is_default, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const inserted: ICategory[] = [];

  for (const cat of defaultCategories) {
    const id = uuidv4();
    stmt.run(id, userId, cat.name, cat.type, cat.icon, cat.color, cat.sort_order, now, now);
    inserted.push({ id, user_id: userId, ...cat, is_default: 1, created_at: now, updated_at: now });
  }

  return inserted;
};

// 获取用户分类列表
export const getCategoriesByUser = (userId: string, type?: CategoryType): ICategory[] => {
  let sql = 'SELECT * FROM categories WHERE user_id = ?';
  const params: any[] = [userId];
  if (type) { sql += ' AND type = ?'; params.push(type); }
  sql += ' ORDER BY sort_order, created_at';
  return db.prepare(sql).all(...params) as ICategory[];
};

// 创建分类
export const createCategory = (userId: string, data: { name: string; type: CategoryType; icon?: string; color?: string }): ICategory => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM categories WHERE user_id = ? AND type = ?').get(userId, data.type) as { max: number | null };
  
  db.prepare(`
    INSERT INTO categories (id, user_id, name, type, icon, color, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, data.name, data.type, data.icon || 'default', data.color || '#1890ff', (maxOrder.max || 0) + 1, now, now);

  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as ICategory;
};

// 更新分类
export const updateCategory = (id: string, userId: string, data: { name?: string; icon?: string; color?: string }): ICategory | null => {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.name) { fields.push('name = ?'); values.push(data.name); }
  if (data.icon) { fields.push('icon = ?'); values.push(data.icon); }
  if (data.color) { fields.push('color = ?'); values.push(data.color); }
  
  if (fields.length === 0) return db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?').get(id, userId) as ICategory;
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id, userId);
  
  db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as ICategory;
};

// 删除分类
export const deleteCategory = (id: string, userId: string): boolean => {
  const result = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
};

// 转换为前端格式
export const toCategory = (cat: ICategory) => ({
  _id: cat.id,
  userId: cat.user_id,
  name: cat.name,
  type: cat.type,
  icon: cat.icon,
  color: cat.color,
  isDefault: !!cat.is_default,
  sortOrder: cat.sort_order,
  createdAt: cat.created_at,
  updatedAt: cat.updated_at
});
