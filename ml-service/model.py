from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

api_key = "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"
if not api_key:
    raise ValueError("GROQ_API_KEY not found!")

client = Groq(api_key=api_key)
print("✅ Groq model ready!")


def generate_text(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an expert placement preparation coach. Always respond with valid JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=1024,
    )
    return response.choices[0].message.content