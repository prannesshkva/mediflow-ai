import uuid
import time
from typing import TypedDict, Optional, List, Any, Dict
from langgraph.graph import StateGraph, END

from app.agents.classifier import run_classifier
from app.agents.risk_agent import run_risk_agent
from app.agents.rag_agent import run_rag_agent
from app.agents.appointment_agent import run_appointment_agent
from app.agents.validator_agent import run_validator_agent
from app.agents.response_agent import run_response_agent
from app.core.circuit_breaker import get_circuit_breaker
from app.database.supabase import db

class WorkflowState(TypedDict):
    tenant_id: str
    clinic_name: str
    query: str
    patient_name: str
    user_id: str
    session_id: str
    history: Optional[List[Dict[str, str]]]

    intent: Optional[str]
    risk_level: Optional[str]
    escalate: Optional[bool]
    risk_reason: Optional[str]

    rag_context: Optional[List[str]]
    rag_used_real: Optional[bool]
    appointment_data: Optional[Dict]
    response_draft: Optional[str]
    validation_result: Optional[Dict]
    final_response: Optional[str]

    # Human-in-the-Loop (HITL) Oversight Fields
    hitl_required: bool
    hitl_status: str  # "auto_approved" | "pending_clinician_review" | "clinician_approved" | "rejected"
    hitl_review_id: Optional[str]
    clinician_id: Optional[str]
    clinician_notes: Optional[str]

    circuit_breaker_status: str
    agent_trace: List[Dict]

def classifier_node(state: WorkflowState) -> WorkflowState:
    intent, duration = run_classifier(state["query"])
    state["intent"] = intent
    state["agent_trace"].append({
        "agent": "Query Classifier",
        "status": "completed",
        "output": {"intent": intent, "tenant_id": state["tenant_id"]},
        "duration_ms": duration,
    })
    return state

def risk_node(state: WorkflowState) -> WorkflowState:
    risk_result, duration = run_risk_agent(state["query"], state["intent"])
    state["risk_level"] = risk_result["risk_level"]
    state["escalate"] = risk_result["escalate"]
    state["risk_reason"] = risk_result["reason"]
    state["agent_trace"].append({
        "agent": "Risk Evaluator",
        "status": "completed",
        "output": risk_result,
        "duration_ms": duration,
    })

    if risk_result["escalate"]:
        db.create_escalation({
            "tenant_id": state["tenant_id"],
            "patient_name": state["patient_name"],
            "risk_level": risk_result["risk_level"],
            "issue": risk_result["reason"],
            "query": state["query"],
        })

    return state

def hitl_gate_node(state: WorkflowState) -> WorkflowState:
    """
    Human-in-the-Loop (HITL) Clinical Oversight Gate.
    Suspends autonomous agent output when high clinical risk or emergency symptoms
    are detected, staging the case into the urgent clinician review queue.
    """
    is_critical = (state["risk_level"] == "HIGH" or state["intent"] == "emergency_symptom")

    if is_critical:
        state["hitl_required"] = True
        state["hitl_status"] = "pending_clinician_review"

        preliminary_draft = (
            f"🚨 **Clinical Triage Notice — Urgent Provider Review Required**\n\n"
            f"Patient reported acute symptoms: *\"{state['query']}\"*\n"
            f"Initial Risk Assessment: **{state['risk_level']}** ({state['risk_reason']}).\n\n"
            f"This case has been suspended for clinician sign-off. If you are experiencing "
            f"an immediate emergency, call 112 / 911 or proceed to the nearest emergency department."
        )

        review_record = db.create_hitl_review({
            "tenant_id": state["tenant_id"],
            "session_id": state["session_id"],
            "patient_name": state["patient_name"],
            "patient_id": state["user_id"],
            "query": state["query"],
            "intent": state["intent"] or "emergency_symptom",
            "risk_level": state["risk_level"] or "HIGH",
            "risk_reason": state["risk_reason"] or "High-risk triage protocol",
            "proposed_response": preliminary_draft,
            "status": "pending_clinician_review",
        })

        state["hitl_review_id"] = review_record["id"]
        state["response_draft"] = preliminary_draft
        state["final_response"] = preliminary_draft

        state["agent_trace"].append({
            "agent": "HITL Clinical Oversight Gate",
            "status": "suspended",
            "output": {
                "action": "suspended_pending_review",
                "review_id": review_record["id"],
                "reason": state["risk_reason"],
            },
            "duration_ms": 5,
        })
    else:
        state["hitl_required"] = False
        state["hitl_status"] = "auto_approved"
        state["agent_trace"].append({
            "agent": "HITL Clinical Oversight Gate",
            "status": "completed",
            "output": {"action": "auto_approved", "risk_level": state["risk_level"]},
            "duration_ms": 2,
        })

    return state

