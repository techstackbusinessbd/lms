/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * সাইজ কন্ট্রোল ও কুইক-প্রিসেট টুলবার (Design Size Toolbar)
 *
 * একক বা কমা-সেপারেটেড সাইজ এন্ট্রি এবং দ্রুত সাইজ যোগ করার প্রিসেট চিপস।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DesignSizeToolbarProps {
  existingSizes: string[];
  onAddSizes: (sizes: string) => void;
}

const COMMON_SIZE_PRESETS = ['28', '30', '32', '34', '36', '38', '40'];

export const DesignSizeToolbar: React.FC<DesignSizeToolbarProps> = ({
  existingSizes,
  onAddSizes,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleAdd = (val?: string) => {
    const toAdd = val !== undefined ? val : inputVal;
    if (toAdd.trim()) {
      onAddSizes(toAdd);
      if (val === undefined) setInputVal('');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-sm bg-slate-50 dark:bg-[#161820] border border-slate-200 dark:border-[#272930]">
      {/* ১. কুইক প্রিসেট সাইজ চিপস */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
          Quick Add Sizes:
        </span>
        <div className="flex items-center gap-1 flex-wrap">
          {COMMON_SIZE_PRESETS.map((sz) => {
            const isAdded = existingSizes.includes(sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => !isAdded && handleAdd(sz)}
                disabled={isAdded}
                className={`px-2 py-0.5 rounded-sm text-xs font-mono transition-colors ${
                  isAdded
                    ? 'bg-slate-200/60 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : 'bg-white dark:bg-[#1a1c24] text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-[#272930] hover:border-blue-400'
                }`}
              >
                +{sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* ২. ম্যানুয়াল সাইজ ইনপুট (কমা-সেপারেটেড সাপোর্ট) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          placeholder="e.g. 28, 30, 32 or XL"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="h-7 px-2.5 text-xs font-mono rounded-sm border border-slate-200 dark:border-[#272930] bg-white dark:bg-[#121317] w-40 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleAdd()}
          className="h-7 px-3 text-xs font-mono"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add Size</span>
        </Button>
      </div>
    </div>
  );
};
