import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Sample disciplinary cases data
const sampleCases = [
  {
    case_number: 'CASE-1704067200000',
    student_name: 'Juan Dela Cruz',
    student_id: '2024-00001',
    violation_type: 'Academic Dishonesty',
    description: 'Caught cheating during midterm examination in Mathematics subject.',
    date_of_incident: '2024-01-15',
    location: 'Room 101, Main Building',
    reported_by: 'Prof. Maria Santos',
    status: 'pending',
    sanctions: null,
    notes: null,
  },
  {
    case_number: 'CASE-1704153600000',
    student_name: 'Maria Garcia',
    student_id: '2024-00002',
    violation_type: 'Misconduct',
    description: 'Disruptive behavior during class hours, repeatedly talking loudly and disturbing other students.',
    date_of_incident: '2024-01-20',
    location: 'Room 205, Science Building',
    reported_by: 'Prof. Jose Reyes',
    status: 'active',
    sanctions: 'Written warning issued',
    notes: 'Student has been counseled',
  },
  {
    case_number: 'CASE-1704240000000',
    student_name: 'Pedro Santos',
    student_id: '2024-00003',
    violation_type: 'Attendance Violation',
    description: 'Excessive absences without valid excuse. Missed 10 consecutive days of classes.',
    date_of_incident: '2024-02-01',
    location: 'Various Classrooms',
    reported_by: 'Prof. Ana Lopez',
    status: 'resolved',
    sanctions: 'Required to submit medical certificate and make up missed work',
    notes: 'Case resolved after submission of valid documents',
  },
  {
    case_number: 'CASE-1704326400000',
    student_name: 'Sofia Ramos',
    student_id: '2024-00004',
    violation_type: 'Dress Code Violation',
    description: 'Wearing inappropriate attire not in accordance with university dress code policy.',
    date_of_incident: '2024-02-10',
    location: 'Campus Grounds',
    reported_by: 'Security Officer - Mr. Carlos Mendoza',
    status: 'resolved',
    sanctions: 'Verbal warning',
    notes: 'Student complied immediately',
  },
  {
    case_number: 'CASE-1704412800000',
    student_name: 'Miguel Torres',
    student_id: '2024-00005',
    violation_type: 'Disrespect',
    description: 'Used inappropriate language and showed disrespectful behavior towards faculty member.',
    date_of_incident: '2024-02-15',
    location: 'Faculty Office',
    reported_by: 'Prof. Linda Cruz',
    status: 'active',
    sanctions: 'Suspension pending hearing',
    notes: 'Hearing scheduled for next week',
  },
]

export async function seedDatabase() {
  try {
    console.log('🌱 Starting to seed database...')
    
    for (const caseData of sampleCases) {
      await addDoc(collection(db, 'disciplinary_cases'), {
        ...caseData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
      console.log(`✅ Added case: ${caseData.case_number}`)
    }
    
    console.log('🎉 Database seeded successfully!')
    console.log(`📊 Added ${sampleCases.length} sample cases`)
    return { success: true, count: sampleCases.length }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    return { success: false, error: error.message }
  }
}
