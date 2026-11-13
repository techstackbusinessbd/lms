/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ব্র্যান্ড ও সাব-ব্র্যান্ড মাস্টার ট্যাব (Brands Tab)
 * 
 * রুল ২৩ (TanStack Table), রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, Search, RefreshCw, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { DataTableColumnHeader } from '@/components/ui/DataTableColumnHeader';
import { Brand, Buyer } from '@/types/masterData';
import { getBrands, createBrand, updateBrand, deleteBrand, getBuyers } from '@/services/masterDataApi';
import { MasterFormModal } from './MasterFormModal';

export const BrandTab: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyerFilter, setSelectedBuyerFilter] = useState<string>('ALL');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // বায়ার তালিকা লোড
  useEffect(() => {
    getBuyers({ page_size: 100, active_only: true }).then((res) => {
      setBuyers(res.items);
    });
  }, []);

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getBrands(
        { page, page_size: pageSize, search: search.trim() || undefined },
        selectedBuyerFilter === 'ALL' ? undefined : selectedBuyerFilter
      );
      setBrands(res.items);
      setTotal(res.total);
    } catch {
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, selectedBuyerFilter]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const handleOpenAdd = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (br: Brand) => {
    setSelectedBrand(br);
    setIsModalOpen(true);
  };

  const handleDelete = async (br: Brand) => {
    if (window.confirm(`Are you sure you want to deactivate brand '${br.name}'?`)) {
      await deleteBrand(br.id);
      loadBrands();
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (selectedBrand) {
      await updateBrand(selectedBrand.id, formData);
    } else {
      await createBrand(formData);
    }
    loadBrands();
  };

  const columns = useMemo<ColumnDef<Brand>[]>(
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="BRAND NAME" />,
        cell: ({ row }) => (
          <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'buyer_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="PARENT BUYER" />,
        cell: ({ row }) => (
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            {row.original.buyer_name || <span className="text-zinc-400 italic">Universal Brand</span>}
          </span>
        ),
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
              title="Edit Brand"
            >
              <Edit2 className="w-3 h-3 text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(row.original)}
              className="h-7 px-2 text-xs rounded-sm hover:text-rose-600"
              title="Deactivate Brand"
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
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search brand name / code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs h-8 pl-8 pr-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-mono"
            />
          </div>

          <select
            value={selectedBuyerFilter}
            onChange={(e) => setSelectedBuyerFilter(e.target.value)}
            className="text-xs h-8 px-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-medium"
          >
            <option value="ALL">All Buyers</option>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="text-xs gap-1.5 rounded-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Brand</span>
          </Button>
          <Button variant="outline" size="sm" onClick={loadBrands} className="h-8 px-2 rounded-sm">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        isLoading={isLoading}
        totalCount={total}
        pageCount={Math.ceil(total / pageSize) || 1}
        pageIndex={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No Brands Found"
        emptyDescription="Add garment sub-brands linked to specific buyers (e.g. Levi's Red Tab, H&M Divided)."
      />

      <MasterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType="brand"
        initialData={selectedBrand}
        buyersList={buyers}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
