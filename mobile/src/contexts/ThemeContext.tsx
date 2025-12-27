import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'system';

// 颜色方案接口
export interface ColorScheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  warning: string;
  info: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textWhite: string;
  border: string;
  borderLight: string;
  gradientStart: string;
  gradientEnd: string;
}

// 浅色主题
const lightColors: ColorScheme = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  secondaryLight: '#F472B6',
  success: '#10B981',
  successLight: '#34D399',
  danger: '#EF4444',
  dangerLight: '#F87171',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
};

// 深色主题
const darkColors: ColorScheme = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  secondary: '#F472B6',
  secondaryLight: '#F9A8D4',
  success: '#34D399',
  successLight: '#6EE7B7',
  danger: '#F87171',
  dangerLight: '#FCA5A5',
  warning: '#FBBF24',
  info: '#60A5FA',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textWhite: '#FFFFFF',
  border: '#334155',
  borderLight: '#475569',
  gradientStart: '#6366F1',
  gradientEnd: '#8B5CF6',
};

// Context 类型
interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ColorScheme;
  setTheme: (theme: ThemeMode) => void;
}

const THEME_STORAGE_KEY = 'app-theme-mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // 加载保存的主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('[ThemeContext] Error loading theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // 设置主题并保存
  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('[ThemeContext] Error saving theme:', error);
    }
  };

  // 计算实际是否为深色模式
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  // 获取当前颜色方案
  const colors = isDark ? darkColors : lightColors;

  if (!isLoaded) {
    return null; // 或者返回加载指示器
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { lightColors, darkColors };
