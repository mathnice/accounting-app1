import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getStoredUser, getStoredToken, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = await getStoredToken();
      if (token) {
        const storedUser = await getStoredUser();
        setUser(storedUser);
      }
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
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
