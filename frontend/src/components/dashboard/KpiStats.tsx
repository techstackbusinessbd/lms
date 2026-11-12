/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ড্যাশবোর্ড কেপিআই স্ট্যাটস কার্ডস (High-Density Industrial KPI Stats)
 * 
 * ফ্লিট অ্যাক্টিভিটি, প্রোডাকশন প্রগ্রেস, সাব-২০০ms লেটেন্সি ও অ্যাক্টিভ অর্ডারের সারসংক্ষেপ।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Badge } from '@/components/ui';

export const KpiStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* কেপিআই ১: লেজার ফ্লিট সক্রিয়তা */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xs">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
          <span>FLEET READINESS</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% ONLINE
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            20 / 20
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Tables Active</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span>Gigabit LAN Ping</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">0.4 ms</span>
        </div>
      </div>

      {/* কেপিআই ২: আজকের লেজার আউটপুট */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xs">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
          <span>TODAY'S PRODUCTION</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">92.0%</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            1,840
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Target: 2,000 pcs</span>
        </div>
        {/* মিনি প্রগ্রেস বার */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-sm mt-2.5 overflow-hidden">
          <div className="bg-blue-600 h-full rounded-sm" style={{ width: '92%' }} />
        </div>
      </div>

      {/* কেপিআই ৩: সাব-২০০ms স্ক্যান-টু-লেজার লেটেন্সি */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xs">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
          <span>AVERAGE LATENCY</span>
          <Badge variant="primary" className="text-[10px] py-0">
            SLA PASSED
          </Badge>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            42 ms
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Limit: &lt;200 ms</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span>FastAPI Uvicorn</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">Zero Jitter</span>
        </div>
      </div>

      {/* কেপিআই ৪: ফ্লোরে সক্রিয় অর্ডার */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xs">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
          <span>ACTIVE PO ON FLOOR</span>
          <span className="text-zinc-600 dark:text-zinc-400">4 Global Buyers</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            06 Orders
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">5,400 Units</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span>Leading Style</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">Levi's 511</span>
        </div>
      </div>
    </div>
  );
};
