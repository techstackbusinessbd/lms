/**
 * অথেনটিকেশন এপিআই ক্লায়েন্ট সার্ভিস (Authentication API Client Service)
 * Denim Laser Automation & Control System (Denim LACS)
 *
 * ব্যাকএন্ডের /api/v1/auth এন্ডপয়েন্টগুলোর সাথে টাইপ-সেফ যোগাযোগ পরিচালনা করে।
 * রুল ২৩ মেনে Pydantic v2 সার্ভার-সাইড এরর পার্সিং সমর্থন করে।
 */

import {
  LoginCredentials,
  PydanticValidationErrorResponse,
  QuickPinCredentials,
  TokenResponse,
  UserSummary,
} from '@/types/auth';

const API_BASE = '/api/v1/auth';

export class AuthApiError extends Error {
  public status: number;
  public fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * এপিআই রেসপন্স এরর হ্যান্ডলিং ও Pydantic v2 ভ্যালিডেশন এরর পার্সিং
 */
async function handleResponseError(res: Response): Promise<never> {
  const status = res.status;
  let message = 'An unexpected authentication error occurred.';
  const fieldErrors: Record<string, string> = {};

  try {
    const errorData = await res.json();

    if (status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
      // Pydantic v2 ভ্যালিডেশন এরর পার্স করা
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

  throw new AuthApiError(message, status, fieldErrors);
}

/**
 * পাসওয়ার্ড ভিত্তিক অফিস লগইন (Merchandiser, Designer, Admin)
 */
export async function loginWithPassword(credentials: LoginCredentials): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    return handleResponseError(response);
  }

  return response.json();
}

/**
 * শপ-ফ্লোর ৪-৬ ডিজিট Quick-PIN ভিত্তিক অপারেটর লগইন
 */
export async function loginWithQuickPin(credentials: QuickPinCredentials): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE}/quick-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    return handleResponseError(response);
  }

  return response.json();
}

/**
 * বিয়ারার টোকেনের মাধ্যমে বর্তমান ইউজারের প্রোফাইল ফেচ
 */
export async function fetchCurrentUser(token: string): Promise<UserSummary> {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return handleResponseError(response);
  }

  return response.json();
}

