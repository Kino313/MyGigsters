const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  worker: {
    summary: () => request('/worker/summary'),
    activities: (params: Record<string, string>) => {
      const q = new URLSearchParams(params).toString()
      return request(`/worker/activities${q ? `?${q}` : ''}`)
    },
    uploadActivity: (rows: any[]) =>
      request('/worker/upload-activity', {
        method: 'POST',
        body: JSON.stringify(rows),
      }),
    benefits: () => request('/worker/benefits'),
    claim: (id: string) => request(`/worker/benefits/${id}/claim`, { method: 'POST' }),
  },
    admin: {
    rules: () => request('/admin/rules'),
    createRule: (payload: any) =>
      request('/admin/rules', { method: 'POST', body: JSON.stringify(payload) }),
    toggleRuleStatus: (id: string, next?: boolean) =>
      request(`/admin/rules/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(next == null ? {} : { status: next }),
      }),
    recompute: () => request('/admin/recompute', { method: 'POST' }),
    preview: (id: string) => request(`/admin/rules/${id}/preview`, { method: 'POST' }),
    users: (q: string) => request(`/admin/users?q=${encodeURIComponent(q)}`),
    logs: (params: Record<string, string>) => {
      const q = new URLSearchParams(params).toString()
      return request(`/admin/logs${q ? `?${q}` : ''}`)
    },
  },
}