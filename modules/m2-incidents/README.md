# Module 2 — Incident Reporting

**Owner:** Member 2

## What this module owns

| Service | Port | Provides | Calls |
|---|---|---|---|
| `services/incident-service` | 4003 | GET /incidents/students · POST /incidents · GET /incidents?student_id= | auth-service, student-service, case-service (`POST /cases/offenses`) |
| `services/student-service` | 4002 | GET/POST /students · GET/PUT/DELETE /students/:id | auth-service |

**Pages** (in `pages/`): StudentManagement.jsx · IncidentReport.jsx (not routed yet; the report form currently lives in CaseManagement.jsx)

Case Management (Module 3) and its Good Moral check read student records from `student-service`.

## Run it alone

```bash
cd services/incident-service
cp .env.example .env      # fill in the Firebase service-account values
npm install
npm run dev               # http://localhost:4003/health
```

## Rules

- Change only files inside this folder.
- Pages import the shared app shell through `@/`, for example `@/lib/api` and `@/components/Modal`. Ask the leader if you need a change there.
- Keep the endpoints in the table above working; other modules depend on them.
