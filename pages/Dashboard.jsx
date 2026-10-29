import { useState, useEffect } from 'react'
import { analyticsApi } from '@/lib/api'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import { FaChartBar, FaClock, FaSync, FaCheckCircle } from 'react-icons/fa'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    resolvedCases: 0,
    activeCases: 0,
  })
  const [recentCases, setRecentCases] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { stats, recentCases } = await analyticsApi.dashboard()
      setRecentCases(recentCases)
      setStats(stats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
    setLoading(false)
  }

  const columns = [
    {
      name: 'Case Number',
      selector: row => row.case_number,
      sortable: true,
      width: '140px',
      hide: 'sm',
      cell: row => <span className="font-semibold text-gray-900 text-xs sm:text-sm">{row.case_number}</span>
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      grow: 2,
      cell: row => (
        <div className="py-2">
          <p className="text-gray-700 line-clamp-2 text-xs sm:text-sm">{row.description}</p>
        </div>
      )
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      width: '100px',
      cell: row => (
        <span
          className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase ${row.status === 'pending'
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
          cursor: 'pointer',
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

  const statCards = [
    { label: 'Total Cases', value: stats.totalCases, color: 'bg-blue-500', icon: FaChartBar },
    { label: 'Pending Cases', value: stats.pendingCases, color: 'bg-yellow-500', icon: FaClock },
    { label: 'Active Cases', value: stats.activeCases, color: 'bg-orange-500', icon: FaSync },
    { label: 'Resolved Cases', value: stats.resolvedCases, color: 'bg-green-500', icon: FaCheckCircle },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Overview of disciplinary cases and activities</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-emerald-500 hover:shadow-xl transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center text-white self-end sm:self-auto`}>
                  <IconComponent className="text-xl sm:text-2xl" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Cases DataTable */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Cases</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Latest disciplinary case submissions</p>
          </div>
          <button
            onClick={() => navigate('/app/cases')}
            className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>View All</span>
            <span></span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : recentCases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">No cases reported yet</p>
            <p className="text-sm text-gray-400 mt-2">Cases will appear here once reported</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={recentCases}
            customStyles={customStyles}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[5, 10, 15]}
            highlightOnHover
            pointerOnHover
            onRowClicked={(row) => navigate('/app/cases')}
          />
        )}
      </div>
    </div>
  )
}
