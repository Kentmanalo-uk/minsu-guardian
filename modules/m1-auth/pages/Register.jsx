import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Modal from '@/components/Modal'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'officer',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match!')
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long!')
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      setShowSuccessModal(true)
      setTimeout(() => {
        navigate('/app/dashboard')
      }, 2000)
    } catch (error) {
      let message = error.message
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please use a different email or login.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.'
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use a stronger password.'
      }
      setErrorMessage(message)
      setShowErrorModal(true)
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 px-4 py-8">
      <div className="max-w-lg w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="text-white hover:text-blue-100 mb-8 flex items-center space-x-2 text-lg"
        >
          <span></span>
          <span>Back to Home</span>
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-xl mb-6">
            <span className="text-5xl font-bold text-emerald-600">M</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Create Account</h1>
          <p className="text-blue-100 text-lg">Mindoro State University - Bongabong Campus</p>
        </div>

        {/* Register Modal Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Register</h2>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-blue-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-blue-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
                placeholder="your.email@minsu.edu.ph"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-blue-50 border-0 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
                required
              >
                <option value="officer">Discipline Officer</option>
                <option value="admin">Administrator</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-blue-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
                placeholder="••••••••"
                required
              />
              <p className="text-sm text-gray-500 mt-2">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-blue-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6 transform hover:scale-105"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-base text-gray-600">
            <p>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-white text-base mt-8 opacity-90">
          © 2024 Mindoro State University. All rights reserved.
        </p>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Registration Successful"
        size="md"
      >
        <div className="text-center py-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to MinSU!</h3>
          <p className="text-gray-700 mb-6">
            Your account has been created successfully. You will be redirected to the dashboard shortly.
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-minsu-primary mx-auto"></div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Registration Failed"
        size="md"
      >
        <div className="text-center py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Registration Error</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setShowErrorModal(false)}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </Modal>
    </div>
  )
}
