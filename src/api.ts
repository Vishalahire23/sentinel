import type { Monitor, Alert, Policy, SessionUser, DashboardStats, SystemLog } from './types.ts';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) => 
    request<{ user: SessionUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, name: string) => 
    request<{ user: SessionUser }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  logout: () => 
    request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => 
    request<{ user: SessionUser | null }>('/auth/me'),

  // Stats & Monitors
  getStats: () => request<DashboardStats>('/stats'),
  getMonitors: () => request<Monitor[]>('/monitors'),
  addMonitor: (data: Partial<Monitor>) => 
    request<Monitor>('/monitors', { method: 'POST', body: JSON.stringify(data) }),
  updateMonitor: (id: string, updates: Partial<Monitor>) => 
    request<Monitor>(`/monitors/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteMonitor: (id: string) => 
    request<{ ok: boolean }>(`/monitors/${id}`, { method: 'DELETE' }),

  // Alerts
  getAlerts: () => request<Alert[]>('/alerts'),
  markAlertRead: (id: string) => 
    request<Alert>(`/alerts/${id}/read`, { method: 'PATCH' }),
  dismissAlert: (id: string) => 
    request<{ ok: boolean }>(`/alerts/${id}`, { method: 'DELETE' }),

  // Policies
  getPolicies: () => request<Policy[]>('/policies'),
  addPolicy: (data: Partial<Policy>) => 
    request<Policy>('/policies', { method: 'POST', body: JSON.stringify(data) }),
  togglePolicy: (id: string) => 
    request<Policy>(`/policies/${id}/toggle`, { method: 'PATCH' }),

  // Admin & Automation
  getAdminUsers: () => request<SessionUser[]>('/admin/users'),
  getAdminLogs: () => request<SystemLog[]>('/admin/logs'),
  repriceMonitor: (id: string, newPrice: number, reason?: string) => 
    request<Monitor>(`/monitors/${id}/reprice`, { method: 'POST', body: JSON.stringify({ newPrice, reason }) }),
  getCrawlerStatus: () => 
    request<{ active: boolean; intervalSeconds: number; webhookConfigured: string }>('/crawler/status'),
  toggleCrawler: () => 
    request<{ active: boolean }>('/crawler/toggle', { method: 'POST' }),

  // Roadmap Phase 1 & 3: Telemetry Stream & Scraper
  simulatePriceShift: (monitorId?: string) => 
    request<{ monitor: Monitor; alert?: Alert }>('/telemetry/simulate', { method: 'POST', body: JSON.stringify({ monitorId }) }),
  simulateFestiveCrash: (festiveName?: string) => 
    request<{ affectedCount: number; alertsCreated: number; details: string }>('/simulator/festive', { method: 'POST', body: JSON.stringify({ festiveName }) }),
  dispatchWhatsAppAlert: (alertId: string, recipient?: string) => 
    request<{ success: boolean; deliveredTo: string; messageSid: string; preview: string }>(`/alerts/${alertId}/whatsapp`, { method: 'POST', body: JSON.stringify({ recipient }) }),
  scrapeAndAdd: (url: string, category?: string) => 
    request<Monitor>('/monitors/scrape', { method: 'POST', body: JSON.stringify({ url, category }) })
};

export function subscribeToTelemetry(onMessage: (event: { type: string; data?: unknown; timestamp?: string }) => void): () => void {
  const es = new EventSource('/api/stream/events');
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);
    } catch (err) {
      console.warn('Failed to parse SSE event', err);
    }
  };
  return () => es.close();
}
