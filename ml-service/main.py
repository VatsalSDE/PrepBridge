from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import generate_text
import json
import re

app = FastAPI(title="PrepBridge ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AlumniInput(BaseModel):
    rawAlumniInput: str


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "PrepBridge ML Service"}


@app.post("/generate-guidelines")
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
    print(f"🤖 Gemini output:\n{raw_output}")

    # Clean markdown if Gemini wraps in ```json
    cleaned = re.sub(r"```json|```", "", raw_output).strip()

    try:
        result = json.loads(cleaned)
        return {"success": True, "data": result}
    except json.JSONDecodeError:
        # Try extracting JSON from response
        try:
            json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                return {"success": True, "data": result}
        except (json.JSONDecodeError, AttributeError):
            pass

    # Fallback if everything fails
    print("⚠️ JSON parse failed, using fallback")
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