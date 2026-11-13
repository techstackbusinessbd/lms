/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার সারসংক্ষেপ কেপিআই কার্ডস (Executive Industrial Order Stats Strip)
 *
 * রুল ১৬ (2px Corner Radius), রুল ১৮ (Zero Clutter) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Layers, Hash, FileCode, Flame } from 'lucide-react';
import { Order } from '@/types/order';

interface OrderStatsProps {
  orders: Order[];
  totalCount: number;
}

export const OrderStats: React.FC<OrderStatsProps> = ({ orders, totalCount }) => {
  // মোট পিস সংখ্যা হিসাব
  const totalUnits = orders.reduce((sum, o) => sum + (o.total_quantity || 0), 0);

  // বিভিন্ন স্ট্যাটাসের অর্ডার সংখ্যা হিসাব
  const pendingDesignCount = orders.filter((o) => o.status === 'PENDING_DESIGN').length;
  const inProductionCount = orders.filter((o) => o.status === 'IN_PRODUCTION').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* ১. মোট নিবন্ধিত অর্ডার */}
      <div className="relative overflow-hidden p-3.5 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/30 before:to-transparent">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>TOTAL ORDERS</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
            Active
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            {totalCount.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-400 font-mono">POs in System</span>
        </div>
      </div>

      {/* ২. মোট অর্ডারের পিস সংখ্যা */}
      <div className="relative overflow-hidden p-3.5 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/30 before:to-transparent">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold">
            <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>TOTAL VOLUME</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Garments</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
            {totalUnits.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-400 font-mono">Pcs Total</span>
        </div>
      </div>

      {/* ৩. পেন্ডিং ডিজাইন (স্টেপ ২ অপেক্ষমাণ) */}
      <div className="relative overflow-hidden p-3.5 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-500/30 before:to-transparent">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <FileCode className="w-3.5 h-3.5" />
            <span>PENDING DESIGN</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
            Step 2
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
            {pendingDesignCount}
          </span>
          <span className="text-xs text-zinc-400 font-mono">Needs .jean5</span>
        </div>
      </div>

      {/* ৪. লাইভ প্রোডাকশনে চলমান (স্টেপ ৭) */}
      <div className="relative overflow-hidden p-3.5 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/30 before:to-transparent">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <Flame className="w-3.5 h-3.5" />
            <span>IN PRODUCTION</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
            Step 7
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-blue-600 dark:text-blue-400">
            {inProductionCount}
          </span>
          <span className="text-xs text-zinc-400 font-mono">On 20 Tables</span>
        </div>
      </div>
    </div>
  );
};
