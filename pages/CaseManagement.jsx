import { useState, useEffect } from 'react'
import { caseApi, incidentApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Modal, { ConfirmModal } from '@/components/Modal'
import DataTable from 'react-data-table-component'
import { FaEye, FaFilter, FaPrint, FaBroom, FaPlus, FaUser, FaIdCard, FaExclamationTriangle, FaFileAlt, FaCalendar, FaMapMarkerAlt, FaUserTie, FaSearch } from 'react-icons/fa'

export default function CaseManagement() {
  const [cases, setCases] = useState([])
  const [filteredCases, setFilteredCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null)
  const [mergingCases, setMergingCases] = useState(false)
  
  // Report Incident Modal States
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    violation_type: '',
    description: '',
    date_of_incident: '',
    location: '',
    reported_by: '',
  })

  useEffect(() => {
    fetchCases()
  }, [])

  useEffect(() => {
    if (filter === 'all') {
      setFilteredCases(cases)
    } else {
      setFilteredCases(cases.filter(c => c.status === filter))
    }
  }, [filter, cases])

  const fetchCases = async () => {
    setLoading(true)
    try {
      // Offense level and good-moral eligibility are computed by the Case service
      const casesData = await caseApi.list()
      setCases(casesData)
      setFilteredCases(casesData)
    } catch (error) {
      console.error('Error fetching cases:', error)
    }
    setLoading(false)
  }

  const updateCaseStatus = async (caseId, newStatus) => {
    try {
      await caseApi.updateStatus(caseId, newStatus)
      toast.success(`Case status updated to ${newStatus}!`)
      fetchCases()
      setShowDetailsModal(false)
      setSelectedCase(null)
    } catch (error) {
      console.error('Error updating case:', error)
      toast.error('Error updating case status. Please try again.')
    }
  }

  const handleStatusChange = (caseId, newStatus) => {
    setPendingStatusUpdate({ caseId, newStatus })
    setShowConfirmModal(true)
  }

  const confirmStatusChange = () => {
    if (pendingStatusUpdate) {
      updateCaseStatus(pendingStatusUpdate.caseId, pendingStatusUpdate.newStatus)
      setPendingStatusUpdate(null)
    }
  }

  const openCaseDetails = (case_) => {
    setSelectedCase(case_)
    setShowDetailsModal(true)
  }

  const mergeDuplicateCases = async () => {
    setMergingCases(true)
    try {
      const { mergedCount } = await caseApi.mergeDuplicates()
      toast.success(`Successfully merged cases for ${mergedCount} students!`)
      fetchCases() // Refresh the table
    } catch (error) {
      console.error('Error merging cases:', error)
      toast.error('Failed to merge cases. Please try again.')
    }
    setMergingCases(false)
  }

  // Report Incident Functions
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
      setFilteredStudents(students)
      setShowStudentDropdown(students.length > 0)
    }
  }

  const selectStudent = (student) => {
    const offenseLevel = student.offenseCount + 1
    const offenseText = offenseLevel === 1 ? '1st Offense' :
                       offenseLevel === 2 ? '2nd Offense' :
                       offenseLevel === 3 ? '3rd Offense' :
                       `${offenseLevel}th Offense`
    
    setFormData({
      ...formData,
      student_name: student.name,
      student_id: student.id,
      violation_type: offenseLevel <= 3 ? offenseText : ''
    })
    setShowStudentDropdown(false)
  }

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setReportLoading(true)

    try {
      // Incident service validates the student and adds the offense to their case
      const result = await incidentApi.report(formData)

      if (result.created) {
        toast.success(`Incident reported successfully! Case #${result.case_number}`)
      } else {
        toast.success(`Case updated! ${formData.violation_type} added`)
      }
      
      setFormData({
        student_name: '',
        student_id: '',
        violation_type: '',
        description: '',
        date_of_incident: '',
        location: '',
        reported_by: '',
      })
      setShowReportModal(false)
      fetchCases()
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error(error.message || 'Error submitting report. Please try again.')
    }

    setReportLoading(false)
  }

  const handleReportChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const openReportModal = () => {
    fetchStudents()
    setShowReportModal(true)
  }

  const printGoodMoralCertificate = async (studentCase) => {
    // Open the window before awaiting so popup blockers treat it as part of the click
    const printWindow = window.open('', '_blank')

    try {
      const goodMoral = await caseApi.goodMoral(studentCase.student_id)
      if (!goodMoral.eligible) {
        printWindow.close()
        toast.error(`${goodMoral.student_name} is not eligible for a Good Moral Certificate`)
        return
      }
    } catch (error) {
      printWindow.close()
      toast.error(error.message || 'Could not verify Good Moral eligibility')
      return
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Good Moral Certificate - ${studentCase.student_name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            background: white;
            padding: 20px;
          }
          
          .certificate {
            max-width: 800px;
            margin: 0 auto;
            border: 8px double #10b981;
            padding: 30px;
            position: relative;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
          }
          
          .university-name {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 5px;
          }
          
          .campus-name {
            font-size: 16px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .office-name {
            font-size: 14px;
            color: #888;
            font-style: italic;
          }
          
          .certificate-title {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #10b981;
            margin: 30px 0 25px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .content {
            text-align: justify;
            line-height: 1.8;
            font-size: 15px;
            margin: 25px 0;
          }
          
          .student-name {
            font-size: 22px;
            font-weight: bold;
            color: #10b981;
            text-decoration: underline;
            text-align: center;
            margin: 20px 0;
          }
          
          .student-id {
            text-align: center;
            font-size: 16px;
            color: #666;
            margin-bottom: 25px;
          }
          
          .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
          }
          
          .signature-block {
            text-align: center;
            flex: 1;
            min-width: 200px;
          }
          
          .signature-line {
            border-top: 2px solid #000;
            margin-top: 50px;
            padding-top: 8px;
            font-weight: bold;
            font-size: 13px;
          }
          
          .signature-title {
            font-size: 13px;
            color: #666;
            margin-top: 5px;
          }
          
          .date {
            text-align: right;
            margin-top: 30px;
            font-style: italic;
            font-size: 14px;
          }
          
          .seal {
            position: absolute;
            bottom: 80px;
            left: 50px;
            width: 100px;
            height: 100px;
            border: 3px solid #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            text-align: center;
            color: #10b981;
            font-weight: bold;
            transform: rotate(-15deg);
            line-height: 1.2;
          }
          
          /* Mobile Responsive */
          @media screen and (max-width: 768px) {
            body {
              padding: 10px;
            }
            
            .certificate {
              padding: 20px;
              border-width: 5px;
            }
            
            .logo {
              width: 60px;
              height: 60px;
              font-size: 30px;
            }
            
            .university-name {
              font-size: 18px;
            }
            
            .campus-name {
              font-size: 14px;
            }
            
            .office-name {
              font-size: 12px;
            }
            
            .certificate-title {
              font-size: 20px;
              letter-spacing: 1px;
            }
            
            .content {
              font-size: 13px;
              line-height: 1.6;
            }
            
            .student-name {
              font-size: 18px;
            }
            
            .student-id {
              font-size: 14px;
            }
            
            .footer {
              flex-direction: column;
            }
            
            .signature-block {
              width: 100%;
            }
            
            .signature-line {
              margin-top: 40px;
              font-size: 12px;
            }
            
            .seal {
              width: 80px;
              height: 80px;
              font-size: 9px;
              left: 30px;
              bottom: 60px;
            }
          }
          
          /* Print Styles */
          @media print {
            body {
              padding: 0;
            }
            
            .certificate {
              border-width: 6px;
              page-break-inside: avoid;
            }
            
            @page {
              size: A4;
              margin: 15mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="logo"></div>
            <div class="university-name">MINDORO STATE UNIVERSITY</div>
            <div class="campus-name">Bongabong Campus</div>
            <div class="office-name">Office of Student Affairs</div>
          </div>
          
          <div class="certificate-title">Certificate of Good Moral Character</div>
          
          <div class="content">
            <p style="text-indent: 30px;">
              This is to certify that <strong>${studentCase.student_name}</strong>, 
              a bonafide student of Mindoro State University - Bongabong Campus, 
              has demonstrated good moral character and conduct during their stay in this institution.
            </p>
          </div>
          
          <div class="student-name">${studentCase.student_name}</div>
          <div class="student-id">Student ID: ${studentCase.student_id}</div>
          
          <div class="content">
            <p style="text-indent: 30px;">
              Based on our records, the above-named student has maintained satisfactory 
              disciplinary standing and has shown respect for university rules and regulations. 
              This certificate is issued upon request for whatever legal purpose it may serve.
            </p>
          </div>
          
          <div class="date">Issued this ${currentDate}</div>
          
          <div class="footer">
            <div class="signature-block">
              <div class="signature-line">_______________________</div>
              <div class="signature-title">Discipline Officer</div>
            </div>
            <div class="signature-block">
              <div class="signature-line">_______________________</div>
              <div class="signature-title">Director, Student Affairs</div>
            </div>
          </div>
          
          <div class="seal">OFFICIAL<br/>SEAL<br/>MinSU</div>
        </div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Trigger print dialog after content loads
    printWindow.onload = function() {
      printWindow.print()
    }
    
    toast.success('Certificate ready for printing/PDF export')
  }
  const columns = [
    {
      name: 'Case Number',
      selector: row => row.case_number,
      sortable: true,
      width: '160px',
      cell: row => <span className="font-semibold text-gray-900">{row.case_number}</span>
    },
    {
      name: 'Student Name',
      selector: row => row.student_name,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Offense',
      selector: row => row.offenseLevel,
      sortable: true,
      width: '120px',
      center: true,
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          row.offenseNumber === 1 
            ? 'bg-green-100 text-green-800' 
            : row.offenseNumber === 2 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.offenseLevel}
        </span>
      ),
    },
    {
      name: 'Good Moral',
      selector: row => row.isEligibleForGoodMoral,
      sortable: true,
      width: '140px',
      center: true,
      cell: row => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          row.isEligibleForGoodMoral 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.isEligibleForGoodMoral ? 'Eligible' : 'Not Eligible'}
        </span>
      ),
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      width: '110px',
      center: true,
      cell: row => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
            row.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : row.status === 'active'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: 'Actions',
      width: '100px',
      center: true,
      cell: row => (
        <button
          onClick={() => openCaseDetails(row)}
          className="flex items-center justify-center space-x-1 px-2 sm:px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          title="View Details"
        >
          <FaEye className="text-sm sm:text-base" />
          <span className="text-xs sm:text-sm font-medium">View</span>
        </button>
      ),
    },
  ]

  const customStyles = {
    table: {
      style: {
        width: '100%',
      },
    },
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Case Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Review and manage disciplinary cases</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={openReportModal}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all text-sm"
            title="Report new incident"
          >
            <FaPlus />
            <span>Report Incident</span>
          </button>
          <button
            onClick={mergeDuplicateCases}
            disabled={mergingCases}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="Merge duplicate cases for same students"
          >
            <FaBroom />
            <span>{mergingCases ? 'Merging...' : 'Clean Up Duplicates'}</span>
          </button>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
            <FaFilter className="text-gray-500 flex-shrink-0" />
            {['all', 'pending', 'active', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium text-lg mb-2">No cases found</p>
            <p className="text-sm text-gray-400 mt-2">
              {filter === 'all' ? 'No cases have been reported yet' : `No ${filter} cases found`}
            </p>
          </div>
        ) : (
          <div className="w-full">
            <DataTable
              columns={columns}
              data={filteredCases}
              customStyles={customStyles}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              highlightOnHover
              responsive
              noDataComponent={<div className="p-4">No records found</div>}
            />
          </div>
        )}
      </div>

      {/* Case Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedCase(null)
        }}
        title="Case Details"
        size="lg"
      >
        {selectedCase && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Case Number</p>
                  <p className="text-xl font-bold text-gray-900">{selectedCase.case_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      selectedCase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedCase.status === 'active'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedCase.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offense Level</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold mt-1 ${
                    selectedCase.violationCount === 1 
                      ? 'bg-green-100 text-green-800' 
                      : selectedCase.violationCount === 2 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCase.offenseLevel}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Good Moral Status</p>
                  <span className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold mt-1 ${
                    selectedCase.isEligibleForGoodMoral 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCase.isEligibleForGoodMoral ? 'Eligible' : 'Not Eligible'}
                  </span>
                </div>
              </div>
            </div>

            {!selectedCase.isEligibleForGoodMoral && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div>
                  <h4 className="font-bold text-red-900 mb-1">Good Moral Certificate Not Available</h4>
                  <p className="text-sm text-red-700">
                    This student has reached their {selectedCase.offenseLevel} and is not eligible for a Good Moral Certificate. 
                    Students must have 1st or 2nd offense only to be eligible.
                  </p>
                </div>
              </div>
            )}

            {selectedCase.isEligibleForGoodMoral && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-green-900 mb-1">Eligible for Good Moral Certificate</h4>
                    <p className="text-sm text-green-700">
                      This student is on their {selectedCase.offenseLevel} and is eligible to receive a Good Moral Certificate.
                    </p>
                  </div>
                  <button
                    onClick={() => printGoodMoralCertificate(selectedCase)}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto flex-shrink-0"
                  >
                    <FaPrint className="text-lg" />
                    <span className="whitespace-nowrap">Print Certificate</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Student Name</p>
                <p className="text-lg font-semibold text-gray-900">{selectedCase.student_name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Student ID</p>
                <p className="text-lg font-semibold text-gray-900">{selectedCase.student_id}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Offense Level</p>
              <p className="text-lg font-semibold text-gray-900">{selectedCase.violation_type}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
              <p className="text-gray-900 leading-relaxed">{selectedCase.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Date of Incident</p>
                <p className="text-gray-900 font-medium">{selectedCase.date_of_incident}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                <p className="text-gray-900 font-medium">{selectedCase.location}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Reported By</p>
              <p className="text-gray-900 font-medium">{selectedCase.reported_by}</p>
            </div>

            {/* Offense History */}
            {selectedCase.offense_history && selectedCase.offense_history.length > 1 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-blue-900 mb-3">
                  Offense History ({selectedCase.offense_history.length} total offenses)
                </h4>
                <div className="space-y-3">
                  {selectedCase.offense_history.map((offense, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          index + 1 === 1 ? 'bg-green-100 text-green-800' :
                          index + 1 === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {offense.offense_level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {offense.date_of_incident}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{offense.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{offense.location}</span>
                        <span>{offense.reported_by}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-4">Update Case Status</p>
              <div className="flex space-x-3">
                {selectedCase.status !== 'active' && (
                  <button
                    onClick={() => handleStatusChange(selectedCase.id, 'active')}
                    className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Mark as Active
                  </button>
                )}
                {selectedCase.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusChange(selectedCase.id, 'resolved')}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Status Change Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setPendingStatusUpdate(null)
        }}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
        message={`Are you sure you want to change the case status to "${pendingStatusUpdate?.newStatus}"? This action will be recorded in the system.`}
        confirmText="Yes, Update Status"
        cancelText="Cancel"
        type="info"
      />

      {/* Report Incident Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setFormData({
            student_name: '',
            student_id: '',
            violation_type: '',
            description: '',
            date_of_incident: '',
            location: '',
            reported_by: '',
          })
        }}
        title="Report New Incident"
        size="lg"
      >
        <form onSubmit={handleReportSubmit} className="space-y-6">
          {/* Student Information */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleStudentNameChange}
                    onFocus={() => {
                      if (formData.student_name.length === 0 && students.length > 0) {
                        setFilteredStudents(students)
                        setShowStudentDropdown(true)
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Search or enter student name"
                    required
                    autoComplete="off"
                  />
                  {showStudentDropdown && filteredStudents.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-emerald-500 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                            className="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                                <p className="text-xs text-gray-500">ID: {student.id} • {student.offenseCount} offense(s)</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                                Next: {nextOffenseText}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID *</label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleReportChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., 2024-00001"
                  required
                />
              </div>
            </div>
          </div>

          {/* Violation Details */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Violation Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Offense Level *</label>
                <select
                  name="violation_type"
                  value={formData.violation_type}
                  onChange={handleReportChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select offense level</option>
                  <option value="1st Offense">1st Offense</option>
                  <option value="2nd Offense">2nd Offense</option>
                  <option value="3rd Offense">3rd Offense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleReportChange}
                  rows="4"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="Provide detailed description of the incident..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Incident Information */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Incident Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Incident *</label>
                <input
                  type="date"
                  name="date_of_incident"
                  value={formData.date_of_incident}
                  onChange={handleReportChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleReportChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Room 101, Library"
                  required
                />
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-3">Reporter Information</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reported By *</label>
              <input
                type="text"
                name="reported_by"
                value={formData.reported_by}
                onChange={handleReportChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Your name"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowReportModal(false)
                setFormData({
                  student_name: '',
                  student_id: '',
                  violation_type: '',
                  description: '',
                  date_of_incident: '',
                  location: '',
                  reported_by: '',
                })
              }}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reportLoading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {reportLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
