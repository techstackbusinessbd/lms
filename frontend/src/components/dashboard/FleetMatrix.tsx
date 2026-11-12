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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xs p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>20 Jeanologia Flat Conveyor Tables Live Matrix</span>
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
            Live Edge-Agent status for eMark .jean5 auto-dispatch
          </p>
        </div>

        {/* ফিল্টার বাটনস */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFleetFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm border transition-colors ${
              fleetFilter === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All (20)
          </button>
          <button
            onClick={() => setFleetFilter('engraving')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm border transition-colors ${
              fleetFilter === 'engraving'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Engraving (7)
          </button>
          <button
            onClick={() => setFleetFilter('idle')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm border transition-colors ${
              fleetFilter === 'idle'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
              className={`p-2.5 rounded-sm border transition-all text-center ${
                isEngraving
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-mono font-bold text-xs ${
                    isEngraving ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {machine.code}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isEngraving
                      ? 'bg-blue-600 dark:bg-blue-400 animate-ping'
                      : 'bg-zinc-400 dark:bg-zinc-600'
                  }`}
                />
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                {machine.ip}
              </p>
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                {machine.scansToday} pcs
              </p>
              <span
                className={`inline-block mt-1 text-[9px] uppercase font-mono px-1 py-0.5 rounded-sm border ${
                  isEngraving
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
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
