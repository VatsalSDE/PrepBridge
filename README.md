# PrepBridge

PrepBridge is a full-stack placement preparation platform for students and admins.
It combines structured learning workflows, progress analytics, anonymous community collaboration, and JD-resume analysis in one monorepo.

## Contents
- Product Overview
- Core Capabilities
- High-Level Architecture
- Repository Layout
- Technology Stack
- Quick Start
- Environment Configuration
- Run and Build Commands
- Authentication and Roles
- API Surface
- Realtime Events
- Seed Data and Postman Collections
- Smoke Testing
- Frontend Integration Pattern
- Development Workflows
- Deployment Notes
- Troubleshooting
- Known Limitations and Improvements

## Product Overview
PrepBridge supports two primary personas:

1. Students
- Create and complete daily preparation tasks.
- Track roadmap progress across DSA, Core CS, Aptitude, and System Design.
- Build streaks, unlock badges, and compare with leaderboard peers.
- Participate in anonymous community discussions.
- View calendar activity, reflections, and report dashboards.
- Analyze resume fit against a job description.

2. Admins
- Manage users and moderation actions.
- Create, update, approve, and manage companies.
- Review and act on reported community posts.
- Manage roadmap templates and user-specific roadmap progress.
- View dashboard analytics.

## Core Capabilities

### Student Side
- Authentication with OTP verification and password reset.
- Task lifecycle: create, update, toggle completion, delete, date filters, history, pomodoro updates.
- Profile management with resume upload and preview.
- Roadmap progress management.
- Achievements, streak tracking, and leaderboard.
- Anonymous community posting, commenting, upvoting, bookmarking, and reporting.
- Calendar heatmap and day-level history.
- Reports dashboard, weekly reports, reflection system, and long-term stats.
- JD analysis history, save/unsave actions, and skill gap summaries.

### Admin Side
- Admin login and protected admin-only routes.
- User listing, detail view, ban, and unban actions.
- Company CRUD, approval flow, and interview guideline generation.
- Community moderation (hide/unhide/delete post, resolve/dismiss report).
- Roadmap template and per-user roadmap controls.
- Dashboard metrics: users, activity, reports, growth, and engagement.

## High-Level Architecture

```text
Frontend (React + Vite)  -->  Backend (Node + Express + Socket.IO)  -->  MongoDB
                                           |
                                           +-->  ML Service (FastAPI)
```

### Service Matrix

| Service | Path | Default Port | Purpose |
|---|---|---:|---|
| Frontend | Frontend | 5173 | Student and admin UI |
| Backend API | Backend | 5000 | REST APIs, auth, business logic, realtime server |
| ML Service | ml-service | 8000 | JD analysis and admin guideline generation |
| Database | external/local | - | Persistent application data |

## Repository Layout

```text
Prep-Bridge/
  Backend/
    src/
      app.js
      server.js
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      sockets/
      utils/
      seeds/
    scripts/
    package.json

  Frontend/
    src/
      components/
      features/
      hooks/
      lib/
      pages/
      services/
      store/
      utils/
    package.json

  ml-service/
    main.py
    admin_routes.py
    user_routes.py
    model.py
    requirements.txt
```

## Technology Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Passport (Google and GitHub OAuth)
- Socket.IO
- Multer (resume uploads)
- Nodemailer

### Frontend
- React 18 + Vite
- TypeScript support in project tooling
- Zustand for state management
- React Router
- Tailwind CSS + Radix UI
- Framer Motion
- Recharts

### ML Service
- FastAPI
- Pydantic
- LLM integration via Groq client in current implementation

## Quick Start

## 1. Prerequisites
- Node.js 18+
- npm
- Python 3.10+
- MongoDB (local or cloud)

## 2. Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install

cd ../ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install groq
```

Note: The ML service code imports the Groq SDK. If it is not present in your environment, install it explicitly as shown above.

## 3. Configure environment files
Create the following files:

- Backend/.env
- Frontend/.env (optional)
- ml-service/.env (recommended)

Use the templates in the Environment Configuration section.

## 4. Start services

Terminal 1 (Backend):

```bash
cd Backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd Frontend
npm run dev
```

Terminal 3 (ML Service, optional but recommended):

```bash
cd ml-service
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

## 5. Verify health
- Backend health: GET http://localhost:5000/api/health
- ML health: GET http://localhost:8000/health
- Frontend app: http://localhost:5173

## Environment Configuration

## Backend .env template

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/prepbridge

JWT_SECRET=replace_with_strong_secret
JWT_EXPIRE=7d
SESSION_SECRET=replace_with_session_secret

FRONTEND_URL=http://localhost:5173
FRONTEND_URLS=http://localhost:5173,http://localhost:8080

ML_SERVICE_URL=http://localhost:8000

ADMIN_EMAIL=admin@prepbridge.com
ADMIN_PASSWORD=Admin@123

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@prepbridge.com

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

Notes:
- In development, if SMTP values are missing, email actions log to console instead of sending real email.
- Include your frontend origins in FRONTEND_URL or FRONTEND_URLS to avoid CORS issues.

## Frontend .env template (optional)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If omitted, frontend service defaults to http://localhost:5000/api.

## ML service .env template (recommended)

```env
GROQ_API_KEY=replace_with_real_key
```

Important:
- The current ml-service/model.py implementation uses a hardcoded API key value.
- Move that value to GROQ_API_KEY in environment variables before sharing or deploying.

## Run and Build Commands

## Backend commands

```bash
cd Backend
npm run dev         # nodemon src/server.js
npm start           # node src/server.js
npm run seed:admin  # create/update admin account
```

Additional seed scripts:

```bash
cd Backend
node src/seeds/seedBadges.js
node src/seeds/seedCompanies.js
```

## Frontend commands

