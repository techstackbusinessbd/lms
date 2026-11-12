/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ড্যাশবোর্ড কেপিআই স্ট্যাটস কার্ডস (Executive Industrial KPI Stats)
 * 
 * ফ্লিট অ্যাক্টিভিটি, প্রোডাকশন প্রগ্রেস, সাব-২০০ms লেটেন্সি ও অ্যাক্টিভ অর্ডারের সারসংক্ষেপ।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Gauge, Radio, TrendingUp, PackageCheck } from 'lucide-react';
import { Badge } from '@/components/ui';

export const KpiStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* কেপিআই ১: লেজার ফ্লিট সক্রিয়তা */}
      <div className="relative overflow-hidden p-4 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/30 before:to-transparent">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>FLEET READINESS</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
            100% ONLINE
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            20 / 20
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Tables Active</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pt-2 border-t border-slate-100 dark:border-[#1f2127]">
          <span>Gigabit LAN Ping</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">0.4 ms</span>
        </div>
      </div>

      {/* কেপিআই ২: আজকের লেজার আউটপুট */}
      <div className="relative overflow-hidden p-4 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/30 before:to-transparent">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>TODAY'S PRODUCTION</span>
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono text-[11px]">92.0%</span>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            1,840
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Target: 2,000 pcs</span>
        </div>
        {/* মিনি প্রগ্রেস বার */}
        <div className="w-full bg-slate-100 dark:bg-[#1c1d23] h-1.5 rounded-sm mt-2.5 overflow-hidden">
          <div className="bg-blue-600 h-full rounded-sm shadow-[0_0_8px_rgba(37,99,235,0.4)]" style={{ width: '92%' }} />
        </div>
      </div>

      {/* কেপিআই ৩: সাব-২০০ms স্ক্যান-টু-লেজার লেটেন্সি */}
      <div className="relative overflow-hidden p-4 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/30 before:to-transparent">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AVERAGE LATENCY</span>
          </span>
          <Badge variant="primary" hasDot className="text-[10px] py-0">
            SLA PASSED
          </Badge>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            42 ms
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Limit: &lt;200 ms</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pt-2 border-t border-slate-100 dark:border-[#1f2127]">
          <span>FastAPI Engine</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">Sub-200ms Active</span>
        </div>
      </div>

      {/* কেপিআই ৪: ফ্লোরে সক্রিয় অর্ডার */}
      <div className="relative overflow-hidden p-4 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/30 before:to-transparent">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono font-medium">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <PackageCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>ACTIVE PO ON FLOOR</span>
          </span>
          <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">4 Global Buyers</span>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            06 Orders
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">5,400 Units</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono pt-2 border-t border-slate-100 dark:border-[#1f2127]">
          <span>Leading Style</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">Levi's 511 Slim</span>
        </div>
      </div>
    </div>
  );
};
