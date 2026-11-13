/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * থার্মাল প্রিন্ট স্টেশন ফিল্টার ও টুলবার কম্পোনেন্ট
 * 
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Search, RefreshCw, Plus, Printer, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Order } from '@/types/order';

interface PrintStationToolbarProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sizeFilter: string;
  onSizeFilterChange: (size: string) => void;
  stageFilter: string;
  onStageFilterChange: (stage: string) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  onOpenGenerateModal: () => void;
  selectedCount: number;
  onOpenBatchPrint: () => void;
  availableSizes: string[];
}

export const PrintStationToolbar: React.FC<PrintStationToolbarProps> = ({
  orders,
  selectedOrder,
  onSelectOrder,
  searchQuery,
  onSearchChange,
  sizeFilter,
  onSizeFilterChange,
  stageFilter,
  onStageFilterChange,
  onResetFilters,
  onRefresh,
  onOpenGenerateModal,
  selectedCount,
  onOpenBatchPrint,
  availableSizes,
}) => {
  return (
    <div className="p-3 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1e2026] rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* অর্ডার সিলেক্টর */}
        <div className="flex-1 max-w-md">
          <label className="block text-[10px] font-mono uppercase font-bold text-zinc-500 mb-1">
            Active Garment PO / Style
          </label>
          <select
            value={selectedOrder?.id || ''}
            onChange={(e) => {
              const o = orders.find((ord) => ord.id === e.target.value);
              if (o) onSelectOrder(o);
            }}
            className="w-full text-xs h-8 px-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-mono font-medium focus:ring-1 focus:ring-blue-500"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.buyer_name} | Style: {o.style_code} | {o.po_number || o.job_no} ({o.total_quantity} pcs)
              </option>
            ))}
          </select>
        </div>

        {/* প্রাইমারি অ্যাকশন বাটনস */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {selectedCount > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenBatchPrint}
              className="text-xs gap-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm animate-in fade-in"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Batch Print ({selectedCount} Labels)</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenGenerateModal}
            className="text-xs gap-1.5 rounded-sm shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate QR Units</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="text-xs h-8 px-2 rounded-sm border-slate-200/90 dark:border-[#22252e]"
            title="Refresh Unit List"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ফিল্টারিং রো: সার্চ, সাইজ এবং স্টেজ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1a1c22]">
        {/* সার্চ বক্স */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search Serial / QR Payload..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs h-8 pl-8 pr-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-mono placeholder:font-sans focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* সাইজ ফিল্টার */}
        <div>
          <select
            value={sizeFilter}
            onChange={(e) => onSizeFilterChange(e.target.value)}
            className="w-full text-xs h-8 px-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-mono focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Garment Sizes</option>
            {availableSizes.map((s) => (
              <option key={s} value={s}>
                Size {s}
              </option>
            ))}
          </select>
        </div>

        {/* স্টেজ ফিল্টার */}
        <div>
          <select
            value={stageFilter}
            onChange={(e) => onStageFilterChange(e.target.value)}
            className="w-full text-xs h-8 px-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-mono focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Workflow Stages</option>
            <option value="GENERATED">Generated (Pending Print)</option>
            <option value="PRINTED">Printed Labels</option>
            <option value="ATTACHED">Attached at Sewing</option>
            <option value="RECEIVED_AT_LASER">At Laser Table</option>
            <option value="COMPLETED">Laser Completed</option>
          </select>
        </div>

        {/* ক্লিয়ার ফিল্টার বাটন */}
        {(searchQuery || sizeFilter !== 'ALL' || stageFilter !== 'ALL') && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs gap-1 rounded-sm border border-slate-200/90 dark:border-[#22252e]"
          >
            <FilterX className="w-3.5 h-3.5 text-zinc-500" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
};
