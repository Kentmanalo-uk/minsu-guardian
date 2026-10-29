# MinSU Disciplinary System - Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Node.js and npm

Download and install Node.js (v18 or higher) from https://nodejs.org/

Verify installation:
```bash
node --version
npm --version
```

### 2. Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: MinSU Disciplinary System
   - Database Password: (create a strong password)
   - Region: Choose closest to Philippines (Singapore recommended)
4. Wait for project to be created (2-3 minutes)

### 3. Set Up Database

1. In your Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create the disciplinary_cases table
CREATE TABLE disciplinary_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  description TEXT NOT NULL,
  date_of_incident DATE NOT NULL,
  location TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved')),
  sanctions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_case_number ON disciplinary_cases(case_number);
CREATE INDEX idx_student_id ON disciplinary_cases(student_id);
CREATE INDEX idx_status ON disciplinary_cases(status);

-- Enable Row Level Security
ALTER TABLE disciplinary_cases ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (full access)
CREATE POLICY "Enable all access for authenticated users" 
ON disciplinary_cases
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_disciplinary_cases_updated_at 
BEFORE UPDATE ON disciplinary_cases 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

4. Click "Run" to execute the SQL

### 4. Get Supabase Credentials

1. In Supabase dashboard, go to "Settings" > "API"
2. Copy these values:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - anon/public key (long string starting with "eyJ...")

### 5. Create User Accounts

1. In Supabase dashboard, go to "Authentication" > "Users"
2. Click "Add User" > "Create new user"
3. Enter email and password for discipline officers/admin
4. Click "Create User"
5. Repeat for additional users

Example users:
- admin@minsu.edu.ph
- discipline.officer@minsu.edu.ph
- osas@minsu.edu.ph

### 6. Configure the Application

1. Open the project folder in your code editor
2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 7. Install Dependencies

```bash
npm install
```

### 8. Run the Application

```bash
npm run dev
```

The application will open at http://localhost:5173

### 9. Test the System

1. Open http://localhost:5173 in your browser
2. You should see the login page
3. Log in with one of the user accounts you created
4. Test all features:
   - Dashboard
   - Report Incident
   - Case Management
   - Reports

### 10. Deploy to Production

#### Option A: Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com and sign up
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
6. Click "Deploy"

#### Option B: Deploy to Netlify

1. Push your code to GitHub
2. Go to https://netlify.com and sign up
3. Click "Add new site" > "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Site settings
7. Click "Deploy"

#### Option C: Deploy to University Server

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to your web server
3. Configure your web server (Apache/Nginx) to serve the files
4. Ensure environment variables are set on the server

## Troubleshooting

### Issue: "Invalid API key"
- Check that your `.env` file has the correct Supabase credentials
- Make sure the file is named exactly `.env` (not `.env.txt`)
- Restart the development server after changing `.env`

### Issue: "Failed to fetch"
- Check your internet connection
- Verify Supabase project is active
- Check browser console for detailed error messages

### Issue: Can't log in
- Verify user account exists in Supabase Authentication
- Check that email and password are correct
- Ensure RLS policies are set up correctly

### Issue: Cases not showing
- Check that the database table was created successfully
- Verify RLS policies allow authenticated users to read data
- Check browser console for errors

## Additional Configuration

### Customizing Colors

Edit `tailwind.config.js` to change the MinSU brand colors:

```javascript
colors: {
  minsu: {
    primary: '#1e40af',    // Main blue
    secondary: '#3b82f6',  // Light blue
    accent: '#60a5fa',     // Accent blue
    dark: '#1e3a8a',       // Dark blue
  }
}
```

### Adding More Violation Types

Edit `src/pages/IncidentReport.jsx` and add options to the violation type dropdown.

### Email Notifications

To enable email notifications:
1. Go to Supabase dashboard > Authentication > Email Templates
2. Customize email templates
3. Add email sending logic in your application

## Support

For technical support, contact:
- IT Department: it@minsu.edu.ph
- Developer: Paolo Amor P. Palma

## Security Best Practices

1. Never commit `.env` file to version control
2. Use strong passwords for user accounts
3. Regularly backup your Supabase database
4. Keep dependencies updated: `npm update`
5. Monitor Supabase logs for suspicious activity
6. Use HTTPS in production
7. Implement proper user roles and permissions

## Maintenance

### Regular Tasks

- Weekly: Review and backup database
- Monthly: Update npm packages
- Quarterly: Review and update security policies
- Annually: Audit user accounts and access

### Database Backup

1. Go to Supabase dashboard > Database > Backups
2. Enable automatic backups
3. Download manual backups regularly

## Next Steps

After setup, consider:
1. Adding more user roles (student, faculty, admin)
2. Implementing email notifications
3. Adding file upload for evidence
4. Creating detailed audit logs
5. Adding student portal for viewing their cases
6. Integrating with existing MinSU systems
