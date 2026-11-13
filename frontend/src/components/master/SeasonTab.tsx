/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * প্রোডাকশন সিজন মাস্টার ট্যাব (Seasons Tab)
 * 
 * রুল ২৩ (TanStack Table), রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, Search, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { DataTableColumnHeader } from '@/components/ui/DataTableColumnHeader';
import { Season } from '@/types/masterData';
import { getSeasons, createSeason, updateSeason, deleteSeason } from '@/services/masterDataApi';
import { MasterFormModal } from './MasterFormModal';

export const SeasonTab: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  const loadSeasons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSeasons({ page, page_size: pageSize, search: search.trim() || undefined });
      setSeasons(res.items);
      setTotal(res.total);
    } catch {
      setSeasons([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    loadSeasons();
  }, [loadSeasons]);

  const handleOpenAdd = () => {
    setSelectedSeason(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Season) => {
    setSelectedSeason(s);
    setIsModalOpen(true);
  };

  const handleDelete = async (s: Season) => {
    if (window.confirm(`Are you sure you want to deactivate season '${s.name}'?`)) {
      await deleteSeason(s.id);
      loadSeasons();
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (selectedSeason) {
      await updateSeason(selectedSeason.id, formData);
    } else {
      await createSeason(formData);
    }
    loadSeasons();
  };

  const columns = useMemo<ColumnDef<Season>[]>(
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="SEASON NAME" />,
        cell: ({ row }) => (
          <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{row.original.name}</span>
          </div>
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
              title="Edit Season"
            >
              <Edit2 className="w-3 h-3 text-blue-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(row.original)}
              className="h-7 px-2 text-xs rounded-sm hover:text-rose-600"
              title="Deactivate Season"
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
            placeholder="Search season name / code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs h-8 pl-8 pr-2 rounded-sm border border-slate-300 dark:border-[#282b35] bg-white dark:bg-[#16171d] text-zinc-900 dark:text-zinc-100 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleOpenAdd} className="text-xs gap-1.5 rounded-sm">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Season</span>
          </Button>
          <Button variant="outline" size="sm" onClick={loadSeasons} className="h-8 px-2 rounded-sm">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={seasons}
        isLoading={isLoading}
        totalCount={total}
        pageCount={Math.ceil(total / pageSize) || 1}
        pageIndex={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No Seasons Found"
        emptyDescription="Add production seasons (e.g. Spring/Summer, Autumn/Winter) to categorize garments purchase orders."
      />

      <MasterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType="season"
        initialData={selectedSeason}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

