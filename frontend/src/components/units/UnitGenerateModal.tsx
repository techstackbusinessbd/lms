/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * বাল্ক কিউআর ও প্যান্ট সিরিয়াল জেনারেশন মডাল (Batch Unit Generator Modal)
 * 
 * রুল ২৩ (Pydantic v2 Server Validation), রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Sparkles, AlertCircle, QrCode } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Order } from '@/types/order';
import { ProductionType } from '@/types/unit';
import { generateUnitsBatch } from '@/services/unitApi';

interface UnitGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  onSuccess: (generatedCount: number) => void;
}

export const UnitGenerateModal: React.FC<UnitGenerateModalProps> = ({
  isOpen,
  onClose,
  orders,
  selectedOrder,
  onSelectOrder,
  onSuccess,
}) => {
  const [sizeRows, setSizeRows] = useState<Array<{ size: string; qty: number }>>([
    { size: '28', qty: 20 },
    { size: '30', qty: 50 },
    { size: '32', qty: 50 },
    { size: '34', qty: 30 },
  ]);
  const [newSizeInput, setNewSizeInput] = useState<string>('');
  const [cutNo, setCutNo] = useState<string>('');
  const [bundleNo, setBundleNo] = useState<string>('');
  const [productionType, setProductionType] = useState<ProductionType>('COMPLETE_GARMENT');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalCount = sizeRows.reduce((acc, r) => acc + (Number(r.qty) || 0), 0);

  const handleAddSize = () => {
    const s = newSizeInput.trim().toUpperCase();
    if (!s) return;
    if (sizeRows.some((r) => r.size === s)) {
      setErrorMsg(`Size ${s} is already in the list.`);
      return;
    }
    setSizeRows([...sizeRows, { size: s, qty: 10 }]);
    setNewSizeInput('');
    setErrorMsg(null);
  };

  const handleQtyChange = (index: number, val: number) => {
    const updated = [...sizeRows];
    updated[index].qty = Math.max(0, val);
    setSizeRows(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) {
      setErrorMsg('Please select an active garment order.');
      return;
    }
    const filteredRows = sizeRows.filter((r) => r.qty > 0);
    if (filteredRows.length === 0) {
      setErrorMsg('Please enter quantity > 0 for at least one garment size.');
      return;
    }

    const sizeQuantitiesMap: Record<string, number> = {};
    filteredRows.forEach((r) => {
      sizeQuantitiesMap[r.size] = r.qty;
    });

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await generateUnitsBatch({
        order_id: selectedOrder.id,
        size_quantities: sizeQuantitiesMap,
        production_type: productionType,
        cut_no: cutNo.trim() || undefined,
        bundle_no: bundleNo.trim() || undefined,
      });
      onSuccess(res.total_generated);
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Batch generation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-sm font-mono">
            <QrCode className="w-4 h-4 text-blue-500" />
            <span>Generate QR Units & Sequential Serials</span>
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Select Garment Order / PO
              </label>
              <select
                value={selectedOrder?.id || ''}
                onChange={(e) => {
                  const found = orders.find((o) => o.id === e.target.value);
                  if (found) onSelectOrder(found);
                }}
                className="w-full text-xs h-9 px-2 rounded-sm border border-slate-300 dark:border-[#22252e] bg-white dark:bg-[#121317] text-zinc-900 dark:text-zinc-100 font-mono focus:ring-1 focus:ring-blue-500"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.buyer_name} | {o.style_code} | {o.po_number || o.job_no} ({o.total_quantity} pcs)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Production Category
              </label>
              <select
                value={productionType}
                onChange={(e) => setProductionType(e.target.value as ProductionType)}
                className="w-full text-xs h-9 px-2 rounded-sm border border-slate-300 dark:border-[#22252e] bg-white dark:bg-[#121317] text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-blue-500"
              >
                <option value="COMPLETE_GARMENT">Complete Pant (Two-Step Front & Back)</option>
                <option value="CUT_PANEL">Cut Panels Only (Single Step Flat)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Cut No (Optional)" placeholder="e.g. CUT-01" value={cutNo} onChange={(e) => setCutNo(e.target.value)} />
            <Input label="Bundle No (Optional)" placeholder="e.g. B-004" value={bundleNo} onChange={(e) => setBundleNo(e.target.value)} />
          </div>

          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Size Quantity Breakdown</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New Size (e.g. 36)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } }}
                  className="w-28 text-xs h-7 px-2 font-mono uppercase rounded-sm border border-slate-300 dark:border-[#22252e] bg-white dark:bg-[#121317]"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddSize} className="h-7 px-2 text-xs gap-1 rounded-sm border-slate-300 dark:border-[#2a2d37]">
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </Button>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200/90 dark:border-[#1e2026] rounded-sm divide-y divide-slate-100 dark:divide-[#1a1c22]">
              {sizeRows.map((row, idx) => (
                <div key={row.size} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#121317] hover:bg-slate-50 dark:hover:bg-[#16171d]">
                  <span className="w-16 font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">Size {row.size}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={row.qty}
                      onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                      className="w-24 text-right font-mono text-xs h-7 px-2 rounded-sm border border-slate-300 dark:border-[#282a33] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-[11px] font-mono text-zinc-400">pcs</span>
                    <button
                      type="button"
                      onClick={() => setSizeRows(sizeRows.filter((_, i) => i !== idx))}
                      className="p-1 text-zinc-400 hover:text-rose-500 rounded-sm"
                      title="Remove Size"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center px-3 py-2 mt-2 bg-slate-50 dark:bg-[#121317] border border-slate-200/80 dark:border-[#1e2026] rounded-sm">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Units to Generate:</span>
              <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{totalCount.toLocaleString()} Units</span>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-[#1e2026]">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} className="text-xs rounded-sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || totalCount === 0} className="text-xs gap-1.5 rounded-sm">
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate {totalCount} QR Units</span>
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