```bash
cd Frontend
npm run dev
npm run build
npm run build:dev
npm run lint
npm run preview
```

## ML service commands

```bash
cd ml-service
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

## Authentication and Roles

### Auth model
- Backend uses JWT Bearer tokens.
- Protected user routes require Authorization: Bearer <token>.
- Admin routes require both protect and isAdmin middleware (except public admin login).

### Frontend token persistence
- User auth state is persisted under prepbridge-auth.
- Admin auth state is persisted under prepbridge-admin.
- API client automatically reads the appropriate token for user/admin requests.

## API Surface

Base API prefix: /api

| Module | Base Path | Summary |
|---|---|---|
| Auth | /api/auth | register, OTP verify/resend, login, me, forgot/reset/change password, OAuth callbacks, logout |
| Admin Auth (alt) | /api/admin/login | public admin login endpoint |
| Users | /api/users | dashboard summary, profile get/update, resume upload/view |
| Tasks | /api/tasks | list/create/update/delete, toggle completion, history, date filters, pomodoro |
| Roadmap | /api/roadmap | fetch roadmap, update foundations/domains |
| Achievements | /api/achievements | badges, streaks, leaderboard |
| Community | /api/community | posts, comments, upvotes, bookmarks, report flow, my posts |
| Calendar | /api/calendar | heatmap and day details |
| Reports | /api/reports | dashboard, weekly report, history, reflections, stats |
| JD | /api/jd | company list, analyze, history, save toggle, delete, skill gaps |
| Admin | /api/admin | dashboard, users, companies, moderation, roadmap admin |

### JD and guideline generation behavior
- Backend attempts ML service calls first:
  - POST /user/analyze-jd (ml service)
  - POST /admin/generate-guidelines (ml service)
- If ML service is unavailable, backend falls back to deterministic rule-based logic.

## Realtime Events

Socket.IO is initialized in backend server and requires handshake auth token and userId.

Community events emitted by backend:
- post:created
- post:updated
- post:deleted
- post:upvoted
- post:bookmarked
- comment:added
- comment:deleted

## Seed Data and Postman Collections

## Seed scripts
- Admin seed: Backend/src/seeds/seedAdmin.js
- Badges seed: Backend/src/seeds/seedBadges.js
- Companies seed: Backend/src/seeds/seedCompanies.js

## Postman collections
- Backend/PrepBridge_Vatsal_APIs.postman_collection.json
- Backend/prepbridge-admin-apis.postman_collection.json

Recommended test sequence:
1. Auth
2. Tasks
3. Profile
4. Roadmap
5. Achievements
6. Calendar
7. Community
8. Reports
9. JD
10. Admin flows

## Smoke Testing

Backend includes smoke scripts in Backend/scripts:

- reports-module-smoke.js
- community-report-toggle-smoke.js
- community-admin-report-actions-smoke.js
- community-realtime-smoke.js

Run in this order:

```bash
cd Backend
node scripts/reports-module-smoke.js
node scripts/community-report-toggle-smoke.js
node scripts/community-admin-report-actions-smoke.js
node scripts/community-realtime-smoke.js
```

Expected prerequisites:
- Backend server is running.
- MongoDB is reachable.
- Required env vars are set.

## Frontend Integration Pattern

Frontend follows a clear layering pattern:

```text
Page -> Zustand Store -> Service -> apiRequest
```

Meaning:
- UI pages should trigger store actions.
- Store handles async actions and state updates.
- Service layer owns endpoint paths and request contracts.
- Shared API client handles auth headers and response normalization.

## Development Workflows

Supporting docs in repository:
- FRONTEND_BACKEND_WORKFLOW.md
- TEAM_WORKFLOW.md
- ML_IMPLEMENTATION_GUIDE.md

These files describe day-by-day integration order, team split, and ML roadmap planning.

## Deployment Notes

Before production deployment:
1. Replace all secrets with secure values.
2. Remove any hardcoded keys from source code.
3. Set strict CORS origins (do not use wildcard in production).
4. Ensure HTTPS for frontend/backend and secure cookie/session policies.
5. Add process manager and observability (PM2, logs, health checks, alerts).
6. Configure MongoDB network access and backup strategy.

## Troubleshooting

## Backend does not start
- Confirm MONGO_URI and JWT_SECRET are set in Backend/.env.
- Check if PORT is already in use.

## CORS blocked requests
- Add your frontend origin to FRONTEND_URL or FRONTEND_URLS.
- Restart backend after env changes.

## User/admin appears logged out unexpectedly
- Verify token exists in localStorage states prepbridge-auth or prepbridge-admin.
- Ensure JWT_SECRET is stable across backend restarts for active tokens.

## OTP/reset email not arriving
- In development without SMTP, mail content is printed in backend logs.
- For real emails, configure SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/FROM_EMAIL.

## Resume upload fails
- Allowed types: PDF, DOC, DOCX.
- File size limit: 5 MB.

## ML responses missing or failing
- Start ml-service on port 8000 or set ML_SERVICE_URL to correct host.
- Verify Groq dependency and API key setup.
- Backend will fallback, but quality/features may be reduced.

## Known Limitations and Improvements

Current known constraints:
- ML service security hardening is needed (remove hardcoded key usage).
- ML requirements file should explicitly include all runtime packages used by code.
- Automated test coverage can be expanded beyond smoke scripts.

Suggested next improvements:
1. Add .env.example files for Backend, Frontend, and ml-service.
2. Add CI pipeline for lint, smoke scripts, and build validation.
3. Add API contract documentation (OpenAPI/Swagger) for backend.
4. Add role-based audit logs for admin actions.

---

If you are onboarding a new developer, start with Quick Start, run seed:admin, verify health endpoints, and then execute the smoke tests.