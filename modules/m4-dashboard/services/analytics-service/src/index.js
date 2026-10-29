// Module 4 — Dashboard & Analytics. Read-only: has no database of its own and builds
// the dashboard from the Case module's API.
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { requireAuth } from './lib/auth.js'
import { callService, errorHandler } from './lib/http.js'

const fetchCases = (token) => callService(process.env.CASE_SERVICE_URL, '/cases', { token })

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ service: 'analytics-service', status: 'ok' }))

app.use('/dashboard', requireAuth)

app.get('/dashboard', async (req, res) => {
  const cases = await fetchCases(req.token)
  res.json({
    stats: {
      totalCases: cases.length,
      pendingCases: cases.filter(c => c.status === 'pending').length,
      resolvedCases: cases.filter(c => c.status === 'resolved').length,
      activeCases: cases.filter(c => c.status === 'active').length,
    },
    recentCases: cases.slice(0, 10),
  })
})

app.use(errorHandler)

const PORT = process.env.PORT || 4006
app.listen(PORT, () => console.log(`analytics-service listening on :${PORT}`))
