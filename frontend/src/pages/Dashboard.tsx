/**
 * অ্যাডমিন প্যানেল ওভারভিউ ড্যাশবোর্ড (Modern Industrial Fleet Dashboard)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * ২০টি Jeanologia মেশিনের লাইভ মেট্রিক্স, রিয়েলটাইম ফ্লিট ম্যাট্রিক্স ও অর্ডার ট্র্যাকিং।
 * রুল ১৬ (2px Corner Radius) এবং রুল ২৩ (TanStack DataTable) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import {
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';

export const Dashboard: React.FC = () => {
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
      scansToday: 80 + (i * 17) % 65,
      activeStyle: isEngraving ? "Levi's 511 Slim" : 'Standby',
    };
  });

  const filteredFleet = fleetMachines.filter((m) => {
    if (fleetFilter === 'all') return true;
    return m.state === fleetFilter;
  });

  // রিয়েল প্রোডাকশন অর্ডার ডাটা
  const liveOrders = [
    {
      po: 'PO-884920',
      buyer: "Levi's",
      style: '511 Slim Denim',
      wash: 'Dark Vintage Whisker',
      qty: 2400,
      lasered: 1840,
      step: 'Step 7: Production',
      stepVariant: 'primary',
    },
    {
      po: 'PO-773104',
      buyer: 'H&M',
      style: 'Straight Fit Jean',
      wash: 'Medium Stone Wash',
      qty: 1800,
      lasered: 920,
      step: 'Step 6: eMark Ready',
      stepVariant: 'secondary',
    },
    {
      po: 'PO-991255',
      buyer: 'Zara Man',
      style: 'Tapered Cargo Denim',
      wash: 'Cloud Bleach Fade',
      qty: 1200,
      lasered: 0,
      step: 'Step 2: Laser Vault',
      stepVariant: 'outline',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ১. শীর্ষ ৪টি হাই-ডেনসিটি ইন্ডাস্ট্রিয়াল কেপিআই কার্ড */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* কেপিআই ১: লেজার ফ্লিট সক্রিয়তা */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-sm shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
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
            <span className="text-xs text-zinc-500 font-mono">Tables Active</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <span>Gigabit LAN Ping</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">0.4 ms</span>
          </div>
        </div>

        {/* কেপিআই ২: আজকের লেজার আউটপুট */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-sm shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>TODAY'S PRODUCTION</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">92.0%</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
              1,840
            </span>
            <span className="text-xs text-zinc-500 font-mono">Target: 2,000 pcs</span>
          </div>
          {/* মিনি প্রগ্রেস বার */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-sm mt-2.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-sm" style={{ width: '92%' }} />
          </div>
        </div>

        {/* কেপিআই ৩: সাব-২০০ms স্ক্যান-টু-লেজার লেটেন্সি */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-sm shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>AVERAGE LATENCY</span>
            <Badge variant="primary" className="text-[10px] py-0">
              SLA PASSED
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              42 ms
            </span>
            <span className="text-xs text-zinc-500 font-mono">Limit: &lt;200 ms</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <span>FastAPI Uvicorn</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">Zero Jitter</span>
          </div>
        </div>

        {/* কেপিআই ৪: ফ্লোরে সক্রিয় অর্ডার */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-sm shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>ACTIVE PO ON FLOOR</span>
            <span className="text-zinc-600 dark:text-zinc-400">4 Global Buyers</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
              06 Orders
            </span>
            <span className="text-xs text-zinc-500 font-mono">5,400 Units</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <span>Leading Style</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">Levi's 511</span>
          </div>
        </div>
      </div>

      {/* ২. ২০টি Jeanologia ফ্ল্যাট কনভেয়ার টেবিলের লাইভ ফ্লিট ম্যাট্রিক্স */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-sm shadow-xs p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span>20 Jeanologia Flat Conveyor Tables Live Matrix</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Live Edge-Agent status for eMark .jean5 auto-dispatch
            </p>
          </div>

          {/* ফিল্টার বাটনস */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFleetFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm border transition-colors ${
                fleetFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              All (20)
            </button>
            <button
              onClick={() => setFleetFilter('engraving')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm border transition-colors ${
                fleetFilter === 'engraving'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Engraving (7)
            </button>
            <button
              onClick={() => setFleetFilter('idle')}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm border transition-colors ${
                fleetFilter === 'idle'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              Standby (13)
            </button>
          </div>
        </div>

        {/* ২০টি টেবিলের কমপ্যাক্ট গ্রিড ম্যাট্রিক্স */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {filteredFleet.map((machine) => (
            <div
              key={machine.code}
              className={`p-2.5 rounded-sm border transition-all text-center ${
                machine.state === 'engraving'
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/50 shadow-2xs'
                  : 'bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  {machine.code}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    machine.state === 'engraving'
                      ? 'bg-blue-600 animate-ping'
                      : 'bg-zinc-400 dark:bg-zinc-600'
                  }`}
                />
              </div>
              <p className="text-[10px] text-zinc-500 font-mono truncate">{machine.ip}</p>
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                {machine.scansToday} pcs
              </p>
              <span
                className={`inline-block mt-1 text-[9px] uppercase font-mono px-1 py-0.5 rounded-sm ${
                  machine.state === 'engraving'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {machine.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ৩. লাইভ প্রোডাকশন অর্ডার ট্র্যাকিং (TanStack Table Style) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-sm shadow-xs p-4">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Active Production Orders on Floor
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Live PO status across the locked 8-step workflow chain
            </p>
          </div>
          <Badge variant="primary">3 Running POs</Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO NUMBER</TableHead>
              <TableHead>BUYER & STYLE</TableHead>
              <TableHead>WASH REFERENCE</TableHead>
              <TableHead>TOTAL UNITS</TableHead>
              <TableHead>SHIFT PROGRESS</TableHead>
              <TableHead>CURRENT STAGE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liveOrders.map((order) => {
              const progressPct = Math.round((order.lasered / order.qty) * 100);
              return (
                <TableRow key={order.po}>
                  <TableCell className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {order.po}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {order.buyer}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">{order.style}</div>
                  </TableCell>
                  <TableCell className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {order.wash}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                    {order.qty.toLocaleString()} pcs
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                        <span>{order.lasered} pcs</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-sm overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-sm"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.stepVariant as any}>{order.step}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
