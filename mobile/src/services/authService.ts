import AsyncStorage from '@react-native-async-storage/async-storage';

const INSFORGE_BASE_URL = 'https://y758dmj4.us-east.insforge.app';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export const signIn = async (email: string, password: string): Promise<{ user: User; token: string; error?: string } | null> => {
  try {
    console.log('Attempting login for:', email);
    const response = await fetch(`${INSFORGE_BASE_URL}/api/auth/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log('Login response:', JSON.stringify(data));
    
    if (data.accessToken) {
      await AsyncStorage.setItem('insforge-auth-token', data.accessToken);
      await AsyncStorage.setItem('insforge-auth-user', JSON.stringify(data.user));
      return { user: data.user, token: data.accessToken };
    }
    
    // 返回错误信息
    if (data.error === 'AUTH_EMAIL_NOT_VERIFIED') {
      return { user: {} as User, token: '', error: '请先验证邮箱后再登录' };
    }
    if (data.error === 'AUTH_UNAUTHORIZED') {
      return { user: {} as User, token: '', error: '邮箱或密码错误' };
    }
    
    return null;
  } catch (error) {
    console.error('Sign in error:', error);
    return null;
  }
};

export const signUp = async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
  try {
    const response = await fetch(`${INSFORGE_BASE_URL}/api/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.accessToken) {
      await AsyncStorage.setItem('insforge-auth-token', data.accessToken);
      await AsyncStorage.setItem('insforge-auth-user', JSON.stringify(data.user));
      return { user: data.user, token: data.accessToken };
    }
    return null;
  } catch (error) {
    console.error('Sign up error:', error);
    return null;
  }
};

export const signOut = async (): Promise<void> => {
  await AsyncStorage.removeItem('insforge-auth-token');
  await AsyncStorage.removeItem('insforge-auth-user');
};

export const getStoredUser = async (): Promise<User | null> => {
  const userStr = await AsyncStorage.getItem('insforge-auth-user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getStoredToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('insforge-auth-token');
};
