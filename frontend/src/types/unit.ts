/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * গার্মেন্ট ইউনিট ও থার্মাল প্রিন্টিং টাইপ ডেফিনিশনস
 * 
 * রুল ০৪ (<300 Lines) এবং রুল ১২ (English Technical Terms) মেনে প্রস্তুতকৃত।
 */

export type GarmentStage =
  | 'GENERATED'
  | 'PRINTED'
  | 'ATTACHED'
  | 'RECEIVED_AT_LASER'
  | 'FRONT_DONE'
  | 'BACK_DONE'
  | 'COMPLETED'
  | 'QC_PASSED'
  | 'REJECTED';

export type ProductionType = 'COMPLETE_GARMENT' | 'CUT_PANEL';

export type QcStatus = 'PENDING' | 'PASSED' | 'REWORK' | 'REJECTED';

export interface GarmentUnit {
  id: string;
  order_id: string;
  style_code: string;
  size_code: string;
  production_type: ProductionType;
  cut_no?: string | null;
  bundle_no?: string | null;
  unit_serial_no: string;
  qr_code_payload: string;
  current_stage: GarmentStage;
  printed_by?: string | null;
  printed_at?: string | null;
  lasered_by_machine_id?: string | null;
  lasered_by_operator_id?: string | null;
  front_laser_completed_at?: string | null;
  back_laser_completed_at?: string | null;
  qc_status: QcStatus;
  qc_inspected_by?: string | null;
  qc_inspected_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GarmentUnitBatchGenerateRequest {
  order_id: string;
  size_quantities: Record<string, number>;
  production_type: ProductionType;
  cut_no?: string;
  bundle_no?: string;
}

export interface BatchGenerateResponse {
  total_generated: number;
  order_id: string;
  style_code: string;
  first_serial: string;
  last_serial: string;
}

export interface GarmentUnitListResponse {
  items: GarmentUnit[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GarmentUnitFilterParams {
  page?: number;
  page_size?: number;
  size?: string;
  stage?: string;
  search?: string;
}

export interface BatchZplResponse {
  zpl_data: string;
  total_labels: string;
}

