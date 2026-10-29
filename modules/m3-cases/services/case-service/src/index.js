// Module 4 — Case Management & Sanctions. Owns the `disciplinary_cases` collection:
// one case per student, with every offense kept in `offense_history`.
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { FieldValue } from 'firebase-admin/firestore'
import { db, fromDoc } from './lib/firebase.js'
import { requireAuth } from './lib/auth.js'
import { HttpError, callService, requireFields, errorHandler } from './lib/http.js'

const cases = db.collection('disciplinary_cases')
const STATUSES = ['pending', 'active', 'resolved']
const GOOD_MORAL_MAX_OFFENSES = 2 // Only 1st and 2nd offense are eligible

const ordinal = (n) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} Offense`

// Offense level and good-moral eligibility, derived from the stored case
function withOffenseInfo(case_) {
  let offenseCount = case_.offense_count || 1
  const offenseLevel = case_.violation_type || '1st Offense'
  const offenseMatch = offenseLevel.match(/(\d+)(st|nd|rd|th)/)
  if (offenseMatch) offenseCount = parseInt(offenseMatch[1])

  return {
    ...case_,
    violationCount: offenseCount,
    offenseNumber: offenseCount,
    offenseLevel,
    isEligibleForGoodMoral: offenseCount <= GOOD_MORAL_MAX_OFFENSES,
  }
}

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ service: 'case-service', status: 'ok' }))

app.use('/cases', requireAuth)

// ?status=pending|active|resolved  ?limit=10
app.get('/cases', async (req, res) => {
  let q = cases.orderBy('created_at', 'desc')
  if (req.query.status) q = q.where('status', '==', req.query.status)
  if (req.query.limit) q = q.limit(Math.min(parseInt(req.query.limit) || 10, 500))

  const snapshot = await q.get()
  res.json(snapshot.docs.map(d => withOffenseInfo(fromDoc(d))))
})

// { [student_id]: number of offenses so far } — used to suggest the next offense level
app.get('/cases/offense-counts', async (req, res) => {
  const snapshot = await cases.get()
  const counts = {}
  snapshot.docs.forEach(d => {
    const { student_id, offense_count } = d.data()
    counts[student_id] = (counts[student_id] || 0) + (offense_count || 1)
  })
  res.json(counts)
})

// Good-moral certificate check: combines this module's case data with the Student module's record
app.get('/cases/good-moral/:studentId', async (req, res) => {
  const { studentId } = req.params
  const snapshot = await cases.where('student_id', '==', studentId).limit(1).get()
  const case_ = snapshot.empty ? null : withOffenseInfo(fromDoc(snapshot.docs[0]))

  let student = null
  try {
    student = await callService(process.env.STUDENT_SERVICE_URL, `/students/${encodeURIComponent(studentId)}`, { token: req.token })
  } catch (err) {
    if (err.status !== 404) throw err
  }
  if (!student && !case_) throw new HttpError(404, 'Student not found')

  res.json({
    student_id: studentId,
    student_name: student?.student_name || case_.student_name,
    course: student?.course || null,
    year_level: student?.year_level || null,
    offenseCount: case_?.offenseNumber || 0,
    offenseLevel: case_?.offenseLevel || null,
    eligible: case_ ? case_.isEligibleForGoodMoral : true,
  })
})

app.get('/cases/:id', async (req, res) => {
  const snap = await cases.doc(req.params.id).get()
  if (!snap.exists) throw new HttpError(404, 'Case not found')
  res.json(withOffenseInfo(fromDoc(snap)))
})

// Record an offense: appended to the student's existing case, or opens a new one.
// Called by the Incident module.
app.post('/cases/offenses', async (req, res) => {
  requireFields(req.body, ['student_id', 'student_name', 'violation_type', 'description', 'date_of_incident', 'location', 'reported_by'])
  const { student_id, student_name, violation_type, description, date_of_incident, location, reported_by } = req.body
  const offense = { offense_level: violation_type, description, date_of_incident, location, reported_by, reported_at: new Date() }

  const result = await db.runTransaction(async (tx) => {
    const existing = await tx.get(cases.where('student_id', '==', student_id).limit(1))

    if (!existing.empty) {
      const doc = existing.docs[0]
      const data = doc.data()
      const offenseHistory = [...(data.offense_history || []), offense]
      tx.update(doc.ref, {
        violation_type,
        description,
        date_of_incident,
        location,
        reported_by,
        offense_history: offenseHistory,
        offense_count: offenseHistory.length,
        status: 'pending',
        updated_at: FieldValue.serverTimestamp(),
      })
      return { id: doc.id, case_number: data.case_number, offense_count: offenseHistory.length, created: false }
    }

    const ref = cases.doc()
    const case_number = `CASE-${Date.now()}`
    tx.set(ref, {
      case_number,
      student_name,
      student_id,
      violation_type,
      description,
      date_of_incident,
      location,
      reported_by,
      offense_history: [offense],
      offense_count: 1,
      status: 'pending',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    })
    return { id: ref.id, case_number, offense_count: 1, created: true }
  })

  res.status(result.created ? 201 : 200).json({ ...result, violation_type })
})

app.patch('/cases/:id/status', async (req, res) => {
  const { status } = req.body
  if (!STATUSES.includes(status)) throw new HttpError(400, `Status must be one of: ${STATUSES.join(', ')}`)
  const ref = cases.doc(req.params.id)
  if (!(await ref.get()).exists) throw new HttpError(404, 'Case not found')

  await ref.update({ status, updated_at: FieldValue.serverTimestamp() })
  res.json(withOffenseInfo(fromDoc(await ref.get())))
})

// Collapse multiple cases for the same student into their oldest case
app.post('/cases/merge-duplicates', async (req, res) => {
  const snapshot = await cases.orderBy('created_at', 'asc').get()
  const byStudent = {}
  snapshot.docs.forEach(d => {
    const data = d.data()
    ;(byStudent[data.student_id] ||= []).push({ id: d.id, ...data })
  })

  let mergedCount = 0
  for (const studentCases of Object.values(byStudent)) {
    if (studentCases.length < 2) continue

    const [mainCase, ...duplicates] = studentCases
    const latestCase = studentCases[studentCases.length - 1]
    const offenseCount = studentCases.length
    const offenseHistory = studentCases.map((case_, index) => ({
      offense_level: case_.violation_type || ordinal(index + 1),
      description: case_.description,
      date_of_incident: case_.date_of_incident,
      location: case_.location,
      reported_by: case_.reported_by,
      reported_at: case_.created_at?.toDate?.() || new Date(),
    }))

    const batch = db.batch()
    batch.update(cases.doc(mainCase.id), {
      violation_type: latestCase.violation_type || ordinal(offenseCount),
      description: latestCase.description,
      date_of_incident: latestCase.date_of_incident,
      location: latestCase.location,
      reported_by: latestCase.reported_by,
      offense_history: offenseHistory,
      offense_count: offenseCount,
      status: latestCase.status,
      updated_at: FieldValue.serverTimestamp(),
    })
    duplicates.forEach(dup => batch.delete(cases.doc(dup.id)))
    await batch.commit()
    mergedCount++
  }

  res.json({ mergedCount })
})

app.use(errorHandler)

const PORT = process.env.PORT || 4004
app.listen(PORT, () => console.log(`case-service listening on :${PORT}`))
