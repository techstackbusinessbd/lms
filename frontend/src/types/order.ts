/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার ম্যানেজমেন্ট টাইপ ডেফিনিশন (Garments Enterprise Order Spec)
 *
 * সিটিও স্যারের স্পেসিফিকেশন অনুসারী ১০টি কোর ফিল্ড:
 * 1. Company
 * 2. Buyer
 * 3. Style
 * 4. Job No.
 * 5. Brand
 * 6. Season
 * 7. Order Qty
 * 8. UOM
 * 9. Ship Date
 * 10. Dealing Merchant
 */

export interface Order {
  id: string; // RFC 9562 UUIDv7
  company: string;
  buyer_name: string;
  style_code: string;
  job_no: string;
  brand: string | null;
  season: string | null;
  total_quantity: number;
  uom: string;
  target_delivery_date: string; // Ship Date (YYYY-MM-DD)
  dealing_merchant: string | null;

  // সহযোগী ফিল্ডসমূহ
  po_number?: string;
  style_name?: string | null;
  fabric_description?: string | null;
  wash_reference?: string | null;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING_DESIGN' | 'DESIGN_APPROVED' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  current_revision: number;
  notes: string | null;
  created_by: string;
  creator?: {
    id: string;
    username: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderCreatePayload {
  company: string;
  buyer_name: string;
  style_code: string;
  job_no: string;
  brand?: string | null;
  season?: string | null;
  total_quantity: number;
  uom?: string;
  target_delivery_date: string; // Ship Date
  dealing_merchant?: string | null;

  po_number?: string;
  style_name?: string | null;
  fabric_description?: string | null;
  wash_reference?: string | null;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string | null;
}

export interface OrderUpdatePayload {
  company?: string;
  buyer_name?: string;
  style_code?: string;
  job_no?: string;
  brand?: string | null;
  season?: string | null;
  total_quantity?: number;
  uom?: string;
  target_delivery_date?: string;
  dealing_merchant?: string | null;

  po_number?: string;
  style_name?: string | null;
  fabric_description?: string | null;
  wash_reference?: string | null;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string | null;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OrderFilterParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  company?: string;
  buyer?: string;
}