def rag_node(state: WorkflowState) -> WorkflowState:
    chunks, used_real, duration = run_rag_agent(state["query"], state["intent"])
    state["rag_context"] = chunks
    state["rag_used_real"] = used_real
    state["agent_trace"].append({
        "agent": "RAG Retrieval",
        "status": "completed",
        "output": {
            "chunks_retrieved": len(chunks),
            "source": "pinecone" if used_real else "knowledge_base",
        },
        "duration_ms": duration,
    })
    return state

def appointment_node(state: WorkflowState) -> WorkflowState:
    appt_data, duration = run_appointment_agent(
        state["query"], state["intent"], state["patient_name"], state["user_id"]
    )
    state["appointment_data"] = appt_data
    state["agent_trace"].append({
        "agent": "Appointment Router",
        "status": "completed",
        "output": appt_data or {"action": "not_applicable"},
        "duration_ms": duration,
    })
    return state

def response_node(state: WorkflowState) -> WorkflowState:
    response_draft, duration = run_response_agent(
        query=state["query"],
        intent=state["intent"],
        context=state["rag_context"] or [],
        risk_level=state["risk_level"],
        appointment_data=state["appointment_data"],
        history=state.get("history"),
    )
    state["response_draft"] = response_draft
    state["agent_trace"].append({
        "agent": "Response Writer",
        "status": "completed",
        "output": {"response_length": len(response_draft)},
        "duration_ms": duration,
    })
    return state

def validator_node(state: WorkflowState) -> WorkflowState:
    val_result, duration = run_validator_agent(
        response_draft=state["response_draft"] or "",
        intent=state["intent"] or "general_inquiry",
        risk_level=state["risk_level"] or "LOW",
        rag_context_used=bool(state.get("rag_context")),
        patient_query=state.get("query", ""),
    )
    state["validation_result"] = val_result
    state["final_response"] = val_result["modified_response"]
    state["circuit_breaker_status"] = get_circuit_breaker().state.value

    state["agent_trace"].append({
        "agent": "Validator & Circuit Breaker",
        "status": "completed",
        "output": {
            "passed": val_result["passed"],
            "confidence": val_result["confidence"],
            "issues": val_result["issues"],
            "circuit_breaker": state["circuit_breaker_status"],
            "contraindications_flagged": len(val_result.get("contraindications", [])),
        },
        "duration_ms": duration,
    })

    db.create_chat_log({
        "tenant_id": state["tenant_id"],
        "session_id": state["session_id"],
        "patient_name": state["patient_name"],
        "query": state["query"],
        "intent": state["intent"],
        "risk_level": state["risk_level"],
        "response": state["final_response"],
        "agent_trace": state["agent_trace"],
        "hitl_status": state["hitl_status"],
    })

    return state

# ----------------------------------------------------------------------
# Subgraphs & Graph Composition
# ----------------------------------------------------------------------
def build_data_gathering_subgraph() -> StateGraph:
    subgraph = StateGraph(WorkflowState)
    subgraph.add_node("rag_retrieval", rag_node)
    subgraph.add_node("appointment_router", appointment_node)
    subgraph.set_entry_point("rag_retrieval")
    subgraph.add_edge("rag_retrieval", "appointment_router")
    subgraph.add_edge("appointment_router", END)
    return subgraph.compile()

def build_response_generation_subgraph() -> StateGraph:
    subgraph = StateGraph(WorkflowState)
    subgraph.add_node("response_writer", response_node)
    subgraph.add_node("validator", validator_node)
    subgraph.set_entry_point("response_writer")
    subgraph.add_edge("response_writer", "validator")
    subgraph.add_edge("validator", END)
    return subgraph.compile()

data_gathering = build_data_gathering_subgraph()
response_generation = build_response_generation_subgraph()

