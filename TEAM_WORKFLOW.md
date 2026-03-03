# PrepBridge - Team Development Workflow

## Team Split

| Member | Responsibility | Scope |
|--------|---------------|-------|
| **Vatsal** | User Side | All student-facing features |
| **Raj** | Admin Side | All admin-facing features + moderation |

---

## 🔗 SHARED DEPENDENCIES (Do First - Together)

Before splitting, **both must agree on these shared components:**

### Day 1 (Together):
```
1. User.js model - Both sides use it
2. Auth middleware - Both sides need it
3. Error handler middleware
4. Database connection setup
```

**Who creates shared files:** Vatsal creates, Raj reviews and pulls.

---

# 👤 VATSAL's WORKFLOW (User Side)

## Phase 1: Models (Days 1-3)

### Models to Create:
```
Backend/src/models/
├── User.js ⭐ (SHARED - create first)
├── Task.js
├── UserStreak.js
├── ActivityLog.js
├── RoadmapProgress.js
├── Badge.js
├── UserBadge.js
├── CommunityPost.js
├── PostUpvote.js
├── PostComment.js
├── PostBookmark.js
├── AnonymousIdentity.js
├── JDAnalysis.js
├── WeeklyReport.js
└── Reflection.js
```

### Model Creation Order:
| Day | Models | Why This Order |
|-----|--------|----------------|
| 1 | User.js, Task.js | Core dependencies |
| 2 | UserStreak.js, ActivityLog.js, RoadmapProgress.js | Dashboard needs these |
| 3 | Badge.js, UserBadge.js, AnonymousIdentity.js | Achievements + Community identity |
| 3 | CommunityPost.js, PostUpvote.js, PostComment.js, PostBookmark.js | Community features |
| 4 | JDAnalysis.js, WeeklyReport.js, Reflection.js | Reports + JD matching |

---

## Phase 2: Controllers & Routes (Days 4-10)

### File Structure:
```
Backend/src/
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── task.controller.js
│   ├── roadmap.controller.js
│   ├── achievement.controller.js
│   ├── community.controller.js
│   ├── calendar.controller.js
│   ├── report.controller.js
│   └── jd.controller.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── task.routes.js
│   ├── roadmap.routes.js
│   ├── achievement.routes.js
│   ├── community.routes.js
│   ├── calendar.routes.js
│   ├── report.routes.js
│   └── jd.routes.js
│
├── services/
│   ├── streak.service.js
│   ├── badge.service.js
│   ├── anonymous.service.js
│   └── email.service.js
│
└── middleware/
    ├── auth.middleware.js ⭐ (SHARED)
    └── errorHandler.js ⭐ (SHARED)
```
### API Development Order:

#### Days 4-5: Auth APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Student signup + send OTP |
| `/api/auth/verify-otp` | POST | Verify OTP |
| `/api/auth/login` | POST | Login, return JWT |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/forgot-password` | POST | Send reset email |
| `/api/auth/logout` | POST | Logout |

#### Days 5-6: Task APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks` | GET | Get today's tasks |
| `/api/tasks` | POST | Create task |
| `/api/tasks/:id` | PUT | Update task |
| `/api/tasks/:id/toggle` | PATCH | Toggle complete |
| `/api/tasks/:id` | DELETE | Delete task |
| `/api/tasks/history` | GET | Get historical tasks |

#### Day 6: User Profile APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/profile` | GET | Get profile |
| `/api/users/profile` | PUT | Update profile |
| `/api/users/resume` | POST | Upload resume |

#### Day 7: Roadmap APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/roadmap` | GET | Get full roadmap progress |
| `/api/roadmap/foundations/:section` | PATCH | Update foundation topic |
| `/api/roadmap/domains/:roleId` | PATCH | Update domain skill |

#### Day 7-8: Achievement APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/achievements` | GET | Get badges + progress |
| `/api/achievements/streaks` | GET | Get streak info |
| `/api/achievements/leaderboard` | GET | Weekly leaderboard |

