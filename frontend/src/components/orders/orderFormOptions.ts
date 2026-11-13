/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার এন্ট্রি ফর্ম ড্রপডাউন অপশনসমূহ (Garments Order Dropdown Options)
 *
 * রুল ০৪ (<300 Lines) মেনে ডেটা আলাদা মডিউলে সংরক্ষিত।
 */

import { SelectOption } from '@/components/ui/Select';

// ১. কোম্পানি / ফ্যাক্টরি ইউনিট ড্রপডাউন
export const COMPANY_OPTIONS: SelectOption[] = [
  { value: 'Denim Solutions Ltd. Unit-1', label: 'Denim Solutions Ltd. Unit-1' },
  { value: 'Denim Solutions Ltd. Unit-2', label: 'Denim Solutions Ltd. Unit-2' },
  { value: 'Pacific Jeans Ltd. Unit-1', label: 'Pacific Jeans Ltd. Unit-1' },
  { value: 'Pacific Jeans Ltd. Unit-2', label: 'Pacific Jeans Ltd. Unit-2' },
  { value: 'Ananta Denim Ltd.', label: 'Ananta Denim Ltd.' },
  { value: 'Ha-Meem Denim Division', label: 'Ha-Meem Denim Division' },
];

// ২. বায়ার ড্রপডাউন
export const BUYER_OPTIONS: SelectOption[] = [
  { value: 'Levi Strauss & Co.', label: 'Levi Strauss & Co.' },
  { value: 'H&M', label: 'H&M' },
  { value: 'Zara', label: 'Zara' },
  { value: 'American Eagle', label: 'American Eagle' },
  { value: 'GAP Inc.', label: 'GAP Inc.' },
  { value: 'Target', label: 'Target' },
  { value: 'Tommy Hilfiger', label: 'Tommy Hilfiger' },
  { value: 'Wrangler / Lee', label: 'Wrangler / Lee' },
];

// ৩. ব্র্যান্ড ড্রপডাউন
export const BRAND_OPTIONS: SelectOption[] = [
  { value: "Levi's Red Tab", label: "Levi's Red Tab" },
  { value: "Levi's Signature", label: "Levi's Signature" },
  { value: "Levi's Premium", label: "Levi's Premium" },
  { value: 'H&M Divided', label: 'H&M Divided' },
  { value: 'H&M Regular', label: 'H&M Regular' },
  { value: 'Zara Denim Lab', label: 'Zara Denim Lab' },
  { value: 'Zara Man', label: 'Zara Man' },
  { value: 'AEO Premium', label: 'AEO Premium' },
  { value: 'GAP 1969', label: 'GAP 1969' },
  { value: 'Main Brand', label: 'Main Brand' },
];

// ৪. সিজন ড্রপডাউন
export const SEASON_OPTIONS: SelectOption[] = [
  { value: 'Spring/Summer', label: 'Spring/Summer' },
  { value: 'Autumn/Winter', label: 'Autumn/Winter' },
  { value: 'Spring', label: 'Spring' },
  { value: 'Summer', label: 'Summer' },
  { value: 'Fall', label: 'Fall' },
  { value: 'Winter', label: 'Winter' },
  { value: 'Holiday', label: 'Holiday' },
];

// ৫. সিজন বছর ড্রপডাউন
export const SEASON_YEAR_OPTIONS: SelectOption[] = [
  { value: 2024, label: '2024' },
  { value: 2025, label: '2025' },
  { value: 2026, label: '2026' },
  { value: 2027, label: '2027' },
  { value: 2028, label: '2028' },
  { value: 2029, label: '2029' },
  { value: 2030, label: '2030' },
];

// ৬. ইউওএম (পরিমাপের একক) ড্রপডাউন
export const UOM_OPTIONS: SelectOption[] = [
  { value: 'PCS', label: 'PCS' },
  { value: 'DZN', label: 'DZN' },
  { value: 'SET', label: 'SET' },
];
