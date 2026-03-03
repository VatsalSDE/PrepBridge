# PrepBridge - Complete Feature Implementation Guide

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [User Side Features (Vatsal)](#user-side-features-vatsal)
3. [Admin Side Features (Raj)](#admin-side-features-raj)
4. [ML Features Implementation](#ml-features-implementation)
5. [Technology Choices](#technology-choices)
6. [Implementation Timeline](#implementation-timeline)
7. [Things to Keep in Mind](#things-to-keep-in-mind)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PREPBRIDGE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│   │   Frontend  │────▶│   Backend   │────▶│   MongoDB   │      │
│   │   (React)   │     │  (Node.js)  │     │   (Atlas)   │      │
│   └─────────────┘     └──────┬──────┘     └─────────────┘      │
│                              │                                   │
│                              ▼                                   │
│                       ┌─────────────┐                           │
│                       │ ML Service  │                           │
│                       │  (Python)   │                           │
│                       └─────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Services:
| Service | Technology | Port | Purpose |
|---------|------------|------|---------|
| Frontend | React + Vite | 5173 | User/Admin Interface |
| Backend | Node.js + Express | 5000 | REST APIs |
| ML Service | Python + FastAPI | 8000 | AI/ML Processing |
| Database | MongoDB Atlas | - | Data Storage |

---

## 👤 User Side Features (Vatsal)

### ✅ Completed Features (Backend APIs Ready)
| Feature | Status | APIs |
|---------|--------|------|
| Auth (Register, Login, OTP) | ✅ Done | `/api/auth/*` |
| Task Management | ✅ Done | `/api/tasks/*` |
| User Profile | ✅ Done | `/api/users/*` |
| Roadmap Progress | ✅ Done | `/api/roadmap/*` |
| Achievements & Streaks | ✅ Done | `/api/achievements/*` |
| Calendar Heatmap | ✅ Done | `/api/calendar/*` |
| Anonymous Community | ✅ Done | `/api/community/*` |
| Weekly Reports | ✅ Done | `/api/reports/*` |
| JD Analysis (Skeleton) | ✅ Done | `/api/jd/*` |

### ⏳ Pending: JD Matching ML Integration

**What it does:**
- User pastes Job Description text
- User uploads/has resume
- ML extracts skills from both
- Shows match score + missing skills + recommendations

**API Flow:**
```
POST /api/jd/analyze
├── User sends: { jobTitle, company, jdText }
├── Backend calls: ML Service /extract-skills
├── ML returns: { extractedSkills, matchedSkills, missingSkills, matchScore }
└── Backend saves: JDAnalysis document + returns result
```

---

## 🛡️ Admin Side Features (Raj)

### Features to Build:

#### 1. Admin Authentication
```
POST /api/admin/login     - Admin login (no registration, seeded)
GET  /api/admin/me        - Get admin info
```

#### 2. Company Management
```
GET    /api/admin/companies          - List all companies
POST   /api/admin/companies          - Add company (triggers ML)
PUT    /api/admin/companies/:id      - Update company
DELETE /api/admin/companies/:id      - Delete company
GET    /api/admin/companies/:id      - Get single company
```

#### 3. Post Moderation
```
GET    /api/admin/posts/reported     - Get reported posts
PATCH  /api/admin/posts/:id/hide     - Hide a post
PATCH  /api/admin/posts/:id/unhide   - Unhide a post
DELETE /api/admin/posts/:id          - Delete a post
GET    /api/admin/posts              - All posts (for review)
```

#### 4. User Management
```
GET    /api/admin/users              - List all users
PATCH  /api/admin/users/:id/ban      - Ban user
PATCH  /api/admin/users/:id/unban    - Unban user
GET    /api/admin/users/:id          - User details
```

#### 5. Dashboard Stats
```
GET    /api/admin/stats              - Dashboard metrics
```

### ⏳ Admin ML Feature: Interview Guidelines Generator

**What it does:**
- Admin pastes raw JD text when adding a company
- ML generates interview patterns + focus distribution
- Saves structured interview guidelines

**Flow:**
```
POST /api/admin/companies
├── Admin sends: { name, logo, city, industry, jdText }
├── Backend calls: ML Service /generate-interview-guide
├── ML returns: { interviewPattern, focusDistribution, keyTopics }
└── Backend saves: Company with generated guidelines
```

---

## 🤖 ML Features Implementation

### Feature 1: JD Skill Extraction (User Side)

**Input:** Raw JD text
**Output:** 
```json
{
  "extractedSkills": ["Python", "AWS", "System Design", "DSA"],
  "experience": "2-4 years",
  "role": "Backend Engineer"
}
```

### Feature 2: Resume Skill Extraction (User Side)

**Input:** Resume text (extracted from PDF)
**Output:**
```json
{
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "experience": "1 year",
  "education": "B.Tech CSE"
}
```

### Feature 3: Skill Matching (User Side)

**Input:** JD skills + Resume skills
**Output:**
```json
{
  "matchedSkills": ["Python", "DSA"],
  "missingSkills": ["AWS", "System Design"],
  "matchScore": 65,
  "recommendations": [
    "Learn AWS basics (EC2, S3, Lambda)",
    "Practice system design on InterviewBit"
  ]
}
```

### Feature 4: Interview Guide Generator (Admin Side)

**Input:** Raw JD text
**Output:**
```json
{
  "interviewPattern": "3 rounds: Online Assessment + Technical + HR",
  "focusDistribution": {
    "dsa": 40,
    "coreCS": 20,
    "systemDesign": 25,
    "behavioral": 15
  },
  "keyTopics": {
    "dsa": ["Arrays", "Trees", "Graphs", "DP"],
    "coreCS": ["DBMS", "OS", "Networks"],
    "systemDesign": ["URL Shortener", "Rate Limiter"]
  },
  "commonQuestions": [
    "Design a URL shortener",
    "Explain process vs thread",
    "Implement LRU Cache"
  ]
}
```

---

## 🛠️ Technology Choices

### Option 1: OpenAI GPT (Recommended for MVP)

**Pros:**
- Fastest to implement
- Best quality results
- Handles all 4 features with one API
- No ML expertise needed

**Cons:**
- Costs money (~$0.002 per request)
- Depends on external API

**Setup:**
```bash
pip install openai langchain
```

**Example Code:**
```python
from openai import OpenAI
client = OpenAI(api_key="your-key")

def extract_skills(jd_text):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "system",
            "content": "Extract technical skills from the job description. Return JSON."
        }, {
            "role": "user",
            "content": jd_text
        }],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
```

**Cost Estimate:**
- GPT-3.5: $0.002 per 1K tokens (~2000 chars)
- 100 analyses/day = ~$6/month

---

### Option 2: Hugging Face (Free, but complex)

**Pros:**
- Completely free
- No API limits
- Runs locally or on HF Spaces

**Cons:**
- Lower quality than GPT
- Need to fine-tune for good results
- More complex setup

**Models to Use:**
| Task | Model |
|------|-------|
| Skill Extraction | `dslim/bert-base-NER` or `Jean-Baptiste/roberta-large-ner-english` |
| Text Classification | `facebook/bart-large-mnli` |
| Text Generation | `google/flan-t5-large` |

**Setup:**
```bash
pip install transformers torch
```

**Example Code:**
```python
from transformers import pipeline

# For skill extraction (NER)
ner = pipeline("ner", model="dslim/bert-base-NER")
results = ner("Looking for Python developer with AWS experience")

# For generating interview guide
generator = pipeline("text2text-generation", model="google/flan-t5-large")
prompt = f"Generate interview pattern for: {jd_text}"
result = generator(prompt, max_length=500)
```

---

### Option 3: LangChain + Local LLM (Advanced)

**Pros:**
- Free after setup
- Privacy (data stays local)
- Customizable

**Cons:**
- Needs GPU (8GB+ VRAM)
- Complex setup
- Slower response

**Setup:**
```bash
pip install langchain langchain-community ollama
# Install Ollama separately
```

**Models:**
- `llama2:7b` - General purpose
- `codellama:7b` - Better for technical content
- `mistral:7b` - Fast and good quality

---

### 🎯 MY RECOMMENDATION

**For MVP (Start Here):**
```
OpenAI GPT-3.5 Turbo
├── Fast implementation (1-2 days)
├── High quality results
├── Cost: ~$10-20/month for small scale
└── Can switch to Hugging Face later
```

**For Production (Later):**
```
Fine-tuned Hugging Face Model + OpenAI fallback
├── Train on your own data
├── Reduce API costs
└── Better accuracy for your domain
```

---

## 📁 ML Service Structure

Create a separate Python service:

```
ml-service/
├── main.py              # FastAPI app
├── requirements.txt     
├── .env                 # OPENAI_API_KEY
├── routers/
│   ├── skills.py        # /extract-skills, /match-skills
│   └── interview.py     # /generate-interview-guide
├── services/
│   ├── skill_extractor.py
│   ├── skill_matcher.py
│   └── interview_generator.py
└── utils/
    └── prompts.py       # System prompts
```

### main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import skills, interview

app = FastAPI(title="PrepBridge ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(skills.router, prefix="/api/ml", tags=["Skills"])
app.include_router(interview.router, prefix="/api/ml", tags=["Interview"])

@app.get("/health")
def health():
    return {"status": "ok"}
```

### routers/skills.py
```python
from fastapi import APIRouter
from pydantic import BaseModel
from services.skill_extractor import extract_skills_from_jd, extract_skills_from_resume
from services.skill_matcher import match_skills

router = APIRouter()

class JDRequest(BaseModel):
    jdText: str

class MatchRequest(BaseModel):
    jdText: str
    resumeText: str
    userSkills: list[str] = []

@router.post("/extract-skills")
async def extract_skills(request: JDRequest):
    return extract_skills_from_jd(request.jdText)

@router.post("/match-skills")
async def match(request: MatchRequest):
    jd_skills = extract_skills_from_jd(request.jdText)
    resume_skills = extract_skills_from_resume(request.resumeText)
    all_user_skills = list(set(resume_skills + request.userSkills))
    return match_skills(jd_skills, all_user_skills)
```

### services/skill_extractor.py (Using OpenAI)
```python
import json
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_skills_from_jd(jd_text: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": """Extract technical skills from this job description.
                Return JSON with this format:
                {
                    "extractedSkills": ["skill1", "skill2"],
                    "experience": "X years",
                    "role": "Job Title"
                }"""
            },
            {"role": "user", "content": jd_text}
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def extract_skills_from_resume(resume_text: str) -> list:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": """Extract technical skills from this resume.
                Return JSON: {"skills": ["skill1", "skill2"]}"""
            },
            {"role": "user", "content": resume_text}
        ],
        response_format={"type": "json_object"}
    )
    result = json.loads(response.choices[0].message.content)
    return result.get("skills", [])
```

### routers/interview.py
```python
from fastapi import APIRouter
from pydantic import BaseModel
from services.interview_generator import generate_interview_guide

router = APIRouter()

class InterviewRequest(BaseModel):
    jdText: str
    company: str = ""

@router.post("/generate-interview-guide")
async def generate_guide(request: InterviewRequest):
    return generate_interview_guide(request.jdText, request.company)
```

### services/interview_generator.py
```python
import json
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_interview_guide(jd_text: str, company: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": """Generate interview preparation guide from this JD.
                Return JSON:
                {
                    "interviewPattern": "Description of rounds",
                    "focusDistribution": {"dsa": 40, "coreCS": 20, "systemDesign": 25, "behavioral": 15},
                    "keyTopics": {
                        "dsa": ["topic1", "topic2"],
                        "coreCS": ["topic1"],
                        "systemDesign": ["topic1"]
                    },
                    "commonQuestions": ["question1", "question2"]
                }"""
            },
            {"role": "user", "content": f"Company: {company}\n\nJD:\n{jd_text}"}
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
```

### requirements.txt
```
fastapi==0.109.0
uvicorn==0.27.0
openai==1.12.0
python-dotenv==1.0.0
pydantic==2.6.0
```

---

## 📞 Calling ML Service from Node.js

### Backend/src/services/ml.service.js
```javascript
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlService = {
  async extractSkills(jdText) {
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/extract-skills`, {
      jdText
    });
    return response.data;
  },

  async matchSkills(jdText, resumeText, userSkills = []) {
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/match-skills`, {
      jdText,
      resumeText,
      userSkills
    });
    return response.data;
  },

  async generateInterviewGuide(jdText, company) {
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/generate-interview-guide`, {
      jdText,
      company
    });
    return response.data;
  }
};

module.exports = mlService;
```

### Update jd.controller.js to use ML
```javascript
const mlService = require('../services/ml.service');

exports.analyzeJD = asyncHandler(async (req, res) => {
  const { jobTitle, company, jdText } = req.body;
  const user = await User.findById(req.user.id);

  // Call ML service
  const mlResult = await mlService.matchSkills(
    jdText,
    user.resumeText || '',
    user.skills || []
  );

  const analysis = await JDAnalysis.create({
    userId: req.user.id,
    jobTitle,
    company,
    jdText,
    extractedSkills: mlResult.extractedSkills,
    matchedSkills: mlResult.matchedSkills,
    missingSkills: mlResult.missingSkills,
    matchScore: mlResult.matchScore,
    recommendations: mlResult.recommendations
  });

  res.status(201).json({
    success: true,
    data: analysis
  });
});
```

---

## 📅 Implementation Timeline

### Phase 1: Backend APIs (Done ✅)
- Days 1-10: All Node.js APIs

### Phase 2: Frontend Integration
- Days 11-16: Connect React to APIs

### Phase 3: ML Service Setup
- Day 17: Setup FastAPI + OpenAI
- Day 18: Implement skill extraction endpoints
- Day 19: Implement interview guide endpoint
- Day 20: Connect Node.js to ML service

### Phase 4: Testing & Polish
- Days 21-22: Test all flows end-to-end
- Days 23-24: Fix bugs, optimize

---

## ⚠️ Things to Keep in Mind

### 1. API Key Security
```
❌ NEVER commit API keys to git
✅ Use .env files
✅ Add .env to .gitignore
```

### 2. ML Service Error Handling
```javascript
// Always wrap ML calls in try-catch
try {
  const result = await mlService.extractSkills(jdText);
} catch (error) {
  // Return placeholder if ML fails
  return { extractedSkills: [], matchScore: 0, error: 'ML service unavailable' };
}
```

### 3. Rate Limiting
```
OpenAI has rate limits:
- Free tier: 3 RPM (requests per minute)
- Paid: 3500 RPM
Add retry logic with exponential backoff
```

### 4. Caching
```javascript
// Cache ML results to save API calls
// Same JD text = same result
const cacheKey = crypto.createHash('md5').update(jdText).digest('hex');
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### 5. Resume Text Extraction
```
For PDF resume → text:
Option 1: pdf-parse (Node.js)
Option 2: PyPDF2 (Python)
Option 3: Cloud Vision API (Google)
```

### 6. Prompt Engineering Tips
```
✅ Be specific about output format (JSON)
✅ Give examples in the prompt
✅ Set temperature=0 for consistent results
✅ Keep prompts under 500 tokens
```

### 7. Cost Optimization
```
- Use GPT-3.5 not GPT-4 (10x cheaper)
- Cache repeated queries
- Batch requests when possible
- Set max_tokens limit
```

### 8. Fallback Strategy
```
Primary: OpenAI API
Fallback: Hugging Face (if OpenAI down)
Last resort: Simple keyword matching
```

---

## 🚀 Quick Start Commands

### Start ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Start Backend
```bash
cd Backend
npm run dev
```

### Start Frontend
```bash
cd Frontend
npm run dev
```

### Test ML Endpoint
```bash
curl -X POST http://localhost:8000/api/ml/extract-skills \
  -H "Content-Type: application/json" \
  -d '{"jdText": "Looking for Python developer with AWS experience"}'
```

---

## 📌 Summary

| Feature | Owner | ML Needed | Status |
|---------|-------|-----------|--------|
| Auth, Tasks, Profile | Vatsal | No | ✅ Done |
| Roadmap, Achievements | Vatsal | No | ✅ Done |
| Community, Calendar | Vatsal | No | ✅ Done |
| Reports | Vatsal | No | ✅ Done |
| JD Matching | Vatsal | Yes | ⏳ ML pending |
| Admin Auth | Raj | No | 🔲 To do |
| Company Management | Raj | Yes | 🔲 To do |
| Post Moderation | Raj | No | 🔲 To do |
| User Management | Raj | No | 🔲 To do |

**Next Steps:**
1. Vatsal: Start frontend integration
2. Raj: Build admin APIs
3. Together: Setup ML service (Day 17+)
