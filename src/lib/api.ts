import type { Company, Assessment, AutoFlag, ReportSummary, ReportDetail } from '@/types';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2030/api/v1';

let isRedirecting = false;

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
    if (typeof window !== 'undefined' && !isRedirecting && !window.location.pathname.startsWith('/login')) {
      isRedirecting = true;
      // Clear stale session and redirect to login
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false }).catch(() => {});
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
    delete: (companyId: string, docId: string) =>
      fetchApi<void>(`/companies/${companyId}/documents/${docId}`, { method: 'DELETE' }),
    getDownloadUrl: (companyId: string, docId: string) =>
      fetchApi<{ download_url: string }>(
        `/companies/${companyId}/documents/${docId}/download-url`
      ),
  },
  chat: {
    createConversation: (companyId: string, title?: string) =>
      fetchApi<any>(`/companies/${companyId}/chat/conversations`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    listConversations: (companyId: string) =>
      fetchApi<any[]>(`/companies/${companyId}/chat/conversations`),
    getMessages: (companyId: string, conversationId: string) =>
      fetchApi<any[]>(
        `/companies/${companyId}/chat/conversations/${conversationId}/messages`
      ),
    // sendMessage is handled directly with fetch+SSE in the chat panel, not via fetchApi
  },
  research: {
    get: (companyId: string) =>
      fetchApi<any>(`/companies/${companyId}/research`),
    trigger: (companyId: string) =>
      fetchApi<any>(`/companies/${companyId}/research/trigger`, { method: 'POST' }),
  },
  settings: {
    getKeyStatus: () =>
      fetchApi<{
        ai_provider: string;
        groq_configured: boolean;
        groq_key_hint: string | null;
      }>('/settings/api-keys'),
    updateApiKeys: (provider: string, apiKey: string) =>
      fetchApi<any>('/settings/api-keys', {
        method: 'PUT',
        body: JSON.stringify({ provider, api_key: apiKey }),
      }),
  },
  autoIntake: {
    trigger: (companyId: string) =>
      fetchApi<any>(`/companies/${companyId}/auto-intake/process`, { method: 'POST' }),
  },
  reports: {
    list: (companyId: string) =>
      fetchApi<ReportSummary[]>(`/companies/${companyId}/reports`),
    get: (companyId: string, reportId: string) =>
      fetchApi<ReportDetail>(`/companies/${companyId}/reports/${reportId}`),
    generate: (companyId: string, data: { module_number: number; assessment_id: string; tier?: string }) =>
      fetchApi<{ status: string; module_number: number }>(`/companies/${companyId}/reports/generate`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    exportPdfUrl: (companyId: string, reportId: string, language: string = 'en') =>
      `${API_URL}/companies/${companyId}/reports/${reportId}/export/pdf?language=${language}`,
  },
  diagnostics: {
    create: (data: { company: { legal_name: string; primary_industry?: string; country?: string; contact_person?: string; contact_phone?: string }; answers?: Record<string, string | string[]>; other_answers?: Record<string, string> }) =>
      fetchApi<any>('/diagnostics', { method: 'POST', body: JSON.stringify(data) }),
    list: () => fetchApi<any[]>('/diagnostics'),
    get: (id: string) => fetchApi<any>(`/diagnostics/${id}`),
    saveDraft: (id: string, data: { answers: Record<string, string | string[]>; other_answers?: Record<string, string> }) =>
      fetchApi<any>(`/diagnostics/${id}/draft`, { method: 'PUT', body: JSON.stringify(data) }),
    submit: (id: string) =>
      fetchApi<any>(`/diagnostics/${id}/submit`, { method: 'POST' }),
    generateReport: (id: string) =>
      fetchApi<any>(`/diagnostics/${id}/generate-report`, { method: 'POST' }),
    rerun: (id: string) =>
      fetchApi<any>(`/diagnostics/${id}/rerun`, { method: 'POST' }),
    getReport: (id: string) =>
      fetchApi<any>(`/diagnostics/${id}/report`),
  },
  assessments: {
    trigger: (companyId: string, stage: string) =>
      fetchApi<Assessment>(`/companies/${companyId}/assessments`, { method: 'POST', body: JSON.stringify({ stage }) }),
    list: (companyId: string) =>
      fetchApi<Assessment[]>(`/companies/${companyId}/assessments`),
    get: (companyId: string, assessmentId: string) =>
      fetchApi<Assessment>(`/companies/${companyId}/assessments/${assessmentId}`),
    getFlags: (companyId: string, assessmentId: string) =>
      fetchApi<AutoFlag[]>(`/companies/${companyId}/assessments/${assessmentId}/flags`),
  },
};
