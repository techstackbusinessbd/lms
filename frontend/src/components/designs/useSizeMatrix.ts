/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * সাইজ ম্যাট্রিক্স ক্যালকুলেশন হুক (Size Matrix Calculation Hook)
 *
 * একটি লেজার ডিজাইনের আপলোডকৃত ফাইলসমূহ থেকে প্রতিটি সাইজের ফ্রন্ট, ব্যাক ও মকআপ স্লট তৈরি করে।
 * রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import { useMemo } from 'react';
import { LaserDesign } from '@/types/design';
import { SizeMatrixRow } from './matrixColumns';

export const DEFAULT_SIZES = ['28', '30', '32', '34', '36', '38', '40', 'ALL'];

export function useSizeMatrix(
  activeDesign: LaserDesign | null,
  extraSizes: string[]
): SizeMatrixRow[] {
  return useMemo<SizeMatrixRow[]>(() => {
    if (!activeDesign) return [];
    const files = activeDesign.files || [];
    const fileSizes = files.map((f) => f.size_code.toUpperCase());
    const allSizes = Array.from(new Set([...DEFAULT_SIZES, ...fileSizes, ...extraSizes]));

    return allSizes.map((size) => {
      const front_file = files.find(
        (f) => f.size_code.toUpperCase() === size && f.placement === 'FRONT'
      );
      const back_file = files.find(
        (f) => f.size_code.toUpperCase() === size && f.placement === 'BACK'
      );
      const mockup_file = files.find(
        (f) => f.size_code.toUpperCase() === size && f.placement === 'PANEL'
      );

      let status: 'COMPLETE' | 'PARTIAL' | 'EMPTY' = 'EMPTY';
      if (front_file && back_file) status = 'COMPLETE';
      else if (front_file || back_file || mockup_file) status = 'PARTIAL';

      return { size_code: size, front_file, back_file, mockup_file, status };
    });
  }, [activeDesign, extraSizes]);
}
