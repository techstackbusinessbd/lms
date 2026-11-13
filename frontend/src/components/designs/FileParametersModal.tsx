/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার প্যারামিটার এডিটিং মডাল (Laser File Parameters Modal)
 *
 * পাওয়ার (Power %), স্পিড (Speed %) ও সাইকেল টাইম (Cycle Time) সমন্বয়।
 * রুল: রেসিপি লক থাকলে অপারেটর এডিট করতে পারবে না; আনলক থাকলে এডিট করতে পারবে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Lock, Loader2, AlertCircle } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateFileParameters, DesignApiError } from '@/services/designApi';
import { LaserDesignFile } from '@/types/design';

interface FileParametersModalProps {
  isOpen: boolean;
  designId: string;
  file: LaserDesignFile | null;
  isLocked: boolean;
  onClose: () => void;
  onParametersUpdated: (updatedFile: LaserDesignFile) => void;
}

export const FileParametersModal: React.FC<FileParametersModalProps> = ({
  isOpen,
  designId,
  file,
  isLocked,
  onClose,
  onParametersUpdated,
}) => {
  const [power, setPower] = useState<string>('');
  const [speed, setSpeed] = useState<string>('');
  const [cycleTime, setCycleTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setPower(file.power_percentage !== null && file.power_percentage !== undefined ? String(file.power_percentage) : '');
      setSpeed(file.speed_percentage !== null && file.speed_percentage !== undefined ? String(file.speed_percentage) : '');
      setCycleTime(file.cycle_time_estimate_sec !== null && file.cycle_time_estimate_sec !== undefined ? String(file.cycle_time_estimate_sec) : '');
      setError(null);
    }
  }, [file]);

  if (!file) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setError('Cannot edit parameters: Recipe is LOCKED by designer.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateFileParameters(designId, file.id, {
        power_percentage: power ? Number(power) : null,
        speed_percentage: speed ? Number(speed) : null,
        cycle_time_estimate_sec: cycleTime ? Number(cycleTime) : null,
      });
      onParametersUpdated(updated);
      onClose();
    } catch (err) {
      if (err instanceof DesignApiError) {
        setError(err.message);
      } else {
        setError('Failed to update laser parameters. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Laser Parameters (Sz {file.size_code} - {file.placement})</span>
          </ModalTitle>
        </ModalHeader>

        {isLocked && (
          <div className="p-3 rounded-sm bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2 text-amber-800 dark:text-amber-200 text-xs">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Parameters Enforced (Locked)</p>
              <p className="text-[11px] font-mono text-amber-700 dark:text-amber-300">
                Recipe is locked by designer. Machine operator cannot modify parameters. Unlock recipe to enable parameter adjustments.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form id="edit-parameters-form" onSubmit={handleSubmit} className="space-y-3.5">
          <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#15171e] border border-slate-200 dark:border-[#272930] text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">File:</span>
              <span className="font-bold truncate max-w-[200px]" title={file.original_filename}>{file.original_filename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span className={isLocked ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                {isLocked ? 'Locked (Read-Only)' : 'Unlocked (Operator Editable)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <Input
              label="Power Cap (%)"
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 85"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              disabled={isLocked || isSubmitting}
            />
            <Input
              label="Speed Cap (%)"
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 90"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              disabled={isLocked || isSubmitting}
            />
            <Input
              label="Cycle Time (s)"
              type="number"
              min={0}
              placeholder="e.g. 42"
              value={cycleTime}
              onChange={(e) => setCycleTime(e.target.value)}
              disabled={isLocked || isSubmitting}
            />
          </div>
        </form>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {isLocked ? 'Close' : 'Cancel'}
          </Button>
          {!isLocked && (
            <Button
              type="submit"
              form="edit-parameters-form"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Parameters'
              )}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
