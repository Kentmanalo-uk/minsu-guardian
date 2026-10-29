import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

import { firebaseConfig, requireEnv } from './firebase-config.js'

requireEnv('VITE_FIREBASE_API_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD')

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createAdminUser() {
  // Try different admin credentials
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = 'MinSU Administrator'

  try {
    console.log('Creating new admin user...')
    console.log('Email:', adminEmail)
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
    console.log('✓ Admin user created in Firebase Auth')
    console.log('User UID:', userCredential.user.uid)

    // Add user data to Firestore with admin role
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      fullName: adminName,
      email: adminEmail,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✓ Admin user data saved to Firestore')

    console.log('\n========================================')
    console.log('✅ NEW ADMIN ACCOUNT CREATED!')
    console.log('========================================')
    console.log('\n📧 Admin Credentials:')
    console.log('------------------')
    console.log(`Email:    ${adminEmail}`)
    console.log('Password: (ADMIN_PASSWORD in your .env)')
    console.log('\n⚠️  SAVE THESE CREDENTIALS!')
    console.log('========================================\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error:', error.code)
    console.error('Message:', error.message)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n✅ This email is already registered!')
      console.log('\nYou can login with:')
      console.log(`Email:    ${adminEmail}`)
      console.log('Password: (ADMIN_PASSWORD in your .env)')
    }
    
    process.exit(1)
  }
}

createAdminUser()
