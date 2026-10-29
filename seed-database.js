// Seed Database Script - Run with: node seed-database.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
import { firebaseConfig, requireEnv } from './firebase-config.js'

requireEnv('VITE_FIREBASE_API_KEY')

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample disciplinary cases
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
];

async function seedDatabase() {
  console.log('\n🌱 Starting to seed database...\n');
  
  try {
    let count = 0;
    
    for (const caseData of sampleCases) {
      await addDoc(collection(db, 'disciplinary_cases'), {
        ...caseData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      count++;
      console.log(`✅ [${count}/${sampleCases.length}] Added: ${caseData.case_number} - ${caseData.student_name}`);
    }
    
    console.log('\n🎉 SUCCESS! Database seeded successfully!');
    console.log(`📊 Total cases added: ${count}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ You can now view the data in:');
    console.log('   🔗 Firestore Console: https://console.firebase.google.com/project/minsu-disciplinary/firestore');
    console.log('   🔗 Your App: http://localhost:5173');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR: Failed to seed database');
    console.error('Error details:', error.message);
    console.error('\n⚠️  Make sure you have:');
    console.error('   1. Created Firestore database in Firebase Console');
    console.error('   2. Set security rules to allow writes');
    console.error('   3. Enabled Authentication (if rules require it)\n');
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
