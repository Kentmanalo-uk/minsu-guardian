# Module 4 — Dashboard and Analytics

**Owner:** Member 4

## What this module owns

| Service | Port | Provides | Calls |
|---|---|---|---|
| `services/analytics-service` | 4006 | GET /dashboard | auth-service, case-service (`GET /cases`) |

**Pages** (in `pages/`): Dashboard.jsx

Read-only: this service has no database of its own.

## Run it alone

```bash
cd services/analytics-service
cp .env.example .env      # fill in the Firebase service-account values
npm install
npm run dev               # http://localhost:4006/health
```

## Rules

- Change only files inside this folder.
- Pages import the shared app shell through `@/`, for example `@/lib/api` and `@/components/Modal`. Ask the leader if you need a change there.
- Keep the endpoints in the table above working; other modules depend on them.
