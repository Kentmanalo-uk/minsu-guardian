# MinSU-Guardian-Report

## Module 5 — Reports and Records

**Owner:** Member 5

## What this module owns

| Service | Port | Provides | Calls |
|---|---|---|---|
| `services/report-service` | 4005 | GET /reports/analytics · GET /reports/export.csv | auth-service, case-service (`GET /cases`) |

**Pages** (in `pages/`): Reports.jsx

Read-only: this service has no database of its own. Filtering by date, status and violation type is part of this module’s scope but is not implemented yet.

## Run it alone

```bash
cd services/report-service
cp .env.example .env      # fill in the Firebase service-account values
npm install
npm run dev               # http://localhost:4005/health
```

## Rules

- Change only files inside this folder.
- Pages import the shared app shell through `@/`, for example `@/lib/api` and `@/components/Modal`. Ask the leader if you need a change there.
- Keep the endpoints in the table above working; other modules depend on them.
