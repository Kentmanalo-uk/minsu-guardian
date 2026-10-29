# MinSU Disciplinary — Modules

The app is split into five modules, one per team member. Each folder here is also its own GitHub repo; this leader repo pulls them in with `git subtree` and adds the shared shell (`src/`) around them.

| Folder | Module | Owner | Services (port) | Pages |
|---|---|---|---|---|
| `m1-auth` | 1. User Authentication and Access Control | Member 1 | auth-service (4001) | Landing, UserManagement |
| `m2-incidents` | 2. Incident Reporting | Mike Fernandez ([repo](https://github.com/mike7fnd/incident-reporting)) | incident-service (4003), student-service (4002) | StudentManagement, IncidentReport |
| `m3-cases` | 3. Disciplinary Case Management | Kent Rolan O. Manalo (leader; worked on directly in this repo) | case-service (4004) | CaseManagement |
| `m4-dashboard` | 4. Dashboard and Analytics | Kyle Emanuel Q. Magsino ([repo](https://github.com/Kyle1215-Magsino/MinSU-Guardian)) | analytics-service (4006) | Dashboard |
| `m5-reports` | 5. Reports and Records | John Paul Rodriguez Quisto ([repo](https://github.com/johnpaulquisto10/MinSU-Guardian-Report)) | report-service (4005) | Reports |

The **leader** owns everything outside `modules/`: `src/App.jsx` (routes), `src/components/Layout.jsx` (menu), `src/lib/api.js`, `src/lib/firebase.js`, the root `package.json` and deployment.

## How the modules talk

Modules never import each other's code. They only call each other's APIs over HTTP:

- The browser signs in with Firebase and sends the ID token as `Authorization: Bearer <token>` on every call.
- Every service checks that token with `GET /auth/verify` on auth-service.
- incident-service → student-service (does the student exist?) → case-service (`POST /cases/offenses`).
- case-service → student-service (Good Moral details).
- analytics-service and report-service → case-service (`GET /cases`).

Service addresses come from env variables (`AUTH_SERVICE_URL`, `STUDENT_SERVICE_URL`, `CASE_SERVICE_URL`), so each one can be deployed separately.

## Run the whole app (leader repo)

```bash
npm install          # installs the frontend and all six services (npm workspaces)
npm run dev:all      # web on :5173 + all services
```

Each service needs its own `.env` (copy its `.env.example`).

## Git workflow

### Leader: create the five member repos from this repo (once)

```bash
# for each module, e.g. m3-cases:
git subtree split --prefix=modules/m3-cases -b split/m3-cases
git push https://github.com/<team>/minsu-m3-cases.git split/m3-cases:main
```

### Leader: connect the member repos (once)

```bash
git remote add m3 https://github.com/<team>/minsu-m3-cases.git
```

### Members: daily work

Each member clones **their own repo**, works only in it, and pushes to its `main` branch as usual. To try the full app, clone the leader repo too.

### Leader: bring in a member's latest work

```bash
git subtree pull --prefix=modules/m3-cases m3 main --squash
```

Do this for each module on the agreed integration day, then run `npm install && npm run dev:all` and test the full flow: log in → report an incident → update the case → dashboard → export CSV.

### Fixing a bug in a module

Open an issue in that member's repo and let them fix it there. If the leader edits a member's folder directly, the next `subtree pull` will conflict.

### Module 3 (leader's own module)

`modules/m3-cases` has no separate repo: the leader edits it directly here and commits to `main`. To refresh its `member/m3-cases` branch after changes:

```bash
git subtree split --prefix=modules/m3-cases -b member/m3-cases
git push leader member/m3-cases
```
