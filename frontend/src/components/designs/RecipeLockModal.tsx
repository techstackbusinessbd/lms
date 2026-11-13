/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * রেসিপি লক কনফার্মেশন মডাল (Recipe Lock Confirmation Gate)
 *
 * হেড ইঞ্জিনিয়ারের সাইন-অফ ও রেসিপি লক গেটওয়ে পরিচালনা করে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Lock, ShieldAlert, Loader2 } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { lockRecipe, DesignApiError } from '@/services/designApi';
import { LaserDesign } from '@/types/design';

interface RecipeLockModalProps {
  isOpen: boolean;
  design: LaserDesign | null;
  onClose: () => void;
  onLocked: (updated: LaserDesign) => void;
}

export const RecipeLockModal: React.FC<RecipeLockModalProps> = ({
  isOpen,
  design,
  onClose,
  onLocked,
}) => {
  const [lockNotes, setLockNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!design) return null;

  const handleLock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await lockRecipe(design.id, {
        confirm_lock: true,
        lock_notes: lockNotes.trim() || undefined,
      });
      onLocked(updated);
      onClose();
    } catch (err) {
      if (err instanceof DesignApiError) {
        setError(err.message);
      } else {
        setError('Failed to lock recipe. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Lock className="w-4 h-4" />
            <span>Lock Recipe for Floor Production</span>
          </ModalTitle>
        </ModalHeader>

        {error && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form id="lock-recipe-form" onSubmit={handleLock} className="space-y-3.5">
          {/* সতর্কবার্তা নোটিশ */}
          <div className="p-3 rounded-sm bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Immutable Recipe Sign-off</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300 font-mono">
              Once locked, this recipe will be active for all 20 Jeanologia Flat Conveyor tables.
              File contents and parameters cannot be edited on the shop-floor.
            </p>
          </div>

          {/* রেসিপি সারসংক্ষেপ */}
          <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#15171e] border border-slate-200 dark:border-[#272930] text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Recipe:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{design.recipe_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Style Code:</span>
              <span className="font-semibold">{design.style_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Mapped Files:</span>
              <span className="font-bold text-blue-600">{design.files.length} .jean5 files</span>
            </div>
          </div>

          <Input
            label="Head Engineer Approval Notes (Optional)"
            placeholder="e.g. Approved wash parameters for bulk production"
            value={lockNotes}
            onChange={(e) => setLockNotes(e.target.value)}
          />
        </form>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="lock-recipe-form"
            variant="primary"
            disabled={isSubmitting || design.files.length === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Locking Recipe...</span>
              </>
            ) : (
              'Confirm & Lock Recipe'
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
