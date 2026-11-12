/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * থিম ম্যানেজার হুক (Theme Management Hook)
 * ডার্ক মোড ও লাইট মোড নির্বিঘ্নে টগল ও লোকাল স্টোরেজে সংরক্ষণ
 */

import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

export function useTheme(): {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
} {
  // লোকাল স্টোরেজ থেকে সেভ করা থিম লোড করা (ডিফল্ট: dark)
  const [theme, setCurrentTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lacs_theme') as ThemeMode | null;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('lacs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return {
    theme,
    toggleTheme,
    setTheme: setCurrentTheme,
  };
}

