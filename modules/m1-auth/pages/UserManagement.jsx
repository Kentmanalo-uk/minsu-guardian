import { useState, useEffect } from 'react'
import { userApi } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import toast from 'react-hot-toast'
import DataTable from 'react-data-table-component'
import { FaUserPlus, FaEdit, FaArchive, FaUsers, FaShieldAlt, FaUserTie, FaUndo } from 'react-icons/fa'
import Modal, { ConfirmModal } from '@/components/Modal'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showArchivedUsers, setShowArchivedUsers] = useState(false)
  const { currentUser, userRole } = useAuth()

  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'officer'
  })

  useEffect(() => {
    fetchUsers()
  }, [showArchivedUsers])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      setUsers(await userApi.list(showArchivedUsers))
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    }
    setLoading(false)
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    
    try {
      // Created by the Auth service, so the admin stays signed in
      await userApi.create(newUserData)

      toast.success('User added successfully!')
      setShowAddModal(false)
      setNewUserData({ fullName: '', email: '', password: '', role: 'officer' })
      fetchUsers()
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error(error.message || 'Failed to add user')
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    try {
      await userApi.updateRole(selectedUser.id, selectedUser.role)

      toast.success('User role updated successfully!')
      setShowEditModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleArchiveUser = async () => {
    if (!selectedUser) return

    try {
      await userApi.setArchived(selectedUser.id, true)

      toast.success('User archived successfully!')
      setShowArchiveModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error archiving user:', error)
      toast.error('Failed to archive user')
    }
  }

  const handleRestoreUser = async (user) => {
    try {
      await userApi.setArchived(user.id, false)

      toast.success('User restored successfully!')
      fetchUsers()
    } catch (error) {
      console.error('Error restoring user:', error)
      toast.error('Failed to restore user')
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-red-100 text-red-800', icon: FaShieldAlt, label: 'Admin' },
      officer: { color: 'bg-blue-100 text-blue-800', icon: FaUserTie, label: 'Officer' },
      staff: { color: 'bg-green-100 text-green-800', icon: FaUsers, label: 'Staff' }
    }
    const badge = badges[role] || badges.officer
    const IconComponent = badge.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <IconComponent />
        <span>{badge.label}</span>
      </span>
    )
  }

  const columns = [
    {
      name: 'Full Name',
      selector: row => row.fullName,
      sortable: true,
      grow: 2,
      cell: row => <span className="font-semibold text-gray-900 text-sm">{row.fullName}</span>
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
      grow: 2,
      hide: 'sm',
      cell: row => <span className="text-sm">{row.email}</span>
    },
    {
      name: 'Role',
      selector: row => row.role,
      sortable: true,
      width: '120px',
      center: true,
      cell: row => getRoleBadge(row.role)
    },
    {
      name: 'Actions',
      width: '200px',
      center: true,
      cell: row => (
        <div className="flex items-center justify-center space-x-2">
          {!showArchivedUsers ? (
            <>
              <button
                onClick={() => {
                  setSelectedUser(row)
                  setShowEditModal(true)
                }}
                className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                title="Edit Role"
              >
                <FaEdit />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => {
                  setSelectedUser(row)
                  setShowArchiveModal(true)
                }}
                className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                title="Archive User"
              >
                <FaArchive />
                <span className="hidden sm:inline">Archive</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRestoreUser(row)}
              className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
              title="Restore User"
            >
              <FaUndo />
              <span className="hidden sm:inline">Restore</span>
            </button>
          )}
        </div>
      ),
    },
  ]

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '2px solid #e5e7eb',
        fontWeight: '600',
        fontSize: '13px',
        color: '#374151',
        minHeight: '48px',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        minHeight: '60px',
        '&:hover': {
          backgroundColor: '#f3f4f6',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e5e7eb',
        minHeight: '56px',
      },
    },
  }

  // Check if current user is admin
  if (userRole === null) {
    // Still loading user role
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaShieldAlt className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowArchivedUsers(!showArchivedUsers)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 sm:py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
              showArchivedUsers
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
            }`}
          >
            <FaArchive />
            <span>{showArchivedUsers ? 'Show Active Users' : 'Show Archived'}</span>
          </button>
          {!showArchivedUsers && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              <FaUserPlus />
              <span>Add New User</span>
            </button>
          )}
        </div>
      </div>

      {/* Users DataTable */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {showArchivedUsers ? 'No archived users found' : 'No active users found'}
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
          />
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setNewUserData({ fullName: '', email: '', password: '', role: 'officer' })
        }}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={newUserData.fullName}
              onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              placeholder="user@minsu.edu.ph"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
            >
              <option value="officer">Discipline Officer</option>
              <option value="admin">Administrator</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false)
                setNewUserData({ fullName: '', email: '', password: '', role: 'officer' })
              }}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Add User
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        title="Edit User Role"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">User</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{selectedUser.fullName}</p>
              <p className="text-xs sm:text-sm text-gray-500">{selectedUser.email}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select New Role
              </label>
              <select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              >
                <option value="officer">Discipline Officer</option>
                <option value="admin">Administrator</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedUser(null)
                }}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Update Role
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        isOpen={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false)
          setSelectedUser(null)
        }}
        onConfirm={handleArchiveUser}
        title="Archive User"
        message={`Are you sure you want to archive ${selectedUser?.fullName}? The user will not be able to login but can be restored later.`}
        confirmText="Yes, Archive User"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  )
}