#### Days 8-9: Community APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/community/posts` | GET | List posts (paginated) |
| `/api/community/posts` | POST | Create post |
| `/api/community/posts/:id` | GET | Get post with comments |
| `/api/community/posts/:id` | PUT | Edit own post |
| `/api/community/posts/:id` | DELETE | Delete own post |
| `/api/community/posts/:id/upvote` | POST | Toggle upvote |
| `/api/community/posts/:id/bookmark` | POST | Toggle bookmark |
| `/api/community/posts/:id/comments` | POST | Add comment |
| `/api/community/comments/:id` | DELETE | Delete own comment |
| `/api/community/posts/:id/report` | POST | Report post |
| `/api/community/my-posts` | GET | User's posts |
| `/api/community/bookmarks` | GET | User's bookmarks |

#### Day 9: Calendar APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar/heatmap` | GET | Heatmap data (1 year) |
| `/api/calendar/day/:date` | GET | Day details |

#### Day 10: Report & JD APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports/weekly` | GET | Get current week report |
| `/api/reports/history` | GET | Past reports |
| `/api/reports/reflection` | POST | Submit reflection |
| `/api/reports/stats` | GET | Overall stats |
| `/api/jd/companies` | GET | List approved companies |
| `/api/jd/companies/:id` | GET | Company details + JD |
| `/api/jd/analyze` | POST | Analyze resume vs JD |
| `/api/jd/history` | GET | Past analyses |

---

## Phase 3: Services (Days 6-10, alongside APIs)

### streak.service.js
```javascript
// Functions needed:
- calculateStreak(userId) - Called when task completed
- checkAndUpdateStreak(userId) - Daily check
- getStreakInfo(userId) - For achievements page
```

### badge.service.js
```javascript
// Functions needed:
- checkBadgeProgress(userId) - Check all badge criteria
- awardBadge(userId, badgeId) - Award badge to user
- getAllBadgesWithProgress(userId) - For achievements page
```

### anonymous.service.js
```javascript
// Functions needed:
- generateAnonymousIdentity(userId) - Create "Anonymous Panda #4521"
- getAnonymousIdentity(userId) - Get existing identity
```

### email.service.js
```javascript
// Functions needed:
- sendOTP(email, otp) - For signup verification
- sendPasswordReset(email, token) - For forgot password
```

---

## Phase 4: API Testing (Days 11-12)

### Testing with Postman/Thunder Client:

#### Test Order:
1. **Auth Flow:**
   - Register → Get OTP → Verify OTP → Login → Get Token
   - Test protected routes with token

2. **Task Flow:**
   - Create task → Get tasks → Update task → Toggle complete → Delete

3. **Community Flow:**
   - Create post → Upvote → Comment → Bookmark → Get posts

4. **Roadmap Flow:**
   - Get progress → Update topic → Check progress updated

5. **Edge Cases:**
   - Invalid token
   - Expired OTP
   - Duplicate email
   - Missing required fields

---

## Phase 5: Frontend Integration (Days 13-16)

### Create API Service Layer:
```
Frontend/src/services/
├── api.js (axios instance with interceptors)
├── authService.js
├── taskService.js
├── roadmapService.js
├── achievementService.js
├── communityService.js
├── calendarService.js
├── reportService.js
└── jdService.js
```

### Integration Order:
| Day | Feature | Pages Affected |
|-----|---------|----------------|
| 13 | Auth | Login, Signup |
| 13 | Tasks | Daily Planning |
| 14 | Profile | Profile Page |
| 14 | Roadmap | Roadmap Page |
| 15 | Achievements | Achievements Page |
| 15 | Calendar | Calendar Page |
| 16 | Community | Community Page |
| 16 | Reports | Reports Page |
| 16 | JD Matching | JD Matching Page |

### Update Zustand Stores:
- `authStore.js` - Real auth
- `taskStore.js` - Real tasks
- Create new stores as needed

---

# 🛡️ RAJ's WORKFLOW (Admin Side)

## Phase 1: Models (Days 1-3)

### Models to Create:
```
Backend/src/models/
├── Company.js
└── PostReport.js
```

**Note:** Raj uses User.js, CommunityPost.js from Vatsal (pull from git)

### Model Details:

#### Company.js (Day 2)
```javascript
{
  name: String,
  logo: String,
  city: String,
  industry: String,
  websiteUrl: String,
  jd: String,
  interviewPattern: String,
  focusDistribution: {
    dsa: Number,
    coreCS: Number,
    systemDesign: Number,
    hr: Number
  },
  guidelines: [String],
  rawAlumniInput: String,
  approved: Boolean,
  createdBy: ObjectId,
  timestamps: true
}
```

