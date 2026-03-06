# PrepBridge Frontend ↔ Backend Integration Master Workflow

Use this file as the single daily execution source for full frontend-backend integration.

## 1) Scope & Rules

### In Scope
- Full user + admin frontend integration with existing backend routes.
- Replace all mocks, static seed data, and simulated delays in feature pages.
- Standardize API → service → store → page flow.

### Out of Scope (this phase)
- AI/ML inference pipelines and external ML service wiring.

### Non-Negotiable Rules
- UI pages must call Zustand stores, not raw fetch.
- Stores must call service layer files.
- Service layer owns endpoint paths and request details.
- No `setTimeout`-based fake API behavior in integrated pages.

---

## 2) Environment Baseline

### Backend (`Backend/`)
- API base: `http://localhost:5000`
- Required `.env` keys:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `FRONTEND_URL=http://localhost:8080`

### Frontend (`Frontend/`)
- API base (optional): `VITE_API_BASE_URL=http://localhost:5000/api`
- Default fallback should stay `http://localhost:5000/api`

---

## 3) Current Backend Route Map (Source of Truth)

Mounted in `Backend/src/routes/index.js`:

- Auth: `/api/auth/*`
- Admin: `/api/admin/*`
- Tasks: `/api/tasks/*`
- Users: `/api/users/*`
- Roadmap: `/api/roadmap/*`
- Achievements: `/api/achievements/*`
- Community: `/api/community/*`
- Calendar: `/api/calendar/*`
- Reports: `/api/reports/*`
- JD: `/api/jd/*`

---

## 4) Frontend Architecture Standard

### Service Layer (`Frontend/src/services/`)
- `api.js` shared request client
- `authService.js`
- `taskService.js`
- `adminService.js`
- Add missing feature service files as needed:
   - `userService.js`, `roadmapService.js`, `achievementService.js`, `calendarService.js`, `communityService.js`, `reportService.js`, `jdService.js`

### Store Layer (`Frontend/src/store/`)
- Existing: `authStore.js`, `taskStore.js`, `adminStore.js`
- Add missing stores per feature where async + shared state is needed:
   - `profileStore.js`, `roadmapStore.js`, `achievementStore.js`, `calendarStore.js`, `communityStore.js`, `reportStore.js`, `jdStore.js`

### Page Layer (`Frontend/src/features/**/pages/`)
- Pages consume only stores + local UI state.
- No mock constants in integrated pages.

---

## 5) Feature Integration Matrix

Status legend: ✅ Done, 🟡 In Progress, ⬜ Not Started

### A. Auth (User)
- Backend routes:
   - `POST /api/auth/register`
   - `POST /api/auth/verify-otp`
   - `POST /api/auth/resend-otp`
   - `POST /api/auth/login`
   - `GET /api/auth/me`
   - `POST /api/auth/forgot-password`
   - `POST /api/auth/reset-password`
   - `POST /api/auth/logout`
- Frontend files:
   - Services: `src/services/authService.js`
   - Store: `src/store/authStore.js`
   - Pages: `features/auth/pages/LoginPage.jsx`, `SignupPage.jsx`, `ForgotPasswordPage.jsx`
- Status: ✅

### B. Tasks / Daily Planning
- Backend routes:
   - `GET /api/tasks`
   - `POST /api/tasks`
   - `PUT /api/tasks/:id`
   - `PATCH /api/tasks/:id/toggle`
   - `DELETE /api/tasks/:id`
   - `GET /api/tasks/date?date=...`
- Frontend files:
   - Service: `src/services/taskService.js`
   - Store: `src/store/taskStore.js`
   - Page: `features/planning/pages/DailyPlanningPage.jsx`
- Status: ✅

### C. Admin Auth + Core Admin
- Backend routes:
   - `POST /api/auth/admin/login`
   - `GET /api/admin/dashboard`
   - `GET /api/admin/users`
   - `PATCH /api/admin/users/:id/ban`
   - `PATCH /api/admin/users/:id/unban`
   - company + moderation admin routes under `/api/admin/*`
- Frontend files:
   - Service: `src/services/adminService.js`
   - Store: `src/store/adminStore.js`
   - Pages: `features/admin/pages/*`
- Status: 🟡 (Admin login integrated; most admin pages still mock-driven)

### D. Profile
- Backend routes:
   - `GET /api/users/profile`
   - `PUT /api/users/profile`
   - `POST /api/users/resume`
- Frontend page: `features/profile/pages/ProfilePage.jsx`
- Status: ⬜ (currently using mock user constants)

