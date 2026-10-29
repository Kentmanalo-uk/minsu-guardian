import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Service account from env vars; falls back to GOOGLE_APPLICATION_CREDENTIALS / Google Cloud default credentials
const credential = process.env.FIREBASE_PRIVATE_KEY
  ? cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  : applicationDefault()

initializeApp({ credential, projectId: process.env.FIREBASE_PROJECT_ID })

export const db = getFirestore()
export const adminAuth = getAuth()

// Firestore Timestamps -> ISO strings so API responses are plain JSON
export function serialize(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(serialize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]))
  }
  return value
}

export const fromDoc = (doc) => ({ id: doc.id, ...serialize(doc.data()) })