#### PostReport.js (Day 2)
```javascript
{
  postId: ObjectId,
  reporterId: ObjectId,
  reason: String,
  description: String,
  status: String,
  reviewedBy: ObjectId,
  reviewedAt: Date,
  actionTaken: String,
  createdAt: Date
}
```

---

## Phase 2: Controllers & Routes (Days 4-8)

### File Structure:
```
Backend/src/
├── controllers/
│   └── admin.controller.js
│
├── routes/
│   └── admin.routes.js
│
├── services/
│   └── analytics.service.js
│
└── middleware/
    └── admin.middleware.js
```

### API Development Order:

#### Day 4: Admin Auth & Middleware
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/admin/login` | POST | Admin login |

**admin.middleware.js:**
```javascript
// Check if user.role === 'admin'
// Use after auth.middleware
```

#### Days 5-6: User Management APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | List all users (paginated) |
| `/api/admin/users/:id` | GET | Get user details |
| `/api/admin/users/:id/ban` | PATCH | Ban user |
| `/api/admin/users/:id/unban` | PATCH | Unban user |

#### Days 6-7: Company Management APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/companies` | GET | All companies |
| `/api/admin/companies` | POST | Add company |
| `/api/admin/companies/:id` | GET | Get company |
| `/api/admin/companies/:id` | PUT | Update company |
| `/api/admin/companies/:id` | DELETE | Delete company |
| `/api/admin/companies/:id/approve` | PATCH | Approve company |
| `/api/admin/companies/:id/generate-guidelines` | POST | Generate guidelines |

#### Day 7-8: Community Moderation APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/community/reports` | GET | Get reported posts |
| `/api/admin/community/posts/:id/hide` | PATCH | Hide post |
| `/api/admin/community/posts/:id/unhide` | PATCH | Unhide post |
| `/api/admin/reports/:id/resolve` | PATCH | Resolve report |
| `/api/admin/reports/:id/dismiss` | PATCH | Dismiss report |

#### Day 8: Dashboard Stats API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard` | GET | Get admin stats |

**Stats to return:**
```javascript
{
  totalUsers: Number,
  activeUsers: Number, // Last 7 days
  bannedUsers: Number,
  totalPosts: Number,
  pendingReports: Number,
  totalCompanies: Number,
  approvedCompanies: Number,
  userGrowth: [], // Last 30 days
  activityChart: [] // Last 7 days
}
```

---

## Phase 3: Services (Days 5-8)

### analytics.service.js
```javascript
// Functions needed:
- getDashboardStats() - For admin dashboard
- getUserGrowthData(days) - User signups per day
- getActivityData(days) - Tasks completed per day
- getCommunityStats() - Posts, comments, reports
```

---

## Phase 4: Seed Data (Day 9)

### Create Seed Files:
```
Backend/src/seeds/
├── seedAdmin.js - Create admin user
├── seedCompanies.js - Sample companies
└── seedBadges.js - All badges (SHARED with Vatsal)
```

**seedAdmin.js:**
```javascript
// Create admin user:
// email: admin@prepbridge.com
// password: Admin@123
// role: 'admin'
```

**seedCompanies.js:**
```javascript
// Add 5-10 sample companies:
// TCS, Infosys, Wipro, Google, Microsoft, etc.
// With sample JDs and focus distributions
```

---

## Phase 5: API Testing (Days 10-11)

### Testing with Postman:

#### Test Order:
1. **Admin Auth:**
   - Login as admin → Get token

2. **User Management:**
   - List users → Ban user → Check user status → Unban

3. **Company Management:**
   - Create company → List companies → Update → Delete

4. **Moderation:**
   - Get reports → Hide post → Resolve report

5. **Dashboard:**
   - Get stats → Verify counts

#### Edge Cases:
- Non-admin trying admin routes (should 403)
- Banning already banned user
- Deleting non-existent company

---

## Phase 6: Frontend Integration (Days 12-14)

### Create Admin API Service:
```
Frontend/src/services/
└── adminService.js
```

### Integration Order:
| Day | Feature | Pages Affected |
|-----|---------|----------------|
| 12 | Admin Auth | Admin Login |
| 12 | Dashboard Stats | Admin Dashboard |
| 13 | User Management | Admin Users |
| 13 | Company Management | Admin Companies |
| 14 | Moderation | Admin Community |

### Update Admin Store:
- `adminStore.js` - Real admin data

---

