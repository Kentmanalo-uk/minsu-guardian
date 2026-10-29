import { useState, useEffect } from 'react'
import { incidentApi } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaUser, FaIdCard, FaExclamationTriangle, FaFileAlt, FaCalendar, FaMapMarkerAlt, FaUserTie, FaSearch } from 'react-icons/fa'
import Modal from '@/components/Modal'

export default function IncidentReport() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    violation_type: '',
    description: '',
    date_of_incident: '',
    location: '',
    reported_by: '',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [generatedCaseNumber, setGeneratedCaseNumber] = useState('')
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      // Students with their current offense counts (Incident service combines Students + Cases)
      setStudents(await incidentApi.students())
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    }
  }

  const handleStudentNameChange = (e) => {
    const value = e.target.value
    setFormData({ ...formData, student_name: value, violation_type: '' })
    
    if (value.length > 0) {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(value.toLowerCase()) ||
        student.id.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredStudents(filtered)
      setShowStudentDropdown(true)
    } else {
      // Show all students when input is empty
      setFilteredStudents(students)
      setShowStudentDropdown(students.length > 0)
    }
  }

  const handleStudentInputFocus = () => {
    // Show all students when focusing on the input
    if (formData.student_name.length === 0 && students.length > 0) {
      setFilteredStudents(students)
      setShowStudentDropdown(true)
    } else if (formData.student_name.length > 0) {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(formData.student_name.toLowerCase()) ||
        student.id.toLowerCase().includes(formData.student_name.toLowerCase())
      )
      setFilteredStudents(filtered)
      setShowStudentDropdown(true)
    }
  }

  const selectStudent = (student) => {
    // Calculate recommended offense level for this student
    const offenseLevel = student.offenseCount + 1
    const offenseText = offenseLevel === 1 ? '1st Offense' :
                       offenseLevel === 2 ? '2nd Offense' :
                       offenseLevel === 3 ? '3rd Offense' :
                       `${offenseLevel}th Offense`
    
    setFormData({
      ...formData,
      student_name: student.name,
      student_id: student.id,
      violation_type: offenseLevel <= 3 ? offenseText : '' // Auto-fill only if 1st-3rd
    })
    setShowStudentDropdown(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Incident service validates the student and adds the offense to their case
      const result = await incidentApi.report(formData)

      setGeneratedCaseNumber(result.case_number)
      setShowSuccessModal(true)
      toast.success(result.created
        ? `Incident reported successfully! Case #${result.case_number}`
        : `Case updated! ${formData.violation_type} added to Case #${result.case_number}`)

      // Redirect to case management after 2 seconds
      setTimeout(() => {
        navigate('/app/cases')
      }, 2000)
      
      setFormData({
        student_name: '',
        student_id: '',
        violation_type: '',
        description: '',
        date_of_incident: '',
        location: '',
        reported_by: '',
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error(error.message || 'Error submitting report. Please try again.')
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Report Incident</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Submit a new disciplinary case report</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Student Information Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FaUser className="text-emerald-600" />
            <span>Student Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleStudentNameChange}
                  onFocus={handleStudentInputFocus}
                  onBlur={() => {
                    // Delay hiding dropdown to allow click on items
                    setTimeout(() => setShowStudentDropdown(false), 200)
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Search or enter student name"
                  required
                  autoComplete="off"
                />
                
                {/* Dropdown */}
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-emerald-500 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredStudents.map((student, index) => {
                      const nextOffense = student.offenseCount + 1
                      const nextOffenseText = nextOffense === 1 ? '1st Offense' :
                                             nextOffense === 2 ? '2nd Offense' :
                                             nextOffense === 3 ? '3rd Offense' :
                                             `${nextOffense}th Offense`
                      const badgeColor = nextOffense === 1 ? 'bg-green-100 text-green-800' :
                                        nextOffense === 2 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                      
                      return (
                        <div
                          key={index}
                          onClick={() => selectStudent(student)}
                          className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <FaUser className="text-emerald-600 flex-shrink-0 mt-1" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                                <p className="text-xs text-gray-500">
                                  ID: {student.id}
                                  {student.course !== 'N/A' && ` • ${student.course}`}
                                  {student.year_level !== 'N/A' && ` • ${student.year_level}`}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {student.offenseCount} previous offense{student.offenseCount !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 ${badgeColor}`}>
                              Next: {nextOffenseText}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {showStudentDropdown && filteredStudents.length === 0 && formData.student_name.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4">
                    <p className="text-sm text-gray-500 text-center">
                      No students found. You can enter a new student name.
                    </p>
                  </div>
                )}
              </div>
              {students.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                   Click to see all students or start typing to search by name/ID
                </p>
              )}
              {students.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                   No students in database. Add students in Student Management first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID *
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="e.g., 2024-00001"
                required
              />
            </div>
          </div>
        </div>

        {/* Violation Details Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FaExclamationTriangle className="text-emerald-600" />
            <span>Violation Details</span>
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Offense Level *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaExclamationTriangle className="text-gray-400" />
                </div>
                <select
                  name="violation_type"
                  value={formData.violation_type}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none bg-white"
                  required
                >
                  <option value="">Select offense level</option>
                  <option value="1st Offense">1st Offense</option>
                  <option value="2nd Offense">2nd Offense</option>
                  <option value="3rd Offense">3rd Offense</option>
                </select>
              </div>
              {formData.student_name && students.some(s => s.name === formData.student_name) && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                   Recommended: {
                    (() => {
                      const student = students.find(s => s.name === formData.student_name)
                      const nextOffense = student ? student.offenseCount + 1 : 1
                      return nextOffense === 1 ? '1st Offense' :
                             nextOffense === 2 ? '2nd Offense' :
                             nextOffense === 3 ? '3rd Offense' :
                             `${nextOffense}th Offense`
                    })()
                  }
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FaFileAlt className="text-gray-400" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Provide detailed description of the incident..."
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Incident Information Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FaCalendar className="text-emerald-600" />
            <span>Incident Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Incident *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="date_of_incident"
                  value={formData.date_of_incident}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="e.g., Room 101, Library"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reporter Information Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FaUserTie className="text-emerald-600" />
            <span>Reporter Information</span>
          </h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reported By *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserTie className="text-gray-400" />
              </div>
              <input
                type="text"
                name="reported_by"
                value={formData.reported_by}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Your name"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t-2 border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              student_name: '',
              student_id: '',
              violation_type: '',
              description: '',
              date_of_incident: '',
              location: '',
              reported_by: '',
            })}
            className="px-6 py-3 sm:py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-base sm:text-lg transition-all transform hover:scale-105"
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Report Submitted Successfully"
        size="md"
      >
        <div className="text-center py-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Incident Reported Successfully!</h3>
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Case Number:</p>
            <p className="text-3xl font-bold text-emerald-600">{generatedCaseNumber}</p>
          </div>
          <p className="text-gray-700 mb-6">
            The incident has been recorded in the system. Redirecting to Case Management...
          </p>
          <button
            onClick={() => {
              setShowSuccessModal(false)
              navigate('/app/cases')
            }}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all transform hover:scale-105"
          >
            Go to Case Management
          </button>
        </div>
      </Modal>
    </div>
  )
}
