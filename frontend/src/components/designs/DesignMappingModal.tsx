/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন ম্যাপিং ইন্টারঅ্যাক্টিভ মডাল (Design Mapping Modal)
 *
 * ডিজাইনারের চাহিদা অনুযায়ী ডায়নামিক সাইজ ও রেসিপি লক/আনলক ইন্টারফেস।
 * রুল ১৬ (2px Corner Radius), রুল ২৩ (DataTable) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle } from 'lucide-react';
import { Modal, ModalContent } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Order } from '@/types/order';
import { LaserDesign, LaserDesignFile } from '@/types/design';
import { getOrders } from '@/services/orderApi';
import { getDesignsByOrder, createDesign, createNewVersion } from '@/services/designApi';
import { getSizeMatrixColumns } from './matrixColumns';
import { useSizeMatrix } from './useSizeMatrix';
import { RecipeLockModal } from './RecipeLockModal';
import { RecipeUnlockModal } from './RecipeUnlockModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import { DesignMappingHeader } from './DesignMappingHeader';
import { DesignSizeToolbar } from './DesignSizeToolbar';
import { DesignMappingFooter } from './DesignMappingFooter';

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
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
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
    setCustomSizes([]);
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

  const handleAddSizes = (inputSizes: string) => {
    const tokens = inputSizes
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    setCustomSizes((prev) => {
      const updated = [...prev];
      for (const t of tokens) {
        if (!updated.includes(t)) updated.push(t);
      }
      return updated;
    });
  };

  const handleRemoveSize = (sizeCode: string) => {
    setCustomSizes((prev) => prev.filter((s) => s !== sizeCode));
  };

  const matrixRows = useSizeMatrix(activeDesign, customSizes);

  const columns = useMemo(() => {
    if (!activeDesign) return [];
    return getSizeMatrixColumns({
      designId: activeDesign.id,
      isLocked: activeDesign.is_locked,
      onFileUploaded: handleFileUploaded,
      onFileDeleted: handleFileDeleted,
      onPreviewImage: (f) => setPreviewFile(f),
      onRemoveSize: handleRemoveSize,
    });
  }, [activeDesign]);

  const completedCount = matrixRows.filter((r) => r.status === 'COMPLETE').length;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-6xl w-[96vw] max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border border-slate-200 dark:border-[#272930] bg-white dark:bg-[#121317] rounded-sm shadow-2xl">
        {/* ১. ডেডিকেটেড ইন্ডাস্ট্রিয়াল হেডার ও স্টাইল সিলেক্টর */}
        <DesignMappingHeader
          orders={orders}
          selectedOrderId={selectedOrderId}
          selectedOrder={selectedOrder}
          activeDesign={activeDesign}
          isInitialDesign={Boolean(initialDesign)}
          onOrderChange={handleOrderChange}
          onLockClick={() => setIsLockModalOpen(true)}
          onUnlockClick={() => setIsUnlockModalOpen(true)}
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
            <div className="space-y-3">
              {/* সাইজ কন্ট্রোল ও প্রিসেটস টুলবার */}
              {!activeDesign.is_locked && (
                <DesignSizeToolbar
                  existingSizes={matrixRows.map((r) => r.size_code)}
                  onAddSizes={handleAddSizes}
                />
              )}

              {/* সাইজ ম্যাট্রিক্স টেবিল */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                    Size-by-Size Recipe Matrix ({matrixRows.length} Sizes)
                  </span>
                </div>

                {matrixRows.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={matrixRows}
                    isLoading={isLoading}
                    emptyTitle="No Sizes Configured"
                    emptyDescription="Add garment sizes to start mapping."
                  />
                ) : (
                  /* কোনো সাইজ যুক্ত না করা থাকলে এম্পটি স্টেট */
                  <div className="p-8 text-center rounded-sm border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#15171e]/50 space-y-3">
                    <PlusCircle className="w-8 h-8 text-blue-500 mx-auto" />
                    <div>
                      <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">
                        No Sizes Added for Style {selectedOrder?.style_code || activeDesign.style_code}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 max-w-sm mx-auto mt-0.5">
                        Add the required garment sizes above (or click a quick preset) to map .jean5 laser files.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSizes('28, 30, 32, 34, 36')}
                      className="h-7 text-xs font-mono text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60"
                    >
                      + Add Standard Sizes (28, 30, 32, 34, 36)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ৩. মডাল ফুটার */}
        <DesignMappingFooter
          completedCount={completedCount}
          totalSizes={matrixRows.length}
          isLocked={Boolean(activeDesign?.is_locked)}
          hasFiles={Boolean(activeDesign && activeDesign.files.length > 0)}
          onClose={onClose}
          onLockClick={() => setIsLockModalOpen(true)}
          onUnlockClick={() => setIsUnlockModalOpen(true)}
        />

        <RecipeLockModal
          isOpen={isLockModalOpen}
          design={activeDesign}
          onClose={() => setIsLockModalOpen(false)}
          onLocked={(u) => {
            setActiveDesign(u);
            onSaved();
          }}
        />
        <RecipeUnlockModal
          isOpen={isUnlockModalOpen}
          design={activeDesign}
          onClose={() => setIsUnlockModalOpen(false)}
          onUnlocked={(u) => {
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
