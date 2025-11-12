"""
Pydantic models for context management API requests and responses
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class SessionCreate(BaseModel):
    """Request model for creating a new session"""
    user_id: Optional[str] = None


class SessionResponse(BaseModel):
    """Response model for session creation"""
    session_id: str
    created_at: str
    message: str = "Session created successfully"


class MessageInput(BaseModel):
    """Request model for adding a message to a session"""
    session_id: str
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str
    metadata: Optional[Dict[str, Any]] = None


class MessageResponse(BaseModel):
    """Response model for message operations"""
    success: bool
    message: str
    session_id: str


class ContextualRequirementsInput(BaseModel):
    """Request model for analyzing requirements with context"""
    session_id: str
    requirements_text: str
    context: Optional[str] = None
    domain: Optional[str] = None


class ContextualArchitectureRequest(BaseModel):
    """Request model for getting architecture recommendation with context"""
    session_id: str
    requirements_text: Optional[str] = None  # Can be omitted if using session context
    force_new_analysis: bool = False  # Whether to force a new NLP analysis


class SetPersistentConstraint(BaseModel):
    """Request model for setting a persistent constraint"""
    session_id: str
    key: str
    value: Any


class AddTechnologyPreference(BaseModel):
    """Request model for adding a technology preference"""
    session_id: str
    technology: str


class AddClarification(BaseModel):
    """Request model for adding a pending clarification"""
    session_id: str
    clarification: str


class ResolveClarification(BaseModel):
    """Request model for resolving a clarification"""
    session_id: str
    question: str
    answer: str


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history"""
    session_id: str
    messages: List[Dict[str, Any]]
    total_count: int


class ContextSummaryResponse(BaseModel):
    """Response model for context summary"""
    session_id: str
    user_id: Optional[str]
    created_at: str
    last_updated: str
    message_count: int
    domain: Optional[str]
    has_current_requirements: bool
    analysis_count: int
    recommendation_count: int
    persistent_constraints: Dict[str, Any]
    technology_preferences: List[str]
    pending_clarifications: List[str]


class SessionListResponse(BaseModel):
    """Response model for listing active sessions"""
    active_sessions: List[str]
    count: int


class CleanupResponse(BaseModel):
    """Response model for cleanup operations"""
    expired_sessions_removed: int
    message: str
