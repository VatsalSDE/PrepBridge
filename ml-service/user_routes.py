from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from model import generate_text
import json
import re

router = APIRouter(prefix="/user", tags=["User"])


class JDInput(BaseModel):
    jdText: str
    resumeText: str
    jobTitle: str = "Software Engineer"
    companyName: str = "the company"


@router.post("/analyze-jd")
def analyze_jd(body: JDInput):
    if not body.jdText.strip():
        raise HTTPException(status_code=400, detail="jdText is required")
    if not body.resumeText.strip():
        raise HTTPException(status_code=400, detail="resumeText is required")

    prompt = f"""You are an expert placement preparation coach and hiring consultant.

Analyze this Job Description against the candidate's resume and return ONLY a valid JSON object.
No explanation, no markdown, no extra text — ONLY the JSON.

Job Title: {body.jobTitle}
Company: {body.companyName}

Job Description:
{body.jdText}

Candidate Resume:
{body.resumeText}

Return exactly this JSON structure:
{{
  "matchScore": 75,
  "matchedSkills": [
    {{"skill": "React", "userLevel": "intermediate"}},
    {{"skill": "Node.js", "userLevel": "advanced"}}
  ],
  "missingSkills": [
    {{"skill": "Docker", "category": "technical", "importance": "required"}},
    {{"skill": "Redis", "category": "technical", "importance": "preferred"}}
  ],
  "extractedSkills": [
    {{"skill": "React", "category": "technical", "importance": "required"}},
    {{"skill": "Node.js", "category": "technical", "importance": "required"}}
  ],
  "recommendations": [
    {{
      "skill": "Docker",
      "priority": "high",
      "suggestedResources": [
        "Practice Docker interview questions",
        "Build one mini project using Docker",
        "Revise fundamentals of Docker"
      ]
    }}
  ]
}}

Rules:
- matchScore must be 0 to 100 (integer)
- matchedSkills are skills found in BOTH JD and resume
- missingSkills are skills in JD but NOT in resume
- extractedSkills are ALL skills found in the JD
- importance must be exactly: required, preferred, or nice-to-have
- userLevel must be exactly: beginner, intermediate, or advanced
- priority must be exactly: high, medium, or low
- recommendations must only include missingSkills
- Return ONLY the JSON, nothing else"""

    raw_output = generate_text(prompt)
    print(f"🤖 JD Analysis output:\n{raw_output}")

    cleaned = re.sub(r"```json|```", "", raw_output).strip()

    try:
        result = json.loads(cleaned)
        return {"success": True, "data": result}
    except json.JSONDecodeError:
        try:
            json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                return {"success": True, "data": result}
        except (json.JSONDecodeError, AttributeError):
            pass

    print("⚠️ JD JSON parse failed, using fallback")
    return {
        "success": True,
        "data": {
            "matchScore": 50,
            "matchedSkills": [],
            "missingSkills": [],
            "extractedSkills": [],
            "recommendations": []
        }
    }