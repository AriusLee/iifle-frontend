import type { Company } from '@/types';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2030/api/v1';

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await getSession() as any;
  const token = session?.accessToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      fetchApi<{ access_token: string; token_type: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
      fetchApi<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => fetchApi<any>('/auth/me'),
  },
  companies: {
    list: () => fetchApi<Company[]>('/companies'),
    get: (id: string) => fetchApi<Company>(`/companies/${id}`),
    create: (data: any) =>
      fetchApi<Company>('/companies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      fetchApi<Company>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  intake: {
    getStage: (companyId: string, stage: string) =>
      fetchApi<any>(`/companies/${companyId}/intake/${stage}`),
    getAllStages: (companyId: string) => fetchApi<any[]>(`/companies/${companyId}/intake`),
    saveDraft: (companyId: string, stage: string, data: any) =>
      fetchApi<any>(`/companies/${companyId}/intake/${stage}/draft`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    submitStage: (companyId: string, stage: string, data: any) =>
      fetchApi<any>(`/companies/${companyId}/intake/${stage}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  documents: {
    getUploadUrl: (companyId: string, data: { filename: string; category: string }) =>
      fetchApi<{ upload_url: string; s3_key: string }>(
        `/companies/${companyId}/documents/upload-url`,
        { method: 'POST', body: JSON.stringify(data) }
      ),
    createRecord: (companyId: string, data: any) =>
      fetchApi<any>(`/companies/${companyId}/documents`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (companyId: string) => fetchApi<any[]>(`/companies/${companyId}/documents`),
    getDownloadUrl: (companyId: string, docId: string) =>
      fetchApi<{ download_url: string }>(
        `/companies/${companyId}/documents/${docId}/download-url`
      ),
  },
};