### E. Roadmap
- Backend routes:
   - `GET /api/roadmap`
   - `PATCH /api/roadmap/foundations/:section`
   - `PATCH /api/roadmap/domains/:roleId`
- Frontend page: `features/roadmap/pages/RoadmapPage.jsx`
- Status: ⬜

### F. Achievements
- Backend routes:
   - `GET /api/achievements`
   - `GET /api/achievements/streaks`
   - `GET /api/achievements/leaderboard`
- Frontend page: `features/achievements/pages/AchievementsPage.jsx`
- Status: ⬜

### G. Calendar
- Backend routes:
   - `GET /api/calendar/heatmap`
   - `GET /api/calendar/day/:date`
- Frontend page: `features/calendar/pages/CalendarPage.jsx`
- Status: ⬜ (currently sample data comments/pattern)

### H. Community
- Backend routes:
   - `GET/POST /api/community/posts`
   - `GET/PUT/DELETE /api/community/posts/:id`
   - `POST /api/community/posts/:id/upvote`
   - `POST /api/community/posts/:id/bookmark`
   - `POST /api/community/posts/:id/comments`
   - `DELETE /api/community/comments/:id`
   - `POST /api/community/posts/:id/report`
   - `GET /api/community/my-posts`
   - `GET /api/community/bookmarks`
- Frontend page: `features/community/pages/CommunityPage.jsx`
- Status: ⬜ (currently mock posts)

### I. Reports
- Backend routes:
   - `GET /api/reports/weekly`
   - `GET /api/reports/history`
   - `POST /api/reports/reflection`
   - `GET /api/reports/reflections`
   - `GET /api/reports/stats`
- Frontend page: `features/reports/pages/ReportsPage.jsx`
- Status: ⬜ (contains simulated async delay)

### J. JD Matching (Non-ML only)
- Backend routes:
   - `POST /api/jd/analyze`
   - `GET /api/jd/history`
   - `GET /api/jd/skill-gaps`
   - `GET /api/jd/:id`
   - `PATCH /api/jd/:id/save`
   - `DELETE /api/jd/:id`
- Frontend page: `features/jdmatching/pages/JDMatchingPage.jsx`
- Status: ⬜ (currently mock company data + simulated delay)

---

## 6) Daily Folder Audit Checklist (Run Every Day)

### Step 1: Scan for Mock Patterns
- Search in `Frontend/src/features/**` for:
   - `MOCK_`
   - `setTimeout(`
   - `initialTasks`
   - `dummy`
   - `sample`
   - hardcoded arrays used as API substitute

### Step 2: Verify Layering
- Each integrated feature must have:
   - service file under `src/services/`
   - store file under `src/store/` (or use existing store if shared)
   - page using store selectors/actions only

### Step 3: Verify Endpoint Coverage
- For each page action (load/create/update/delete/toggle), confirm matching backend route exists and is called from service.

### Step 4: Verify Auth Headers
- User pages use user token.
- Admin pages use admin token.

### Step 5: Build + Smoke
- Frontend build passes.
- Backend runs without route/middleware errors.
- Smoke flows:
   - Signup → OTP verify → login
   - Daily tasks CRUD
   - Admin login + at least one admin list API

---

## 7) Integration Execution Order (Strict)

1. Auth finish: remove remaining simulated flows in Forgot Password.
2. Admin feature pages: dashboard/users/companies/community/reports.
3. Profile + Roadmap.
4. Achievements + Calendar.
5. Community user page.
6. Reports user page.
7. JD non-ML page.

Rule: do not start a new slice until the current slice passes the Definition of Done.

---

## 8) Definition of Done (Per Feature)

- No mock constants/fake delays in that feature page/store.
- Read operations load from backend response.
- Write operations persist to backend and update UI state.
- Loading and error states are visible and user-friendly.
- Auth-protected requests include Bearer token automatically.
- Frontend build passes.

---

## 9) Daily Progress Log Template

Copy this section each day and fill it:

### Date:
### Slice worked on:
### Files changed:
### Endpoints integrated:
### Mocks removed:
### Build status:
### Remaining blockers:
### Next slice:

---

## 10) Immediate Next Tasks (Actionable)

1. Integrate `ForgotPasswordPage.jsx` with `authService` endpoints (remove all simulated timers).
2. Integrate `AdminUsersPage.jsx` with `/api/admin/users`, ban, unban.
3. Integrate `AdminDashboardPage.jsx` with `/api/admin/dashboard`.
4. Build `profileService/store` and wire `ProfilePage.jsx` to `/api/users/profile`.
5. Build `roadmapService/store` and wire `RoadmapPage.jsx` to `/api/roadmap/*`.
