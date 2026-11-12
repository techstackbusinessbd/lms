/**
 * অ্যাডমিন প্যানেল টপ হেডার (Modern Industrial Top Header)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * লাইভ সিস্টেম হেলথ, লোকাল ল্যান স্ট্যাটাস, থিম টগল ও সিনক্রোনাইজেশন কন্ট্রোল।
 */

import React from 'react';
import { RefreshCw, Sun, Moon, Activity, Wifi } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui';

interface HeaderProps {
  pageTitle: string;
  isDbConnected: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  isDbConnected,
  onSync,
  isSyncing,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 px-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* ১. বামদিকের পেজ টাইটেল ও ব্রেডক্রাম্ব */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
          {pageTitle}
        </h2>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>20 Flat Conveyor Tables Online</span>
        </div>
      </div>

      {/* ২. ডানদিকের লাইভ টেলিমিতি ও অ্যাকশন কন্ট্রোলস */}
      <div className="flex items-center gap-2">
        {/* ল্যান স্ট্যাটাস ব্যাজ */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-sm text-[11px] font-mono font-medium">
          <Wifi className="w-3 h-3 text-emerald-500" />
          <span className="text-zinc-700 dark:text-zinc-300">Gigabit LAN</span>
        </div>

        {/* সাব-২০০ms SLA ব্যাজ */}
        <Badge variant="primary" className="hidden sm:inline-flex font-mono text-[10px]">
          &lt;200ms SLA
        </Badge>

        {/* ডেটাবেজ স্ট্যাটাস */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 rounded-sm text-[11px] font-mono">
          <div
            className={`w-2 h-2 rounded-full ${
              isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-zinc-700 dark:text-zinc-300">
            {isDbConnected ? 'DB Active' : 'Disconnected'}
          </span>
        </div>

        {/* থিম টগল বাটন */}
        <button
          onClick={toggleTheme}
          type="button"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 rounded-sm border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-blue-600" />
          )}
        </button>

        {/* রিফ্রেশ / সিঙ্ক বাটন */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          title="Sync Realtime Fleet Data"
          className="h-8 px-2.5 rounded-sm border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>
      </div>
    </header>
  );
};
