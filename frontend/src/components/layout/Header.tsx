/**
 * অ্যাডমিন প্যানেল টপ হেডার (Executive Industrial Top Header)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * লাইভ সিস্টেম হেলথ, লোকাল ল্যান স্ট্যাটাস, থিম টগল ও সিনক্রোনাইজেশন কন্ট্রোল।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
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
    <header className="h-14 px-6 bg-white dark:bg-[#0f1013] border-b border-slate-200 dark:border-[#1f2127] flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* ১. বামদিকের পেজ টাইটেল ও সাব-টেলিমিতি */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase font-mono">
          {pageTitle}
        </h2>
        <span className="text-zinc-300 dark:text-zinc-700 font-mono">/</span>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span>20 Flat Conveyor Tables Online</span>
        </div>
      </div>

      {/* ২. ডানদিকের লাইভ টেলিমিতি ও অ্যাকশন কন্ট্রোলস */}
      <div className="flex items-center gap-2">
        {/* ল্যান স্ট্যাটাস অরা ব্যাজ */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-sm text-[11px] font-mono font-medium">
          <Wifi className="w-3 h-3 text-emerald-500" />
          <span>Gigabit LAN</span>
        </div>

        {/* সাব-২০০ms SLA ব্যাজ */}
        <Badge variant="primary" hasDot className="hidden sm:inline-flex text-[10px]">
          &lt;200ms SLA
        </Badge>

        {/* ডেটাবেজ স্ট্যাটাস */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-[#18191e] border border-zinc-200 dark:border-[#272930] rounded-sm text-[11px] font-mono">
          <div
            className={`w-2 h-2 rounded-full ${
              isDbConnected
                ? 'bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse'
                : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
            }`}
          />
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">
            {isDbConnected ? 'DB Active' : 'Disconnected'}
          </span>
        </div>

        {/* থিম টগল বাটন */}
        <button
          onClick={toggleTheme}
          type="button"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 rounded-sm border border-zinc-200 dark:border-[#272930] bg-zinc-50 dark:bg-[#18191e] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#202228] transition-colors shadow-2xs cursor-pointer"
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
          className="h-8 px-2.5 rounded-sm border border-zinc-200 dark:border-[#272930] bg-zinc-50 dark:bg-[#18191e] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#202228] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-blue-600 dark:text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-mono text-[11px]">Sync</span>
        </button>
      </div>
    </header>
  );
};
