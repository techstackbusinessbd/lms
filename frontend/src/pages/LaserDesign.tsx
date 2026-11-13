/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন ভল্ট ও স্মার্ট সাইজ ম্যাপিং পোর্টাল (Laser Design Vault Portal)
 *
 * রুল ২৩ (TanStack DataTable v8 & Server Validation), রুল ১৬ (2px Corner Radius)
 * এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত সেন্ট্রাল সাইজ ম্যাট্রিক্স ভল্ট ইন্টারফেস।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Vault, Plus, Lock, CopyPlus, RefreshCw, FolderOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { getOrders } from '@/services/orderApi';
import { getDesignsByOrder, createNewVersion } from '@/services/designApi';
import { Order } from '@/types/order';
import { LaserDesign, LaserDesignFile } from '@/types/design';
import { getSizeMatrixColumns } from '@/components/designs/matrixColumns';
import { BulkDropzone } from '@/components/designs/BulkDropzone';
import { RecipeLockModal } from '@/components/designs/RecipeLockModal';
import { DesignCreateModal } from '@/components/designs/DesignCreateModal';
import { ImagePreviewModal } from '@/components/designs/ImagePreviewModal';
import { useSizeMatrix, DEFAULT_SIZES } from '@/components/designs/useSizeMatrix';

