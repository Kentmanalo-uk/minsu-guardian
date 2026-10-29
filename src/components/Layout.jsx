import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../lib/useAuth'
import { FaChartBar, FaFolderOpen, FaChartLine, FaSignOutAlt, FaGavel, FaBars, FaTimes, FaUsers, FaUserGraduate } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { ConfirmModal } from './Modal'

export default function Layout({ user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { userRole } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully!')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: FaChartBar },
    { path: '/app/cases', label: 'Case Management', icon: FaFolderOpen },
    { path: '/app/reports', label: 'Reports', icon: FaChartLine },
    { path: '/app/students', label: 'Students', icon: FaUserGraduate },
  ]

  // Add User Management for admins only
  if (userRole === 'admin') {
    navItems.push({ path: '/app/users', label: 'User Management', icon: FaUsers })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-green-500 shadow-lg border-b-4 border-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {showMobileMenu ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 font-bold text-lg sm:text-xl shadow-lg">
                <FaGavel />
              </div>
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-white">MinSU Guardian</h1>
                <p className="text-xs text-emerald-100">Protecting Campus Integrity</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <p className="text-xs text-emerald-100 capitalize">{userRole || 'Officer'}</p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="hidden lg:flex items-center space-x-2 text-sm text-white hover:text-emerald-100 font-medium transition-colors bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {showMobileMenu && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/50 animate-fadeIn" 
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl animate-slideInLeft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-green-500 border-b-4 border-emerald-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600">
                    <FaGavel className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Menu</h2>
                    <p className="text-emerald-100 text-xs">Navigation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="text-white hover:text-emerald-100 p-2"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Logged in as</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole || 'Officer'}</p>
            </div>

            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="text-xl" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  handleLogoutClick()
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="bg-white border-b-2 border-emerald-500 shadow-sm overflow-x-auto hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 border-b-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === item.path
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
                  }`}
                >
                  <IconComponent className="text-base sm:text-lg" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will be redirected to the landing page."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  )
}
