/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মাস্টার ডাটা টাইপ ডেফিনিশন (Master Data Types)
 * 
 * Company, Buyer, Brand, Season-এর জন্য ফ্রন্টএন্ড টাইপস।
 * রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

export interface Company {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Buyer {
  id: string;
  code: string;
  name: string;
  country?: string | null;
  contact_email?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Brand {
  id: string;
  buyer_id?: string | null;
  buyer_name?: string | null;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface Season {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface MasterListResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MasterFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  active_only?: boolean;
}
