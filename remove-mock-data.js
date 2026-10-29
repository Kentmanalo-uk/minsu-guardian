import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'

import { firebaseConfig, requireEnv } from './firebase-config.js'

requireEnv('VITE_FIREBASE_API_KEY')

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Mock data case numbers to delete
const mockCaseNumbers = [
  'CASE-1704067200000',
  'CASE-1704153600000',
  'CASE-1704240000000',
  'CASE-1704326400000',
  'CASE-1704412800000'
]

// Mock student IDs to identify mock data
const mockStudentIds = [
  '2024-00001',
  '2024-00002',
  '2024-00003',
  '2024-00004',
  '2024-00005'
]

async function removeMockData() {
  console.log('\n🗑️  Starting to remove mock/seed data...\n')
  
  try {
    const casesRef = collection(db, 'disciplinary_cases')
    const querySnapshot = await getDocs(casesRef)
    
    let deletedCount = 0
    let keptCount = 0
    const deletedCases = []
    
    console.log(`📊 Found ${querySnapshot.size} total cases in database\n`)
    
    for (const docSnapshot of querySnapshot.docs) {
      const caseData = docSnapshot.data()
      const caseNumber = caseData.case_number
      const studentId = caseData.student_id
      
      // Check if this is mock data
      const isMockCase = mockCaseNumbers.includes(caseNumber)
      const isMockStudent = mockStudentIds.includes(studentId)
      
      if (isMockCase || isMockStudent) {
        await deleteDoc(doc(db, 'disciplinary_cases', docSnapshot.id))
        deletedCount++
        deletedCases.push({
          case_number: caseNumber,
          student_name: caseData.student_name,
          student_id: studentId
        })
        console.log(`❌ Deleted: ${caseNumber} - ${caseData.student_name} (${studentId})`)
      } else {
        keptCount++
        console.log(`✅ Kept: ${caseNumber} - ${caseData.student_name} (${studentId})`)
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 CLEANUP COMPLETE!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n📊 Summary:`)
    console.log(`   🗑️  Mock cases deleted: ${deletedCount}`)
    console.log(`   ✅ Real cases kept: ${keptCount}`)
    console.log(`   📝 Total cases processed: ${querySnapshot.size}`)
    
    if (deletedCases.length > 0) {
      console.log('\n🗑️  Deleted Cases:')
      deletedCases.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.case_number} - ${c.student_name} (${c.student_id})`)
      })
    }
    
    console.log('\n✅ Your real data has been preserved!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ ERROR: Failed to remove mock data')
    console.error('Error details:', error.message)
    console.error('\n⚠️  Make sure you have:')
    console.error('   1. Proper Firestore permissions')
    console.error('   2. Valid Firebase configuration')
    console.error('   3. Network connection\n')
    process.exit(1)
  }
}

removeMockData()
