# Module 3 — Disciplinary Case Management

**Owner:** Member 3

## What this module owns

| Service | Port | Provides | Calls |
|---|---|---|---|
| `services/case-service` | 4004 | GET /cases · GET /cases/:id · PATCH /cases/:id/status · POST /cases/merge-duplicates · GET /cases/good-moral/:studentId · POST /cases/offenses · GET /cases/offense-counts | auth-service, student-service |

**Pages** (in `pages/`): CaseManagement.jsx (case table, details, status, Good Moral print, report form)

Modules 2, 4 and 5 depend on this service: incident-service records offenses through it, and analytics-service and report-service read `GET /cases`. Do not change the `GET /cases` response fields without telling them.

## Run it alone

```bash
cd services/case-service
cp .env.example .env      # fill in the Firebase service-account values
npm install
npm run dev               # http://localhost:4004/health
```

## Rules

- Change only files inside this folder.
- Pages import the shared app shell through `@/`, for example `@/lib/api` and `@/components/Modal`. Ask the leader if you need a change there.
- Keep the endpoints in the table above working; other modules depend on them.
