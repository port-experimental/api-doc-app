'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const TOKEN_STORAGE_KEY = 'port_user_token';
const BASE_URL_STORAGE_KEY = 'port_base_url';

interface AuthContextType {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  isAuthenticated: boolean;
  baseUrl: string | null;
  setBaseUrl: (url: string) => void;
  clearBaseUrl: () => void;
  hasCustomBaseUrl: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(null);
  const [baseUrl, setBaseUrlState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load token and base URL from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        setTokenState(storedToken);
      }
      const storedBaseUrl = localStorage.getItem(BASE_URL_STORAGE_KEY);
      if (storedBaseUrl) {
        setBaseUrlState(storedBaseUrl);
      }
      setIsHydrated(true);
    }
  }, []);

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    }
  }, []);

  const clearToken = useCallback(() => {
    setTokenState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const setBaseUrl = useCallback((url: string) => {
    // Normalize URL - remove trailing slash
    const normalizedUrl = url.replace(/\/+$/, '');
    setBaseUrlState(normalizedUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem(BASE_URL_STORAGE_KEY, normalizedUrl);
    }
  }, []);

  const clearBaseUrl = useCallback(() => {
    setBaseUrlState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(BASE_URL_STORAGE_KEY);
    }
  }, []);

  const value: AuthContextType = {
    token,
    setToken,
    clearToken,
    isAuthenticated: !!token,
    baseUrl,
    setBaseUrl,
    clearBaseUrl,
    hasCustomBaseUrl: !!baseUrl,
  };

  // Prevent hydration mismatch by not rendering children until hydrated
  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

