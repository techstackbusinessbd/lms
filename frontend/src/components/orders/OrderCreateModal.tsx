/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * নতুন অর্ডার এন্ট্রি মডাল (Order Create Modal - Garments Enterprise Spec)
 *
 * সিটিও স্যারের স্পেসিফিকেশন অনুসারী ১০টি কোর ফিল্ড:
 * Company, Buyer, Style, Job No., Brand, Season, Order Qty, UOM, Ship Date, Dealing Merchant
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
  company: 'Denim Solutions Ltd.',
  buyer_name: '',
  style_code: '',
  job_no: '',
  brand: '',
  season: 'Spring/Summer 2026',
  total_quantity: 0,
  uom: 'PCS',
  target_delivery_date: '',
  dealing_merchant: '',
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
            <span>Order Entry (Step 1)</span>
          </ModalTitle>
          <ModalDescription>
            Register garments purchase order with 10 enterprise tracking fields.
          </ModalDescription>
        </ModalHeader>

        {generalError && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form id="create-order-form" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Row 1: Company & Buyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company *"
              placeholder="e.g. Denim Solutions Ltd."
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              error={fieldErrors['company']}
              required
            />
            <Input
              label="Buyer *"
              placeholder="e.g. Levi Strauss & Co."
              value={formData.buyer_name}
              onChange={(e) => handleChange('buyer_name', e.target.value)}
              error={fieldErrors['buyer_name']}
              required
            />
          </div>

          {/* Row 2: Style & Job No. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Style *"
              placeholder="e.g. 511 Slim Fit"
              value={formData.style_code}
              onChange={(e) => handleChange('style_code', e.target.value)}
              error={fieldErrors['style_code']}
              required
            />
            <Input
              label="Job No. *"
              placeholder="e.g. JOB-2026-0042"
              value={formData.job_no}
              onChange={(e) => handleChange('job_no', e.target.value)}
              error={fieldErrors['job_no']}
              required
            />
          </div>

          {/* Row 3: Brand & Season */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Brand"
              placeholder="e.g. Levi's Red Tab / Signature"
              value={formData.brand || ''}
              onChange={(e) => handleChange('brand', e.target.value)}
              error={fieldErrors['brand']}
            />
            <Input
              label="Season"
              placeholder="e.g. Spring/Summer 2026"
              value={formData.season || ''}
              onChange={(e) => handleChange('season', e.target.value)}
              error={fieldErrors['season']}
            />
          </div>

          {/* Row 4: Order Qty, UOM & Ship Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Order Qty *"
              type="number"
              min={1}
              placeholder="10000"
              value={formData.total_quantity || ''}
              onChange={(e) => handleChange('total_quantity', Number(e.target.value))}
              error={fieldErrors['total_quantity']}
              required
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 select-none">
                UOM *
              </label>
              <select
                value={formData.uom || 'PCS'}
                onChange={(e) => handleChange('uom', e.target.value)}
                className="w-full h-11 px-3 rounded-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 transition-colors"
              >
                <option value="PCS">PCS (Pieces)</option>
                <option value="DZN">DZN (Dozens)</option>
                <option value="SET">SET (Sets)</option>
              </select>
            </div>
            <Input
              label="Ship Date *"
              type="date"
              value={formData.target_delivery_date}
              onChange={(e) => handleChange('target_delivery_date', e.target.value)}
              error={fieldErrors['target_delivery_date']}
              required
            />
          </div>

          {/* Row 5: Dealing Merchant & Production Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Dealing Merchant"
              placeholder="e.g. Tanvir Ahmed"
              value={formData.dealing_merchant || ''}
              onChange={(e) => handleChange('dealing_merchant', e.target.value)}
              error={fieldErrors['dealing_merchant']}
            />
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 select-none">
                Production Notes
              </label>
              <input
                type="text"
                placeholder="Special instructions or wash guidance..."
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full h-11 px-3 rounded-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
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
