
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import { Toaster } from 'react-hot-toast'

import Landing from '@modules/m1-auth/pages/Landing'
import Dashboard from '@modules/m4-dashboard/pages/Dashboard'
import CaseManagement from '@modules/m3-cases/pages/CaseManagement'
import Reports from '@modules/m5-reports/pages/Reports'
import UserManagement from '@modules/m1-auth/pages/UserManagement'
import StudentManagement from '@modules/m2-incidents/pages/StudentManagement'
import SeedData from './pages/SeedData'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F8F5] flex items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M12 3 19 6V11.5C19 16 16 19.5 12 21C8 19.5 5 16 5 11.5V6L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight text-gray-900">
                MinSU
              </p>
              <p className="text-xs text-gray-500">
                Disciplinary Management System
              </p>
            </div>
          </div>

          <div className="h-px w-full overflow-hidden bg-gray-200">
            <div className="h-full w-1/3 animate-loading-bar bg-emerald-700" />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Preparing your workspace...
          </p>
        </div>
      </main>
    )
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: '#FFFFFF',
            color: '#242923',
            padding: '14px 16px',
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 8px 30px rgba(20, 35, 25, 0.08)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            maxWidth: '360px',
          },
          success: {
            iconTheme: {
              primary: '#047857',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/seed"
          element={user ? <SeedData /> : <Navigate to="/" replace />}
        />

        <Route
          path="/app"
          element={
            user ? (
              <Layout user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cases" element={<CaseManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
