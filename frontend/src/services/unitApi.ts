/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * গার্মেন্ট ইউনিট ও থার্মাল প্রিন্টিং এপিআই ক্লায়েন্ট (Garment Unit API Client)
 * 
 * ব্যাকএন্ডের /api/v1/units এন্ডপয়েন্টগুলোর সাথে টাইপ-সেফ যোগাযোগ পরিচালনা করে।
 * রুল ২৩ (Server-Side Validation), রুল ০৪ (<300 Lines) এবং রুল ১১ (Bangla Comments) মেনে প্রস্তুতকৃত।
 */

import {
  GarmentUnit,
  GarmentUnitBatchGenerateRequest,
  GarmentUnitFilterParams,
  GarmentUnitListResponse,
  BatchGenerateResponse,
  BatchZplResponse,
} from '@/types/unit';

const API_BASE = '/api/v1/units';

export class UnitApiError extends Error {
  public status: number;
  public fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'UnitApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

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

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    const fieldErrors: Record<string, string> = {};
    try {
      const data = await res.json();
      if (data.detail) {
        if (typeof data.detail === 'string') {
          errorDetail = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorDetail = data.detail.map((d: { msg?: string }) => d.msg || '').join(', ');
          data.detail.forEach((err: { loc?: string[]; msg?: string }) => {
            if (err.loc && err.loc.length > 1) {
              const fieldName = err.loc[err.loc.length - 1];
              fieldErrors[fieldName] = err.msg || 'Invalid field value';
            }
          });
        }
      }
    } catch {
      // JSON পার্সিং ব্যর্থ হলে ডিফল্ট মেসেজ
    }
    throw new UnitApiError(errorDetail, res.status, fieldErrors);
  }
  return res.json();
}

/**
 * অর্ডারের নির্দিষ্ট সাইজ অনুপাতে বাল্ক কিউআর ও প্যান্ট সিরিয়াল তৈরি করে
 */
export async function generateUnitsBatch(
  payload: GarmentUnitBatchGenerateRequest
): Promise<BatchGenerateResponse> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<BatchGenerateResponse>(res);
}

/**
 * অর্ডারের কিউআর কোড ও প্যান্টের লাইভ প্রগ্রেস তালিকা ফিল্টারসহ ফেচ করে
 */
export async function getOrderUnits(
  orderId: string,
  params: GarmentUnitFilterParams = {}
): Promise<GarmentUnitListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.page_size) searchParams.set('page_size', params.page_size.toString());
  if (params.size && params.size !== 'ALL') searchParams.set('size', params.size);
  if (params.stage && params.stage !== 'ALL') searchParams.set('stage', params.stage);
  if (params.search) searchParams.set('search', params.search);

  const qs = searchParams.toString();
  const url = `${API_BASE}/order/${orderId}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<GarmentUnitListResponse>(res);
}

/**
 * একক কিউআর কোড পিএনজি ইমেজের সরাসরি ইউআরএল তৈরি করে
 */
export function getUnitQrPngUrl(unitId: string): string {
  return `${API_BASE}/${unitId}/qr-png`;
}

/**
 * নির্বাচিত প্যান্টসমূহের জন্য থার্মাল ZPL প্রিন্ট স্পুল জেনারেট করে
 */
export async function generateBatchZpl(unitIds: string[]): Promise<BatchZplResponse> {
  const res = await fetch(`${API_BASE}/batch-zpl`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(unitIds),
  });
  return handleResponse<BatchZplResponse>(res);
}

/**
 * প্রিন্ট সম্পন্ন চিহ্নিতকরণ ও অডিট ট্রেইল আপডেট করে
 */
export async function markUnitsPrinted(
  unitIds: string[]
): Promise<{ updated_count: number }> {
  const res = await fetch(`${API_BASE}/mark-printed`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(unitIds),
  });
  return handleResponse<{ updated_count: number }>(res);
}

/**
 * ক্যামেরা স্ক্যানার তাৎক্ষণিক লুকআপ (Sub-10ms)
 */
export async function scanLookupUnit(query: string): Promise<GarmentUnit> {
  const res = await fetch(`${API_BASE}/scan-lookup/${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<GarmentUnit>(res);
}
