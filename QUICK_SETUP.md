# ⚡ Quick Firebase Setup - Do This Now!

Your Firebase credentials are already configured in `.env`. Just follow these 3 steps:

## Step 1: Enable Email Authentication (2 minutes)

1. Open: https://console.firebase.google.com/project/minsu-disciplinary/authentication/providers
2. Click on **"Email/Password"**
3. Toggle the **Enable** switch
4. Click **Save**

✅ Done!

## Step 2: Create Firestore Database (2 minutes)

1. Open: https://console.firebase.google.com/project/minsu-disciplinary/firestore
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: **asia-southeast1** (Singapore)
5. Click **Enable**

✅ Done!

## Step 3: Set Security Rules (1 minute)

1. Still in Firestore, click the **"Rules"** tab
2. Replace everything with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /disciplinary_cases/{caseId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

✅ Done!

---

## 🎉 That's It! Now Test Your App:

1. Go to: http://localhost:5173
2. Click **"Sign In"** → **"Register here"**
3. Create your first account:
   - Name: Your Name
   - Email: admin@minsu.edu.ph
   - Password: (the password you chose)
   - Role: Administrator

4. Click **"Create Account"**

You'll be automatically logged in and redirected to the dashboard!

---

## 🔗 Quick Links:

- **Firebase Console**: https://console.firebase.google.com/project/minsu-disciplinary
- **Authentication**: https://console.firebase.google.com/project/minsu-disciplinary/authentication
- **Firestore**: https://console.firebase.google.com/project/minsu-disciplinary/firestore
- **Your App**: http://localhost:5173

---

## ⚠️ Troubleshooting:

**"Firebase: Error (auth/operation-not-allowed)"**
→ You forgot Step 1. Enable Email/Password authentication.

**"Missing or insufficient permissions"**
→ You forgot Step 3. Set the Firestore security rules.

**"Firebase: Error (auth/invalid-api-key)"**
→ Check that `.env` file exists and dev server was restarted.

---

## 📝 Default Test Accounts to Create:

After setup, create these accounts for testing:

1. **Admin Account**
   - Email: admin@minsu.edu.ph
   - Password: (the password you chose)
   - Role: Administrator

2. **Officer Account**
   - Email: officer@minsu.edu.ph
   - Password: officer123
   - Role: Discipline Officer

3. **Staff Account**
   - Email: staff@minsu.edu.ph
   - Password: staff123
   - Role: Staff

---

**Total Time: 5 minutes** ⏱️

Good luck! 🚀
