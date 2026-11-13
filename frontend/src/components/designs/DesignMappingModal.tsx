/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন ম্যাপিং ইন্টারঅ্যাক্টিভ মডাল (Design Mapping Modal)
 *
 * নির্দিষ্ট স্টাইলের জন্য সাইজ ম্যাট্রিক্স, বাল্ক অটো-ম্যাচ ড্রপজোন ও রেসিপি লকিং ইন্টারফেস।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Layers, Lock, CopyPlus, Plus, FolderOpen } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
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

  // ১. অর্ডার লোড
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
          setSelectedOrderId(res.items[0].id);
        }
      } catch {
        // হ্যান্ডলিং
      }
    }
    initOrders();
  }, [isOpen, initialDesign]);

  // ২. অর্ডার পরিবর্তন হলে বিদ্যমান ডিজাইন লোড
  const loadOrderDesigns = useCallback(async (orderId: string) => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const designs = await getDesignsByOrder(orderId);
      setActiveDesign(designs.length > 0 ? designs[0] : null);
    } catch {
      // হ্যান্ডলিং
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    loadOrderDesigns(orderId);
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

  const handleCreateDraft = async () => {
    if (!selectedOrder) return;
    setIsLoading(true);
    try {
      const created = await createDesign({
        order_id: selectedOrder.id,
        style_code: selectedOrder.style_code,
        recipe_name: `${selectedOrder.style_code} Recipe v1`,
      });
      setActiveDesign(created);
      onSaved();
    } catch {
      // হ্যান্ডলিং
    } finally {
      setIsLoading(false);
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

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-[#272930]">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="text-sm font-bold font-mono">
                  {activeDesign ? `Style Mapping Matrix: ${activeDesign.style_code}` : 'New Laser Design Mapping'}
                </span>
                <p className="text-[11px] font-mono text-zinc-400 font-normal">
                  Map Jeanologia .jean5 recipes &amp; artwork to garment sizes
                </p>
              </div>
            </div>

            {/* PO সিলেক্টর */}
            <div className="w-64">
              <Select
                options={orders.map((o) => ({
                  value: o.id,
                  label: `${o.job_no || o.po_number} (${o.style_code})`,
                }))}
                value={selectedOrderId}
                onChange={(e) => handleOrderChange(e.target.value)}
                disabled={Boolean(initialDesign)}
              />
            </div>
          </ModalTitle>
        </ModalHeader>

        {activeDesign ? (
          <div className="space-y-3.5 pt-2">
            {/* হেডার স্ট্যাটাস ও বাটনস */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-[#15171e] border border-slate-200/90 dark:border-[#272930] rounded-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-sm bg-white dark:bg-[#1e2028] text-zinc-800 dark:text-zinc-200 border border-slate-200 dark:border-[#272930]">
                  Rev v{activeDesign.version}
                </span>
                <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">{activeDesign.recipe_name}</span>
                <Badge variant={activeDesign.is_locked ? 'success' : 'warning'} hasDot className="text-[10px] font-mono py-0.5">
                  {activeDesign.is_locked ? 'Floor Locked' : 'Draft Editing'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {!activeDesign.is_locked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLockModalOpen(true)}
                    disabled={activeDesign.files.length === 0}
                    className="text-xs font-mono text-amber-600 hover:text-amber-700 border-amber-200 dark:border-amber-900/60"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    <span>Lock Recipe</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const rev = await createNewVersion(activeDesign.id);
                      setActiveDesign(rev);
                      onSaved();
                    }}
                    className="text-xs font-mono"
                  >
                    <CopyPlus className="w-3.5 h-3.5 mr-1" />
                    <span>Create New Revision</span>
                  </Button>
                )}
              </div>
            </div>

            {/* বাল্ক অটো-ম্যাচ ড্রপজোন */}
            <BulkDropzone
              designId={activeDesign.id}
              isLocked={activeDesign.is_locked}
              onBatchUploaded={handleBatchUploaded}
            />

            {/* সাইজ ম্যাট্রিক্স টেবিল */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">Size Mapping Grid ({matrixRows.length} sizes)</span>
                {!activeDesign.is_locked && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Add Size (e.g. 42)"
                      value={newSizeInput}
                      onChange={(e) => setNewSizeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize()}
                      className="h-7 px-2 text-xs font-mono rounded-sm border border-slate-200 dark:border-[#272930] bg-white dark:bg-[#121317] w-32"
                    />
                    <Button variant="outline" size="sm" onClick={handleAddCustomSize} className="h-7 text-xs font-mono">
                      + Add
                    </Button>
                  </div>
                )}
              </div>

              <DataTable
                columns={columns}
                data={matrixRows}
                isLoading={isLoading}
                emptyTitle="No Sizes Configured"
                emptyDescription="Size matrix is loading..."
              />
            </div>
          </div>
        ) : (
          /* রেসিপি ড্রাফট না থাকলে ইনিশিয়ালাইজেশন */
          <div className="p-8 text-center bg-slate-50 dark:bg-[#15171e] border border-slate-200 dark:border-[#272930] rounded-sm space-y-3 my-4">
            <FolderOpen className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">No Design Recipe Draft Found</p>
            <p className="text-[11px] font-mono text-zinc-400 max-w-sm mx-auto">
              Initialize the first Jeanologia .jean5 recipe draft for {selectedOrder?.style_code || 'this style'}.
            </p>
            <Button variant="primary" size="sm" onClick={handleCreateDraft} disabled={!selectedOrder || isLoading} className="text-xs font-mono">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Initialize Recipe Draft</span>
            </Button>
          </div>
        )}

        <RecipeLockModal
          isOpen={isLockModalOpen}
          design={activeDesign}
          onClose={() => setIsLockModalOpen(false)}
          onLocked={(u) => { setActiveDesign(u); onSaved(); }}
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
