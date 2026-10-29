import { auth } from './firebase'

// Each module is deployed separately; point these at the deployed URLs in .env
const SERVICES = {
  auth: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:4001',
  student: import.meta.env.VITE_STUDENT_API_URL || 'http://localhost:4002',
  incident: import.meta.env.VITE_INCIDENT_API_URL || 'http://localhost:4003',
  case: import.meta.env.VITE_CASE_API_URL || 'http://localhost:4004',
  report: import.meta.env.VITE_REPORT_API_URL || 'http://localhost:4005',
  analytics: import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:4006',
}

async function request(service, path, { method = 'GET', body, raw = false } = {}) {
  const token = await auth.currentUser?.getIdToken()
  let res
  try {
    res = await fetch(`${SERVICES[service]}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw Object.assign(new Error(`Cannot reach the ${service} service. Is it running?`), { status: 0 })
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status })
  }
  if (raw) return res
  return res.status === 204 ? null : res.json()
}

const json = (method, body) => ({ method, body })

// Module 1 — Auth & User Management
export const authApi = {
  me: () => request('auth', '/auth/me'),
  register: (data) => request('auth', '/auth/register', json('POST', data)),
}

export const userApi = {
  list: (archived = false) => request('auth', `/users?archived=${archived}`),
  create: (data) => request('auth', '/users', json('POST', data)),
  updateRole: (id, role) => request('auth', `/users/${id}/role`, json('PATCH', { role })),
  setArchived: (id, archived) => request('auth', `/users/${id}/archive`, json('PATCH', { archived })),
}

// Module 2 — Incident Reporting (student records)
export const studentApi = {
  list: () => request('student', '/students'),
  create: (data) => request('student', '/students', json('POST', data)),
  update: (id, data) => request('student', `/students/${encodeURIComponent(id)}`, json('PUT', data)),
  remove: (id) => request('student', `/students/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

// Module 2 — Incident Reporting
export const incidentApi = {
  students: () => request('incident', '/incidents/students'),
  report: (data) => request('incident', '/incidents', json('POST', data)),
}

// Module 3 — Case Management
export const caseApi = {
  list: () => request('case', '/cases'),
  updateStatus: (id, status) => request('case', `/cases/${id}/status`, json('PATCH', { status })),
  mergeDuplicates: () => request('case', '/cases/merge-duplicates', { method: 'POST' }),
  goodMoral: (studentId) => request('case', `/cases/good-moral/${encodeURIComponent(studentId)}`),
}

// Module 4 — Dashboard & Analytics
export const analyticsApi = {
  dashboard: () => request('analytics', '/dashboard'),
}

// Module 5 — Reports & Records
export const reportApi = {
  analytics: () => request('report', '/reports/analytics'),
  exportCsv: async () => (await request('report', '/reports/export.csv', { raw: true })).blob(),
}
