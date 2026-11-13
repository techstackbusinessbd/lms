/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার ক্রিয়েশন ফর্ম মাস্টার ডাটা ডায়নামিক হুক
 * 
 * রুল ০৪ (<300 Lines) মেনে ডেটা ফেচিং আলাদা করা হয়েছে।
 */

import { useState, useEffect } from 'react';
import { SelectOption } from '@/components/ui/Select';
import { getCompanies, getBuyers, getBrands, getSeasons } from '@/services/masterDataApi';
import {
  COMPANY_OPTIONS,
  BUYER_OPTIONS,
  BRAND_OPTIONS,
  SEASON_OPTIONS,
} from './orderFormOptions';

export function useMasterOptions(selectedBuyerName?: string) {
  const [companyOptions, setCompanyOptions] = useState<SelectOption[]>(COMPANY_OPTIONS);
  const [buyerOptions, setBuyerOptions] = useState<SelectOption[]>(BUYER_OPTIONS);
  const [allBrands, setAllBrands] = useState<Array<{ id: string; name: string; buyer_name?: string | null }>>([]);
  const [brandOptions, setBrandOptions] = useState<SelectOption[]>(BRAND_OPTIONS);
  const [seasonOptions, setSeasonOptions] = useState<SelectOption[]>(SEASON_OPTIONS);

  useEffect(() => {
    // কোম্পানি লোড
    getCompanies({ page_size: 100, active_only: true })
      .then((res) => {
        if (res.items.length > 0) {
          setCompanyOptions(res.items.map((c) => ({ value: c.name, label: `${c.name} (${c.code})` })));
        }
      })
      .catch(() => {});

    // বায়ার লোড
    getBuyers({ page_size: 100, active_only: true })
      .then((res) => {
        if (res.items.length > 0) {
          setBuyerOptions(res.items.map((b) => ({ value: b.name, label: `${b.name} (${b.code})` })));
        }
      })
      .catch(() => {});

    // ব্র্যান্ড লোড
    getBrands({ page_size: 100, active_only: true })
      .then((res) => {
        if (res.items.length > 0) {
          setAllBrands(res.items);
          setBrandOptions(res.items.map((b) => ({ value: b.name, label: b.name })));
        }
      })
      .catch(() => {});

    // সিজন লোড
    getSeasons({ page_size: 100, active_only: true })
      .then((res) => {
        if (res.items.length > 0) {
          setSeasonOptions(res.items.map((s) => ({ value: s.name, label: `${s.name} (${s.code})` })));
        }
      })
      .catch(() => {});
  }, []);

  // বায়ার নির্বাচন অনুযায়ী ব্র্যান্ড ফিল্টারিং
  useEffect(() => {
    if (allBrands.length > 0 && selectedBuyerName) {
      const filtered = allBrands.filter(
        (b) => !b.buyer_name || b.buyer_name.toLowerCase() === selectedBuyerName.toLowerCase()
      );
      if (filtered.length > 0) {
        setBrandOptions(filtered.map((b) => ({ value: b.name, label: b.name })));
        return;
      }
    }
    if (allBrands.length > 0) {
      setBrandOptions(allBrands.map((b) => ({ value: b.name, label: b.name })));
    }
  }, [selectedBuyerName, allBrands]);

  return { companyOptions, buyerOptions, brandOptions, seasonOptions };
}
