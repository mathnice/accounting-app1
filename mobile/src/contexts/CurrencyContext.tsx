import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 支持的货币类型
export type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'HKD' | 'TWD';

// 货币信息
interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  nameCN: string;
}

// 支持的货币列表
export const CURRENCIES: CurrencyInfo[] = [
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', nameCN: '人民币' },
  { code: 'USD', symbol: '$', name: 'US Dollar', nameCN: '美元' },
  { code: 'EUR', symbol: '€', name: 'Euro', nameCN: '欧元' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', nameCN: '日元' },
  { code: 'GBP', symbol: '£', name: 'British Pound', nameCN: '英镑' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', nameCN: '港币' },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', nameCN: '新台币' },
];

// Context 类型
interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  currencyInfo: CurrencyInfo;
  setCurrency: (currency: CurrencyCode) => void;
  formatAmount: (amount: number, showSymbol?: boolean) => string;
}

const CURRENCY_STORAGE_KEY = 'app-currency';

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('CNY');
  const [isLoaded, setIsLoaded] = useState(false);

  // 加载保存的货币设置
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        if (savedCurrency && CURRENCIES.some(c => c.code === savedCurrency)) {
          setCurrencyState(savedCurrency as CurrencyCode);
        }
      } catch (error) {
        console.error('[CurrencyContext] Error loading currency:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadCurrency();
  }, []);

  // 设置货币并保存
  const setCurrency = async (newCurrency: CurrencyCode) => {
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('[CurrencyContext] Error saving currency:', error);
    }
  };

  // 获取当前货币信息
  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const symbol = currencyInfo.symbol;

  // 格式化金额（金额单位为分）
  const formatAmount = (amount: number, showSymbol: boolean = true): string => {
    const value = (amount / 100).toFixed(2);
    return showSymbol ? `${symbol}${value}` : value;
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <CurrencyContext.Provider value={{ currency, symbol, currencyInfo, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
