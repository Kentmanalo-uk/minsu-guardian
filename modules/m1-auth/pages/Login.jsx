import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Modal from '@/components/Modal'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/app/dashboard')
    } catch (error) {
      let message = error.message
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.'
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.'
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.'
      }
      setErrorMessage(message)
      setShowErrorModal(true)
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      alert('Please enter your email address')
      return
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setShowForgotPasswordModal(false)
      setShowResetSuccessModal(true)
      setResetEmail('')
    } catch (error) {
      let message = error.message
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.'
      }
      alert(message)
    }
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
          <h1 className="text-4xl font-bold text-white mb-3">MinSU Disciplinary System</h1>
          <p className="text-blue-100 text-lg">Mindoro State University - Bongabong Campus</p>
        </div>

        {/* Login Modal Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-blue-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
                placeholder="kylemagsino7@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-blue-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                />
                <span className="ml-3 text-base text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-base text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6 transform hover:scale-105"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-base text-gray-600">
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-white text-base mt-8 opacity-90">
          © 2024 Mindoro State University. All rights reserved.
        </p>
      </div>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Login Failed"
        size="md"
      >
        <div className="text-center py-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Authentication Error</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setShowErrorModal(false)
                setShowForgotPasswordModal(true)
              }}
              className="w-full btn-secondary"
            >
              Reset Password
            </button>
          </div>
        </div>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotPasswordModal}
        onClose={() => {
          setShowForgotPasswordModal(false)
          setResetEmail('')
        }}
        title="Reset Password"
        size="md"
      >
        <div className="py-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Forgot Your Password?</h3>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="input-field"
                placeholder="your.email@minsu.edu.ph"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false)
                  setResetEmail('')
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="flex-1 btn-primary"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Reset Success Modal */}
      <Modal
        isOpen={showResetSuccessModal}
        onClose={() => setShowResetSuccessModal(false)}
        title="Email Sent"
        size="md"
      >
        <div className="text-center py-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700">
              Password reset link has been sent to your email address. Please check your inbox and follow the instructions.
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <button
            onClick={() => setShowResetSuccessModal(false)}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}
