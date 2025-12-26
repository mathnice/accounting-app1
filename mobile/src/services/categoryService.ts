import { insforgeDb } from './insforgeDb';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CategoryType = 'income' | 'expense';

export interface Category {
  _id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
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

// 默认分类
const DEFAULT_CATEGORIES = [
  { name: '餐饮', type: 'expense', icon: 'food', color: '#FF6B6B' },
  { name: '交通', type: 'expense', icon: 'car', color: '#4ECDC4' },
  { name: '购物', type: 'expense', icon: 'shopping', color: '#45B7D1' },
  { name: '娱乐', type: 'expense', icon: 'game', color: '#96CEB4' },
  { name: '医疗', type: 'expense', icon: 'medical', color: '#FFEAA7' },
  { name: '教育', type: 'expense', icon: 'book', color: '#DDA0DD' },
  { name: '住房', type: 'expense', icon: 'home', color: '#98D8C8' },
  { name: '工资', type: 'income', icon: 'salary', color: '#52C41A' },
  { name: '奖金', type: 'income', icon: 'bonus', color: '#FAAD14' },
  { name: '投资', type: 'income', icon: 'invest', color: '#1890FF' },
];

export const getCategories = async (type?: CategoryType): Promise<{ data: { categories: Category[] } }> => {
  const userId = await getUserId();
  if (!userId) {
    console.log('[CategoryService] No user ID found');
    return { data: { categories: [] } };
  }

  let query = insforgeDb.from('categories').eq('user_id', userId);
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query.order('sort_order', { ascending: true }).execute();
  
  if (error) {
    console.error('[CategoryService] Error fetching categories:', error);
    return { data: { categories: [] } };
  }

  const categories = (data || []).map((c: any) => ({
    _id: c.id,
    userId: c.user_id,
    name: c.name,
    type: c.type,
    icon: c.icon,
    color: c.color,
    isDefault: c.is_default,
  }));

  return { data: { categories } };
};

export const createCategory = async (data: { name: string; type: CategoryType; icon?: string; color?: string }): Promise<{ data: { category: Category } }> => {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data: result, error } = await insforgeDb.from('categories').insert({
    user_id: userId,
    name: data.name,
    type: data.type,
    icon: data.icon || 'default',
    color: data.color || '#1890ff',
    is_default: false,
    sort_order: 0,
  });

  if (error) {
    console.error('[CategoryService] Error creating category:', error);
    throw error;
  }

  const category = result?.[0];
  return {
    data: {
      category: {
        _id: category.id,
        userId: category.user_id,
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        isDefault: category.is_default,
      },
    },
  };
};

export const initializeCategories = async (): Promise<{ data: { categories: Category[] } }> => {
  const userId = await getUserId();
  if (!userId) {
    console.log('[CategoryService] No user ID for initialization');
    return { data: { categories: [] } };
  }

  // 检查是否已有分类
  const { data: existing } = await insforgeDb.from('categories').eq('user_id', userId).limit(1).execute();
  
  if (existing && existing.length > 0) {
    console.log('[CategoryService] Categories already exist');
    return getCategories();
  }

  // 创建默认分类
  console.log('[CategoryService] Creating default categories for user:', userId);
  const categoriesToInsert = DEFAULT_CATEGORIES.map((c, index) => ({
    user_id: userId,
    name: c.name,
    type: c.type,
    icon: c.icon,
    color: c.color,
    is_default: true,
    sort_order: index,
  }));

  const { error } = await insforgeDb.from('categories').insert(categoriesToInsert);
  
  if (error) {
    console.error('[CategoryService] Error initializing categories:', error);
  }

  return getCategories();
};
