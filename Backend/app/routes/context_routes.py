"""
API routes for context management
Handles session creation, message history, and contextual interactions
"""

from fastapi import APIRouter, HTTPException
from controllers.context_manager import context_manager
from controllers.NLP_Processor import NLPProcessor
from controllers.RAG import get_architecture_recommendation
from models.context_models import (
    SessionCreate,
    SessionResponse,
    MessageInput,
    MessageResponse,
    ContextualRequirementsInput,
    ContextualArchitectureRequest,
    SetPersistentConstraint,
    AddTechnologyPreference,
    AddClarification,
    ResolveClarification,
    ConversationHistoryResponse,
    ContextSummaryResponse,
    SessionListResponse,
    CleanupResponse
)
from models.requirements_model import RequirementsAnalysisOutput
from typing import Optional

router = APIRouter(prefix="/api/context", tags=["Context Management"])

# Initialize NLP processor
nlp_processor = NLPProcessor()


@router.post("/sessions", response_model=SessionResponse)
async def create_session(session_data: SessionCreate):
    """
    Create a new conversation session
    """
    try:
        session_id = context_manager.create_session(user_id=session_data.user_id)
        session = context_manager.get_session(session_id)
        
        return SessionResponse(
            session_id=session_id,
            created_at=session.created_at.isoformat(),
            message="Session created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/sessions/{session_id}", response_model=ContextSummaryResponse)
async def get_session_summary(session_id: str):
    """
    Get a summary of the session context
    """
    summary = context_manager.get_context_summary(session_id)
    
    if not summary:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    return ContextSummaryResponse(**summary)


