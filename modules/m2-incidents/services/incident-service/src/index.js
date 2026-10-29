// Module 3 — Incident Reporting. Takes a report, checks the student with the Student module,
// records the offense through the Case module, and keeps its own `incidents` log.
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { FieldValue } from 'firebase-admin/firestore'
import { db, fromDoc } from './lib/firebase.js'
import { requireAuth } from './lib/auth.js'
import { HttpError, callService, requireFields, errorHandler } from './lib/http.js'

const incidents = db.collection('incidents')
const { STUDENT_SERVICE_URL, CASE_SERVICE_URL } = process.env

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ service: 'incident-service', status: 'ok' }))

app.use('/incidents', requireAuth)

// Students for the report form, with how many offenses each already has
app.get('/incidents/students', async (req, res) => {
  const [students, offenseCounts] = await Promise.all([
    callService(STUDENT_SERVICE_URL, '/students', { token: req.token }),
    callService(CASE_SERVICE_URL, '/cases/offense-counts', { token: req.token }),
  ])

  res.json(students.map(s => ({
    name: s.student_name,
    id: s.student_id,
    course: s.course,
    year_level: s.year_level,
    offenseCount: offenseCounts[s.student_id] || 0,
  })))
})

app.post('/incidents', async (req, res) => {
  requireFields(req.body, ['student_id', 'violation_type', 'description', 'date_of_incident', 'location', 'reported_by'])
  const { student_id, violation_type, description, date_of_incident, location, reported_by } = req.body

  let student
  try {
    student = await callService(STUDENT_SERVICE_URL, `/students/${encodeURIComponent(student_id)}`, { token: req.token })
  } catch (err) {
    if (err.status === 404) throw new HttpError(404, `Student ${student_id} is not registered. Add them under Students first.`)
    throw err
  }

  const caseResult = await callService(CASE_SERVICE_URL, '/cases/offenses', {
    method: 'POST',
    token: req.token,
    body: {
      student_id,
      student_name: student.student_name,
      violation_type,
      description,
      date_of_incident,
      location,
      reported_by,
    },
  })

  const ref = await incidents.add({
    student_id,
    student_name: student.student_name,
    violation_type,
    description,
    date_of_incident,
    location,
    reported_by,
    case_id: caseResult.id,
    case_number: caseResult.case_number,
    submitted_by: req.user.uid,
    created_at: FieldValue.serverTimestamp(),
  })

  res.status(201).json({ incident_id: ref.id, ...caseResult })
})

// ?student_id=  — incident log, newest first
app.get('/incidents', async (req, res) => {
  const q = req.query.student_id ? incidents.where('student_id', '==', req.query.student_id) : incidents
  const snapshot = await q.get()
  const list = snapshot.docs.map(fromDoc)
  list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  res.json(list)
})

app.use(errorHandler)

const PORT = process.env.PORT || 4003
app.listen(PORT, () => console.log(`incident-service listening on :${PORT}`))
