import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

import { firebaseConfig, requireEnv } from './firebase-config.js'

requireEnv('VITE_FIREBASE_API_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD')

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function fixAdminRole() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  try {
    console.log('Logging in as admin...')
    
    // Login first
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
    console.log('✓ Logged in successfully')
    console.log('User UID:', userCredential.user.uid)

    // Now create/update the Firestore document with admin role
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      fullName: 'MinSU Administrator',
      email: adminEmail,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✓ Admin role set in Firestore')

    console.log('\n========================================')
    console.log('✅ ADMIN ROLE FIXED!')
    console.log('========================================')
    console.log('\nYou can now login with:')
    console.log(`Email:    ${adminEmail}`)
    console.log('Password: (ADMIN_PASSWORD in your .env)')
    console.log('\nThe account now has ADMIN privileges!')
    console.log('========================================\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.code)
    console.error('Message:', error.message)
    process.exit(1)
  }
}

fixAdminRole()
