import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponseUser } from '@shared/schema';
import { authStorage } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  user: AuthResponseUser | null;
  token: string | null;
  login: (user: AuthResponseUser, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = authStorage.getToken();
    const savedUser = authStorage.getUser();
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
  }, []);

  // Verify token with backend
  const { isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!token && !user,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const login = (user: AuthResponseUser, token: string) => {
    setUser(user);
    setToken(token);
    authStorage.setUser(user);
    authStorage.setToken(token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
