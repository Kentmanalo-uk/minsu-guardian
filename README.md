# MinSU Disciplinary System CMS

A modern, web-based Disciplinary Case Management System for Mindoro State University - Bongabong Campus.

## Features

- 🔐 Secure authentication with Supabase
- 📊 Real-time dashboard with case statistics
- 📝 Online incident reporting system
- 📋 Comprehensive case management
- 📈 Analytics and reporting tools
- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Firestore)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Authentication**: Firebase Auth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd minsu-disciplinary-system
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase

Create a new Supabase project at https://supabase.com

4. Create the database table

Run this SQL in your Supabase SQL Editor:

```sql
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
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE disciplinary_cases ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON disciplinary_cases
  FOR ALL USING (auth.role() = 'authenticated');
```

5. Configure environment variables

Copy `.env.example` to `.env` and add your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

6. Start the development server
```bash
npm run dev
```

7. Open http://localhost:5173 in your browser

## Project Structure

```
minsu-disciplinary-system/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navigation
│   ├── lib/
│   │   └── supabase.js         # Supabase client configuration
│   ├── pages/
│   │   ├── Login.jsx           # Authentication page
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── IncidentReport.jsx  # Report new incidents
│   │   ├── CaseManagement.jsx  # Manage cases
│   │   └── Reports.jsx         # Analytics and reports
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Usage

### Creating a User Account

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User" and create an account with email/password
4. Use these credentials to log in to the system

### Reporting an Incident

1. Navigate to "Report Incident"
2. Fill in all required fields
3. Submit the form
4. A unique case number will be generated automatically

### Managing Cases

1. Go to "Case Management"
2. Filter cases by status (All, Pending, Active, Resolved)
3. Click on a case to view details
4. Update case status as needed

### Viewing Reports

1. Navigate to "Reports & Analytics"
2. View statistics and trends
3. Export reports as CSV files

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel or Netlify
2. Add environment variables in the deployment settings
3. Deploy!

## Security Notes

- All routes are protected with authentication
- Row Level Security (RLS) is enabled on Supabase
- Only authenticated users can access the system
- Passwords are securely hashed by Supabase Auth

## Support

For issues or questions, contact the IT department at Mindoro State University.

## License

© 2024 Mindoro State University. All rights reserved.
