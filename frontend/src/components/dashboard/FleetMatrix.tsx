/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ২০টি Jeanologia ফ্ল্যাট কনভেয়ার টেবিলের লাইভ ফ্লিট ম্যাট্রিক্স (Fleet Matrix)
 * 
 * রিয়েলটাইম এজ-এজেন্ট স্ট্যাটাস, .jean5 অটো-ডিসপ্যাচ ও স্ক্যান কাউন্টার।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Radio } from 'lucide-react';

export const FleetMatrix: React.FC = () => {
  const [fleetFilter, setFleetFilter] = useState<'all' | 'engraving' | 'idle'>('all');

  // ২০টি Jeanologia টেবিলের বাস্তবসম্মত লাইভ ফ্লিট ডাটা (M01-M20)
  const fleetMachines = Array.from({ length: 20 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    const isEngraving = i % 3 === 0;
    return {
      code: `M${num}`,
      name: `Table #${num}`,
      ip: `192.168.1.1${num}`,
      state: isEngraving ? 'engraving' : 'idle',
      scansToday: 80 + ((i * 17) % 65),
      activeStyle: isEngraving ? "Levi's 511 Slim" : 'Standby',
    };
  });

  const filteredFleet = fleetMachines.filter((m) => {
    if (fleetFilter === 'all') return true;
    return m.state === fleetFilter;
  });

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/25 before:to-transparent">
      {/* হেডার ও ফিল্টার কন্ট্রোলস */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100 dark:border-[#1f2127]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-mono">
          <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span>Laser Fleet (20 Tables)</span>
        </h3>

        {/* সেগমেন্টেড পিল ফিল্টার বাটনস */}
        <div className="flex items-center p-0.5 rounded-sm bg-slate-100 dark:bg-[#0a0b0e] border border-slate-200/80 dark:border-[#1f2127]">
          <button
            onClick={() => setFleetFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm transition-all cursor-pointer ${
              fleetFilter === 'all'
                ? 'bg-white dark:bg-[#1c1d23] text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All (20)
          </button>
          <button
            onClick={() => setFleetFilter('engraving')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm transition-all cursor-pointer ${
              fleetFilter === 'engraving'
                ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Engraving (7)
          </button>
          <button
            onClick={() => setFleetFilter('idle')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm transition-all cursor-pointer ${
              fleetFilter === 'idle'
                ? 'bg-white dark:bg-[#1c1d23] text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Standby (13)
          </button>
        </div>
      </div>

      {/* ২০টি টেবিলের কমপ্যাক্ট গ্রিড ম্যাট্রিক্স */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
        {filteredFleet.map((machine) => {
          const isEngraving = machine.state === 'engraving';
          return (
            <div
              key={machine.code}
              className={`p-2.5 rounded-sm border transition-all text-center select-none ${
                isEngraving
                  ? 'bg-blue-50/90 dark:bg-[#0b1329] border-blue-300 dark:border-blue-600/40 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-slate-50/70 dark:bg-[#0d0e12] border-slate-200/90 dark:border-[#1c1e24] hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-mono font-bold text-xs ${
                    isEngraving ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {machine.code}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isEngraving
                      ? 'bg-blue-500 shadow-[0_0_6px_#3b82f6] animate-pulse'
                      : 'bg-zinc-400 dark:bg-zinc-600'
                  }`}
                />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                {machine.ip}
              </p>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 font-mono mt-1">
                {machine.scansToday} pcs
              </p>
              <span
                className={`inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm border font-semibold ${
                  isEngraving
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-zinc-100 dark:bg-[#1a1c22] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-[#272930]'
                }`}
              >
                {machine.state}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
