/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * থার্মাল প্রিন্ট স্টেশন পোর্টাল (Thermal Print Station - Workflow Step 3 & 4)
 * 
 * কাটিং ও সুইং সেকশনে কিউআর কোড জেনারেশন, থার্মাল লেবেল প্রিন্ট ও ZPL স্পুলিং স্ক্রিন।
 * রুল ২৩ (TanStack DataTable), রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Printer } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { getOrders } from '@/services/orderApi';
import { getOrderUnits } from '@/services/unitApi';
import { Order } from '@/types/order';
import { GarmentUnit } from '@/types/unit';
import { getUnitColumns } from '@/components/units/unitColumns';
import { PrintStationToolbar } from '@/components/units/PrintStationToolbar';
import { PrintStationStats } from '@/components/units/PrintStationStats';
import { ThermalPreviewModal } from '@/components/units/ThermalPreviewModal';
import { BatchPrintModal } from '@/components/units/BatchPrintModal';
import { UnitGenerateModal } from '@/components/units/UnitGenerateModal';

export const ThermalPrintStation: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [units, setUnits] = useState<GarmentUnit[]>([]);
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ফিল্টার স্টেট
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  // সিলেকশন স্টেট
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // মডাল স্টেট
  const [previewUnit, setPreviewUnit] = useState<GarmentUnit | null>(null);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState<boolean>(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState<boolean>(false);

  // ১. অর্ডার তালিকা লোড
  useEffect(() => {
    getOrders({ page: 1, page_size: 50 }).then((res) => {
      setOrders(res.items);
      if (res.items.length > 0 && !selectedOrder) {
        setSelectedOrder(res.items[0]);
      }
    });
  }, []);

  // ২. নির্বাচিত অর্ডারের ইউনিট তালিকা ফেচ করা
  const loadUnits = useCallback(async () => {
    if (!selectedOrder) {
      setUnits([]);
      setTotalUnits(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getOrderUnits(selectedOrder.id, {
        page: currentPage,
        page_size: pageSize,
        size: sizeFilter,
        stage: stageFilter,
        search: searchQuery.trim() || undefined,
      });
      setUnits(res.items);
      setTotalUnits(res.total);
      setTotalPages(res.total_pages);
    } catch {
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrder, currentPage, pageSize, sizeFilter, stageFilter, searchQuery]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  // ফিল্টার রিসেট
  const handleResetFilters = () => {
    setSearchQuery('');
    setSizeFilter('ALL');
    setStageFilter('ALL');
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // সিলেকশন টগল
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === units.length && units.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(units.map((u) => u.id)));
    }
  };

  // সাইজ অপশন তালিকা (বর্তমান ইউনিটের সাইজসমূহ বা স্ট্যান্ডার্ড রেঞ্জ)
  const availableSizes = useMemo(() => {
    const set = new Set<string>(['28', '30', '32', '34', '36', '38', '40']);
    units.forEach((u) => set.add(u.size_code));
    return Array.from(set).sort();
  }, [units]);

  // নির্বাচিত ইউনিটের অবজেক্ট তালিকা
  const selectedUnitsList = useMemo(() => {
    return units.filter((u) => selectedIds.has(u.id));
  }, [units, selectedIds]);

  // সামারি কাউন্ট
  const stats = useMemo(() => {
    let printed = 0;
    let pending = 0;
    let completed = 0;
    units.forEach((u) => {
      if (u.current_stage === 'PRINTED' || u.printed_at) printed += 1;
      else if (u.current_stage === 'GENERATED') pending += 1;
      if (u.current_stage === 'COMPLETED' || u.current_stage === 'QC_PASSED') completed += 1;
    });
    return { printed, pending, completed };
  }, [units]);

  // একক প্রিন্ট হ্যান্ডলার
  const handlePrintSingle = async (unit: GarmentUnit) => {
    setPreviewUnit(unit);
  };

  // TanStack কলাম ডেফিনিশন
  const columns = useMemo(
    () =>
      getUnitColumns({
        onPreview: (u) => setPreviewUnit(u),
        onPrintSingle: handlePrintSingle,
        selectedIds,
        onToggleSelect: handleToggleSelect,
        onToggleSelectAll: handleToggleSelectAll,
        allSelected: units.length > 0 && selectedIds.size === units.length,
      }),
    [units, selectedIds]
  );

  return (
    <div className="space-y-4">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                Thermal QR Print Station
              </h1>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Step 3 & 4
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              50x30mm Sew-in Label Spooler & Garment Unit Registry
            </p>
          </div>
        </div>
      </div>

      {/* স্ট্যাটাস কার্ডস */}
      <PrintStationStats
        totalUnits={totalUnits}
        printedCount={stats.printed}
        pendingCount={stats.pending}
        completedCount={stats.completed}
      />

      {/* ফিল্টার ও অ্যাকশন টুলবার */}
      <PrintStationToolbar
        orders={orders}
        selectedOrder={selectedOrder}
        onSelectOrder={(ord) => {
          setSelectedOrder(ord);
          setCurrentPage(1);
          setSelectedIds(new Set());
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sizeFilter={sizeFilter}
        onSizeFilterChange={setSizeFilter}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        onResetFilters={handleResetFilters}
        onRefresh={loadUnits}
        onOpenGenerateModal={() => setIsGenerateOpen(true)}
        selectedCount={selectedIds.size}
        onOpenBatchPrint={() => setIsBatchPrintOpen(true)}
        availableSizes={availableSizes}
      />

      {/* TanStack v8 ডেটাটেবিল */}
      <DataTable
        columns={columns}
        data={units}
        isLoading={isLoading}
        totalCount={totalUnits}
        pageCount={totalPages}
        pageIndex={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No Garment Units Found"
        emptyDescription="Generate sequential QR codes for this garment order to begin printing."
      />

      {/* মডালস */}
      <ThermalPreviewModal
        unit={previewUnit}
        order={selectedOrder}
        isOpen={!!previewUnit}
        onClose={() => setPreviewUnit(null)}
        onPrintedSuccess={loadUnits}
      />

      <BatchPrintModal
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        selectedUnits={selectedUnitsList}
        onPrintCompleted={() => {
          setSelectedIds(new Set());
          loadUnits();
        }}
      />

      <UnitGenerateModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        orders={orders}
        selectedOrder={selectedOrder}
        onSelectOrder={setSelectedOrder}
        onSuccess={() => {
          setCurrentPage(1);
          loadUnits();
        }}
      />
    </div>
  );
};
