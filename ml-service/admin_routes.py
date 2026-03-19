from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from model import generate_text
import json
import re

router = APIRouter(prefix="/admin", tags=["Admin"])


class AlumniInput(BaseModel):
    rawAlumniInput: str


@router.post("/generate-guidelines")
def generate_guidelines(body: AlumniInput):
    text = body.rawAlumniInput.strip()

    if not text:
        raise HTTPException(status_code=400, detail="rawAlumniInput is required")

    prompt = f"""You are an expert placement preparation coach.

Analyze this alumni interview experience and return ONLY a valid JSON object.
No explanation, no markdown, no extra text — ONLY the JSON.

Alumni Experience:
{text}

Return exactly this JSON structure:
{{
  "roundStructure": ["list of interview rounds in order"],
  "difficultyEstimate": "Easy or Medium or Hard",
  "focusDistribution": {{
    "dsa": 25,
    "coreCS": 25,
    "systemDesign": 25,
    "hr": 25
  }},
  "keyTopics": ["list of key topics asked"],
  "preparationGuidelines": ["5 to 8 practical preparation tips"]
}}

Rules:
- focusDistribution values must add up to 100
- difficultyEstimate must be exactly Easy, Medium, or Hard
- preparationGuidelines must have 5 to 8 items
- Return ONLY the JSON, nothing else"""

    raw_output = generate_text(prompt)
    print(f"🤖 Guidelines output:\n{raw_output}")

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

    print("⚠️ Guidelines JSON parse failed, using fallback")
    return {
        "success": True,
        "data": {
            "roundStructure": ["Online Assessment", "Technical Round", "HR Round"],
            "difficultyEstimate": "Medium",
            "focusDistribution": {
                "dsa": 30,
                "coreCS": 25,
                "systemDesign": 20,
                "hr": 25
            },
            "keyTopics": [],
            "preparationGuidelines": [
                "Focus on DSA fundamentals",
                "Practice coding problems daily",
                "Revise core CS subjects",
                "Prepare projects to discuss",
                "Practice mock interviews"
            ]
        }
    }