/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার ম্যানেজমেন্ট টাইপ ডেফিনিশন (Order Management TypeScript Types)
 *
 * রুল ১২ মেনে টেকনিক্যাল টার্মস ও টাইপস ইংরেজিতে।
 * রুল ২৩ মেনে Pydantic v2 ব্যাকএন্ড স্কিমার সাথে শতভাগ সঙ্গতিপূর্ণ।
 */

export interface Order {
  id: string; // RFC 9562 UUIDv7
  buyer_name: string;
  po_number: string;
  style_code: string;
  style_name: string | null;
  fabric_description: string | null;
  wash_reference: string;
  total_quantity: number;
  target_delivery_date: string; // YYYY-MM-DD
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
  buyer_name: string;
  po_number: string;
  style_code: string;
  style_name?: string | null;
  fabric_description?: string | null;
  wash_reference: string;
  total_quantity: number;
  target_delivery_date: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string | null;
}

export interface OrderUpdatePayload {
  buyer_name?: string;
  po_number?: string;
  style_code?: string;
  style_name?: string | null;
  fabric_description?: string | null;
  wash_reference?: string;
  total_quantity?: number;
  target_delivery_date?: string;
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
  priority?: string;
  buyer?: string;
}
