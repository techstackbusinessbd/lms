/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ডিজাইন ম্যাপিং মডাল ফুটার ও অ্যাকশন বার (Design Mapping Modal Footer)
 *
 * রেডি সাইজ কাউন্টার এবং রেসিপি লক/আনলক ও ক্লোজ বাটনসমূহ।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React from 'react';
import { Lock, Unlock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DesignMappingFooterProps {
  completedCount: number;
  totalSizes: number;
  isLocked: boolean;
  hasFiles: boolean;
  onClose: () => void;
  onLockClick: () => void;
  onUnlockClick: () => void;
}

export const DesignMappingFooter: React.FC<DesignMappingFooterProps> = ({
  completedCount,
  totalSizes,
  isLocked,
  hasFiles,
  onClose,
  onLockClick,
  onUnlockClick,
}) => {
  return (
    <div className="px-6 py-3 border-t border-slate-200 dark:border-[#272930] bg-slate-50/60 dark:bg-[#15171e]/60 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span>
          <strong className="text-zinc-800 dark:text-zinc-200">{completedCount}</strong> of{' '}
          {totalSizes} Sizes Ready (Front &amp; Back Mapped)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-mono">
          Close
        </Button>
        {!isLocked ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onLockClick}
            disabled={!hasFiles}
            className="h-8 text-xs font-mono"
          >
            <Lock className="w-3.5 h-3.5 mr-1" />
            <span>Lock &amp; Authorize Recipe</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnlockClick}
            className="h-8 text-xs font-mono text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <Unlock className="w-3.5 h-3.5 mr-1" />
            <span>Unlock for Parameter Editing</span>
          </Button>
        )}
      </div>
    </div>
  );
};
