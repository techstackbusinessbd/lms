/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * অর্ডার ম্যানেজমেন্ট এপিআই ক্লায়েন্ট সার্ভিস (Order API Client)
 *
 * ব্যাকএন্ডের /api/v1/orders এন্ডপয়েন্টগুলোর সাথে টাইপ-সেফ যোগাযোগ পরিচালনা করে।
 * রুল ২৩ মেনে Pydantic v2 সার্ভার-সাইড এরর পার্সিং সমর্থন করে।
 * রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import {
  Order,
  OrderCreatePayload,
  OrderFilterParams,
  OrderListResponse,
  OrderUpdatePayload,
} from '@/types/order';
import { PydanticValidationErrorResponse } from '@/types/auth';

const API_BASE = '/api/v1/orders';

export class OrderApiError extends Error {
  public status: number;
  public fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'OrderApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * রিকোয়েস্ট হেডার ও অথেনটিকেশন টোকেন সংগ্রহ
 */
function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('lacs_access_token') || localStorage.getItem('auth_token')
      : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * এপিআই রেসপন্স এরর হ্যান্ডলিং ও Pydantic v2 ভ্যালিডেশন এরর পার্সিং
 */
async function handleResponseError(res: Response): Promise<never> {
  const status = res.status;
  let message = 'An unexpected error occurred while processing the order.';
  const fieldErrors: Record<string, string> = {};

  try {
    const errorData = await res.json();

    if (status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
      const validationResponse = errorData as PydanticValidationErrorResponse;
      message = 'Please check the input fields below.';
      for (const err of validationResponse.detail) {
        const fieldName = String(err.loc[err.loc.length - 1]);
        fieldErrors[fieldName] = err.msg;
      }
    } else if (errorData.detail && typeof errorData.detail === 'string') {
      message = errorData.detail;
    }
  } catch {
    message = `Server responded with status ${status}.`;
  }

  throw new OrderApiError(message, status, fieldErrors);
}

/**
 * পেজিনেটেড ও ফিল্টারকৃত অর্ডার তালিকা সংগ্রহ (List Orders)
 */
export async function getOrders(params?: OrderFilterParams): Promise<OrderListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.page_size) queryParams.append('page_size', String(params.page_size));
  if (params?.search) queryParams.append('search', params.search.trim());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.company) queryParams.append('company', params.company);
  if (params?.buyer) queryParams.append('buyer', params.buyer);

  const url = `${API_BASE}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  return res.json();
}

/**
 * নির্দিষ্ট অর্ডারের বিস্তারিত তথ্য সংগ্রহ (Get Single Order)
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  return res.json();
}

/**
 * নতুন বায়ার অর্ডার তৈরি (Create Order)
 */
export async function createOrder(payload: OrderCreatePayload): Promise<Order> {
  const res = await fetch(`${API_BASE}/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  return res.json();
}

/**
 * বিদ্যমান অর্ডার সংশোধন (Update Order)
 */
export async function updateOrder(
  orderId: string,
  payload: OrderUpdatePayload
): Promise<Order> {
  const res = await fetch(`${API_BASE}/${orderId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  return res.json();
}

/**
 * অর্ডারের স্ট্যাটাস পরিবর্তন (Update Status Transition)
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  notes?: string
): Promise<Order> {
  const res = await fetch(`${API_BASE}/${orderId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes }),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  return res.json();
}

/**
 * অর্ডার সফট-ডিলিট (Soft Delete Order)
 */
export async function deleteOrder(
  orderId: string
): Promise<{ success: boolean; message: string; order_id: string }> {
  const res = await fetch(`${API_BASE}/${orderId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }

  return res.json();
}
