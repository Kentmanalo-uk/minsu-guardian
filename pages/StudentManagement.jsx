import { useState, useEffect, useMemo } from 'react'
import { studentApi } from '@/lib/api'
import toast from 'react-hot-toast'
import DataTable from 'react-data-table-component'
import { FaUserPlus, FaEdit, FaTrash, FaUserGraduate, FaIdCard, FaEnvelope, FaPhone } from 'react-icons/fa'
import Modal, { ConfirmModal } from '@/components/Modal'

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const [newStudentData, setNewStudentData] = useState({
    student_id: '',
    student_name: '',
    email: '',
    phone: '',
    course: '',
    year_level: '1st Year'
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setStudents(await studentApi.list())
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    }
    setLoading(false)
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    
    try {
      await studentApi.create(newStudentData)

      toast.success('Student added successfully!')
      setShowAddModal(false)
      setNewStudentData({
        student_id: '',
        student_name: '',
        email: '',
        phone: '',
        course: '',
        year_level: '1st Year'
      })
      fetchStudents()
    } catch (error) {
      console.error('Error adding student:', error)
      toast.error(error.message || 'Failed to add student')
    }
  }

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return

    try {
      await studentApi.update(selectedStudent.id, {
        student_name: selectedStudent.student_name,
        email: selectedStudent.email,
        phone: selectedStudent.phone,
        course: selectedStudent.course,
        year_level: selectedStudent.year_level
      })

      toast.success('Student updated successfully!')
      setShowEditModal(false)
      setSelectedStudent(null)
      fetchStudents()
    } catch (error) {
      console.error('Error updating student:', error)
      toast.error('Failed to update student')
    }
  }

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return

    try {
      await studentApi.remove(selectedStudent.id)
      toast.success('Student deleted successfully!')
      setShowDeleteModal(false)
      setSelectedStudent(null)
      fetchStudents()
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student')
    }
  }

  // Memoize columns to prevent re-renders
  const columns = useMemo(() => [
    {
      name: 'Student ID',
      selector: row => row.student_id,
      sortable: true,
      width: '140px',
      cell: row => <span className="font-semibold text-gray-900 text-sm">{row.student_id}</span>
    },
    {
      name: 'Name',
      selector: row => row.student_name,
      sortable: true,
      grow: 2,
      cell: row => <span className="font-semibold text-gray-900 text-sm">{row.student_name}</span>
    },
    {
      name: 'Course',
      selector: row => row.course,
      sortable: true,
      grow: 1,
      hide: 'sm',
      cell: row => <span className="text-sm">{row.course}</span>
    },
    {
      name: 'Year Level',
      selector: row => row.year_level,
      sortable: true,
      width: '120px',
      center: true,
      cell: row => (
        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
          {row.year_level}
        </span>
      )
    },
    {
      name: 'Actions',
      width: '180px',
      center: true,
      cell: row => (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => {
              setSelectedStudent(row)
              setShowEditModal(true)
            }}
            className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
            title="Edit Student"
          >
            <FaEdit />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => {
              setSelectedStudent(row)
              setShowDeleteModal(true)
            }}
            className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
            title="Delete Student"
          >
            <FaTrash />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      ),
    },
  ], [])

  // Memoize custom styles
  const customStyles = useMemo(() => ({
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
  }), [])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage student records and information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
        >
          <FaUserPlus />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Students DataTable */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <FaUserGraduate className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No students found</p>
            <p className="text-sm text-gray-400 mt-2">Add your first student to get started</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={students}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
          />
        )}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setNewStudentData({
            student_id: '',
            student_name: '',
            email: '',
            phone: '',
            course: '',
            year_level: '1st Year'
          })
        }}
        title="Add New Student"
        size="md"
      >
        <form onSubmit={handleAddStudent} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaIdCard className="inline mr-2 text-emerald-600" />
              Student ID *
            </label>
            <input
              type="text"
              value={newStudentData.student_id}
              onChange={(e) => setNewStudentData({ ...newStudentData, student_id: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              placeholder="e.g., 2024-00001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUserGraduate className="inline mr-2 text-emerald-600" />
              Full Name *
            </label>
            <input
              type="text"
              value={newStudentData.student_name}
              onChange={(e) => setNewStudentData({ ...newStudentData, student_name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2 text-emerald-600" />
              Email
            </label>
            <input
              type="email"
              value={newStudentData.email}
              onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              placeholder="student@minsu.edu.ph"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaPhone className="inline mr-2 text-emerald-600" />
              Phone Number
            </label>
            <input
              type="tel"
              value={newStudentData.phone}
              onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              placeholder="09XX-XXX-XXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course *
            </label>
            <select
              value={newStudentData.course}
              onChange={(e) => setNewStudentData({ ...newStudentData, course: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              required
            >
              <option value="">Select Course</option>
              <option value="BS Computer Science">BS Computer Science</option>
              <option value="BS Information Technology">BS Information Technology</option>
              <option value="BS Business Administration">BS Business Administration</option>
              <option value="BS Accountancy">BS Accountancy</option>
              <option value="BS Education">BS Education</option>
              <option value="BS Engineering">BS Engineering</option>
              <option value="BS Nursing">BS Nursing</option>
              <option value="BS Psychology">BS Psychology</option>
              <option value="BS Agriculture">BS Agriculture</option>
              <option value="BS Criminology">BS Criminology</option>
              <option value="BS Hospitality Management">BS Hospitality Management</option>
              <option value="BS Tourism Management">BS Tourism Management</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Year Level *
            </label>
            <select
              value={newStudentData.year_level}
              onChange={(e) => setNewStudentData({ ...newStudentData, year_level: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false)
                setNewStudentData({
                  student_id: '',
                  student_name: '',
                  email: '',
                  phone: '',
                  course: '',
                  year_level: '1st Year'
                })
              }}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Add Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedStudent(null)
        }}
        title="Edit Student"
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Student ID</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{selectedStudent.student_id}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={selectedStudent.student_name}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, student_name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={selectedStudent.email || ''}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={selectedStudent.phone || ''}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, phone: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course *
              </label>
              <select
                value={selectedStudent.course}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, course: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                required
              >
                <option value="">Select Course</option>
                <option value="BS Computer Science">BS Computer Science</option>
                <option value="BS Information Technology">BS Information Technology</option>
                <option value="BS Business Administration">BS Business Administration</option>
                <option value="BS Accountancy">BS Accountancy</option>
                <option value="BS Education">BS Education</option>
                <option value="BS Engineering">BS Engineering</option>
                <option value="BS Nursing">BS Nursing</option>
                <option value="BS Psychology">BS Psychology</option>
                <option value="BS Agriculture">BS Agriculture</option>
                <option value="BS Criminology">BS Criminology</option>
                <option value="BS Hospitality Management">BS Hospitality Management</option>
                <option value="BS Tourism Management">BS Tourism Management</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year Level *
              </label>
              <select
                value={selectedStudent.year_level}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, year_level: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedStudent(null)
                }}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStudent}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Update Student
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedStudent(null)
        }}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to delete ${selectedStudent?.student_name}? This action cannot be undone.`}
        confirmText="Yes, Delete Student"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
