/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * Tailwind CSS ক্লাস মার্জ ও কনফ্লিক্ট রেজোলিউশন ইউটিলিটি
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * একাধিক সিএসএস ক্লাস মার্জ করার এবং ডুপ্লিকেট ক্লাস রিমুভ করার নির্ভরযোগ্য ফাংশন।
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
