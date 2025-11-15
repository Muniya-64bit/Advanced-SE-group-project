"""
Context Manager for maintaining conversation history and user session context.
Handles multi-turn conversations and provides context-aware recommendations.
"""

from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import json
from collections import defaultdict
import uuid


class Message(BaseModel):
    """Represents a single message in the conversation"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Optional[Dict[str, Any]] = None


class ConversationContext(BaseModel):
    """Represents the context of an ongoing conversation"""
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=datetime.now)
    last_updated: datetime = Field(default_factory=datetime.now)
    
    # Domain-specific context
    current_requirements: Optional[Dict[str, Any]] = None
    nlp_analysis_history: List[Dict[str, Any]] = []
    architecture_recommendations: List[Dict[str, Any]] = []
    
    # User preferences and constraints that persist across turns
    persistent_constraints: Dict[str, Any] = Field(default_factory=dict)
    domain: Optional[str] = None
    technology_preferences: List[str] = Field(default_factory=list)
    
    # Clarification tracking
    pending_clarifications: List[str] = Field(default_factory=list)
    clarified_items: Dict[str, str] = Field(default_factory=dict)


class ContextManager:
    """
    Manages conversation contexts across multiple sessions.
    Provides context-aware processing and maintains conversation history.
    """
    
    def __init__(self, max_history_length: int = 10, session_timeout_minutes: int = 60):
        """
        Initialize the context manager
        
        Args:
            max_history_length: Maximum number of messages to keep in context
            session_timeout_minutes: Minutes before a session is considered expired
        """
        self.sessions: Dict[str, ConversationContext] = {}
        self.max_history_length = max_history_length
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
    
    def create_session(self, user_id: Optional[str] = None) -> str:
        """Create a new conversation session"""
        context = ConversationContext(user_id=user_id)
        self.sessions[context.session_id] = context
        return context.session_id
    
    def get_session(self, session_id: str) -> Optional[ConversationContext]:
        """Get an existing session by ID"""
        session = self.sessions.get(session_id)
        
        if session:
            # Check if session has expired
            if datetime.now() - session.last_updated > self.session_timeout:
                self._archive_session(session_id)
                return None
        
        return session
    
    def add_message(
        self, 
        session_id: str, 
        role: str, 
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Add a message to the conversation history"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        message = Message(role=role, content=content, metadata=metadata)
        session.messages.append(message)
        session.last_updated = datetime.now()
        
        # Trim history if it exceeds max length
        if len(session.messages) > self.max_history_length * 2:  # *2 for user+assistant pairs
            session.messages = session.messages[-(self.max_history_length * 2):]
        
        return True
    
    def update_requirements(
        self, 
        session_id: str, 
        requirements: Dict[str, Any]
    ) -> bool:
        """Update the current requirements in the session context"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        # Merge with existing requirements if any
        if session.current_requirements:
            # Append new functional requirements
            if "functional_requirements" in requirements:
                existing_frs = session.current_requirements.get("functional_requirements", [])
                existing_frs.extend(requirements["functional_requirements"])
                requirements["functional_requirements"] = existing_frs
            
            # Merge non-functional requirements
            if "non_functional_requirements" in requirements:
                existing_nfrs = session.current_requirements.get("non_functional_requirements", [])
                existing_nfrs.extend(requirements["non_functional_requirements"])
                requirements["non_functional_requirements"] = existing_nfrs
            
            # Merge constraints
            if "constraints" in requirements:
                existing_constraints = session.current_requirements.get("constraints", [])
                existing_constraints.extend(requirements["constraints"])
                requirements["constraints"] = existing_constraints
        
        session.current_requirements = requirements
        session.last_updated = datetime.now()
        
        return True
    
    def add_nlp_analysis(
        self, 
        session_id: str, 
        analysis_result: Dict[str, Any]
    ) -> bool:
        """Store NLP analysis result in history"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        analysis_entry = {
            "timestamp": datetime.now().isoformat(),
            "analysis": analysis_result
        }
        session.nlp_analysis_history.append(analysis_entry)
        
        # Keep only recent analyses (last 5)
        if len(session.nlp_analysis_history) > 5:
            session.nlp_analysis_history = session.nlp_analysis_history[-5:]
        
        return True
    
    def add_architecture_recommendation(
        self, 
        session_id: str, 
        recommendation: Dict[str, Any]
    ) -> bool:
        """Store architecture recommendation in history"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        rec_entry = {
            "timestamp": datetime.now().isoformat(),
            "recommendation": recommendation
        }
        session.architecture_recommendations.append(rec_entry)
        
        # Keep only recent recommendations (last 3)
        if len(session.architecture_recommendations) > 3:
            session.architecture_recommendations = session.architecture_recommendations[-3:]
        
        return True
    
    def set_persistent_constraint(
        self, 
        session_id: str, 
        key: str, 
        value: Any
    ) -> bool:
        """Set a persistent constraint that applies to all future queries"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        session.persistent_constraints[key] = value
        session.last_updated = datetime.now()
        
        return True
    
    def add_technology_preference(
        self, 
        session_id: str, 
        technology: str
    ) -> bool:
        """Add a technology preference for the session"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        if technology not in session.technology_preferences:
            session.technology_preferences.append(technology)
            session.last_updated = datetime.now()
        
        return True
    
    def get_conversation_history(
        self, 
        session_id: str, 
        last_n: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get conversation history for context"""
        session = self.get_session(session_id)
        
        if not session:
            return []
        
        messages = session.messages
        
        if last_n:
            messages = messages[-last_n:]
        
        return [
            {
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "metadata": msg.metadata
            }
            for msg in messages
        ]
    
    def get_context_summary(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get a summary of the current context for the session"""
        session = self.get_session(session_id)
        
        if not session:
            return None
        
        return {
            "session_id": session.session_id,
            "user_id": session.user_id,
            "created_at": session.created_at.isoformat(),
            "last_updated": session.last_updated.isoformat(),
            "message_count": len(session.messages),
            "domain": session.domain,
            "has_current_requirements": session.current_requirements is not None,
            "analysis_count": len(session.nlp_analysis_history),
            "recommendation_count": len(session.architecture_recommendations),
            "persistent_constraints": session.persistent_constraints,
            "technology_preferences": session.technology_preferences,
            "pending_clarifications": session.pending_clarifications
        }
    
    def build_context_for_llm(self, session_id: str) -> str:
        """
        Build a formatted context string to pass to the LLM
        This helps the LLM understand the conversation history and maintain continuity
        """
        session = self.get_session(session_id)
        
        if not session:
            return ""
        
        context_parts = []
        
        # Add conversation history (last 3 exchanges)
        recent_messages = session.messages[-6:] if len(session.messages) > 6 else session.messages
        if recent_messages:
            context_parts.append("=== CONVERSATION HISTORY ===")
            for msg in recent_messages:
                context_parts.append(f"{msg.role.upper()}: {msg.content[:200]}...")
            context_parts.append("")
        
        # Add persistent constraints
        if session.persistent_constraints:
            context_parts.append("=== PERSISTENT CONSTRAINTS ===")
            for key, value in session.persistent_constraints.items():
                context_parts.append(f"- {key}: {value}")
            context_parts.append("")
        
        # Add technology preferences
        if session.technology_preferences:
            context_parts.append("=== TECHNOLOGY PREFERENCES ===")
            context_parts.append(f"Preferred technologies: {', '.join(session.technology_preferences)}")
            context_parts.append("")
        
        # Add domain context
        if session.domain:
            context_parts.append(f"=== DOMAIN: {session.domain} ===")
            context_parts.append("")
        
        # Add current requirements summary
        if session.current_requirements:
            context_parts.append("=== CURRENT REQUIREMENTS SUMMARY ===")
            req = session.current_requirements
            if req.get("summary"):
                context_parts.append(f"Summary: {req['summary']}")
            if req.get("functional_requirements"):
                context_parts.append(f"Functional Requirements: {len(req['functional_requirements'])} items")
            if req.get("non_functional_requirements"):
                context_parts.append(f"Non-Functional Requirements: {len(req['non_functional_requirements'])} items")
            if req.get("constraints"):
                context_parts.append(f"Constraints: {len(req['constraints'])} items")
            context_parts.append("")
        
        # Add pending clarifications
        if session.pending_clarifications:
            context_parts.append("=== PENDING CLARIFICATIONS ===")
            for clarification in session.pending_clarifications:
                context_parts.append(f"- {clarification}")
            context_parts.append("")
        
        return "\n".join(context_parts)
    
    def add_pending_clarification(
        self, 
        session_id: str, 
        clarification: str
    ) -> bool:
        """Add a question that needs clarification from the user"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        if clarification not in session.pending_clarifications:
            session.pending_clarifications.append(clarification)
            session.last_updated = datetime.now()
        
        return True
    
    def resolve_clarification(
        self, 
        session_id: str, 
        question: str, 
        answer: str
    ) -> bool:
        """Mark a clarification as resolved"""
        session = self.get_session(session_id)
        
        if not session:
            return False
        
        session.clarified_items[question] = answer
        
        # Remove from pending
        if question in session.pending_clarifications:
            session.pending_clarifications.remove(question)
        
        session.last_updated = datetime.now()
        
        return True
    
    def merge_with_persistent_context(
        self, 
        session_id: str, 
        new_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Merge new requirements with persistent context from the session
        This ensures continuity across multiple interactions
        """
        session = self.get_session(session_id)
        
        if not session:
            return new_requirements
        
        merged = new_requirements.copy()
        
        # Add persistent constraints to the constraints list
        if session.persistent_constraints:
            if "constraints" not in merged:
                merged["constraints"] = []
            
            for key, value in session.persistent_constraints.items():
                constraint_exists = any(
                    c.get("value") == value for c in merged["constraints"]
                )
                if not constraint_exists:
                    merged["constraints"].append({
                        "id": f"PC{len(merged['constraints']) + 1}",
                        "text": f"Persistent constraint: {key} = {value}",
                        "type": "persistent",
                        "value": str(value),
                        "mandatory": True
                    })
        
        # Add technology preferences
        if session.technology_preferences:
            if "technologies_mentioned" not in merged:
                merged["technologies_mentioned"] = []
            
            for tech in session.technology_preferences:
                if tech not in merged["technologies_mentioned"]:
                    merged["technologies_mentioned"].append(tech)
        
        # Add domain if available
        if session.domain and not merged.get("domain"):
            merged["domain"] = session.domain
        
        return merged
    
    def clear_session(self, session_id: str) -> bool:
        """Clear a session (soft delete - keeps in memory but marks as cleared)"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def _archive_session(self, session_id: str):
        """Archive an expired session (could save to database in production)"""
        # In production, you would save this to a database
        # For now, we just remove it
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def list_active_sessions(self) -> List[str]:
        """Get list of all active session IDs"""
        return list(self.sessions.keys())
    
    def cleanup_expired_sessions(self):
        """Remove all expired sessions"""
        current_time = datetime.now()
        expired_sessions = [
            session_id 
            for session_id, session in self.sessions.items()
            if current_time - session.last_updated > self.session_timeout
        ]
        
        for session_id in expired_sessions:
            self._archive_session(session_id)
        
        return len(expired_sessions)


# Global context manager instance
context_manager = ContextManager(max_history_length=10, session_timeout_minutes=60)