export const LaserDesignPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [designs, setDesigns] = useState<LaserDesign[]>([]);
  const [activeDesign, setActiveDesign] = useState<LaserDesign | null>(null);
  const [extraSizes, setExtraSizes] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState<string>('');

  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(false);

  // মডাল স্টেট
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<LaserDesignFile | null>(null);

  // ১. অর্ডার তালিকা লোড
  useEffect(() => {
    async function fetchOrders() {
      setIsLoadingOrders(true);
      try {
        const res = await getOrders({ page_size: 50 });
        setOrders(res.items);
        if (res.items.length > 0) {
          setSelectedOrderId(res.items[0].id);
        }
      } catch {
        // হ্যান্ডলিং
      } finally {
        setIsLoadingOrders(false);
      }
    }
    fetchOrders();
  }, []);

  // ২. সিলেক্টেড অর্ডারের রেসিপি তালিকা লোড
  const loadDesigns = useCallback(async (orderId: string) => {
    if (!orderId) return;
    setIsLoadingDesigns(true);
    try {
      const data = await getDesignsByOrder(orderId);
      setDesigns(data);
      setActiveDesign(data.length > 0 ? data[0] : null);
    } catch {
      // হ্যান্ডলিং
    } finally {
      setIsLoadingDesigns(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      loadDesigns(selectedOrderId);
    }
  }, [selectedOrderId, loadDesigns]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  // ফাইল আপডেট/ডিলিট সিঙ্ক হ্যান্ডলারস
  const handleFileUploaded = (file: LaserDesignFile) => {
    setActiveDesign((prev) =>
      prev ? { ...prev, files: [...prev.files.filter((f) => f.id !== file.id), file] } : null
    );
  };

  const handleFileDeleted = (fileId: string) => {
    setActiveDesign((prev) =>
      prev ? { ...prev, files: prev.files.filter((f) => f.id !== fileId) } : null
    );
  };

  const handleBatchUploaded = (newFiles: LaserDesignFile[]) => {
    setActiveDesign((prev) => {
      if (!prev) return null;
      const ids = new Set(newFiles.map((f) => f.id));
      return { ...prev, files: [...prev.files.filter((f) => !ids.has(f.id)), ...newFiles] };
    });
  };

  const handleAddCustomSize = () => {
    const val = newSizeInput.trim().toUpperCase();
    if (val && !DEFAULT_SIZES.includes(val) && !extraSizes.includes(val)) {
      setExtraSizes((p) => [...p, val]);
      setNewSizeInput('');
    }
  };

  // ম্যাট্রিক্স রো ডেটা ক্যালকুলেশন
  const matrixRows = useSizeMatrix(activeDesign, extraSizes);

  // কলাম ডেফিনিশন (TanStack Table v8)
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
    <div className="space-y-4">
      {/* ১. হেডার ও স্টাইল সিলেক্টর বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Vault className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                Laser Design Vault
              </h1>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-600 border border-blue-500/20">
                Jeanologia eMark
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">Size-by-Size Recipe &amp; Artwork Matrix</p>
          </div>
        </div>

        {/* PO সিলেক্টর */}
        <div className="flex items-center gap-2">
          <div className="w-64">
            <Select
              options={orders.map((o) => ({
                value: o.id,
                label: `${o.job_no || o.po_number} (${o.buyer_name} - ${o.style_code})`,
              }))}
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              disabled={isLoadingOrders}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => loadDesigns(selectedOrderId)} disabled={isLoadingDesigns} className="h-8 font-mono text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDesigns ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ২. অ্যাক্টিভ রেসিপি হেডার ও অ্যাকশন বার */}
      {activeDesign ? (
        <div className="p-3.5 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-[#1a1c24] text-zinc-800 dark:text-zinc-200 border border-slate-200 dark:border-[#272930]">
                  Rev v{activeDesign.version}
                </span>
                {designs.length > 1 && (
                  <select
                    className="h-6 text-[11px] font-mono rounded-sm border border-slate-200 dark:border-[#272930] bg-white dark:bg-[#121317] px-1 text-zinc-700 dark:text-zinc-300"
                    value={activeDesign.id}
                    onChange={(e) => {
                      const f = designs.find((d) => d.id === e.target.value);
                      if (f) setActiveDesign(f);
                    }}
                  >
                    {designs.map((d) => (
                      <option key={d.id} value={d.id}>Rev v{d.version} ({d.is_locked ? 'Locked' : 'Draft'})</option>
                    ))}
                  </select>
                )}
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{activeDesign.recipe_name}</h2>
                <Badge variant={activeDesign.is_locked ? 'success' : 'warning'} hasDot className="text-[10px] font-mono py-0.5">
                  {activeDesign.is_locked ? 'Floor Locked' : 'Draft Editing'}
                </Badge>
              </div>
              <p className="text-xs font-mono text-zinc-400">
                Style: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{activeDesign.style_code}</span> • Mapped: {activeDesign.files.length} design files
              </p>
            </div>

            {/* অ্যাকশন বাটনসমূহ */}
            <div className="flex items-center gap-2">
              {!activeDesign.is_locked ? (
                <Button variant="outline" size="sm" onClick={() => setIsLockModalOpen(true)} disabled={activeDesign.files.length === 0} className="text-xs font-mono text-amber-600 hover:text-amber-700 border-amber-200 dark:border-amber-900/60">
                  <Lock className="w-3.5 h-3.5 shrink-0 mr-1" />
                  <span>Lock Recipe</span>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={async () => { const rev = await createNewVersion(activeDesign.id); loadDesigns(selectedOrderId); setActiveDesign(rev); }} className="text-xs font-mono">
                  <CopyPlus className="w-3.5 h-3.5 shrink-0 mr-1" />
                  <span>Create New Revision</span>
                </Button>
              )}
            </div>
          </div>

          {/* স্মার্ট বাল্ক ড্রপজোন (এক ক্লিকে সব সাইজ অটো-ম্যাচ) */}
          <BulkDropzone
            designId={activeDesign.id}
            isLocked={activeDesign.is_locked}
            onBatchUploaded={handleBatchUploaded}
          />
        </div>
      ) : (
        /* কোনো রেসিপি না থাকলে ক্রিয়েট কার্ড */
        <div className="p-8 text-center bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1f2127] rounded-sm shadow-2xs space-y-3">
          <FolderOpen className="w-8 h-8 text-zinc-400 mx-auto" />
          <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">No Laser Recipe Draft Found</p>
          <p className="text-[11px] font-mono text-zinc-400 max-w-sm mx-auto">Create the first Jeanologia .jean5 recipe authoring draft for this purchase order.</p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)} disabled={!selectedOrder} className="text-xs font-mono">
            <Plus className="w-3.5 h-3.5 shrink-0 mr-1" />
            <span>Create First Recipe</span>
          </Button>
        </div>
      )}

      {/* ৩. সাইজ ম্যাট্রিক্স ভার্চুয়ালাইজড ডেটাটেবিল (রুল ২৩) */}
      {activeDesign && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-zinc-800 dark:text-zinc-200">Size Mapping Matrix</span>
              <span className="text-[10px] text-zinc-400">({matrixRows.length} active sizes)</span>
            </div>
            {!activeDesign.is_locked && (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Custom Size (e.g. 42)"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize()}
                  className="h-7 px-2 text-xs font-mono rounded-sm border border-slate-200 dark:border-[#272930] bg-white dark:bg-[#121317] text-zinc-800 dark:text-zinc-200 w-36"
                />
                <Button variant="outline" size="sm" onClick={handleAddCustomSize} className="h-7 text-xs font-mono">
                  + Size
                </Button>
              </div>
            )}
          </div>

          <DataTable
            columns={columns}
            data={matrixRows}
            isLoading={isLoadingDesigns}
            emptyTitle="No Sizes Configured"
            emptyDescription="Size mapping matrix is initializing..."
          />
        </div>
      )}

      {/* মডালসমূহ */}
      <RecipeLockModal
        isOpen={isLockModalOpen}
        design={activeDesign}
        onClose={() => setIsLockModalOpen(false)}
        onLocked={(u) => { setActiveDesign(u); loadDesigns(selectedOrderId); }}
      />
      <DesignCreateModal
        isOpen={isCreateModalOpen}
        order={selectedOrder}
        onClose={() => setIsCreateModalOpen(false)}
        onDesignCreated={(c) => { setActiveDesign(c); loadDesigns(selectedOrderId); }}
      />
      <ImagePreviewModal
        isOpen={Boolean(previewFile)}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
