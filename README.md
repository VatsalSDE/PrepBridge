# PrepBridge

PrepBridge is a full-stack placement preparation platform with:
- Student-side planning, roadmap, achievements, community, reports, and JD matching.
- Admin-side user/company management and content moderation.
- Real-time community updates over Socket.IO.

This repository contains both backend and frontend applications in a single workspace.

## Table of Contents
- Overview
- Core Features
- Tech Stack
- Repository Structure
- Architecture
- Local Setup
- Environment Variables
- Running the Project
- Available Scripts
- API Modules
- Real-Time Events
- Smoke Tests
- Development Workflow
- Troubleshooting
- Future Enhancements

## Overview
PrepBridge helps students plan and track preparation consistently while giving admins control over content quality and moderation.

Key capabilities include:
- Daily task planning and completion tracking.
- Progress roadmaps across foundations and domain skills.
- Streaks, badges, and leaderboard.
- Anonymous community with moderation and reporting.
- Calendar heatmap and weekly/monthly reports.
- JD vs resume matching with skill-gap analysis.

## Core Features

### Student Features
- Authentication and profile management.
- Daily task management:
  - Create, edit, delete, complete tasks.
  - Pomodoro counters and time tracking.
  - Completion rule enforcement before 11:59 PM of scheduled day.
- Roadmap tracking:
  - Foundations: DSA, Core CS, Aptitude, System Design.
  - Domain skill progression.
- Achievements:
  - Streaks, badges, and leaderboard.
- Anonymous community:
  - Posts, comments, upvotes, bookmarks, reports.
- Calendar and reports:
  - Heatmap, day detail, reflections, trend dashboards.
- JD matching:
  - Company JD list (admin-approved), analysis, history, saved analyses, skill-gap insights.

### Admin Features
- Admin authentication.
- Dashboard analytics and user management.
- Company management:
  - Create/update/delete/approve companies.
  - Generate interview guidelines.
- Community moderation:
  - Review reports, hide/unhide/delete posts, resolve or dismiss reports.
- Roadmap template and per-user roadmap management.

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Socket.IO
- Multer (resume upload)
- Nodemailer (email/OTP/reset)

### Frontend
- React 18 + Vite
- Zustand state management
- React Router
- Tailwind CSS + Radix UI
- Framer Motion
- Recharts
- Socket.IO client

## Repository Structure

```text
PrepBridge/
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
    scripts/
    package.json
  Frontend/
    src/
      components/
      features/
      services/
      store/
      utils/
    package.json
 
```

## Architecture

### Backend flow
1. Request enters Express app.
2. CORS + JSON middleware run.
3. Route module dispatches to controller.
4. Controller validates auth/role and performs business logic.
5. Data stored/fetched via Mongoose models.
6. Services update streaks, badges, email, analytics.
7. Responses returned with unified success/error shape.

### Frontend flow
1. Feature page uses Zustand store hooks.
2. Store calls service-layer API helpers.
3. `apiRequest` attaches auth token and handles errors.
4. UI updates reactively from store state.
5. Community feature also receives live socket events.

## Local Setup

## Prerequisites
- Node.js 18+ (recommended latest LTS)
- npm
- MongoDB instance (local or cloud)

## 1) Clone and install

```bash
git clone <your-repo-url>
cd PrepBridge

cd Backend
npm install

cd ../Frontend
npm install
```

## 2) Configure environment
Create environment files before running.

- Backend: `Backend/.env`
- Frontend (optional): `Frontend/.env`

See Environment Variables section below.

## 3) Start apps

Terminal A:
```bash
cd Backend
npm run dev
```

Terminal B:
```bash
cd Frontend
npm run dev
```

Default local URLs:
- Backend API: `http://localhost:5000/api`
- Frontend: `http://localhost:5173`

Health check:
- `GET http://localhost:5000/api/health`

## Environment Variables

## Backend (`Backend/.env`)

Required:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/prepbridge
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRE=7d
```

CORS/frontend URLs:
```env
FRONTEND_URL=http://localhost:5173
FRONTEND_URLS=http://localhost:5173,http://localhost:8080
NODE_ENV=development
```

Email/OTP (optional in development; logs to console if not configured):
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_pass
FROM_EMAIL=noreply@prepbridge.com
```

## Frontend (`Frontend/.env`)
Optional (defaults to localhost backend if omitted):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Running the Project

## Backend
```bash
cd Backend
npm run dev
# or
npm start
```

## Frontend
```bash
cd Frontend
npm run dev
```

## Production build (frontend)
```bash
cd Frontend
npm run build
npm run preview
```

## Available Scripts

## Backend scripts
- `npm run dev` - start backend with nodemon.
- `npm start` - start backend with node.
- `npm run seed:admin` - seed default admin.

Smoke scripts in `Backend/scripts`:
- `community-realtime-smoke.js`
- `community-report-toggle-smoke.js`
- `community-admin-report-actions-smoke.js`
- `reports-module-smoke.js`

Run example:
```bash
cd Backend
node scripts/reports-module-smoke.js
```

## Frontend scripts
- `npm run dev` - start Vite dev server.
- `npm run build` - production build.
- `npm run build:dev` - development mode build.
- `npm run lint` - run ESLint.
- `npm run preview` - preview production bundle.

## API Modules
Base prefix: `/api`

- `/auth` - register/login/verify/reset/logout.
- `/users` - profile/resume/dashboard summary.
- `/tasks` - today tasks, date tasks, history, update, toggle, pomodoro.
- `/roadmap` - roadmap retrieval and progress updates.
- `/achievements` - badges/streaks/leaderboard.
- `/community` - posts, comments, upvotes, bookmarks, reports.
- `/calendar` - heatmap and per-day details.
- `/reports` - dashboard, weekly reports, history, reflections, stats.
- `/jd` - approved companies, analyze, history, save/delete, skill gaps.
- `/admin` - admin dashboard, users, companies, moderation, roadmap controls.

## Real-Time Events
Socket.IO is attached to backend server and authenticated via JWT in handshake.

Typical event channels:
- `post:created`
- `post:updated`
- `post:deleted`
- `post:upvoted`
- `post:bookmarked`
- `comment:added`
- `comment:deleted`

## Smoke Tests
The repository includes script-based smoke tests for critical flows.

Recommended order:
```bash
cd Backend
node scripts/reports-module-smoke.js
node scripts/community-report-toggle-smoke.js
node scripts/community-admin-report-actions-smoke.js
node scripts/community-realtime-smoke.js
```

These validate reporting, moderation, and real-time community behavior.

## Troubleshooting

## Port already in use (5000)
- Stop the existing process on port 5000 or change `PORT` in backend `.env`.

## CORS errors
- Ensure frontend origin is included in `FRONTEND_URL` or `FRONTEND_URLS`.

## Auth issues
- Verify `JWT_SECRET` consistency and token presence in local storage.

## Mongo connection failure
- Check `MONGO_URI` and network/IP allowlist if using cloud MongoDB.

---


