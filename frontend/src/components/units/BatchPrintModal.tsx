/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * বাল্ক থার্মাল প্রিন্ট ও ZPL স্পুলার মডাল (Batch ZPL Spooler Modal)
 * 
 * রুল ১৬ (2px Corner Radius), রুল ০৪ (<300 Lines) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect } from 'react';
import { Printer, Copy, Check, FileText, Loader2 } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GarmentUnit } from '@/types/unit';
import { generateBatchZpl, markUnitsPrinted } from '@/services/unitApi';

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUnits: GarmentUnit[];
  onPrintCompleted: () => void;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  isOpen,
  onClose,
  selectedUnits,
  onPrintCompleted,
}) => {
  const [zplData, setZplData] = useState<string>('');
  const [isLoadingZpl, setIsLoadingZpl] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedZpl, setCopiedZpl] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sizeSummary = React.useMemo(() => {
    const summary: Record<string, number> = {};
    selectedUnits.forEach((u) => {
      summary[u.size_code] = (summary[u.size_code] || 0) + 1;
    });
    return summary;
  }, [selectedUnits]);

  useEffect(() => {
    if (isOpen && selectedUnits.length > 0) {
      setIsLoadingZpl(true);
      setErrorMsg(null);
      const ids = selectedUnits.map((u) => u.id);
      generateBatchZpl(ids)
        .then((res) => {
          setZplData(res.zpl_data);
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Failed to generate ZPL spool.');
        })
        .finally(() => {
          setIsLoadingZpl(false);
        });
    }
  }, [isOpen, selectedUnits]);

  const handleCopyZpl = async () => {
    if (!zplData) return;
    await navigator.clipboard.writeText(zplData);
    setCopiedZpl(true);
    setTimeout(() => setCopiedZpl(false), 2000);
  };

  const handleSpoolAndMark = async () => {
    setIsSubmitting(true);
    try {
      const ids = selectedUnits.map((u) => u.id);
      await markUnitsPrinted(ids);
      onPrintCompleted();
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Failed to update print status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-xl">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-sm font-mono">
            <Printer className="w-4 h-4 text-emerald-500" />
            <span>Batch Thermal Print Spool ({selectedUnits.length} Labels)</span>
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-[#121317] border border-slate-200/80 dark:border-[#1e2026] rounded-sm">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mr-2">
              Selected Breakdown:
            </div>
            {Object.entries(sizeSummary).map(([size, count]) => (
              <div
                key={size}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold"
              >
                <span>Size {size}:</span>
                <span className="font-bold">{count} pcs</span>
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Zebra ZPL II Print Stream (Raw Port 9100 / USB)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyZpl}
                disabled={!zplData || isLoadingZpl}
                className="h-6 px-2 text-[11px] gap-1 rounded-sm border-slate-300 dark:border-[#2a2d37]"
              >
                {copiedZpl ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedZpl ? 'Copied' : 'Copy Raw ZPL'}</span>
              </Button>
            </div>

            <div className="relative">
              {isLoadingZpl ? (
                <div className="h-44 flex items-center justify-center bg-zinc-950 text-zinc-400 font-mono text-xs rounded-sm border border-zinc-800">
                  <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-500" />
                  Compiling {selectedUnits.length} ZPL Stencils...
                </div>
              ) : (
                <textarea
                  readOnly
                  value={zplData}
                  rows={7}
                  className="w-full p-2.5 text-[11px] font-mono bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-sm select-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ZPL stream empty..."
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-[#1e2026]">
            <span className="text-[11px] text-zinc-500 font-mono">
              Directly compatible with Zebra & TSPL Thermal Printers
            </span>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onClose} className="text-xs rounded-sm">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSpoolAndMark}
                disabled={isSubmitting || isLoadingZpl || selectedUnits.length === 0}
                className="text-xs gap-1.5 rounded-sm"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                <span>Spool & Mark as Printed</span>
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
