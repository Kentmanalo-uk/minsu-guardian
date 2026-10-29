# Module 1 — User Authentication and Access Control

**Owner:** Member 1

## What this module owns

| Service | Port | Provides | Calls |
|---|---|---|---|
| `services/auth-service` | 4001 | GET /auth/me · GET /auth/verify · POST /auth/register · GET/POST /users · PATCH /users/:id/role · PATCH /users/:id/archive (admin) | — |

**Pages** (in `pages/`): Landing.jsx (login, register, reset password) · UserManagement.jsx · Login.jsx, Register.jsx (not routed yet)

Every other service calls `GET /auth/verify` to check the caller, so keep that response shape stable: `{ uid, email, fullName, role }`.

## Run it alone

```bash
cd services/auth-service
cp .env.example .env      # fill in the Firebase service-account values
npm install
npm run dev               # http://localhost:4001/health
```

## Rules

- Change only files inside this folder.
- Pages import the shared app shell through `@/`, for example `@/lib/api` and `@/components/Modal`. Ask the leader if you need a change there.
- Keep the endpoints in the table above working; other modules depend on them.
