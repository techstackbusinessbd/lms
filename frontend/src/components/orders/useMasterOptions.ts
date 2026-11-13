/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার ক্রিয়েশন ফর্ম মাস্টার ডাটা ডায়নামিক হুক
 * 
 * ১০০% লাইভ ডাটাবেজ মাস্টার ডাটা থেকে ফেচ করে। জিরো সিড বা ডেমো ডাটা।
 * রুল ০৪ (<300 Lines) মেনে ডেটা ফেচিং আলাদা করা হয়েছে।
 */

import { useState, useEffect } from 'react';
import { SelectOption } from '@/components/ui/Select';
import { getCompanies, getBuyers, getBrands, getSeasons } from '@/services/masterDataApi';

export function useMasterOptions(selectedBuyerName?: string) {
  const [companyOptions, setCompanyOptions] = useState<SelectOption[]>([
    { value: '', label: 'Loading factory units...' },
  ]);
  const [buyerOptions, setBuyerOptions] = useState<SelectOption[]>([
    { value: '', label: 'Loading buyers...' },
  ]);
  const [allBrands, setAllBrands] = useState<Array<{ id: string; name: string; buyer_name?: string | null }>>([]);
  const [brandOptions, setBrandOptions] = useState<SelectOption[]>([
    { value: '', label: 'Loading brands...' },
  ]);
  const [seasonOptions, setSeasonOptions] = useState<SelectOption[]>([
    { value: '', label: 'Loading seasons...' },
  ]);

  useEffect(() => {
    // কোম্পানি লোড
    getCompanies({ page_size: 100, active_only: true })
      .then((res) => {
        if (res.items.length > 0) {
          setCompanyOptions([
            { value: '', label: 'Select Factory / Company...' },
            ...res.items.map((c) => ({ value: c.name, label: `${c.name} (${c.code})` })),
          ]);
        } else {
          setCompanyOptions([{ value: '', label: 'No companies found (Add in Master Data)' }]);
        }
      })
      .catch(() => {
        setCompanyOptions([{ value: '', label: 'Failed to load companies' }]);
      });

    // বায়ার লোড
    getBuyers({ page_size: 100, active_only: true })
      .then((res) => {
        if (res.items.length > 0) {
          setBuyerOptions([
            { value: '', label: 'Select Garment Buyer...' },
            ...res.items.map((b) => ({ value: b.name, label: `${b.name} (${b.code})` })),
          ]);
        } else {
          setBuyerOptions([{ value: '', label: 'No buyers found (Add in Master Data)' }]);
        }
      })
      .catch(() => {
        setBuyerOptions([{ value: '', label: 'Failed to load buyers' }]);
      });

    // ব্র্যান্ড লোড
    getBrands({ page_size: 100, active_only: true })
      .then((res) => {
        setAllBrands(res.items);
        if (res.items.length > 0) {
          setBrandOptions([
            { value: '', label: 'Select Brand (Optional)...' },
            ...res.items.map((b) => ({ value: b.name, label: b.name })),
          ]);
        } else {
          setBrandOptions([{ value: '', label: 'No brands found (Add in Master Data)' }]);
        }
      })
      .catch(() => {
        setBrandOptions([{ value: '', label: 'Failed to load brands' }]);
      });

    // সিজন লোড
    getSeasons({ page_size: 100, active_only: true })
      .then((res) => {
        if (res.items.length > 0) {
          setSeasonOptions([
            { value: '', label: 'Select Production Season...' },
            ...res.items.map((s) => ({ value: s.name, label: `${s.name} (${s.code})` })),
          ]);
        } else {
          setSeasonOptions([{ value: '', label: 'No seasons found (Add in Master Data)' }]);
        }
      })
      .catch(() => {
        setSeasonOptions([{ value: '', label: 'Failed to load seasons' }]);
      });
  }, []);

  // বায়ার নির্বাচন অনুযায়ী ব্র্যান্ড ফিল্টারিং
  useEffect(() => {
    if (allBrands.length > 0 && selectedBuyerName) {
      const filtered = allBrands.filter(
        (b) => !b.buyer_name || b.buyer_name.toLowerCase() === selectedBuyerName.toLowerCase()
      );
      if (filtered.length > 0) {
        setBrandOptions([
          { value: '', label: `Select Brand for ${selectedBuyerName}...` },
          ...filtered.map((b) => ({ value: b.name, label: b.name })),
        ]);
        return;
      }
    }
    if (allBrands.length > 0) {
      setBrandOptions([
        { value: '', label: 'Select Brand (Optional)...' },
        ...allBrands.map((b) => ({ value: b.name, label: b.name })),
      ]);
    }
  }, [selectedBuyerName, allBrands]);

  return { companyOptions, buyerOptions, brandOptions, seasonOptions };
}
