/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মাস্টার ডাটা ম্যানেজমেন্ট পোর্টাল (Master Data Management Portal)
 * 
 * Company, Buyer, Brand এবং Season সেন্ট্রাল কনফিগারেশন স্ক্রিন।
 * রুল ১৬ (2px Corner Radius), রুল ২৩ (TanStack Table) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Database, Building, Globe, Tag, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CompanyTab } from '@/components/master/CompanyTab';
import { BuyerTab } from '@/components/master/BuyerTab';
import { BrandTab } from '@/components/master/BrandTab';
import { SeasonTab } from '@/components/master/SeasonTab';

export type MasterTabKey = 'companies' | 'buyers' | 'brands' | 'seasons';

export const MasterDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MasterTabKey>('companies');

  const tabs: Array<{ key: MasterTabKey; label: string; icon: React.ElementType }> = [
    { key: 'companies', label: 'Factory Units (Companies)', icon: Building },
    { key: 'buyers', label: 'Garment Buyers', icon: Globe },
    { key: 'brands', label: 'Buyer Brands', icon: Tag },
    { key: 'seasons', label: 'Production Seasons', icon: Calendar },
  ];

  return (
    <div className="space-y-4">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                Master Data Registry
              </h1>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Core References
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage dynamic factory units, customer accounts, sub-brands & seasonal catalogues
            </p>
          </div>
        </div>
      </div>

      {/* ট্যাব সিলেক্টর বার */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#121317] border border-slate-200/80 dark:border-[#1e2026] rounded-sm overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-sm transition-all select-none cursor-pointer whitespace-nowrap',
                isActive
                  ? 'bg-white dark:bg-[#1c1e26] text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/90 dark:border-[#272a33]'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* সক্রিয় ট্যাব কন্টেন্ট */}
      {activeTab === 'companies' && <CompanyTab />}
      {activeTab === 'buyers' && <BuyerTab />}
      {activeTab === 'brands' && <BrandTab />}
      {activeTab === 'seasons' && <SeasonTab />}
    </div>
  );
};
