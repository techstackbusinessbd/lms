/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * নতুন অর্ডার এন্ট্রি মডাল (Order Create Modal Component)
 *
 * রুল ২৩ মেনে Pydantic v2 সার্ভার-সাইড এরর সরাসরি ফিল্ডে প্রদর্শন করে।
 * রুল ১৬ (2px Corner Radius) এবং রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState } from 'react';
import { Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createOrder, OrderApiError } from '@/services/orderApi';
import { Order, OrderCreatePayload } from '@/types/order';

interface OrderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const INITIAL_FORM: OrderCreatePayload = {
  buyer_name: '',
  po_number: '',
  style_code: '',
  style_name: '',
  fabric_description: '',
  wash_reference: '',
  total_quantity: 0,
  target_delivery_date: '',
  priority: 'NORMAL',
  notes: '',
};

export const OrderCreateModal: React.FC<OrderCreateModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const [formData, setFormData] = useState<OrderCreatePayload>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof OrderCreatePayload,
    value: string | number | undefined | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const created = await createOrder({
        ...formData,
        total_quantity: Number(formData.total_quantity),
      });
      setFormData(INITIAL_FORM);
      onOrderCreated(created);
      onClose();
    } catch (err) {
      if (err instanceof OrderApiError) {
        setGeneralError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setGeneralError('Failed to create order. Please check network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Create Purchase Order (Step 1)</span>
          </ModalTitle>
          <ModalDescription>
            Enter buyer PO details and total quantity for laser production tracking.
          </ModalDescription>
        </ModalHeader>

        {generalError && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form id="create-order-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Buyer Name *"
              placeholder="e.g. Levi Strauss & Co."
              value={formData.buyer_name}
              onChange={(e) => handleChange('buyer_name', e.target.value)}
              error={fieldErrors['buyer_name']}
              required
            />
            <Input
              label="PO Number *"
              placeholder="e.g. PO-884920"
              value={formData.po_number}
              onChange={(e) => handleChange('po_number', e.target.value)}
              error={fieldErrors['po_number']}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Style Code *"
              placeholder="e.g. 511 Slim Fit"
              value={formData.style_code}
              onChange={(e) => handleChange('style_code', e.target.value)}
              error={fieldErrors['style_code']}
              required
            />
            <Input
              label="Style Name / Description"
              placeholder="e.g. Mens Stretch Selvedge Denim"
              value={formData.style_name || ''}
              onChange={(e) => handleChange('style_name', e.target.value)}
              error={fieldErrors['style_name']}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Wash Reference *"
              placeholder="e.g. Dark Vintage Whisker (W-104)"
              value={formData.wash_reference}
              onChange={(e) => handleChange('wash_reference', e.target.value)}
              error={fieldErrors['wash_reference']}
              required
            />
            <Input
              label="Fabric Composition"
              placeholder="e.g. 12.5 Oz Denim, 98% C 2% Sp"
              value={formData.fabric_description || ''}
              onChange={(e) => handleChange('fabric_description', e.target.value)}
              error={fieldErrors['fabric_description']}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Total Quantity (Pcs) *"
              type="number"
              min={1}
              placeholder="5000"
              value={formData.total_quantity || ''}
              onChange={(e) => handleChange('total_quantity', Number(e.target.value))}
              error={fieldErrors['total_quantity']}
              required
            />
            <Input
              label="Target Delivery Date *"
              type="date"
              value={formData.target_delivery_date}
              onChange={(e) => handleChange('target_delivery_date', e.target.value)}
              error={fieldErrors['target_delivery_date']}
              required
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 select-none">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  handleChange(
                    'priority',
                    e.target.value as OrderCreatePayload['priority']
                  )
                }
                className="w-full h-11 px-3 rounded-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 transition-colors"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Rush</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 select-none">
              Production Notes / Merchandising Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Special requirements, recipe guidelines, or inspection notes..."
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full p-2.5 rounded-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>
        </form>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-order-form"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Saving Order...</span>
              </>
            ) : (
              'Save & Register Order'
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
