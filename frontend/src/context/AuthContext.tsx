import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('securax_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('securax_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('securax_user', JSON.stringify(res.user));
          }
        } catch (err) {
          localStorage.removeItem('securax_token');
          localStorage.removeItem('securax_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await authService.login(data);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await authService.register(data);
    setUser(res.user);
  };

  const demoLogin = async () => {
    const res = await authService.demoLogin();
    setUser(res.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await authService.updateProfile(data);
    if (res.user) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
