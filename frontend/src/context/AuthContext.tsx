/**
 * গ্লোবাল অথেনটিকেশন কনটেক্সট ও প্রোভাইডার (Global Auth Context & Provider)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * ক্লায়েন্ট অ্যাপ্লিকেশনের সেশন স্টেট, ইউজার রোল, পারমিশন চেকিং ও টোকেন পারসিস্টেন্স পরিচালনা করে।
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AuthState, TokenResponse, UserSummary } from '@/types/auth';
import { fetchCurrentUser } from '@/services/authApi';

interface AuthContextType extends AuthState {
  login: (tokenResponse: TokenResponse) => void;
  logout: () => void;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionCode: string) => boolean;
}

const STORAGE_KEY = 'lacs_access_token';
const USER_STORAGE_KEY = 'lacs_user_profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ক্যাশড ইউজার ডেটা থেকে ইনস্ট্যান্ট হাইড্রেশন (রিলোডে ফুলস্ক্রিন লোডার ফ্ল্যাশ রোধ)
  const [user, setUser] = useState<UserSummary | null>(() => {
    try {
      const cached = localStorage.getItem(USER_STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return !!(storedToken && !storedUser);
  });

  // অ্যাপ লোড হওয়ার সময় টোকেন থাকলে ইউজার প্রোফাইল সাইলেন্টলি ভেরিফাই করা (SWR প্যাটার্ন)
  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      const storedToken = localStorage.getItem(STORAGE_KEY);
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const userData = await fetchCurrentUser(storedToken);
        if (isMounted) {
          setUser(userData);
          setToken(storedToken);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        }
      } catch {
        // টোকেন মেয়াদোত্তীর্ণ বা অবৈধ হলে লোকালস্টোরেজ পরিষ্কার করা
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (tokenResponse: TokenResponse) => {
    localStorage.setItem(STORAGE_KEY, tokenResponse.access_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tokenResponse.user));
    setToken(tokenResponse.access_token);
    setUser(tokenResponse.user);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    if (user.role.name === 'SUPER_ADMIN_CTO') return true;
    return user.role.name.toUpperCase() === roleName.toUpperCase();
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role.name === 'SUPER_ADMIN_CTO') return true;
    return user.permissions.includes(permissionCode);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      hasRole,
      hasPermission,
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

