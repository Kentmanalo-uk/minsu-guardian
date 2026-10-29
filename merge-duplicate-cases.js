// Script to merge duplicate cases for the same student into one case
// Run this once to clean up existing data: node merge-duplicate-cases.js

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function mergeDuplicateCases() {
  try {
    console.log('🔍 Fetching all cases...')
    const q = query(collection(db, 'disciplinary_cases'), orderBy('created_at', 'asc'))
    const querySnapshot = await getDocs(q)
    const cases = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    console.log(`📊 Found ${cases.length} total cases`)
    
    // Group cases by student_id
    const studentCases = {}
    cases.forEach(case_ => {
      if (!studentCases[case_.student_id]) {
        studentCases[case_.student_id] = []
      }
      studentCases[case_.student_id].push(case_)
    })
    
    console.log(`👥 Found ${Object.keys(studentCases).length} unique students`)
    
    // Process each student's cases
    for (const [studentId, studentCaseList] of Object.entries(studentCases)) {
      if (studentCaseList.length > 1) {
        console.log(`\n🔄 Merging ${studentCaseList.length} cases for student: ${studentCaseList[0].student_name} (${studentId})`)
        
        // Sort by creation date (oldest first)
        studentCaseList.sort((a, b) => {
          const dateA = a.created_at?.toDate?.() || new Date(0)
          const dateB = b.created_at?.toDate?.() || new Date(0)
          return dateA - dateB
        })
        
        // Keep the first (oldest) case as the main case
        const mainCase = studentCaseList[0]
        const duplicateCases = studentCaseList.slice(1)
        
        // Build offense history from all cases
        const offenseHistory = studentCaseList.map((case_, index) => ({
          offense_level: case_.violation_type || `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Offense`,
          description: case_.description,
          date_of_incident: case_.date_of_incident,
          location: case_.location,
          reported_by: case_.reported_by,
          reported_at: case_.created_at?.toDate?.() || new Date()
        }))
        
        // Get the latest case info
        const latestCase = studentCaseList[studentCaseList.length - 1]
        const offenseCount = studentCaseList.length
        
        // Update main case with merged data
        await updateDoc(doc(db, 'disciplinary_cases', mainCase.id), {
          violation_type: latestCase.violation_type || `${offenseCount}${offenseCount === 1 ? 'st' : offenseCount === 2 ? 'nd' : offenseCount === 3 ? 'rd' : 'th'} Offense`,
          description: latestCase.description,
          date_of_incident: latestCase.date_of_incident,
          location: latestCase.location,
          reported_by: latestCase.reported_by,
          offense_history: offenseHistory,
          offense_count: offenseCount,
          status: latestCase.status,
          updated_at: new Date()
        })
        
        console.log(`  ✅ Updated main case: ${mainCase.case_number}`)
        console.log(`  📋 Added ${offenseHistory.length} offenses to history`)
        
        // Delete duplicate cases
        for (const duplicateCase of duplicateCases) {
          await deleteDoc(doc(db, 'disciplinary_cases', duplicateCase.id))
          console.log(`  🗑️  Deleted duplicate case: ${duplicateCase.case_number}`)
        }
        
        console.log(`  ✨ Merged ${studentCaseList.length} cases into 1 for ${mainCase.student_name}`)
      }
    }
    
    console.log('\n✅ Case merge completed successfully!')
    console.log('🎯 Each student now has only one case with full offense history')
    
  } catch (error) {
    console.error('❌ Error merging cases:', error)
  }
}

mergeDuplicateCases()
