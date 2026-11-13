/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * থার্মাল প্রিন্ট স্টেশন স্ট্যাটাস ও কেপিআই কার্ডস
 * 
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Layers, Printer, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface PrintStationStatsProps {
  totalUnits: number;
  printedCount: number;
  pendingCount: number;
  completedCount: number;
}

export const PrintStationStats: React.FC<PrintStationStatsProps> = ({
  totalUnits,
  printedCount,
  pendingCount,
  completedCount,
}) => {
  const printProgress = totalUnits > 0 ? Math.round((printedCount / totalUnits) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* মোট কিউআর ইউনিট */}
      <Card className="p-3 bg-white dark:bg-[#121317] border-slate-200/90 dark:border-[#1e2026] rounded-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase text-zinc-500">
            Total QR Units
          </span>
          <div className="w-6 h-6 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
          {totalUnits.toLocaleString()}
        </div>
        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
          Order registered units
        </div>
      </Card>

      {/* প্রিন্ট সম্পন্ন */}
      <Card className="p-3 bg-white dark:bg-[#121317] border-slate-200/90 dark:border-[#1e2026] rounded-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase text-zinc-500">
            Printed Labels
          </span>
          <div className="w-6 h-6 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Printer className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
          {printedCount.toLocaleString()}
        </div>
        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
          {printProgress}% labels spooled
        </div>
      </Card>

      {/* প্রিন্ট বাকি (Pending) */}
      <Card className="p-3 bg-white dark:bg-[#121317] border-slate-200/90 dark:border-[#1e2026] rounded-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase text-zinc-500">
            Pending Print
          </span>
          <div className="w-6 h-6 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
          {pendingCount.toLocaleString()}
        </div>
        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
          Waiting for thermal print
        </div>
      </Card>

      {/* লেজার সম্পন্ন */}
      <Card className="p-3 bg-white dark:bg-[#121317] border-slate-200/90 dark:border-[#1e2026] rounded-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase text-zinc-500">
            Laser Processed
          </span>
          <div className="w-6 h-6 rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
          {completedCount.toLocaleString()}
        </div>
        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
          Complete garments lasered
        </div>
      </Card>
    </div>
  );
};
