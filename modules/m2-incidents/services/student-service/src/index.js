// Module 2 — Student Records. Owns the `students` collection (doc id = student_id).
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { FieldValue } from 'firebase-admin/firestore'
import { db, fromDoc } from './lib/firebase.js'
import { requireAuth } from './lib/auth.js'
import { HttpError, requireFields, errorHandler } from './lib/http.js'

const students = db.collection('students')
const EDITABLE = ['student_name', 'email', 'phone', 'course', 'year_level']
const pick = (body) => Object.fromEntries(EDITABLE.filter(k => body[k] !== undefined).map(k => [k, body[k]]))

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ service: 'student-service', status: 'ok' }))

app.use('/students', requireAuth)

app.get('/students', async (req, res) => {
  const snapshot = await students.get()
  res.json(snapshot.docs.map(fromDoc))
})

app.get('/students/:id', async (req, res) => {
  const snap = await students.doc(req.params.id).get()
  if (!snap.exists) throw new HttpError(404, 'Student not found')
  res.json(fromDoc(snap))
})

app.post('/students', async (req, res) => {
  requireFields(req.body, ['student_id', 'student_name'])
  const studentId = String(req.body.student_id).trim()
  const ref = students.doc(studentId)
  if ((await ref.get()).exists) throw new HttpError(409, `Student ${studentId} already exists`)

  await ref.set({
    student_id: studentId,
    ...pick(req.body),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  res.status(201).json(fromDoc(await ref.get()))
})

app.put('/students/:id', async (req, res) => {
  const ref = students.doc(req.params.id)
  if (!(await ref.get()).exists) throw new HttpError(404, 'Student not found')

  await ref.update({ ...pick(req.body), updatedAt: FieldValue.serverTimestamp() })
  res.json(fromDoc(await ref.get()))
})

app.delete('/students/:id', async (req, res) => {
  const ref = students.doc(req.params.id)
  if (!(await ref.get()).exists) throw new HttpError(404, 'Student not found')

  await ref.delete()
  res.status(204).end()
})

app.use(errorHandler)

const PORT = process.env.PORT || 4002
app.listen(PORT, () => console.log(`student-service listening on :${PORT}`))
