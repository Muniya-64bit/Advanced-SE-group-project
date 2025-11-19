from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from google import genai
from google.genai import types
import os
import traceback

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class IssueChatRequest(BaseModel):
    message: str
    projectId: str
    # Context comes from the frontend's architectureContext
    context: Optional[Dict[str, Any]] = None 
    history: List[ChatMessage] = []

# --- System Prompt ---

ISSUES_SYSTEM_INSTRUCTION = """
You are an Expert Software Architecture Consultant and Technical Lead.
Your role is to answer questions, solve problems, and provide guidance specifically regarding the user's defined software architecture.

CONTEXTUAL AWARENESS:
1. You will be provided with an "Existing Architecture Design". This is the absolute truth of the project.
2. You will be provided with "Chat History" to understand the conversation flow.

GUIDELINES:
- **Be Specific:** Do not give generic advice. Reference the specific technologies, modules, and patterns defined in the Context. 
- **Use Diagrams:** If a solution requires visual explanation, use Mermaid.js syntax wrapped in ```mermaid code blocks.
- **Be Concise:** Get straight to the solution. Use bullet points for readability.
- **Problem Solving:** If the user reports an issue (e.g., "latency is high"), analyze their specific architecture to find the bottleneck (e.g., "You are using a Monolith but have high NFRs, consider caching with Redis").

FORMATTING:
- Use Markdown for all responses.
- Code blocks for code snippets.
- Mermaid blocks for diagrams.
"""

# --- Endpoint ---

@router.post("/issues/chat")
async def chat_with_issues(request: IssueChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured.")

    try:
        # 1. Extract Architecture Context
        # The frontend might send the whole context object, we mainly need the summary/recommendation
        arch_summary = "No architecture defined yet."
        if request.context:
            # Try to find the most descriptive text available
            arch_summary = (
                request.context.get("summary") or 
                request.context.get("recommendation") or 
                request.context.get("message") or 
                "No detailed architecture found."
            )

        # 2. Format Chat History for the Prompt
        # We convert the list of objects into a readable script format
        history_text = ""
        if request.history:
            for msg in request.history:
                role_label = "USER" if msg.role == "user" else "ARCHITECT"
                history_text += f"{role_label}: {msg.content}\n"

        # 3. Construct the User Message with Context Injection
        # We inject the context into the user's message so the model sees it immediately
        full_prompt_content = f"""
=== EXISTING ARCHITECTURE DESIGN ===
{arch_summary}
====================================

=== CONVERSATION HISTORY ===
{history_text}
============================

=== CURRENT USER QUESTION ===
{request.message}
=============================

Please answer the user's question based strictly on the Architecture Design above.
"""

        # 4. Call Gemini API
        response = await client.aio.models.generate_content(
            model='gemini-2.0-flash', # Or 'gemini-1.5-flash'
            contents=[
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=full_prompt_content)]
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction=ISSUES_SYSTEM_INSTRUCTION,
                temperature=0.4 # Lower temperature for more technical/precise answers
            )
        )

        return {"response": response.text}

    except Exception as e:
        print(f"Error in Issues Chat: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))