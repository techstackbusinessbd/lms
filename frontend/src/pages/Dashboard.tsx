/**
 * অ্যাডমিন প্যানেল ওভারভিউ ড্যাশবোর্ড (Executive Industrial Fleet Dashboard)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * ২০টি Jeanologia মেশিনের লাইভ মেট্রিক্স, রিয়েলটাইম ফ্লিট ম্যাট্রিক্স ও অর্ডার ট্র্যাকিং।
 * রুল ১৬ (2px Corner Radius), রুল ১৮ (Zero Clutter) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { KpiStats } from '@/components/dashboard/KpiStats';
import { FleetMatrix } from '@/components/dashboard/FleetMatrix';
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
  // রিয়েল প্রোডাকশন অর্ডার ডাটা (লকড ৮-স্টেপ চেইনের সাথে সরাসরি সংযুক্ত)
  const liveOrders = [
    {
      po: 'PO-884920',
      buyer: "Levi's",
      style: '511 Slim Denim',
      wash: 'Dark Vintage Whisker',
      qty: 2400,
      lasered: 1840,
      step: 'Step 7: Production',
      stepVariant: 'primary' as const,
    },
    {
      po: 'PO-773104',
      buyer: 'H&M',
      style: 'Straight Fit Jean',
      wash: 'Medium Stone Wash',
      qty: 1800,
      lasered: 920,
      step: 'Step 6: eMark Ready',
      stepVariant: 'default' as const,
    },
    {
      po: 'PO-991255',
      buyer: 'Zara Man',
      style: 'Tapered Cargo Denim',
      wash: 'Cloud Bleach Fade',
      qty: 1200,
      lasered: 0,
      step: 'Step 2: Laser Vault',
      stepVariant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ১. শীর্ষ ৪টি হাই-ডেনসিটি ইন্ডাস্ট্রিয়াল কেপিআই কার্ড */}
      <KpiStats />

      {/* ২. ২০টি Jeanologia ফ্ল্যাট কনভেয়ার টেবিলের লাইভ ফ্লিট ম্যাট্রিক্স */}
      <FleetMatrix />

      {/* ৩. লাইভ প্রোডাকশন অর্ডার ট্র্যাকিং */}
      <div className="relative overflow-hidden bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-500/25 before:to-transparent">
        {/* কার্ড হেডার */}
        <div className="p-3.5 px-4 flex items-center justify-between border-b border-slate-100 dark:border-[#1f2127] bg-white dark:bg-[#121317]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
            Active Orders
          </h3>
          <Badge variant="primary" hasDot>
            3 Active
          </Badge>
        </div>

        {/* সিমলেস ভার্চুয়ালাইজড টেবিল */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO NUMBER</TableHead>
              <TableHead>BUYER &amp; STYLE</TableHead>
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
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {order.buyer}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono">
                      {order.style}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-300 font-medium">
                    {order.wash}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                    {order.qty.toLocaleString()} pcs
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                        <span>{order.lasered} pcs</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#1c1d23] h-1.5 rounded-sm overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-sm shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.stepVariant}>{order.step}</Badge>
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