def _route_after_hitl_gate(state: WorkflowState) -> str:
    """Conditional edge deciding whether to suspend or proceed to generation."""
    if state.get("hitl_required") and state.get("hitl_status") == "pending_clinician_review":
        return "suspended"
    return "proceed"

def build_workflow() -> StateGraph:
    graph = StateGraph(WorkflowState)
    graph.add_node("classifier", classifier_node)
    graph.add_node("risk_evaluator", risk_node)
    graph.add_node("hitl_gate", hitl_gate_node)
    graph.add_node("data_gathering_subgraph", data_gathering)
    graph.add_node("response_generation_subgraph", response_generation)

    graph.set_entry_point("classifier")
    graph.add_edge("classifier", "risk_evaluator")
    graph.add_edge("risk_evaluator", "hitl_gate")

    graph.add_conditional_edges(
        "hitl_gate",
        _route_after_hitl_gate,
        {
            "suspended": END,
            "proceed": "data_gathering_subgraph",
        }
    )

    graph.add_edge("data_gathering_subgraph", "response_generation_subgraph")
    graph.add_edge("response_generation_subgraph", END)
    return graph.compile()

workflow = build_workflow()

def run_workflow(
    query: str,
    patient_name: str = "Anonymous",
    user_id: str = "anon-user",
    session_id: Optional[str] = None,
    tenant_id: str = "tenant-default",
    history: Optional[List[Dict[str, str]]] = None,
) -> WorkflowState:
    sess = session_id or str(uuid.uuid4())

    turn_history = history
    if turn_history is None:
        turn_history = []
        try:
            past_logs = db.get_session_messages(sess)
            for l in past_logs[-8:]:
                if l.get("query"):
                    turn_history.append({"role": "user", "content": l["query"]})
                if l.get("response"):
                    turn_history.append({"role": "assistant", "content": l["response"]})
        except Exception:
            pass

    initial_state: WorkflowState = {
        "tenant_id": tenant_id,
        "clinic_name": "Metro Health Clinic",
        "query": query,
        "patient_name": patient_name,
        "user_id": user_id,
        "session_id": sess,
        "history": turn_history,
        "intent": None,
        "risk_level": None,
        "escalate": False,
        "risk_reason": None,
        "rag_context": None,
        "rag_used_real": False,
        "appointment_data": None,
        "response_draft": None,
        "validation_result": None,
        "final_response": None,
        "hitl_required": False,
        "hitl_status": "auto_approved",
        "hitl_review_id": None,
        "clinician_id": None,
        "clinician_notes": None,
        "circuit_breaker_status": get_circuit_breaker().state.value,
        "agent_trace": [],
    }
    return workflow.invoke(initial_state)

def resume_workflow_after_hitl(
    review_id: str,
    action: str,  # "approve" | "modify" | "reject"
    modified_response: Optional[str] = None,
    clinician_id: str = "clinician-001",
    clinician_notes: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Resumes a suspended workflow after a licensed clinician has reviewed
    the high-risk triage case and submitted their review decision.
    """
    review = db.get_hitl_review(review_id)
    if not review:
        return None

    if action == "approve":
        final_text = review["proposed_response"]
        new_status = "clinician_approved"
    elif action == "modify":
        final_text = modified_response or review["proposed_response"]
        new_status = "clinician_approved"
    else:  # reject
        final_text = (
            "❌ **Triage Suspended**: A licensed provider reviewed this request and determined "
            "it cannot be handled safely via asynchronous triage. Please report to in-person care."
        )
        new_status = "rejected"

    updated = db.update_hitl_review(review_id, {
        "status": new_status,
        "clinician_id": clinician_id,
        "clinician_notes": clinician_notes or f"Clinician action: {action}",
        "final_response": final_text,
    })

    db.create_chat_log({
        "tenant_id": review["tenant_id"],
        "session_id": review["session_id"],
        "patient_name": review["patient_name"],
        "query": review["query"],
        "intent": review["intent"],
        "risk_level": review["risk_level"],
        "response": final_text,
        "hitl_status": new_status,
        "agent_trace": [
            {
                "agent": "HITL Clinician Oversight Review",
                "status": "completed",
                "output": {
                    "action": action,
                    "clinician_id": clinician_id,
                    "review_id": review_id,
                },
                "duration_ms": 10,
            }
        ],
    })

    return updated
