// Firebase web config for the admin/seed scripts, read from .env (same values as the React app)
try { process.loadEnvFile('.env') } catch { /* .env is optional when variables are already set */ }

export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

export function requireEnv(...names) {
  const missing = names.filter(n => !process.env[n])
  if (missing.length) {
    console.error(`Missing in .env: ${missing.join(', ')}`)
    process.exit(1)
  }
}
