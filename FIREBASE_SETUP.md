# Firebase Setup Guide for MinSU Disciplinary System

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: **MinSU-Disciplinary-System**
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (</>)
2. Register app name: **MinSU Disciplinary System**
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Click on "Email/Password" under Sign-in method
4. Enable "Email/Password"
5. Click "Save"

## Step 4: Create User Accounts

1. Go to **Authentication** > **Users**
2. Click "Add user"
3. Enter email and password:
   - Example: `admin@minsu.edu.ph` / `password123`
   - Example: `officer@minsu.edu.ph` / `password123`
4. Click "Add user"

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Select **Start in production mode**
4. Choose location: **asia-southeast1** (Singapore - closest to Philippines)
5. Click "Enable"

## Step 6: Configure Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write disciplinary cases
    match /disciplinary_cases/{caseId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

## Step 7: Create Firestore Indexes (Optional but Recommended)

1. Go to **Firestore Database** > **Indexes**
2. Click "Add index"
3. Collection ID: `disciplinary_cases`
4. Add fields:
   - `status` (Ascending)
   - `created_at` (Descending)
5. Click "Create"

## Step 8: Configure Your Application

1. Create a `.env` file in your project root:

```bash
cp .env.example .env
```

2. Add your Firebase configuration to `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Where to find these values:**
- Go to Firebase Console > Project Settings > General
- Scroll down to "Your apps" section
- Copy values from the Firebase SDK snippet

## Step 9: Install Dependencies

```bash
npm install
```

## Step 10: Run the Application

```bash
npm run dev
```

Open http://localhost:5173 and log in with the user account you created!

## Step 11: Deploy to Firebase Hosting (Optional)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```

Select:
- Hosting
- Use existing project
- Public directory: `dist`
- Single-page app: Yes
- Set up automatic builds: No

4. Build your app:
```bash
npm run build
```

5. Deploy:
```bash
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

## Firestore Data Structure

The `disciplinary_cases` collection has this structure:

```javascript
{
  case_number: "CASE-1234567890",
  student_name: "Juan Dela Cruz",
  student_id: "2024-00001",
  violation_type: "Academic Dishonesty",
  description: "Caught cheating during exam",
  date_of_incident: "2024-10-15",
  location: "Room 101",
  reported_by: "Prof. Maria Santos",
  status: "pending", // pending | active | resolved
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## Security Best Practices

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use strong passwords** for user accounts
3. **Enable App Check** (optional but recommended):
   - Go to Firebase Console > App Check
   - Register your app
   - Add reCAPTCHA v3 for web

4. **Set up Firebase Storage Rules** if you add file uploads later

5. **Monitor usage** in Firebase Console > Usage and billing

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check that your `.env` file has the correct API key
- Make sure the file is named exactly `.env`
- Restart the dev server: `npm run dev`

### Error: "Missing or insufficient permissions"
- Check Firestore Security Rules
- Make sure you're logged in with an authenticated user
- Verify the rules allow authenticated users to read/write

### Error: "Firebase: Error (auth/user-not-found)"
- Create a user account in Firebase Console > Authentication > Users
- Use the exact email and password you created

### Cases not showing up
- Check Firebase Console > Firestore Database
- Verify data exists in the `disciplinary_cases` collection
- Check browser console for errors

## Additional Features to Add

1. **Email Verification**
   - Enable in Authentication > Templates
   - Add email verification flow

2. **Password Reset**
   - Already built into Firebase Auth
   - Add "Forgot Password" link on login page

3. **File Uploads** (Evidence/Documents)
   - Enable Firebase Storage
   - Add file upload to incident report form

4. **Real-time Updates**
   - Use `onSnapshot()` instead of `getDocs()`
   - Cases update automatically without refresh

5. **Push Notifications**
   - Enable Firebase Cloud Messaging
   - Notify officers of new cases

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

For project issues:
- Contact: Paolo Amor P. Palma
- Email: it@minsu.edu.ph
