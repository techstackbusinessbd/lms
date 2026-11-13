/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার এন্ট্রি ফর্ম অপশনসমূহ (Garments Order Dropdown Options)
 * 
 * Company, Buyer, Brand ও Season এখন ১০০% মাস্টার ডাটা এপিআই দ্বারা চালিত।
 * কোনো সিড বা ডেমো ডাটা রাখা হয়নি।
 * রুল ০৪ (<300 Lines) মেনে ডেটা আলাদা মডিউলে সংরক্ষিত।
 */

import { SelectOption } from '@/components/ui/Select';

// কোম্পানি / ফ্যাক্টরি ইউনিট ড্রপডাউন (ডায়নামিক মাস্টার ডাটা থেকে লোড হবে)
export const COMPANY_OPTIONS: SelectOption[] = [];

// বায়ার ড্রপডাউন (ডায়নামিক মাস্টার ডাটা থেকে লোড হবে)
export const BUYER_OPTIONS: SelectOption[] = [];

// ব্র্যান্ড ড্রপডাউন (ডায়নামিক মাস্টার ডাটা থেকে লোড হবে)
export const BRAND_OPTIONS: SelectOption[] = [];

// সিজন ড্রপডাউন (ডায়নামিক মাস্টার ডাটা থেকে লোড হবে)
export const SEASON_OPTIONS: SelectOption[] = [];

// সিজন বছর ড্রপডাউন (স্ট্যান্ডার্ড ক্যালেন্ডার বছর)
export const SEASON_YEAR_OPTIONS: SelectOption[] = [
  { value: 2024, label: '2024' },
  { value: 2025, label: '2025' },
  { value: 2026, label: '2026' },
  { value: 2027, label: '2027' },
  { value: 2028, label: '2028' },
  { value: 2029, label: '2029' },
  { value: 2030, label: '2030' },
];

// ইউওএম (পরিমাপের একক) ড্রপডাউন
export const UOM_OPTIONS: SelectOption[] = [
  { value: 'PCS', label: 'PCS (Pieces)' },
  { value: 'DZN', label: 'DZN (Dozens)' },
  { value: 'SET', label: 'SET' },
];
