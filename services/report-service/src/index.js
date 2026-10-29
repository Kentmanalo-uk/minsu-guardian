// Module 5 — Reports & Records. Read-only: has no database of its own and builds
// reports and CSV exports from the Case module's API.
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { requireAuth } from './lib/auth.js'
import { callService, errorHandler } from './lib/http.js'

const fetchCases = (token) => callService(process.env.CASE_SERVICE_URL, '/cases', { token })

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ service: 'report-service', status: 'ok' }))

app.use('/reports', requireAuth)

app.get('/reports/analytics', async (req, res) => {
  const cases = await fetchCases(req.token)

  const byStatus = {}
  const byViolationType = {}
  const monthly = {}
  const byStudent = {}

  cases.forEach(case_ => {
    byStatus[case_.status] = (byStatus[case_.status] || 0) + 1
    byViolationType[case_.violation_type] = (byViolationType[case_.violation_type] || 0) + 1

    const date = new Date(case_.date_of_incident)
    if (!isNaN(date)) {
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      ;(monthly[month] ||= { month, cases: 0 }).cases++
    }

    const student = (byStudent[case_.student_id] ||= { name: case_.student_name, count: 0, eligible: true })
    student.count += case_.violationCount
    student.eligible = student.eligible && case_.isEligibleForGoodMoral
  })

  res.json({
    totalCases: cases.length,
    byStatus,
    byViolationType,
    recentActivity: cases.slice(0, 10),
    monthlyTrend: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)),
    studentViolations: Object.values(byStudent).sort((a, b) => b.count - a.count).slice(0, 10),
  })
})

const csvCell = (value) => {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

app.get('/reports/export.csv', async (req, res) => {
  const cases = await fetchCases(req.token)
  const rows = [
    ['Case Number', 'Student Name', 'Student ID', 'Violation Type', 'Offenses', 'Status', 'Date'],
    ...cases.map(c => [c.case_number, c.student_name, c.student_id, c.violation_type, c.violationCount, c.status, c.date_of_incident]),
  ]

  res.type('text/csv')
  res.attachment(`disciplinary-report-${new Date().toISOString().split('T')[0]}.csv`)
  res.send(rows.map(row => row.map(csvCell).join(',')).join('\n'))
})

app.use(errorHandler)

const PORT = process.env.PORT || 4005
app.listen(PORT, () => console.log(`report-service listening on :${PORT}`))