@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions():
    """
    List all active sessions
    """
    active_sessions = context_manager.list_active_sessions()
    return SessionListResponse(
        active_sessions=active_sessions,
        count=len(active_sessions)
    )


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a session
    """
    success = context_manager.clear_session(session_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully", "session_id": session_id}


@router.post("/sessions/cleanup", response_model=CleanupResponse)
async def cleanup_expired_sessions():
    """
    Clean up expired sessions
    """
    removed_count = context_manager.cleanup_expired_sessions()
    return CleanupResponse(
        expired_sessions_removed=removed_count,
        message=f"Removed {removed_count} expired session(s)"
    )


@router.post("/messages", response_model=MessageResponse)
async def add_message(message_input: MessageInput):
    """
    Add a message to the conversation history
    """
    success = context_manager.add_message(
        session_id=message_input.session_id,
        role=message_input.role,
        content=message_input.content,
        metadata=message_input.metadata
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    return MessageResponse(
        success=True,
        message="Message added successfully",
        session_id=message_input.session_id
    )


@router.get("/messages/{session_id}", response_model=ConversationHistoryResponse)
async def get_conversation_history(session_id: str, last_n: Optional[int] = None):
    """
    Get conversation history for a session
    """
    messages = context_manager.get_conversation_history(session_id, last_n)
    
    if messages is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    return ConversationHistoryResponse(
        session_id=session_id,
        messages=messages,
        total_count=len(messages)
    )


@router.post("/analyze-requirements", response_model=RequirementsAnalysisOutput)
async def analyze_requirements_with_context(input_data: ContextualRequirementsInput):
    """
    Analyze requirements with session context
    Maintains conversation history and merges with persistent constraints
    """
    try:
        # Get session
        session = context_manager.get_session(input_data.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        # Add user message to history
        context_manager.add_message(
            session_id=input_data.session_id,
            role="user",
            content=input_data.requirements_text
        )
        
        # Build context for better analysis
        conversation_context = context_manager.build_context_for_llm(input_data.session_id)
        
        # Perform NLP analysis
        full_context = f"{conversation_context}\n\nCurrent Request:\n{input_data.requirements_text}"
        if input_data.context:
            full_context += f"\n\nAdditional Context:\n{input_data.context}"
        
        result = nlp_processor.analyze_requirements(
            requirements_text=input_data.requirements_text,
            context=full_context
        )
        
        # Convert to dict for merging
        result_dict = result.dict()
        
        # Merge with persistent context
        merged_result = context_manager.merge_with_persistent_context(
            input_data.session_id,
            result_dict
        )
        
        # Update session with new requirements
        context_manager.update_requirements(input_data.session_id, merged_result)
        
        # Store NLP analysis in history
        context_manager.add_nlp_analysis(input_data.session_id, merged_result)
        
        # Update domain if provided
        if input_data.domain:
            session.domain = input_data.domain
        
        # Add assistant message (summary) to history
        context_manager.add_message(
            session_id=input_data.session_id,
            role="assistant",
            content=f"Analyzed requirements: {merged_result.get('summary', 'N/A')}",
            metadata={"type": "nlp_analysis"}
        )
        
        return RequirementsAnalysisOutput(**merged_result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/architecture-recommendation")
async def get_contextual_architecture_recommendation(input_data: ContextualArchitectureRequest):
    """
    Get architecture recommendation with full session context
    Uses conversation history and persistent constraints
    """
    try:
        # Get session
        session = context_manager.get_session(input_data.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or expired")
        
        # If new requirements provided, analyze them first
        if input_data.requirements_text:
            # Add user message
            context_manager.add_message(
                session_id=input_data.session_id,
                role="user",
                content=input_data.requirements_text
            )
            
            # Build context
            conversation_context = context_manager.build_context_for_llm(input_data.session_id)
            full_context = f"{conversation_context}\n\nCurrent Request:\n{input_data.requirements_text}"
            
            # Perform NLP analysis
            nlp_result = nlp_processor.analyze_requirements(
                requirements_text=input_data.requirements_text,
                context=full_context
            )
            
            # Merge with persistent context
            nlp_result_dict = nlp_result.dict()
            merged_result = context_manager.merge_with_persistent_context(
                input_data.session_id,
                nlp_result_dict
            )
            
            # Update session
            context_manager.update_requirements(input_data.session_id, merged_result)
            context_manager.add_nlp_analysis(input_data.session_id, merged_result)
        else:
            # Use existing requirements from session
            if not session.current_requirements:
                raise HTTPException(
                    status_code=400, 
                    detail="No requirements found in session. Please provide requirements_text."
                )
            merged_result = session.current_requirements
        
        # Build context for LLM
        llm_context = context_manager.build_context_for_llm(input_data.session_id)
        
        # Add context to the merged result for RAG processing
        merged_result["llm_context"] = llm_context
        merged_result["conversation_history"] = context_manager.get_conversation_history(
            input_data.session_id, 
            last_n=6
        )
        
        # Get architecture recommendation from RAG system
        recommendation = get_architecture_recommendation(merged_result)
        
        # Store recommendation in session
        recommendation_data = {
            "recommendation_text": recommendation,
            "based_on_requirements": merged_result.get("summary", "N/A")
        }
        context_manager.add_architecture_recommendation(
            input_data.session_id,
            recommendation_data
        )
        
        # Add assistant message to history
        context_manager.add_message(
            session_id=input_data.session_id,
            role="assistant",
            content=recommendation[:500] + "...",  # Truncate for history
            metadata={"type": "architecture_recommendation", "full_length": len(recommendation)}
        )
        
        return {
            "session_id": input_data.session_id,
            "recommendation": recommendation,
            "context_used": llm_context,
            "based_on_requirements": merged_result.get("summary", "N/A")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")


@router.post("/persistent-constraints")
async def set_persistent_constraint(constraint_data: SetPersistentConstraint):
    """
    Set a persistent constraint that applies to all future queries in the session
    """
    success = context_manager.set_persistent_constraint(
        session_id=constraint_data.session_id,
        key=constraint_data.key,
        value=constraint_data.value
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    return {
        "message": "Persistent constraint set successfully",
        "session_id": constraint_data.session_id,
        "constraint": {constraint_data.key: constraint_data.value}
    }


@router.post("/technology-preferences")
async def add_technology_preference(pref_data: AddTechnologyPreference):
    """
    Add a technology preference for the session
    """
    success = context_manager.add_technology_preference(
        session_id=pref_data.session_id,
        technology=pref_data.technology
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    return {
        "message": "Technology preference added successfully",
        "session_id": pref_data.session_id,
        "technology": pref_data.technology
    }


@router.post("/clarifications")
async def add_pending_clarification(clarification_data: AddClarification):
    """
    Add a question that needs clarification from the user
    """
    success = context_manager.add_pending_clarification(
        session_id=clarification_data.session_id,
        clarification=clarification_data.clarification
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    return {
        "message": "Clarification added successfully",
        "session_id": clarification_data.session_id,
        "clarification": clarification_data.clarification
    }


@router.post("/clarifications/resolve")
async def resolve_clarification(resolution_data: ResolveClarification):
    """
    Resolve a pending clarification
    """
    success = context_manager.resolve_clarification(
        session_id=resolution_data.session_id,
        question=resolution_data.question,
        answer=resolution_data.answer
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    return {
        "message": "Clarification resolved successfully",
        "session_id": resolution_data.session_id,
        "question": resolution_data.question,
        "answer": resolution_data.answer
    }


@router.get("/health")
async def context_health():
    """Health check for context management service"""
    active_count = len(context_manager.list_active_sessions())
    return {
        "status": "healthy",
        "service": "Context Management",
        "active_sessions": active_count
    }
