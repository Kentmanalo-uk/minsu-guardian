import { callService, HttpError } from './http.js'

// Tokens are checked by the Auth service; cache results briefly so every request
// doesn't cost an extra round trip.
const CACHE_MS = 60_000
const cache = new Map()

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, '')
  if (!token) return next(new HttpError(401, 'Missing authorization token'))

  try {
    const hit = cache.get(token)
    if (hit && hit.expires > Date.now()) {
      req.user = hit.user
    } else {
      req.user = await callService(process.env.AUTH_SERVICE_URL, '/auth/verify', { token })
      if (cache.size > 1000) {
        for (const [key, value] of cache) if (value.expires <= Date.now()) cache.delete(key)
      }
      cache.set(token, { user: req.user, expires: Date.now() + CACHE_MS })
    }
    req.token = token
    next()
  } catch (err) {
    next(err)
  }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : next(new HttpError(403, 'Insufficient permissions'))
