# 🔥 Firestore Database Setup Instructions

## Your Firebase Project: `minsu-disciplinary`

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Create Firestore Database

1. **Open this link:** 
   👉 https://console.firebase.google.com/project/minsu-disciplinary/firestore

2. Click the **"Create database"** button

3. Select **"Start in production mode"**

4. Choose location: **asia-southeast1 (Singapore)**
   - This is closest to the Philippines for best performance

5. Click **"Enable"**

6. Wait 1-2 minutes for database creation

✅ **Done!** Your Firestore database is now created.

---

### Step 2: Set Security Rules

1. In Firestore Console, click the **"Rules"** tab at the top

2. **Delete everything** in the editor

3. **Copy and paste this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Disciplinary cases collection
    match /disciplinary_cases/{caseId} {
      // Allow authenticated users to read and write
      allow read, write: if request.auth != null;
    }
    
    // Users collection (optional - for storing user profiles)
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      // Users can update their own profile
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click **"Publish"** button

✅ **Done!** Security rules are now active.

---

### Step 3: Enable Email Authentication

1. **Open this link:**
   👉 https://console.firebase.google.com/project/minsu-disciplinary/authentication/providers

2. Click on **"Email/Password"**

3. Toggle the **"Enable"** switch to ON

4. Click **"Save"**

✅ **Done!** Email authentication is enabled.

---

## 🎉 You're All Set!

Your Firebase is now fully configured. Here's what you can do:

### Test Your App:

1. Go to: **http://localhost:5173**

2. Click **"Sign In"** → **"Register here"**

3. Create your first account:
   ```
   Name: Admin User
   Email: admin@minsu.edu.ph
   Password: (the password you chose)
   Role: Administrator
   ```

4. Click **"Create Account"**

5. You'll be logged in and see the dashboard!

---

## 📊 Firestore Collection Structure

Your app uses this collection:

### Collection: `disciplinary_cases`

Each document contains:

```javascript
{
  case_number: "CASE-1234567890",      // Auto-generated unique ID
  student_name: "Juan Dela Cruz",      // Student's full name
  student_id: "2024-00001",            // Student ID number
  violation_type: "Academic Dishonesty", // Type of violation
  description: "Detailed description",  // Full incident description
  date_of_incident: "2024-01-15",      // Date (YYYY-MM-DD)
  location: "Room 101",                // Where it happened
  reported_by: "Prof. Maria Santos",   // Who reported it
  status: "pending",                   // pending | active | resolved
  sanctions: null,                     // Penalties (optional)
  notes: null,                         // Additional notes (optional)
  created_at: Timestamp,               // Auto-generated
  updated_at: Timestamp                // Auto-updated
}
```

---

## 🔗 Quick Access Links

- **Firebase Console:** https://console.firebase.google.com/project/minsu-disciplinary
- **Firestore Database:** https://console.firebase.google.com/project/minsu-disciplinary/firestore
- **Authentication:** https://console.firebase.google.com/project/minsu-disciplinary/authentication
- **Security Rules:** https://console.firebase.google.com/project/minsu-disciplinary/firestore/rules
- **Your App:** http://localhost:5173

---

## ⚠️ Troubleshooting

### Error: "Missing or insufficient permissions"
**Solution:** You forgot to set the security rules (Step 2)

### Error: "Firebase: Error (auth/operation-not-allowed)"
**Solution:** You forgot to enable Email/Password authentication (Step 3)

### Error: "Collection not found"
**Solution:** The collection will be created automatically when you submit your first incident report

### Can't see data in Firestore
**Solution:** 
1. Make sure you're logged in to the app
2. Submit a test incident report
3. Refresh Firestore Console

---

## 📝 Files Created

I've created these files for you:

1. **firestore.rules** - Security rules (copy to Firebase Console)
2. **firestore.indexes.json** - Database indexes (optional)
3. **firebase.json** - Firebase configuration
4. **setup-firestore.js** - Setup information script

---

## 🚀 Next Steps

1. ✅ Complete the 3 setup steps above
2. ✅ Create your first user account
3. ✅ Submit a test incident report
4. ✅ Check Firestore Console to see the data
5. ✅ Explore the dashboard, case management, and reports

---

**Total Setup Time: 5 minutes** ⏱️

Need help? Check the troubleshooting section above! 🎯