# 🔄 SYNC POINTS (Critical Meetings)

| Day | What to Sync | Why |
|-----|-------------|-----|
| 1 | User.js model finalized | Both depend on it |
| 3 | All models done | Check references |
| 5 | Auth middleware working | Both need it |
| 8 | All APIs done | Ready for testing |
| 12 | API testing complete | Ready for frontend |
| 16 | Frontend integration done | Final testing |

---

# 📅 COMPLETE TIMELINE

## Week 1 (Days 1-7)

| Day | Vatsal | Raj |
|-----|--------|-----|
| 1 | User.js, Task.js models | Pull User.js, review |
| 2 | UserStreak.js, ActivityLog.js, RoadmapProgress.js | Company.js, PostReport.js |
| 3 | Badge.js, UserBadge.js, Community models | Review Vatsal's models |
| 4 | Auth APIs (register, login, OTP) | Admin middleware |
| 5 | Auth APIs (JWT, forgot-password) | Admin auth API |
| 6 | Task CRUD APIs | User management APIs |
| 7 | User Profile + Roadmap APIs | Company management APIs |

## Week 2 (Days 8-14)

| Day | Vatsal | Raj |
|-----|--------|-----|
| 8 | Achievement APIs | Community moderation APIs |
| 9 | Community APIs | Dashboard stats API |
| 10 | Calendar + Report APIs | Seed data (admin, companies) |
| 11 | JD APIs | API testing |
| 12 | API testing | Frontend: Admin auth + dashboard |
| 13 | Frontend: Auth + Tasks | Frontend: Users + Companies |
| 14 | Frontend: Profile + Roadmap | Frontend: Moderation |

## Week 3 (Days 15-18)

| Day | Vatsal | Raj |
|-----|--------|-----|
| 15 | Frontend: Achievements + Calendar | Final testing |
| 16 | Frontend: Community + Reports | Bug fixes |
| 17 | Frontend: JD Matching | Documentation |
| 18 | Final integration testing | Deployment prep |

---

# 🌿 GIT WORKFLOW

## Branch Structure:
```
main
└── develop
    ├── feature/user-models (Vatsal)
    ├── feature/user-apis (Vatsal)
    ├── feature/user-frontend (Vatsal)
    ├── feature/admin-models (Raj)
    ├── feature/admin-apis (Raj)
    └── feature/admin-frontend (Raj)
```

## Daily Git Flow:
```bash
# Morning - Pull latest
git checkout develop
git pull origin develop
git checkout your-branch
git merge develop

# Evening - Push work
git add .
git commit -m "feat: description"
git push origin your-branch

# After review - Merge to develop
git checkout develop
git merge your-branch
git push origin develop
```

## Commit Message Format:
```
feat: Add task CRUD APIs
fix: Fix JWT token expiry issue
docs: Update API documentation
refactor: Restructure auth controller
```

---

# ✅ CHECKLIST

## Vatsal's Checklist:

### Models:
- [ ] User.js
- [ ] Task.js
- [ ] UserStreak.js
- [ ] ActivityLog.js
- [ ] RoadmapProgress.js
- [ ] Badge.js
- [ ] UserBadge.js
- [ ] CommunityPost.js
- [ ] PostUpvote.js
- [ ] PostComment.js
- [ ] PostBookmark.js
- [ ] AnonymousIdentity.js
- [ ] JDAnalysis.js
- [ ] WeeklyReport.js
- [ ] Reflection.js

### APIs:
- [ ] Auth (register, verify-otp, login, me, forgot-password, logout)
- [ ] Tasks (CRUD + toggle + history)
- [ ] User Profile (get, update, resume)
- [ ] Roadmap (get, update foundations, update domains)
- [ ] Achievements (badges, streaks, leaderboard)
- [ ] Community (posts, comments, upvotes, bookmarks, report)
- [ ] Calendar (heatmap, day details)
- [ ] Reports (weekly, history, reflection, stats)
- [ ] JD (companies, analyze, history)

### Services:
- [ ] streak.service.js
- [ ] badge.service.js
- [ ] anonymous.service.js
- [ ] email.service.js

### Frontend Integration:
- [ ] authService.js
- [ ] taskService.js
- [ ] roadmapService.js
- [ ] achievementService.js
- [ ] communityService.js
- [ ] calendarService.js
- [ ] reportService.js
- [ ] jdService.js

---

## Raj's Checklist:

