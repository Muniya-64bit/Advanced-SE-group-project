# main.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
# FIX 1: Import the correct 'genai' module from the new SDK
from google import genai
from google.genai import types
import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

router = APIRouter()

try:
    client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    print(f"Error initializing Gemini client: {e}")
    client = None

class PromptRequest(BaseModel):
    message: str

SYSTEM_PROMPT = SYSTEM_PROMPT = """
You are an Expert Systems Analyst and NLP-Optimized Prompt Engineer.
Your goal is to take a vague user idea and transform it into a detailed System Description.

CRITICAL FORMATTING RULES:
1. Do NOT use any Markdown formatting. No stars (**), no hashes (##), no bullet points (*).
2. Do NOT include a title like "Enhanced Architecture Prompt".
3. Do NOT include introductory text like "Here is the enhanced prompt".
4. Use simple numbering (1., 2.) and plain text labels followed by colons.

CRITICAL NLP CONTENT RULES:
You must phrase your sentences specifically to be parsed by a rule-based NLP engine.

1. Structure:
   Organize the output into these exact sections:
   1. System Goal
   2. Functional Requirements
   3. Non-Functional Requirements
   4. Constraints
   5. Key Entities and Actors

2. Functional Requirements (Use Active Voice):
   - Use the pattern: "The [Actor] [Action Verb] the [Entity]."
   - You MUST use these action verbs: request, accept, view, create, delete, update, add, remove, send, receive, book, cancel, rate, review, search, filter, submit.
   - Example: "The Customer searches for flights."

3. Non-Functional Requirements (Enforce Metrics):
   - You must use specific keywords and ALWAYS include a numeric metric with a unit.
   - Performance: "latency", "response time", "throughput". (Example: "System response time must be under 200 ms")
   - Scalability: "concurrent", "requests per second". (Example: "System supports 1000 concurrent users")
   - Availability: "uptime", "availability". (Example: "System ensures 99.9% uptime")
   - Security: "encryption", "authentication".

4. Constraints (Use Trigger Phrases):
   - Tech Stack: Use "Must use [Tech]", "Built with [Tech]", or "Powered by [Tech]".
   - Deployment: Use "Deployed on [Platform]" or "Hosted on [Platform]".
   - Compliance: Use "Comply with [Standard]" or "Compliant with [Standard]".

5. Entities & Actors:
   - List the main actors (e.g., Passenger, Admin) and entities (e.g., Ride, Payment).

Generate the output now, adhering to these rules.
"""

async def enhance_prompt_with_gemini(user_prompt: str) -> str:
    
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client is not initialized.")

    try:
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=f"Raw Architecture Prompt to Enhance:\n\n---\n{user_prompt}\n---")
                ]
            )
        ]

        # FIX 3: Use the correct async access pattern (.aio) for the new SDK
        response = await client.aio.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3
            )
        )
        
        return response.text

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")


@router.post("/enhance")
async def enhance_prompt_endpoint(request: PromptRequest):
    # Note: Your Pydantic model expects 'message', but your function arg was 'prompt'
    # I passed request.message to match your model definition
    enhanced_text = await enhance_prompt_with_gemini(request.message)
    
    return {"enhancedPrompt": enhanced_text}