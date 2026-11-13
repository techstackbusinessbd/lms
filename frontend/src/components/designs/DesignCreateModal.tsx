/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * নতুন লেজার রেসিপি তৈরি মডাল (Design Create Modal)
 *
 * নতুন বায়ার অর্ডারের জন্য লেজার ডিজাইন ড্রাফট তৈরি করে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { PlusCircle, Loader2, AlertCircle } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createDesign, DesignApiError } from '@/services/designApi';
import { LaserDesign } from '@/types/design';
import { Order } from '@/types/order';

interface DesignCreateModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onDesignCreated: (design: LaserDesign) => void;
}

export const DesignCreateModal: React.FC<DesignCreateModalProps> = ({
  isOpen,
  order,
  onClose,
  onDesignCreated,
}) => {
  const [recipeName, setRecipeName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      setError('Please provide a recipe title or name.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await createDesign({
        order_id: order.id,
        recipe_name: recipeName.trim(),
        style_code: order.style_code,
        notes: notes.trim() || undefined,
      });

      onDesignCreated(created);
      setRecipeName('');
      setNotes('');
      onClose();
    } catch (err) {
      if (err instanceof DesignApiError) {
        setError(err.message);
      } else {
        setError('Failed to create laser design draft.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Create New Laser Recipe Draft</span>
          </ModalTitle>
        </ModalHeader>

        {error && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form id="create-design-form" onSubmit={handleSubmit} className="space-y-3.5">
          <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-[#15171e] border border-slate-200 dark:border-[#272930] text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">PO / Job No:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{order.job_no || order.po_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Buyer &amp; Style:</span>
              <span className="font-semibold">{order.buyer_name} • {order.style_code}</span>
            </div>
          </div>

          <Input
            label="Recipe Name *"
            placeholder="e.g. 511 Slim Whisker & Scraping v1"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            required
          />

          <Input
            label="Design Notes (Optional)"
            placeholder="Special instructions for Jeanologia table operators..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </form>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-design-form" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Creating Draft...</span>
              </>
            ) : (
              'Create Recipe'
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

