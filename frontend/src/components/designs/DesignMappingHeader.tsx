/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ডিজাইন ম্যাপিং মডাল হেডার ও স্টাইল সিলেক্টর (Design Mapping Modal Header)
 *
 * অর্ডারের মেটাডেটা (Buyer, Style, Job, Qty), রেসিপি রিভিশন ব্যাজ ও লকিং বাটন সমন্বিত হেডার।
 * রুল ১৬ (2px Corner Radius), রুল ১২ (English UI) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Layers, Lock, Unlock, CopyPlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Order } from '@/types/order';
import { LaserDesign } from '@/types/design';

interface DesignMappingHeaderProps {
  orders: Order[];
  selectedOrderId: string;
  selectedOrder: Order | null;
  activeDesign: LaserDesign | null;
  isInitialDesign: boolean;
  onOrderChange: (orderId: string) => void;
  onLockClick: () => void;
  onUnlockClick: () => void;
  onNewRevisionClick: () => void;
}

export const DesignMappingHeader: React.FC<DesignMappingHeaderProps> = ({
  orders,
  selectedOrderId,
  selectedOrder,
  activeDesign,
  isInitialDesign,
  onOrderChange,
  onLockClick,
  onUnlockClick,
  onNewRevisionClick,
}) => {
  return (
    <div className="flex flex-col border-b border-slate-200 dark:border-[#272930] bg-white dark:bg-[#121317]">
      {/* ১. প্রাইমারি হেডার বার (Close বাটন ক্লিয়ারেন্স সহ) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 pr-14">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
                {activeDesign ? `Style Mapping Matrix: ${activeDesign.style_code}` : 'Laser Design Mapping'}
              </h2>
              {activeDesign && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-semibold">
                  Rev v{activeDesign.version}
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              Jeanologia eMark (.jean5 / .jean) and artwork size recipe matrix
            </p>
          </div>
        </div>

        {/* হেডার রাইট: স্ট্যাটাস ও লকিং অ্যাকশন */}
        {activeDesign && (
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={activeDesign.is_locked ? 'success' : 'warning'}
              hasDot
              className="text-[10px] font-mono py-0.5"
            >
              {activeDesign.is_locked ? 'Floor Locked' : 'Draft Editing'}
            </Badge>

            {!activeDesign.is_locked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onLockClick}
                disabled={activeDesign.files.length === 0}
                className="h-7 text-xs font-mono text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                <span>Lock Recipe</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUnlockClick}
                  className="h-7 text-xs font-mono text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  title="Unlock to allow operator parameter adjustments on the floor"
                >
                  <Unlock className="w-3.5 h-3.5 mr-1" />
                  <span>Unlock Recipe</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNewRevisionClick}
                  className="h-7 text-xs font-mono"
                  title="Create new design revision"
                >
                  <CopyPlus className="w-3.5 h-3.5 mr-1" />
                  <span>New Rev</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ২. স্টাইল সিলেক্টর ও অর্ডার মেটাডেটা স্ট্রিপ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-6 py-2.5 bg-slate-50/80 dark:bg-[#161820]/80 border-t border-slate-200/80 dark:border-[#22242c]">
        {/* লেফট: স্টাইল ও পিও সিলেক্টর */}
        <div className="flex flex-wrap items-center gap-3">
          {!isInitialDesign ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
                Garment Style / PO:
              </span>
              <div className="w-72 sm:w-80">
                <Select
                  options={orders.map((o) => ({
                    value: o.id,
                    label: `${o.style_code} — ${o.buyer_name} (${o.job_no || o.po_number || 'PO'})`,
                  }))}
                  value={selectedOrderId}
                  onChange={(e) => onOrderChange(e.target.value)}
                  placeholder="Select Style & Order..."
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-semibold text-zinc-500">Target Style:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-sm border border-blue-200 dark:border-blue-900/50">
                {selectedOrder?.style_code || activeDesign?.style_code}
              </span>
            </div>
          )}

          {/* লাইভ মেটাডেটা পিলস */}
          {selectedOrder && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              <span className="px-2 py-0.5 rounded-sm bg-white dark:bg-[#1a1c24] border border-slate-200 dark:border-[#272930]">
                Buyer: <strong className="text-zinc-800 dark:text-zinc-200">{selectedOrder.buyer_name}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-white dark:bg-[#1a1c24] border border-slate-200 dark:border-[#272930]">
                Job No: <strong className="text-zinc-800 dark:text-zinc-200">{selectedOrder.job_no || selectedOrder.po_number}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-white dark:bg-[#1a1c24] border border-slate-200 dark:border-[#272930]">
                Order Qty: <strong className="text-zinc-800 dark:text-zinc-200">{selectedOrder.total_quantity.toLocaleString()} {selectedOrder.uom}</strong>
              </span>
            </div>
          )}
        </div>

        {/* রাইট: রেসিপি ম্যাপিং স্ট্যাটাস */}
        {activeDesign && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Files in Vault:</span>
            <strong className="text-zinc-800 dark:text-zinc-200 font-bold ml-1">
              {activeDesign.files.length} File(s)
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

