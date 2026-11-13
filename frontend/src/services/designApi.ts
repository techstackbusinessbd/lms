/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * লেজার ডিজাইন ভল্ট এপিআই ক্লায়েন্ট সার্ভিস (Laser Design Vault API Client)
 *
 * ব্যাকএন্ডের /api/v1/designs এন্ডপয়েন্টগুলোর সাথে টাইপ-সেফ যোগাযোগ পরিচালনা করে।
 * রুল ২৩ মেনে Pydantic v2 সার্ভার-সাইড এরর পার্সিং ও গ্রেসফুল সেশন হ্যান্ডলিং।
 * রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import {
  FileUploadPayload,
  LaserDesign,
  LaserDesignCreatePayload,
  LaserDesignFile,
  LaserDesignFilterParams,
  LaserDesignListResponse,
  RecipeLockPayload,
} from '@/types/design';
import { PydanticValidationErrorResponse } from '@/types/auth';

const API_BASE = '/api/v1/designs';

export class DesignApiError extends Error {
  public status: number;
  public fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'DesignApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function getAuthHeaders(isMultipart = false): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('lacs_access_token') || localStorage.getItem('auth_token')
      : null;
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponseError(res: Response): Promise<never> {
  const status = res.status;
  let message = 'An unexpected error occurred while processing the laser design.';
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

  if (status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lacs_access_token');
      localStorage.removeItem('lacs_user_profile');
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new CustomEvent('lacs_session_expired'));
    }
  }

  throw new DesignApiError(message, status, fieldErrors);
}

/**
 * নতুন লেজার ডিজাইন রেসিপি ড্রাফট তৈরি (Create Design Draft)
 */
export async function createDesign(payload: LaserDesignCreatePayload): Promise<LaserDesign> {
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
 * সকল লেজার ডিজাইন রেসিপির তালিকা অনুসন্ধান (পেজিনেশন ও ফিল্টার সহ)
 */
export async function getDesigns(
  params: LaserDesignFilterParams = {}
): Promise<LaserDesignListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.page_size) query.append('page_size', String(params.page_size));
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);

  const res = await fetch(`${API_BASE}/?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) await handleResponseError(res);
  return res.json();
}

/**
 * .jean5 বা .jean ফাইল আপলোড ও সাইজ ম্যাপিং (Multipart File Upload)
 */
export async function uploadDesignFile(
  designId: string,
  payload: FileUploadPayload
): Promise<LaserDesignFile> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('size_code', payload.size_code);
  formData.append('placement', payload.placement);
  if (payload.power_percentage !== undefined && payload.power_percentage !== null) {
    formData.append('power_percentage', String(payload.power_percentage));
  }
  if (payload.speed_percentage !== undefined && payload.speed_percentage !== null) {
    formData.append('speed_percentage', String(payload.speed_percentage));
  }
  if (payload.cycle_time_estimate_sec !== undefined && payload.cycle_time_estimate_sec !== null) {
    formData.append('cycle_time_estimate_sec', String(payload.cycle_time_estimate_sec));
  }

  const res = await fetch(`${API_BASE}/${designId}/upload-file`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });

  if (!res.ok) {
    await handleResponseError(res);
  }
  return res.json();
}

/**
 * নির্দিষ্ট লেজার ডিজাইনের বিস্তারিত বিবরণ সংগ্রহ
 */
export async function getDesignById(designId: string): Promise<LaserDesign> {
  const res = await fetch(`${API_BASE}/${designId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }
  return res.json();
}

/**
 * নির্দিষ্ট অর্ডারের সাথে লিংকড সমস্ত রেসিপি তালিকা সংগ্রহ
 */
export async function getDesignsByOrder(orderId: string): Promise<LaserDesign[]> {
  const res = await fetch(`${API_BASE}/order/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }
  return res.json();
}

/**
 * রেসিপি লক ও প্রোডাকশন সাইন-অফ (Recipe Lock Gate)
 */
export async function lockRecipe(
  designId: string,
  payload: RecipeLockPayload
): Promise<LaserDesign> {
  const res = await fetch(`${API_BASE}/${designId}/lock`, {
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
 * বিদ্যমান লকড রেসিপি ক্লোন করে নতুন রিভিশন (v2, v3...) প্রস্তুত করা
 */
export async function createNewVersion(designId: string): Promise<LaserDesign> {
  const res = await fetch(`${API_BASE}/${designId}/new-version`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    await handleResponseError(res);
  }
  return res.json();
}

/**
 * ভল্ট থেকে ফাইল কনটেন্ট ব্লব ইউআরএল (Blob URL) ফেচ করা (ইমেজ প্রিভিউ)
 */
export async function fetchDesignFileBlob(fileId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/files/${fileId}/content`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    await handleResponseError(res);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * ভল্ট থেকে ম্যাপ করা নির্দিষ্ট ফাইল মুছে ফেলা (শুধুমাত্র DRAFT রেসিপির জন্য)
 */
export async function deleteDesignFile(fileId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    await handleResponseError(res);
  }
}

