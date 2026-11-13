/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন ও রেসিপি ভল্ট টাইপস (Laser Design Vault Types)
 *
 * Jeanologia eMark (.jean/.jean5) ফাইল মেটাডেটা ও রেসিপি লক টাইপ ডেফিনিশন।
 * রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

export type BodyPlacement = 'FRONT' | 'BACK' | 'PANEL';
export type DesignStatus = 'DRAFT' | 'LOCKED' | 'ACTIVE' | 'DEPRECATED';

export interface LaserDesignFile {
  id: string;
  design_id: string;
  size_code: string;
  placement: BodyPlacement;
  file_format: 'JEAN5' | 'JEAN';
  original_filename: string;
  file_path: string;
  file_size_bytes: number;
  file_hash_sha256: string;
  power_percentage?: number | null;
  speed_percentage?: number | null;
  cycle_time_estimate_sec?: number | null;
  created_at: string;
  updated_at: string;
}

export interface LaserDesign {
  id: string;
  order_id: string;
  style_code: string;
  recipe_name: string;
  version: number;
  status: DesignStatus;
  is_locked: boolean;
  locked_at?: string | null;
  locked_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  files: LaserDesignFile[];
}

export interface LaserDesignCreatePayload {
  order_id: string;
  recipe_name: string;
  style_code: string;
  notes?: string;
}

export interface FileUploadPayload {
  file: File;
  size_code: string;
  placement: BodyPlacement;
  power_percentage?: number;
  speed_percentage?: number;
  cycle_time_estimate_sec?: number;
}

export interface RecipeLockPayload {
  confirm_lock: boolean;
  lock_notes?: string;
}
