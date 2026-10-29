import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

import { firebaseConfig, requireEnv } from './firebase-config.js'

requireEnv('VITE_FIREBASE_API_KEY', 'ADMIN_EMAIL', 'ADMIN_PASSWORD')

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = 'System Administrator'

  try {
    console.log('Creating admin user...')
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
    console.log('✓ Admin user created in Firebase Auth')

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
    console.log('✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!')
    console.log('========================================')
    console.log('\nAdmin Credentials:')
    console.log('------------------')
    console.log(`Email:    ${adminEmail}`)
    console.log('Password: (ADMIN_PASSWORD in your .env)')
    console.log('\n⚠️  IMPORTANT: Save these credentials!')
    console.log('========================================\n')

    process.exit(0)
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n⚠️  Admin user already exists!')
      console.log('\nTry logging in with:')
      console.log('---------------------------')
      console.log(`Email:    ${adminEmail}`)
      console.log('Password: (ADMIN_PASSWORD in your .env)')
      console.log('\nIf you forgot the password, use the "Forgot Password" option.')
      console.log('========================================\n')
    } else {
      console.error('❌ Error creating admin user:', error.message)
    }
    process.exit(1)
  }
}

createAdminUser()
