/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন ম্যাপিং ইন্টারঅ্যাক্টিভ মডাল (Design Mapping Modal)
 *
 * নির্দিষ্ট স্টাইলের জন্য সাইজ ম্যাট্রিক্স, বাল্ক অটো-ম্যাচ ড্রপজোন ও রেসিপি লকিং ইন্টারফেস।
 * রুল ১৬ (2px Corner Radius), রুল ২৩ (DataTable) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Modal, ModalContent } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Order } from '@/types/order';
import { LaserDesign, LaserDesignFile } from '@/types/design';
import { getOrders } from '@/services/orderApi';
import { getDesignsByOrder, createDesign, createNewVersion } from '@/services/designApi';
import { getSizeMatrixColumns } from './matrixColumns';
import { useSizeMatrix, DEFAULT_SIZES } from './useSizeMatrix';
import { BulkDropzone } from './BulkDropzone';
import { RecipeLockModal } from './RecipeLockModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import { DesignMappingHeader } from './DesignMappingHeader';

interface DesignMappingModalProps {
  isOpen: boolean;
  initialDesign: LaserDesign | null;
  onClose: () => void;
  onSaved: () => void;
}

export const DesignMappingModal: React.FC<DesignMappingModalProps> = ({
  isOpen,
  initialDesign,
  onClose,
  onSaved,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [activeDesign, setActiveDesign] = useState<LaserDesign | null>(null);
  const [extraSizes, setExtraSizes] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<LaserDesignFile | null>(null);

  // ১. অর্ডারের ডিজাইন লোড বা স্বয়ংক্রিয় ড্রাফট ইনিশিয়ালাইজ (Auto-Init Draft)
  const loadOrCreateOrderDesign = useCallback(
    async (order: Order) => {
      setIsLoading(true);
      try {
        const designs = await getDesignsByOrder(order.id);
        if (designs.length > 0) {
          setActiveDesign(designs[0]);
        } else {
          const created = await createDesign({
            order_id: order.id,
            style_code: order.style_code,
            recipe_name: `${order.style_code} Recipe v1`,
          });
          setActiveDesign(created);
          onSaved();
        }
      } catch {
        // হ্যান্ডলিং
      } finally {
        setIsLoading(false);
      }
    },
    [onSaved]
  );

  // ২. ডায়ালগ ওপেন হলে অর্ডার লোড
  useEffect(() => {
    if (!isOpen) return;
    async function initOrders() {
      try {
        const res = await getOrders({ page_size: 50 });
        setOrders(res.items);
        if (initialDesign) {
          setSelectedOrderId(initialDesign.order_id);
          setActiveDesign(initialDesign);
        } else if (res.items.length > 0) {
          const first = res.items[0];
          setSelectedOrderId(first.id);
          await loadOrCreateOrderDesign(first);
        }
      } catch {
        // হ্যান্ডলিং
      }
    }
    initOrders();
  }, [isOpen, initialDesign, loadOrCreateOrderDesign]);

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      loadOrCreateOrderDesign(found);
    }
  };

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  // ফাইল হ্যান্ডলার্স
  const handleFileUploaded = (file: LaserDesignFile) => {
    setActiveDesign((prev) =>
      prev ? { ...prev, files: [...prev.files.filter((f) => f.id !== file.id), file] } : null
    );
    onSaved();
  };

  const handleFileDeleted = (fileId: string) => {
    setActiveDesign((prev) =>
      prev ? { ...prev, files: prev.files.filter((f) => f.id !== fileId) } : null
    );
    onSaved();
  };

  const handleBatchUploaded = (newFiles: LaserDesignFile[]) => {
    setActiveDesign((prev) => {
      if (!prev) return null;
      const ids = new Set(newFiles.map((f) => f.id));
      return { ...prev, files: [...prev.files.filter((f) => !ids.has(f.id)), ...newFiles] };
    });
    onSaved();
  };

  const handleAddCustomSize = () => {
    const val = newSizeInput.trim().toUpperCase();
    if (val && !DEFAULT_SIZES.includes(val) && !extraSizes.includes(val)) {
      setExtraSizes((p) => [...p, val]);
      setNewSizeInput('');
    }
  };

  const matrixRows = useSizeMatrix(activeDesign, extraSizes);

  const columns = useMemo(() => {
    if (!activeDesign) return [];
    return getSizeMatrixColumns({
      designId: activeDesign.id,
      isLocked: activeDesign.is_locked,
      onFileUploaded: handleFileUploaded,
      onFileDeleted: handleFileDeleted,
      onPreviewImage: (f) => setPreviewFile(f),
    });
  }, [activeDesign]);

  const completedCount = matrixRows.filter((r) => r.status === 'COMPLETE').length;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border border-slate-200 dark:border-[#272930] bg-white dark:bg-[#121317] rounded-sm shadow-2xl">
        {/* ১. ডেডিকেটেড ইন্ডাস্ট্রিয়াল হেডার ও স্টাইল সিলেক্টর */}
        <DesignMappingHeader
          orders={orders}
          selectedOrderId={selectedOrderId}
          selectedOrder={selectedOrder}
          activeDesign={activeDesign}
          isInitialDesign={Boolean(initialDesign)}
          onOrderChange={handleOrderChange}
          onLockClick={() => setIsLockModalOpen(true)}
          onNewRevisionClick={async () => {
            if (!activeDesign) return;
            const rev = await createNewVersion(activeDesign.id);
            setActiveDesign(rev);
            onSaved();
          }}
        />

        {/* ২. স্ক্রোলযোগ্য মডাল বডি */}
        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          {activeDesign && (
            <>
              {/* বাল্ক অটো-ম্যাচ ড্রপজোন */}
              <BulkDropzone
                designId={activeDesign.id}
                isLocked={activeDesign.is_locked}
                onBatchUploaded={handleBatchUploaded}
              />

              {/* সাইজ ম্যাট্রিক্স টেবিল ও সাইজ অ্যাডার */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                      Size-by-Size Recipe Matrix
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      ({matrixRows.length} Sizes Active)
                    </span>
                  </div>

                  {!activeDesign.is_locked && (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add Size (e.g. 42)"
                        value={newSizeInput}
                        onChange={(e) => setNewSizeInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize()}
                        className="h-7 px-2.5 text-xs font-mono rounded-sm border border-slate-200 dark:border-[#272930] bg-white dark:bg-[#15171e] w-36 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomSize}
                        className="h-7 px-2.5 text-xs font-mono"
                      >
                        + Add Size
                      </Button>
                    </div>
                  )}
                </div>

                <DataTable
                  columns={columns}
                  data={matrixRows}
                  isLoading={isLoading}
                  emptyTitle="Loading Matrix..."
                  emptyDescription="Preparing Jeanologia .jean5 recipe slots for this style."
                />
              </div>
            </>
          )}
        </div>

        {/* ৩. মডাল ফুটার */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-[#272930] bg-slate-50/60 dark:bg-[#15171e]/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              <strong className="text-zinc-800 dark:text-zinc-200">{completedCount}</strong> of{' '}
              {matrixRows.length} Sizes Ready (Front &amp; Back Mapped)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-mono">
              Close
            </Button>
            {activeDesign && !activeDesign.is_locked && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsLockModalOpen(true)}
                disabled={activeDesign.files.length === 0}
                className="h-8 text-xs font-mono"
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                <span>Lock &amp; Authorize Recipe</span>
              </Button>
            )}
          </div>
        </div>

        <RecipeLockModal
          isOpen={isLockModalOpen}
          design={activeDesign}
          onClose={() => setIsLockModalOpen(false)}
          onLocked={(u) => {
            setActiveDesign(u);
            onSaved();
          }}
        />
        <ImagePreviewModal
          isOpen={Boolean(previewFile)}
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      </ModalContent>
    </Modal>
  );
};