### Models:
- [ ] Company.js
- [ ] PostReport.js

### APIs:
- [ ] Admin Auth
- [ ] User Management (list, ban, unban)
- [ ] Company Management (CRUD + approve + guidelines)
- [ ] Community Moderation (reports, hide, resolve)
- [ ] Dashboard Stats

### Services:
- [ ] analytics.service.js

### Seeds:
- [ ] seedAdmin.js
- [ ] seedCompanies.js
- [ ] seedBadges.js (coordinate with Vatsal)

### Frontend Integration:
- [ ] adminService.js

---

# 🤖 ML SERVICE INTEGRATION (Phase 7 - Both)

## Overview

A separate Python FastAPI service handles all AI/ML features:

| Feature | Owner | Input | Output |
|---------|-------|-------|--------|
| JD Skill Extraction | Vatsal | JD text | Skills list |
| Resume-JD Matching | Vatsal | JD + Resume | Match score + gaps |
| Interview Guide Gen | Raj | JD text | Interview pattern + focus |

## ML Service Architecture

```
ml-service/
├── main.py              # FastAPI app (port 8000)
├── requirements.txt     
├── .env                 # OPENAI_API_KEY
├── routers/
│   ├── skills.py        # /extract-skills, /match-skills
│   └── interview.py     # /generate-interview-guide
└── services/
    ├── skill_extractor.py
    ├── skill_matcher.py
    └── interview_generator.py
```

## API Endpoints

### For User Side (Vatsal uses):
```
POST /api/ml/extract-skills
├── Input: { "jdText": "..." }
└── Output: { "extractedSkills": [...], "experience": "2-4 years", "role": "..." }

POST /api/ml/match-skills  
├── Input: { "jdText": "...", "resumeText": "...", "userSkills": [...] }
└── Output: { "matchedSkills": [...], "missingSkills": [...], "matchScore": 75, "recommendations": [...] }
```

### For Admin Side (Raj uses):
```
POST /api/ml/generate-interview-guide
├── Input: { "jdText": "...", "company": "Google" }
└── Output: {
│     "interviewPattern": "3 rounds: OA + Tech + HR",
│     "focusDistribution": { "dsa": 40, "coreCS": 20, "systemDesign": 25, "behavioral": 15 },
│     "keyTopics": { "dsa": [...], "coreCS": [...] },
│     "commonQuestions": [...]
│   }
```

## Technology: OpenAI GPT-3.5 (Recommended)

**Why OpenAI for MVP:**
- Fast implementation (1-2 days)
- Best quality results
- ~$10-20/month cost for small scale

**Setup:**
```bash
cd ml-service
pip install fastapi uvicorn openai python-dotenv
echo "OPENAI_API_KEY=your-key" > .env
uvicorn main:app --reload --port 8000
```

## Node.js Integration

### Backend/src/services/ml.service.js
```javascript
const axios = require('axios');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

module.exports = {
  async extractSkills(jdText) {
    const { data } = await axios.post(`${ML_URL}/api/ml/extract-skills`, { jdText });
    return data;
  },
  
  async matchSkills(jdText, resumeText, userSkills = []) {
    const { data } = await axios.post(`${ML_URL}/api/ml/match-skills`, { jdText, resumeText, userSkills });
    return data;
  },
  
  async generateInterviewGuide(jdText, company) {
    const { data } = await axios.post(`${ML_URL}/api/ml/generate-interview-guide`, { jdText, company });
    return data;
  }
};
```

## Timeline

| Day | Task | Owner |
|-----|------|-------|
| 17 | Setup FastAPI + OpenAI | Together |
| 18 | Skill extraction endpoint | Vatsal |
| 18 | Interview guide endpoint | Raj |
| 19 | Connect to Node.js backend | Both |
| 20 | Test end-to-end | Both |

## Important Notes

1. **API Key Security:** Never commit `.env` to git
2. **Error Handling:** Always have fallback if ML fails
3. **Caching:** Cache results for same JD text (saves API cost)
4. **Rate Limits:** OpenAI has rate limits, add retry logic

**Full ML Implementation Details:** See `ML_IMPLEMENTATION_GUIDE.md`

---

# 🚀 LET'S START!

**Day 1 First Task:**
- Vatsal: Create `User.js` model and push to `develop`
- Raj: Pull and review, then create `Company.js`

---

*Good luck team! 💪*
