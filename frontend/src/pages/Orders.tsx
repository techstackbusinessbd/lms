/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার এন্ট্রি ও পিও ম্যানেজমেন্ট পোর্টাল (Order Management Portal - Step 1)
 *
 * রুল ১৬ (2px Corner Radius & Dual Theme), রুল ২৩ (TanStack Table & Server-Side Validation)
 * এবং রুল ০৪ (<300 Lines) মেনে মডুলার আর্কিটেকচারে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layers,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { getOrders } from '@/services/orderApi';
import { Order, OrderFilterParams } from '@/types/order';
import { getOrderColumns } from '@/components/orders/orderColumns';
import { OrderStats } from '@/components/orders/OrderStats';
import { OrderToolbar } from '@/components/orders/OrderToolbar';
import { OrderCreateModal } from '@/components/orders/OrderCreateModal';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // মডাল স্টেট
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // অর্ডার লোড করার এসিঙ্ক ফাংশন
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: OrderFilterParams = {
        page: currentPage,
        page_size: pageSize,
        search: searchQuery.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      };
      const data = await getOrders(params);
      setOrders(data.items);
      setTotalOrders(data.total);
      setTotalPages(data.total_pages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  // স্ট্যাটাসভিত্তিক কাউন্ট ম্যাপ
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // TanStack Table কলাম ডেফিনিশন (মেমোয়াইজড)
  const columns = useMemo(
    () => getOrderColumns((order) => setSelectedOrder(order)),
    []
  );

  return (
    <div className="space-y-4">
      {/* ১. পেজ হেডার ও প্রাইমারি অ্যাকশন বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                Garments Purchase Orders
              </h1>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {totalOrders} POs
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              Production Order Entry &amp; Recipe Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadOrders()}
            disabled={isLoading}
            className="font-mono text-xs"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>New Order</span>
          </Button>
        </div>
      </div>

      {/* ত্রুটি বার্তা (যদি থাকে) */}
      {errorMessage && (
        <div className="p-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadOrders()} className="h-6 text-[11px] font-mono">
            Retry
          </Button>
        </div>
      )}

      {/* ২. এক্সিকিউটিভ কেপিআই সারসংক্ষেপ স্ট্রিপ */}
      <OrderStats orders={orders} totalCount={totalOrders} />

      {/* ৩. ইউনিফাইড ফিল্টার ও সার্চ টুলবার */}
      <OrderToolbar
        activeStatus={statusFilter}
        onSelectStatus={(statusId) => {
          setStatusFilter(statusId);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        totalOrders={totalOrders}
        statusCounts={statusCounts}
      />

      {/* ৪. TanStack Table v8 অ্যাডভান্সড ভার্চুয়ালাইজড ডেটাটেবিল (রুল ২৩) */}
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        totalCount={totalOrders}
        pageCount={totalPages}
        pageIndex={currentPage}
        pageSize={pageSize}
        pageSizeOptions={[10, 15, 25, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onRowClick={(order) => setSelectedOrder(order)}
        emptyTitle="No Matching Orders"
        emptyDescription="No purchase orders match your active search or filter criteria."
        emptyAction={
          searchQuery || statusFilter !== 'ALL' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-7 text-xs font-mono"
            >
              Reset Filter
            </Button>
          ) : undefined
        }
      />

      {/* ক্রিয়েট অর্ডার মডাল */}
      <OrderCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={() => {
          loadOrders();
        }}
      />

      {/* অর্ডার ডিটেইলস ও অ্যাকশন মডাল */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdated={(updated) => {
          setSelectedOrder(updated);
          loadOrders();
        }}
        onDeleted={() => {
          setSelectedOrder(null);
          loadOrders();
        }}
      />
    </div>
  );
};
