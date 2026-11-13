/**
 * ডেনিম লেজার অটোমেশন ও কন্ট্রোল সিস্টেম (Denim LACS)
 * মাস্টার ডাটা এপিআই ক্লায়েন্ট সার্ভিস (Master Data API Client)
 * 
 * Company, Buyer, Brand এবং Season CRUD পরিচালনা করে।
 * রুল ২৩ (Server-Side Validation) ও রুল ০৪ (<300 Lines) মেনে প্রস্তুতকৃত।
 */

import {
  Company,
  Buyer,
  Brand,
  Season,
  MasterListResponse,
  MasterFilterParams,
} from '@/types/masterData';

const BASE_URL = '/api/v1/master';

export class MasterApiError extends Error {
  public status: number;
  public fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'MasterApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('lacs_access_token') || localStorage.getItem('auth_token')
      : null;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
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
      // JSON না থাকলে ডিফল্ট
    }
    throw new MasterApiError(errorDetail, res.status, fieldErrors);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

function buildQuery(params: MasterFilterParams, extra?: Record<string, string>): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', params.page.toString());
  if (params.page_size) sp.set('page_size', params.page_size.toString());
  if (params.search) sp.set('search', params.search);
  if (params.active_only) sp.set('active_only', 'true');
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

// ==================== Companies ====================
export const getCompanies = (p: MasterFilterParams = {}) =>
  fetch(`${BASE_URL}/companies${buildQuery(p)}`, { headers: getAuthHeaders() }).then(handleResponse<MasterListResponse<Company>>);

export const createCompany = (payload: Partial<Company>) =>
  fetch(`${BASE_URL}/companies`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) }).then(handleResponse<Company>);

export const updateCompany = (id: string, payload: Partial<Company>) =>
  fetch(`${BASE_URL}/companies/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) }).then(handleResponse<Company>);

export const deleteCompany = (id: string) =>
  fetch(`${BASE_URL}/companies/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse<void>);

// ==================== Buyers ====================
export const getBuyers = (p: MasterFilterParams = {}) =>
  fetch(`${BASE_URL}/buyers${buildQuery(p)}`, { headers: getAuthHeaders() }).then(handleResponse<MasterListResponse<Buyer>>);

export const createBuyer = (payload: Partial<Buyer>) =>
  fetch(`${BASE_URL}/buyers`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) }).then(handleResponse<Buyer>);

export const updateBuyer = (id: string, payload: Partial<Buyer>) =>
  fetch(`${BASE_URL}/buyers/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) }).then(handleResponse<Buyer>);

export const deleteBuyer = (id: string) =>
  fetch(`${BASE_URL}/buyers/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse<void>);

// ==================== Brands ====================
export const getBrands = (p: MasterFilterParams = {}, buyerId?: string) =>
  fetch(`${BASE_URL}/brands${buildQuery(p, buyerId ? { buyer_id: buyerId } : undefined)}`, { headers: getAuthHeaders() }).then(handleResponse<MasterListResponse<Brand>>);

export const createBrand = (payload: Partial<Brand>) =>
  fetch(`${BASE_URL}/brands`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) }).then(handleResponse<Brand>);

export const updateBrand = (id: string, payload: Partial<Brand>) =>
  fetch(`${BASE_URL}/brands/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) }).then(handleResponse<Brand>);

export const deleteBrand = (id: string) =>
  fetch(`${BASE_URL}/brands/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse<void>);

// ==================== Seasons ====================
export const getSeasons = (p: MasterFilterParams = {}) =>
  fetch(`${BASE_URL}/seasons${buildQuery(p)}`, { headers: getAuthHeaders() }).then(handleResponse<MasterListResponse<Season>>);

export const createSeason = (payload: Partial<Season>) =>
  fetch(`${BASE_URL}/seasons`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) }).then(handleResponse<Season>);

export const updateSeason = (id: string, payload: Partial<Season>) =>
  fetch(`${BASE_URL}/seasons/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) }).then(handleResponse<Season>);

export const deleteSeason = (id: string) =>
  fetch(`${BASE_URL}/seasons/${id}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleResponse<void>);

