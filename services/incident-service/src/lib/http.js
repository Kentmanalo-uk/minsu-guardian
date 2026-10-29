// HTTP helpers shared by every service (copied per service so each one deploys on its own)

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Call another module's API, forwarding the caller's Firebase ID token
export async function callService(baseUrl, path, { method = 'GET', body, token } = {}) {
  let res
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new HttpError(503, `Service unavailable: ${baseUrl}`)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new HttpError(res.status, data.error || `Request failed (${res.status})`)
  return data
}

export function requireFields(body, fields) {
  const missing = fields.filter(f => !body?.[f] || String(body[f]).trim() === '')
  if (missing.length) throw new HttpError(400, `Missing required fields: ${missing.join(', ')}`)
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: err.status ? err.message : 'Internal server error' })
}
