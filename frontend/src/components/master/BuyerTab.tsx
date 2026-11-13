/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * গার্মেন্ট বায়ার মাস্টার ট্যাব (Buyers Tab)
 * 
 * রুল ২৩ (TanStack Table), রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, Search, RefreshCw, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { DataTableColumnHeader } from '@/components/ui/DataTableColumnHeader';
import { Buyer } from '@/types/masterData';
import { getBuyers, createBuyer, updateBuyer, deleteBuyer } from '@/services/masterDataApi';
import { MasterFormModal } from './MasterFormModal';

export const BuyerTab: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  const loadBuyers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBuyers({ page, page_size: pageSize, search: search.trim() || undefined });
      setBuyers(res.items);
      setTotal(res.total);
    } catch {
      setBuyers([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    loadBuyers();
  }, [loadBuyers]);

  const handleOpenAdd = () => {
    setSelectedBuyer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Buyer) => {
    setSelectedBuyer(b);
    setIsModalOpen(true);
  };

  const handleDelete = async (b: Buyer) => {
    if (window.confirm(`Are you sure you want to deactivate buyer '${b.name}'?`)) {
      await deleteBuyer(b.id);
      loadBuyers();
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (selectedBuyer) {
      await updateBuyer(selectedBuyer.id, formData);
    } else {
      await createBuyer(formData);
    }
    loadBuyers();
  };

  const columns = useMemo<ColumnDef<Buyer>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="CODE" />,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
            {row.original.code}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="BUYER NAME" />,
        cell: ({ row }) => (
          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'country',
        header: ({ column }) => <DataTableColumnHeader column={column} title="COUNTRY / EMAIL" />,
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-mono">
                <Globe className="w-3 h-3 text-zinc-400" />
                <span>{b.country || 'N/A'}</span>
              </div>
              {b.contact_email && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                  <Mail className="w-2.5 h-2.5" />
                  <span>{b.contact_email}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'is_active',
        header: ({ column }) => <DataTableColumnHeader column={column} title="STATUS" />,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'default'}>
            {row.original.is_active ? 'Active' : 'Inactive'}
          </Badge>
        ),
        size: 90,
      },
      {
        id: 'actions',
        header: () => <div className="text-right pr-2">ACTIONS</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 pr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEdit(row.original)}
              className="h-7 px-2 text-xs rounded-sm"
              title="Edit Buyer"
            >
              <Edit2 className="w-3 h-3 text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(row.original)}
              className="h-7 px-2 text-xs rounded-sm hover:text-rose-600"
              title="Deactivate Buyer"
            >
              <Trash2 className="w-3 h-3 text-rose-500" />
            </Button>
          </div>
        ),
        size: 90,
      },
    ],
    []
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-white dark:bg-[#121317] border border-slate-200/90 dark:border-[#1e2026] rounded-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search buyer name / code / country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs h-8 pl-8 pr-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="text-xs gap-1.5 rounded-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Buyer</span>
          </Button>
          <Button variant="outline" size="sm" onClick={loadBuyers} className="h-8 px-2 rounded-sm">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={buyers}
        isLoading={isLoading}
        totalCount={total}
        pageCount={Math.ceil(total / pageSize) || 1}
        pageIndex={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No Buyers Found"
        emptyDescription="Add garment buyers (e.g. Levi Strauss, H&M, Zara) to begin managing customer accounts."
      />

      <MasterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType="buyer"
        initialData={selectedBuyer}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
