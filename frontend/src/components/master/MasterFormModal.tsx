/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মাস্টার ডাটা এন্ট্রি ও এডিট মডাল (Universal Master Form Modal)
 * 
 * Company, Buyer, Brand এবং Season-এর ডায়নামিক ইনপুট ফর্ম।
 * রুল ১৬ (2px Corner Radius), রুল ২৩ (Pydantic Validation) ও রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Buyer } from '@/types/masterData';

export type MasterEntityType = 'company' | 'buyer' | 'brand' | 'season';

interface MasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: MasterEntityType;
  initialData?: any | null;
  buyersList?: Buyer[];
  onSubmit: (formData: any) => Promise<void>;
}

export const MasterFormModal: React.FC<MasterFormModalProps> = ({
  isOpen,
  onClose,
  entityType,
  initialData,
  buyersList = [],
  onSubmit,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setAddress(initialData.address || '');
      setCountry(initialData.country || '');
      setContactEmail(initialData.contact_email || '');
      setBuyerId(initialData.buyer_id || '');
      setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
    } else {
      setCode('');
      setName('');
      setAddress('');
      setCountry('');
      setContactEmail('');
      setBuyerId('');
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  const titles: Record<MasterEntityType, string> = {
    company: isEdit ? 'Edit Factory Unit / Company' : 'Add New Factory Unit / Company',
    buyer: isEdit ? 'Edit Garment Buyer' : 'Add New Garment Buyer',
    brand: isEdit ? 'Edit Buyer Brand' : 'Add New Buyer Brand',
    season: isEdit ? 'Edit Production Season' : 'Add New Production Season',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setErrorMsg('Code and Name are strictly required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: any = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        is_active: isActive,
      };

      if (entityType === 'company') payload.address = address.trim() || null;
      if (entityType === 'buyer') {
        payload.country = country.trim() || null;
        payload.contact_email = contactEmail.trim() || null;
      }
      if (entityType === 'brand') payload.buyer_id = buyerId || null;

      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Operation failed. Please verify input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {titles[entityType]}
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ব্র্যান্ডের জন্য বায়ার নির্বাচন */}
          {entityType === 'brand' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Parent Buyer (Optional)
              </label>
              <select
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                className="w-full text-xs h-8 px-2 rounded-sm border border-slate-300 dark:border-[#22252e] bg-white dark:bg-[#121317] text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">No specific buyer (Universal)</option>
                {buyersList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* কোড ও নাম */}
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              label="Identifier Code *"
              placeholder="e.g. DSL-U1"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="uppercase font-mono"
            />
            <Input
              label="Display Name *"
              placeholder="e.g. Denim Solutions Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* কোম্পানি: ঠিকানা */}
          {entityType === 'company' && (
            <Input
              label="Location / Factory Address"
              placeholder="e.g. Plot 14, EPZ, Dhaka"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          )}

          {/* বায়ার: দেশ ও ইমেইল */}
          {entityType === 'buyer' && (
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="Country of Origin"
                placeholder="e.g. USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              <Input
                label="Contact Email"
                placeholder="e.g. buyer@levi.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          )}

          {/* স্ট্যাটাস চেকবক্স */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="master-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-3.5 h-3.5 rounded-sm border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="master-active" className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Active in Order Entry & Production dropdowns
            </label>
          </div>

          <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-[#1e2026]">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} className="text-xs rounded-sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="text-xs gap-1.5 rounded-sm">
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEdit ? 'Save Changes' : 'Create Record'}</span>
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
