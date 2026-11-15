from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from app.database.models import ChatRequest, ChatResponse, AgentTraceStep
from app.database.supabase import db
from app.graph.workflow import run_workflow
from app.auth import get_current_user, User
from app.core.circuit_breaker import get_circuit_breaker

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user: User = Depends(get_current_user)):
    tenant_id = request.tenant_id or getattr(user, "tenant_id", None) or "tenant-default"
    patient_name = request.patient_name or (user.name if user.name != "Unknown User" else "Anonymous")

    result = run_workflow(
        query=request.query,
        patient_name=patient_name,
        user_id=user.uid,
        session_id=request.session_id,
        tenant_id=tenant_id,
        history=request.history,
    )

    trace = [
        AgentTraceStep(
            agent=step["agent"],
            status=step["status"],
            output=step.get("output"),
            duration_ms=step.get("duration_ms"),
        )
        for step in result["agent_trace"]
    ]

    return ChatResponse(
        response=result["final_response"] or "I'm sorry, I couldn't process your request. Please try again.",
        intent=result["intent"] or "general_inquiry",
        risk_level=result["risk_level"] or "LOW",
        escalated=result.get("escalate", False),
        agent_trace=trace,
        session_id=result["session_id"],
        tenant_id=tenant_id,
        hitl_status=result.get("hitl_status", "auto_approved"),
        hitl_required=result.get("hitl_required", False),
        hitl_review_id=result.get("hitl_review_id"),
        appointment_data=result.get("appointment_data"),
        rag_context_used=bool(result.get("rag_context")),
        circuit_breaker_status=result.get("circuit_breaker_status", get_circuit_breaker().state.value),
    )

@router.get("/chat/sessions", response_model=List[Dict[str, Any]])
async def list_chat_sessions(
    tenant_id: str = "tenant-default",
    user: User = Depends(get_current_user),
):
    """Retrieves all active multi-turn chat sessions for the tenant."""
    t_id = tenant_id or getattr(user, "tenant_id", "tenant-default")
    return db.get_sessions(tenant_id=t_id)

@router.get("/chat/sessions/{session_id}", response_model=List[Dict[str, Any]])
async def get_session_history(
    session_id: str,
    user: User = Depends(get_current_user),
):
    """Retrieves full conversation history for a specific session."""
    return db.get_session_messages(session_id=session_id)

@router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    user: User = Depends(get_current_user),
):
    """Deletes a chat session and its associated conversation turns."""
    deleted = db.delete_session(session_id)
    return {"success": True, "session_id": session_id, "deleted": deleted}
