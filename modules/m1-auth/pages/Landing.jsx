import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { FaGavel, FaChartLine, FaFileAlt, FaShieldAlt, FaClock, FaCheckCircle, FaUsers, FaLock, FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa'

export default function Landing() {
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showFeaturesModal, setShowFeaturesModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false)
  const navigate = useNavigate()

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Register state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)

  // Reset password state
  const [resetEmail, setResetEmail] = useState('')

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('minsu_remember_email')
    if (savedEmail) {
      setLoginData(prev => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password)

      // The Auth service rejects archived accounts and accounts without a profile
      try {
        await authApi.me()
      } catch (profileError) {
        await signOut(auth)
        setLoginError(profileError.message)
        toast.error(profileError.message)
        setLoginLoading(false)
        return
      }
      
      // Save or remove email based on remember me checkbox
      if (rememberMe) {
        localStorage.setItem('minsu_remember_email', loginData.email)
      } else {
        localStorage.removeItem('minsu_remember_email')
      }
      
      toast.success('Login successful! Welcome back.')
      setShowLoginModal(false)
      navigate('/app/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      let message = 'Login failed. Please check your credentials.'
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.'
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address format.'
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your credentials.'
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Please try again later.'
      } else {
        message = `Login error: ${error.message}`
      }
      setLoginError(message)
      toast.error(message)
    }
    setLoginLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegisterLoading(true)
    setRegisterError('')

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match!')
      toast.error('Passwords do not match!')
      setRegisterLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters long!')
      toast.error('Password must be at least 6 characters long!')
      setRegisterLoading(false)
      return
    }

    try {
      // The Auth service creates the account and its officer profile, then we sign in
      await authApi.register({
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password
      })
      await signInWithEmailAndPassword(auth, registerData.email, registerData.password)

      toast.success('Account created successfully! Welcome to MinSU.')
      setShowRegisterModal(false)
      navigate('/app/dashboard')
    } catch (error) {
      const message = error.message || 'Registration failed. Please try again.'
      setRegisterError(message)
      toast.error(message)
    }
    setRegisterLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address')
      return
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast.success('Password reset email sent! Check your inbox.')
      setShowForgotPasswordModal(false)
      setShowResetSuccessModal(true)
      setResetEmail('')
    } catch (error) {
      toast.error('Failed to send reset email. Please check the email address.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-emerald-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <FaGavel className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MinSU Guardian</h1>
                <p className="text-xs text-emerald-600 font-medium">Protecting Campus Integrity</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowAboutModal(true)}
                className="hidden md:block text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                About
              </button>
              <button
                onClick={() => setShowFeaturesModal(true)}
                className="hidden md:block text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="hidden md:block text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              >
                Contact
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
                Mindoro State University - Bongabong Campus
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Protecting <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Campus</span> Integrity
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Empowering fair and transparent student conduct management with smart tracking, real-time insights, and seamless case resolution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <span></span>
              </button>
              <button
                onClick={() => setShowFeaturesModal(true)}
                className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all"
              >
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">100%</div>
                <div className="text-sm text-gray-600 mt-1">Digital</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">24/7</div>
                <div className="text-sm text-gray-600 mt-1">Access</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">Secure</div>
                <div className="text-sm text-gray-600 mt-1">Data</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-emerald-100 flex flex-col h-full">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <FaChartLine className="text-2xl text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real-time Dashboard</h3>
              <p className="text-sm text-gray-600">Monitor cases with live statistics</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-emerald-100 flex flex-col h-full">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <FaFileAlt className="text-2xl text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Easy Reporting</h3>
              <p className="text-sm text-gray-600">Submit incidents online instantly</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-emerald-100 flex flex-col h-full">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <FaShieldAlt className="text-2xl text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">Protected with encryption</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-emerald-100 flex flex-col h-full">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <FaUsers className="text-2xl text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">User Friendly</h3>
              <p className="text-sm text-gray-600">Intuitive interface design</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage disciplinary cases efficiently</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:bg-emerald-50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaCheckCircle className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Case Tracking</h3>
              <p className="text-gray-600">Track cases from report to resolution with status updates</p>
            </div>

            <div className="text-center p-8 rounded-2xl hover:bg-emerald-50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaClock className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Access</h3>
              <p className="text-gray-600">Access student records and case history instantly</p>
            </div>

            <div className="text-center p-8 rounded-2xl hover:bg-emerald-50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaLock className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Security</h3>
              <p className="text-gray-600">Enterprise-grade security with Firebase</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join MinSU Guardian today and streamline your case management process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Sign In Now
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <FaGavel className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="font-bold">MinSU Guardian</h3>
                  <p className="text-xs text-gray-400">Protecting Campus Integrity</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Modern disciplinary case management for Mindoro State University - Bongabong Campus
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => setShowAboutModal(true)} className="block text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </button>
                <button onClick={() => setShowFeaturesModal(true)} className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Features
                </button>
                <button onClick={() => setShowContactModal(true)} className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Mindoro State University</p>
                <p>Bongabong Campus</p>
                <p>Oriental Mindoro</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 Mindoro State University - Bongabong Campus. All rights reserved.</p>
            <p className="mt-2">Developed by Paolo Amor P. Palma</p>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAboutModal && (
        <Modal onClose={() => setShowAboutModal(false)} title="About MinSU Guardian">
          <div className="space-y-4">
            <p className="text-gray-700">
              MinSU Guardian is a comprehensive web-based platform designed to streamline 
              the management of student disciplinary cases at Mindoro State University - Bongabong Campus.
            </p>
            <h4 className="font-semibold text-gray-900 mt-4">Our Mission</h4>
            <p className="text-gray-700">
              To provide a transparent, efficient, and secure system for handling disciplinary matters, 
              ensuring accountability and proper documentation of all cases.
            </p>
            <h4 className="font-semibold text-gray-900 mt-4">Key Benefits</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Eliminates manual paperwork and filing</li>
              <li>Provides centralized database for all cases</li>
              <li>Enables quick access to student disciplinary history</li>
              <li>Generates comprehensive reports instantly</li>
              <li>Ensures data security and privacy</li>
            </ul>
          </div>
        </Modal>
      )}

      {/* Features Modal */}
      {showFeaturesModal && (
        <Modal onClose={() => setShowFeaturesModal(false)} title="System Features">
          <div className="space-y-6">
            <FeatureItem
              icon={FaLock}
              title="Secure Authentication"
              description="Firebase-powered authentication ensures only authorized personnel can access the system"
            />
            <FeatureItem
              icon={FaChartLine}
              title="Real-time Dashboard"
              description="View live statistics, pending cases, and recent activities at a glance"
            />
            <FeatureItem
              icon={FaFileAlt}
              title="Online Incident Reporting"
              description="Submit detailed incident reports with automatic case number generation"
            />
            <FeatureItem
              icon={FaGavel}
              title="Case Management"
              description="Track, update, and manage disciplinary cases from start to resolution"
            />
            <FeatureItem
              icon={FaChartLine}
              title="Analytics & Reports"
              description="Generate comprehensive reports with visual statistics and export capabilities"
            />
            <FeatureItem
              icon={FaCheckCircle}
              title="Status Tracking"
              description="Monitor case progress with status updates (Pending, Active, Resolved)"
            />
            <FeatureItem
              icon={FaUsers}
              title="Responsive Design"
              description="Access the system from any device - desktop, tablet, or mobile"
            />
            <FeatureItem
              icon={FaShieldAlt}
              title="Cloud Storage"
              description="All data securely stored in Firebase Firestore with automatic backups"
            />
          </div>
        </Modal>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <Modal onClose={() => setShowContactModal(false)} title="Contact Information">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Mindoro State University</h4>
              <p className="text-gray-700">Bongabong Campus</p>
              <p className="text-gray-700">Bongabong, Oriental Mindoro</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Office of Student Affairs</h4>
              <p className="text-gray-700"> Email: osas@minsu.edu.ph</p>
              <p className="text-gray-700"> Phone: (043) XXX-XXXX</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Technical Support</h4>
              <p className="text-gray-700"> Email: it@minsu.edu.ph</p>
              <p className="text-gray-700">Developer: Paolo Amor P. Palma</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-emerald-800">
                <strong>Note:</strong> For urgent disciplinary matters, please contact the Office of 
                Student Affairs directly during office hours (8:00 AM - 5:00 PM, Monday to Friday).
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Header */}
            <div className="bg-emerald-600 p-6 sm:p-8 rounded-t-3xl text-center relative">
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  setLoginError('')
                }}
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl sm:text-3xl"
              >
                X
              </button>
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-xl mb-4">
                <FaGavel className="text-3xl sm:text-4xl text-emerald-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">MinSU Guardian</h2>
              <p className="text-sm sm:text-base text-emerald-100">Protecting Campus Integrity</p>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h3>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-emerald-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="your.email@minsu.edu.ph"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaKey className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-emerald-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowForgotPasswordModal(true)
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50"
                >
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowRegisterModal(true)
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-8 animate-slideUp">
            {/* Header */}
            <div className="bg-emerald-600 p-8 rounded-t-3xl text-center relative">
              <button
                onClick={() => {
                  setShowRegisterModal(false)
                  setRegisterError('')
                }}
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-3xl"
              >
                X
              </button>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
                <FaGavel className="text-4xl text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-emerald-100">Mindoro State University</p>
            </div>

            {/* Body */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Register</h3>

              {registerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {registerError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUsers className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-emerald-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-emerald-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="your.email@minsu.edu.ph"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaKey className="text-gray-400" />
                    </div>
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-emerald-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaKey className="text-gray-400" />
                    </div>
                    <input
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-emerald-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showRegisterConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50"
                >
                  {registerLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setShowRegisterModal(false)
                      setShowLoginModal(true)
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  X
                </button>
              </div>
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 bg-emerald-50 border-0 rounded-xl mb-4"
                placeholder="your.email@minsu.edu.ph"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForgotPassword}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  Send Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Success Modal */}
      {showResetSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Email Sent!</h3>
            <p className="text-gray-600 mb-6">
              Check your inbox for the password reset link.
            </p>
            <button
              onClick={() => setShowResetSuccessModal(false)}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Modal Component
function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-minsu-primary to-minsu-secondary p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl leading-none"
          >
            X
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-minsu-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-minsu-dark transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Feature Item Component
function FeatureItem({ icon: IconComponent, title, description }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
        <IconComponent className="text-2xl text-emerald-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  )
}
