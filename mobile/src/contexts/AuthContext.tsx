import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getStoredUser, getStoredToken, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查并恢复登录状态
  const checkAuthStatus = async () => {
    try {
      console.log('[AuthContext] Checking auth status...');
      const token = await getStoredToken();
      console.log('[AuthContext] Token exists:', !!token);
      
      if (token) {
        const storedUser = await getStoredUser();
        console.log('[AuthContext] Stored user:', storedUser?.email);
        if (storedUser) {
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth status:', error);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      await checkAuthStatus();
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const result = await authSignIn(email, password);
    if (result) {
      if (result.error) {
        // 返回错误但不设置用户
        return false;
      }
      if (result.token) {
        setUser(result.user);
        return true;
      }
    }
    return false;
  };

  const signUp = async (email: string, password: string): Promise<boolean> => {
    const result = await authSignUp(email, password);
    if (result) {
      setUser(result.user);
      return true;
    }
    return false;
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
