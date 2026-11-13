/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * থার্মাল লেবেল প্রিভিউ ও একক প্রিন্টিং মডাল (50mm x 30mm Sew-in Stencil)
 * 
 * রুল ১৬ (2px Corner Radius), রুল ১৮ (Zero Clutter) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Copy, Check, Printer, CheckCircle2 } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { GarmentUnit } from '@/types/unit';
import { Order } from '@/types/order';
import { generateBatchZpl, getUnitQrPngUrl, markUnitsPrinted } from '@/services/unitApi';

interface ThermalPreviewModalProps {
  unit: GarmentUnit | null;
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintedSuccess?: () => void;
}

export const ThermalPreviewModal: React.FC<ThermalPreviewModalProps> = ({
  unit,
  order,
  isOpen,
  onClose,
  onPrintedSuccess,
}) => {
  const [copiedZpl, setCopiedZpl] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isMarked, setIsMarked] = useState(false);

  if (!unit) return null;

  const qrImageUrl = getUnitQrPngUrl(unit.id);

  const handleCopyZpl = async () => {
    try {
      const zplRes = await generateBatchZpl([unit.id]);
      await navigator.clipboard.writeText(zplRes.zpl_data);
      setCopiedZpl(true);
      setTimeout(() => setCopiedZpl(false), 2000);
    } catch {
      // হ্যান্ডলিং
    }
  };

  const handleMarkPrinted = async () => {
    setIsMarking(true);
    try {
      await markUnitsPrinted([unit.id]);
      setIsMarked(true);
      if (onPrintedSuccess) onPrintedSuccess();
      setTimeout(() => setIsMarked(false), 2000);
    } finally {
      setIsMarking(false);
    }
  };

  const handleBrowserPrint = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=300');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${unit.unit_serial_no}</title>
          <style>
            @page { size: 50mm 30mm; margin: 0; }
            body { font-family: monospace; margin: 0; padding: 4px; display: flex; align-items: center; justify-content: space-between; }
            .left { width: 45%; text-align: center; }
            .right { width: 52%; font-size: 10px; }
            img { width: 90px; height: 90px; }
            .size { font-size: 22px; font-weight: bold; margin: 2px 0; }
            .serial { font-size: 9px; word-break: break-all; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="left"><img src="${qrImageUrl}" /></div>
          <div class="right">
            <div><b>${order?.buyer_name || 'BUYER'}</b></div>
            <div>STYLE: ${unit.style_code}</div>
            <div class="size">SIZE: ${unit.size_code}</div>
            <div class="serial">${unit.unit_serial_no}</div>
            <div>CUT: ${unit.cut_no || '-'} BNDL: ${unit.bundle_no || '-'}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-sm font-mono">
            <Printer className="w-4 h-4 text-blue-500" />
            <span>Thermal Sew-in Label Stencil (50x30mm)</span>
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-4">
          <div className="p-3 bg-zinc-100 dark:bg-[#0c0d10] border border-slate-200/80 dark:border-[#1e2027] rounded-sm flex justify-center">
            <div
              className="w-[320px] h-[180px] bg-white text-black p-2.5 rounded-none border-2 border-dashed border-zinc-400 shadow-md flex flex-col justify-between select-none"
              style={{ fontFamily: 'Courier New, Courier, monospace' }}
            >
              <div className="flex justify-between items-center border-b border-black pb-1 text-[11px] font-bold">
                <span>{order?.buyer_name || 'DENIM LACS'}</span>
                <span>PO: {order?.po_number || order?.job_no || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="w-[95px] h-[95px] flex items-center justify-center border border-black/20 p-0.5">
                  <img src={qrImageUrl} alt={`QR for ${unit.unit_serial_no}`} className="w-full h-full object-contain" />
                </div>

                <div className="flex-1 pl-3 text-right">
                  <div className="text-[10px] text-zinc-600 font-bold">GARMENT SIZE</div>
                  <div className="text-3xl font-extrabold tracking-tight text-black leading-none my-0.5">
                    {unit.size_code}
                  </div>
                  <div className="text-[11px] font-bold mt-0.5">STYLE: {unit.style_code}</div>
                  <div className="text-[9px] text-zinc-700 mt-0.5 font-semibold">
                    {unit.production_type === 'COMPLETE_GARMENT' ? 'COMPLETE PANT' : 'CUT PANEL'}
                  </div>
                  <div className="text-[9px] text-zinc-600">C:{unit.cut_no || '-'} | B:{unit.bundle_no || '-'}</div>
                </div>
              </div>

              <div className="border-t border-black pt-1 flex justify-between items-center text-[9px]">
                <span className="font-bold tracking-wider">{unit.unit_serial_no}</span>
                <span className="text-zinc-600 truncate max-w-[150px]" title={unit.qr_code_payload}>
                  {unit.qr_code_payload}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-[#121317] p-2.5 rounded-sm border border-slate-200/80 dark:border-[#1e2026]">
            <div>
              <span className="text-zinc-500 text-[11px]">Serial Identifier:</span>
              <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{unit.unit_serial_no}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-[11px]">Scanner Decode String:</span>
              <p className="font-mono text-zinc-700 dark:text-zinc-300 text-[11px] truncate">{unit.qr_code_payload}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-[#1e2026]">
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={handleCopyZpl} className="text-xs gap-1 rounded-sm border-slate-300 dark:border-[#272a33]">
                {copiedZpl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedZpl ? 'Copied' : 'Copy ZPL'}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleMarkPrinted} disabled={isMarking} className="text-xs gap-1 rounded-sm border-slate-300 dark:border-[#272a33]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isMarked ? 'Updated' : 'Mark Printed'}</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onClose} className="text-xs rounded-sm">Close</Button>
              <Button variant="primary" size="sm" onClick={handleBrowserPrint} className="text-xs gap-1 rounded-sm">
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
