import { v4 as uuidv4 } from 'uuid';
import { insforge } from '../config/insforgeDb';

export type CategoryType = 'income' | 'expense';

export interface ICategory {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Default categories
export const defaultCategories = [
  { name: '餐饮', type: 'expense' as CategoryType, icon: 'food', color: '#f5222d', sort_order: 1 },
  { name: '交通', type: 'expense' as CategoryType, icon: 'car', color: '#fa8c16', sort_order: 2 },
  { name: '购物', type: 'expense' as CategoryType, icon: 'shopping', color: '#eb2f96', sort_order: 3 },
  { name: '娱乐', type: 'expense' as CategoryType, icon: 'game', color: '#722ed1', sort_order: 4 },
  { name: '医疗', type: 'expense' as CategoryType, icon: 'medicine', color: '#13c2c2', sort_order: 5 },
  { name: '教育', type: 'expense' as CategoryType, icon: 'book', color: '#1890ff', sort_order: 6 },
  { name: '住房', type: 'expense' as CategoryType, icon: 'home', color: '#52c41a', sort_order: 7 },
  { name: '其他支出', type: 'expense' as CategoryType, icon: 'other', color: '#8c8c8c', sort_order: 99 },
  { name: '工资', type: 'income' as CategoryType, icon: 'salary', color: '#52c41a', sort_order: 1 },
  { name: '奖金', type: 'income' as CategoryType, icon: 'bonus', color: '#faad14', sort_order: 2 },
  { name: '投资', type: 'income' as CategoryType, icon: 'invest', color: '#1890ff', sort_order: 3 },
  { name: '其他收入', type: 'income' as CategoryType, icon: 'other', color: '#8c8c8c', sort_order: 99 }
];

// 初始化用户默认分类
export const initializeDefaultCategories = async (userId: string): Promise<ICategory[]> => {
  // 检查是否已有分类
  const { data: existing } = await insforge.database
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) {
    return [];
  }

  // 创建默认分类
  const now = new Date().toISOString();
  const categoriesToInsert = defaultCategories.map(cat => ({
    id: uuidv4(),
    user_id: userId,
    name: cat.name,
    type: cat.type,
    icon: cat.icon,
    color: cat.color,
    is_default: true,
    sort_order: cat.sort_order,
    created_at: now,
    updated_at: now,
  }));

  const { data, error } = await insforge.database
    .from('categories')
    .insert(categoriesToInsert)
    .select();

  if (error) {
    console.error('[Category] Error initializing categories:', error);
    return [];
  }

  return data || [];
};

// 获取用户分类列表
export const getCategoriesByUser = async (userId: string, type?: CategoryType): Promise<ICategory[]> => {
  let query = insforge.database
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query.order('sort_order', { ascending: true });

  if (error) {
    console.error('[Category] Error fetching categories:', error);
    return [];
  }

  return data || [];
};

// 创建分类
export const createCategory = async (userId: string, data: { name: string; type: CategoryType; icon?: string; color?: string }): Promise<ICategory | null> => {
  const id = uuidv4();
  const now = new Date().toISOString();

  const { data: result, error } = await insforge.database
    .from('categories')
    .insert({
      id,
      user_id: userId,
      name: data.name,
      type: data.type,
      icon: data.icon || 'default',
      color: data.color || '#1890ff',
      is_default: false,
      sort_order: 100,
      created_at: now,
      updated_at: now,
    })
    .select();

  if (error) {
    console.error('[Category] Error creating category:', error);
    return null;
  }

  return result?.[0] || null;
};

// 更新分类
export const updateCategory = async (id: string, userId: string, data: { name?: string; icon?: string; color?: string }): Promise<ICategory | null> => {
  const updateData: any = { updated_at: new Date().toISOString() };
  if (data.name) updateData.name = data.name;
  if (data.icon) updateData.icon = data.icon;
  if (data.color) updateData.color = data.color;

  const { data: result, error } = await insforge.database
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('[Category] Error updating category:', error);
    return null;
  }

  return result?.[0] || null;
};

// 删除分类
export const deleteCategory = async (id: string, userId: string): Promise<boolean> => {
  const { error } = await insforge.database
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[Category] Error deleting category:', error);
    return false;
  }

  return true;
};

// 转换为前端格式
export const toCategory = (cat: ICategory) => ({
  _id: cat.id,
  userId: cat.user_id,
  name: cat.name,
  type: cat.type,
  icon: cat.icon,
  color: cat.color,
  isDefault: cat.is_default,
  sortOrder: cat.sort_order,
  createdAt: cat.created_at,
  updatedAt: cat.updated_at
});
