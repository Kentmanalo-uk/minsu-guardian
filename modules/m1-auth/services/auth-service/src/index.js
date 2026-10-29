// Module 1 — Auth & User Management. Owns the `users` collection and is the
// single place every other module asks "who is this token, and what role do they have?"
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { FieldValue } from 'firebase-admin/firestore'
import { db, adminAuth, fromDoc } from './lib/firebase.js'
import { HttpError, requireFields, errorHandler } from './lib/http.js'

const users = db.collection('users')
const ROLES = ['admin', 'officer', 'staff']

async function loadUser(token) {
  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(token)
  } catch {
    throw new HttpError(401, 'Invalid or expired token')
  }

  const snap = await users.doc(decoded.uid).get()
  if (!snap.exists) throw new HttpError(403, 'No user profile found for this account')
  const profile = snap.data()
  if (profile.archived === true) throw new HttpError(403, 'This account has been disabled')

  return { uid: decoded.uid, email: decoded.email, fullName: profile.fullName || '', role: profile.role || 'officer' }
}

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, '')
  if (!token) return next(new HttpError(401, 'Missing authorization token'))
  try {
    req.user = await loadUser(token)
    next()
  } catch (err) {
    next(err)
  }
}

const requireAdmin = (req, res, next) =>
  req.user.role === 'admin' ? next() : next(new HttpError(403, 'Admin access required'))

// Creating accounts server-side means an admin adding a user stays signed in as themselves
async function createAccount({ fullName, email, password, role }) {
  if (!ROLES.includes(role)) throw new HttpError(400, `Role must be one of: ${ROLES.join(', ')}`)
  if (String(password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters long')

  let record
  try {
    record = await adminAuth.createUser({ email, password, displayName: fullName })
  } catch (err) {
    if (err.code === 'auth/email-already-exists') throw new HttpError(409, 'This email is already registered')
    if (err.code === 'auth/invalid-email') throw new HttpError(400, 'Invalid email address format')
    if (err.code === 'auth/invalid-password') throw new HttpError(400, 'Password must be at least 6 characters long')
    throw err
  }

  await users.doc(record.uid).set({
    fullName,
    email,
    role,
    archived: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return { id: record.uid, fullName, email, role, archived: false }
}

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ service: 'auth-service', status: 'ok' }))

// Used by the other modules to check a forwarded token, and by the frontend after login
app.get('/auth/verify', authenticate, (req, res) => res.json(req.user))
app.get('/auth/me', authenticate, (req, res) => res.json(req.user))

// Public self-registration (always gets the officer role)
app.post('/auth/register', async (req, res) => {
  requireFields(req.body, ['fullName', 'email', 'password'])
  const { fullName, email, password } = req.body
  res.status(201).json(await createAccount({ fullName, email, password, role: 'officer' }))
})

app.use('/users', authenticate, requireAdmin)

app.get('/users', async (req, res) => {
  const archived = req.query.archived === 'true'
  const snapshot = await users.get()
  res.json(snapshot.docs.map(fromDoc).filter(u => (u.archived === true) === archived))
})

app.post('/users', async (req, res) => {
  requireFields(req.body, ['fullName', 'email', 'password', 'role'])
  res.status(201).json(await createAccount(req.body))
})

app.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body
  if (!ROLES.includes(role)) throw new HttpError(400, `Role must be one of: ${ROLES.join(', ')}`)
  const ref = users.doc(req.params.id)
  if (!(await ref.get()).exists) throw new HttpError(404, 'User not found')

  await ref.update({ role, updatedAt: FieldValue.serverTimestamp() })
  res.json(fromDoc(await ref.get()))
})

app.patch('/users/:id/archive', async (req, res) => {
  const archived = req.body.archived === true
  if (archived && req.params.id === req.user.uid) throw new HttpError(400, 'You cannot archive your own account')
  const ref = users.doc(req.params.id)
  if (!(await ref.get()).exists) throw new HttpError(404, 'User not found')

  await ref.update({
    archived,
    archivedAt: archived ? FieldValue.serverTimestamp() : null,
    updatedAt: FieldValue.serverTimestamp(),
  })
  res.json(fromDoc(await ref.get()))
})

app.use(errorHandler)

const PORT = process.env.PORT || 4001
app.listen(PORT, () => console.log(`auth-service listening on :${PORT}`))
