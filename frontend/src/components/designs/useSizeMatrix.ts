/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * ডায়নামিক সাইজ ম্যাট্রিক্স ক্যালকুলেশন হুক (Dynamic Size Matrix Calculation Hook)
 *
 * কোনো স্ট্যাটিক সাইজ থাকবে না। ডিজাইনারের চাহিদা অনুযায়ী যোগ করা সাইজ এবং
 * পূর্বে আপলোডকৃত ফাইলের সাইজের ভিত্তিতে সাইজ রো তৈরি করে।
 * রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import { useMemo } from 'react';
import { LaserDesign } from '@/types/design';
import { SizeMatrixRow } from './matrixColumns';

export function useSizeMatrix(
  activeDesign: LaserDesign | null,
  customSizes: string[]
): SizeMatrixRow[] {
  return useMemo<SizeMatrixRow[]>(() => {
    if (!activeDesign) return [];
    const files = activeDesign.files || [];
    const fileSizes = files.map((f) => f.size_code.toUpperCase());

    // ১. কেবল ফাইলে বিদ্যমান সাইজ ও ব্যবহারকারীর কাস্টম সাইজসমূহ
    const allSizes = Array.from(new Set([...fileSizes, ...customSizes]));

    // ২. সাইজগুলো প্রাকৃতিক ক্রমানুসারে সাজানো (Numerical/Alphanumeric sort)
    allSizes.sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

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
  }, [activeDesign, customSizes]);
}
