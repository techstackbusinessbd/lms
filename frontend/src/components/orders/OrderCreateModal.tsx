/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * নতুন অর্ডার এন্ট্রি মডাল (Order Create Modal - Garments Enterprise Spec)
 *
 * ড্রপডাউন সাপোর্ট: Company, Buyer, Brand, Season, Season Year
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
  ModalFooter,
} from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createOrder, OrderApiError } from '@/services/orderApi';
import { Order, OrderCreatePayload } from '@/types/order';
import {
  COMPANY_OPTIONS,
  BUYER_OPTIONS,
  BRAND_OPTIONS,
  SEASON_OPTIONS,
  SEASON_YEAR_OPTIONS,
  UOM_OPTIONS,
} from './orderFormOptions';

interface OrderCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const INITIAL_FORM: OrderCreatePayload = {
  company: COMPANY_OPTIONS[0].value as string,
  buyer_name: BUYER_OPTIONS[0].value as string,
  brand: BRAND_OPTIONS[0].value as string,
  style_code: '',
  job_no: '',
  season: 'Spring/Summer',
  season_year: 2026,
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
        season_year: formData.season_year ? Number(formData.season_year) : undefined,
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
            <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>New Order</span>
          </ModalTitle>
        </ModalHeader>

        {generalError && (
          <div className="p-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form id="create-order-form" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Row 1: 1. Company & 2. Buyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Company *"
              options={COMPANY_OPTIONS}
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              error={fieldErrors['company']}
              required
            />
            <Select
              label="Buyer *"
              options={BUYER_OPTIONS}
              value={formData.buyer_name}
              onChange={(e) => handleChange('buyer_name', e.target.value)}
              error={fieldErrors['buyer_name']}
              required
            />
          </div>

          {/* Row 2: 3. Style & 4. Job No. */}
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

          {/* Row 3: 5. Brand & 6. Season (with Season Year) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Brand"
              options={BRAND_OPTIONS}
              value={formData.brand || ''}
              onChange={(e) => handleChange('brand', e.target.value)}
              error={fieldErrors['brand']}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Season"
                options={SEASON_OPTIONS}
                value={formData.season || ''}
                onChange={(e) => handleChange('season', e.target.value)}
                error={fieldErrors['season']}
              />
              <Select
                label="Season Year"
                options={SEASON_YEAR_OPTIONS}
                value={formData.season_year || 2026}
                onChange={(e) => handleChange('season_year', Number(e.target.value))}
                error={fieldErrors['season_year']}
              />
            </div>
          </div>

          {/* Row 4: 7. Order Qty & 8. UOM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Order Qty *"
              type="number"
              min={1}
              placeholder="Total Pieces"
              value={formData.total_quantity || ''}
              onChange={(e) => handleChange('total_quantity', Number(e.target.value))}
              error={fieldErrors['total_quantity']}
              required
            />
            <Select
              label="UOM *"
              options={UOM_OPTIONS}
              value={formData.uom || 'PCS'}
              onChange={(e) => handleChange('uom', e.target.value)}
              error={fieldErrors['uom']}
            />
          </div>

          {/* Row 5: 9. Ship Date & 10. Dealing Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Ship Date *"
              type="date"
              value={formData.target_delivery_date}
              onChange={(e) => handleChange('target_delivery_date', e.target.value)}
              error={fieldErrors['target_delivery_date']}
              required
            />
            <Input
              label="Dealing Merchant"
              placeholder="Merchant Name"
              value={formData.dealing_merchant || ''}
              onChange={(e) => handleChange('dealing_merchant', e.target.value)}
              error={fieldErrors['dealing_merchant']}
            />
          </div>

          {/* Row 6: Additional Notes */}
          <div>
            <Input
              label="Notes"
              placeholder="Optional production or wash notes..."
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
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
                <span>Saving...</span>
              </>
            ) : (
              'Save Order'
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
