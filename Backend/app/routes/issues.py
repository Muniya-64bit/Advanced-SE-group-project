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
Your sole responsibility is to answer questions, solve architectural issues, and provide guidance
based strictly on the user's provided architecture context.

=====================================================================
MERMAID VERSION REQUIREMENTS — IMPORTANT  
=====================================================================
All diagrams MUST follow **Mermaid.js v11.12.1** syntax.

❗ STRICT RULES:
- Use **ONLY syntax supported in Mermaid v11.12.1**.
- Do NOT use deprecated or older 8.x/9.x syntax.
- Do NOT use future syntax from 12.x or experimental features.
- NO `sequenceDiagram` activation arrows (`activate`, `deactivate`).
- NO `flowchart LR;` on one line with extra semicolons — follow clean block syntax.
- Use `flowchart`, `classDiagram`, `erDiagram`, `stateDiagram`, `gantt`, or `mindmap` as defined in v11.12.1.
- Every diagram must be wrapped inside:

```mermaid
<diagram>
Must NOT include raw HTML, CSS or JS inside Mermaid blocks.

Avoid SVG attributes; Mermaid will generate them automatically.

=====================================================================
GENERAL RESPONSE GUIDELINES
Be Specific — reference the technologies and modules in the provided architecture.

Be Accurate — if proposing changes, explain exactly where they fit in the architecture.

Be Concise — prioritize clarity and bullet points.

Be Problem-Oriented — if the user reports an issue (latency, errors, bottlenecks),
analyze the architecture and propose targeted solutions.

Use Mermaid — when describing system structure, flows, pipelines, interactions,
or deployment models.

Never hallucinate new technologies not present in the architecture context unless asked.

=====================================================================
RESPONSE FORMAT
Your output MUST follow this order:

Short summary (1–2 sentences)

Direct answer to the question

Architecture-specific reasoning

(Optional) Mermaid DIAGRAMS using v11.12.1

If relevant, recommended improvements

All responses MUST be in Markdown format.
"""
# --- Endpoint ---

@router.post("/issues/chat")
async def chat_with_issues(request: IssueChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured.")

    try:
        # 1. Robust Extraction of Architecture Context
        arch_context_data = request.context or {}
        arch_summary = ""

        # STRATEGY A: Check specific fields for the proposal
        if arch_context_data.get("recommendation"):
            arch_summary = arch_context_data.get("recommendation")
        
        # STRATEGY B: Check 'summary' but filter out short placeholders
        # Your log showed summary was just "Architecture update", which is useless.
        elif arch_context_data.get("summary") and len(arch_context_data.get("summary")) > 50:
            arch_summary = arch_context_data.get("summary")

        # STRATEGY C: (CRITICAL FIX) Dig into the message history
        # The actual proposal is usually the last message sent by the assistant
        if not arch_summary and arch_context_data.get("messages"):
            messages = arch_context_data.get("messages", [])
            # Iterate backwards to find the latest detailed response
            for msg in reversed(messages):
                content = msg.get("content", "")
                role = msg.get("role", "")
                # We look for an assistant message that is long enough to be a proposal
                if role == "assistant" and len(content) > 200: 
                    arch_summary = content
                    break
        
        # Fallback
        if not arch_summary:
            arch_summary = "No detailed architecture design found in the context."

        # 2. Format Chat History for the Prompt
        history_text = ""
        if request.history:
            for msg in request.history:
                role_label = "USER" if msg.role == "user" else "ARCHITECT"
                # Ensure content isn't None
                content = msg.content if msg.content else ""
                history_text += f"{role_label}: {content}\n"

        # 3. Construct the Prompt
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

Based strictly on the "EXISTING ARCHITECTURE DESIGN" above, answer the user's question. 
If the user asks for diagrams, generating them using Mermaid.js syntax.
"""

        # 4. Call Gemini API
        response = await client.aio.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=full_prompt_content)]
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction=ISSUES_SYSTEM_INSTRUCTION,
                temperature=0.4
            )
        )

        return {"response": response.text}

    except Exception as e:
        print(f"Error in Issues Chat: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))