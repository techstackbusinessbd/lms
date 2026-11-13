/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * রেসিপি আনলক কনফার্মেশন মডাল (Recipe Unlock Confirmation Gate)
 *
 * লক করা রেসিপি আনলক করে ফ্লোরে অপারেটরের প্যারামিটার এডিট করার অনুমতি দেয়।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Unlock, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { unlockRecipe, DesignApiError } from '@/services/designApi';
import { LaserDesign } from '@/types/design';

interface RecipeUnlockModalProps {
  isOpen: boolean;
  design: LaserDesign | null;
  onClose: () => void;
  onUnlocked: (updated: LaserDesign) => void;
}

export const RecipeUnlockModal: React.FC<RecipeUnlockModalProps> = ({
  isOpen,
  design,
  onClose,
  onUnlocked,
}) => {
  const [unlockNotes, setUnlockNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!design) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await unlockRecipe(design.id, {
        confirm_unlock: true,
        unlock_notes: unlockNotes.trim() || undefined,
      });
      onUnlocked(updated);
      onClose();
    } catch (err) {
      if (err instanceof DesignApiError) {
        setError(err.message);
      } else {
        setError('Failed to unlock recipe. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Unlock className="w-4 h-4" />
            <span>Unlock Recipe for Parameter Tuning</span>
          </ModalTitle>
        </ModalHeader>

        {error && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form id="unlock-recipe-form" onSubmit={handleUnlock} className="space-y-3.5">
          {/* তথ্য নোটিশ */}
          <div className="p-3 rounded-sm bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Operator Editing Authorization</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300 font-mono">
              Unlocking this recipe permits machine operators to adjust laser parameters
              (Power %, Speed %, Cycle Time) directly from the machine workstation.
            </p>
          </div>

          {/* রেসিপি বিবরণ */}
          <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#15171e] border border-slate-200 dark:border-[#272930] text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Recipe:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{design.recipe_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Style:</span>
              <span className="font-semibold">{design.style_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Current Status:</span>
              <span className="font-bold text-emerald-600">Floor Locked</span>
            </div>
          </div>

          <Input
            label="Reason for Unlocking (Optional)"
            placeholder="e.g. Wash floor shade tuning / laser parameter adjustment"
            value={unlockNotes}
            onChange={(e) => setUnlockNotes(e.target.value)}
          />
        </form>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="unlock-recipe-form"
            variant="primary"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Unlocking...</span>
              </>
            ) : (
              'Confirm & Unlock Recipe'
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

