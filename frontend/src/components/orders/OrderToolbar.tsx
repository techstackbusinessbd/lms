/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার ফিল্টার ও সার্চ টুলবার (Industrial Order Toolbar)
 *
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Search } from 'lucide-react';

export interface StatusTab {
  id: string;
  label: string;
}

export const DEFAULT_STATUS_TABS: StatusTab[] = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'PENDING_DESIGN', label: 'Pending Design' },
  { id: 'DESIGN_APPROVED', label: 'Approved' },
  { id: 'IN_PRODUCTION', label: 'In Production' },
  { id: 'COMPLETED', label: 'Completed' },
];

interface OrderToolbarProps {
  statusTabs?: StatusTab[];
  activeStatus: string;
  onSelectStatus: (statusId: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalOrders: number;
  statusCounts: Record<string, number>;
}

export const OrderToolbar: React.FC<OrderToolbarProps> = ({
  statusTabs = DEFAULT_STATUS_TABS,
  activeStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  totalOrders,
  statusCounts,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-1.5 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* ১. সেগমেন্টেড ফিল্টার বাটনস */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {statusTabs.map((tab) => {
          const count =
            tab.id === 'ALL' ? totalOrders : statusCounts[tab.id] || 0;
          const isActive = activeStatus === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectStatus(tab.id)}
              className={`h-7 px-2.5 text-xs font-mono rounded-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-[#1a1c22]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-sm ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/70 dark:bg-[#1f2127] text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ২. সার্চ ইনপুট */}
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search Job, PO, Style, Buyer..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-7 pl-8 pr-3 rounded-sm bg-slate-50 dark:bg-[#0e0f12] border border-slate-200 dark:border-[#22242c] text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 transition-colors"
        />
      </div>
    </div>
  );
};
