import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

import { firebaseConfig, requireEnv } from './firebase-config.js'

requireEnv('VITE_FIREBASE_API_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD')

console.log('Initializing Firebase...')
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

console.log('Firebase initialized successfully!')
console.log('Auth domain:', firebaseConfig.authDomain)

async function testLogin() {
  const testEmail = process.env.ADMIN_EMAIL
  const testPassword = process.env.ADMIN_PASSWORD

  try {
    console.log('\nAttempting to login with:')
    console.log('Email:', testEmail)
    console.log('Password: (ADMIN_PASSWORD in your .env)')
    
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword)
    console.log('\n✅ Login successful!')
    console.log('User ID:', userCredential.user.uid)
    console.log('Email:', userCredential.user.email)
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Login failed!')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n⚠️  The email or password is incorrect.')
      console.log('Please verify the credentials or create a new account.')
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n⚠️  No user found with this email.')
      console.log('Please run: node create-admin.js')
    }
    
    process.exit(1)
  }
}

testLogin()
