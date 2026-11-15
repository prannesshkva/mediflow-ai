"""
MediFlow AI Comprehensive Test Suite
Validates:
1. Multi-tenant clinical triage workflow in LangGraph (strict tenant_id isolation, state partitioning)
2. Human-in-the-Loop (HITL) clinical oversight engine (suspending execution on emergency, clinician sign-off)
3. Non-blocking high-throughput clinical document ingestion pipeline (Pydantic v2 schemas)
4. Automated safety validator & contraindication screening
5. Runtime circuit breakers (CLOSED -> OPEN -> HALF_OPEN & fail-safe fallbacks)
6. End-to-end FastAPI HTTP API endpoints
"""

import pytest
import asyncio
import uuid
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database.supabase import db
from app.database.models import (
    ClinicalNotePayload,
    HITLReviewItem,
    HITLAction,
    RiskLevel,
    HITLStatus,
)
from app.core.circuit_breaker import ClinicalCircuitBreaker, CircuitBreakerOpenException
from app.agents.validator_agent import run_validator_agent, CONTRAINDICATION_RULES
from app.graph.workflow import run_workflow, resume_workflow_after_hitl
from app.rag.ingest import parse_clinical_document_async, batch_ingest_documents_async


# -----------------------------------------------------------------------------
# 1. Multi-Tenant State Isolation Tests
# -----------------------------------------------------------------------------
def test_multi_tenant_state_isolation():
    """Verify strict tenant isolation: data created under Tenant A is inaccessible to Tenant B."""
    tenant_a = "clinic-apollo-delhi"
    tenant_b = "clinic-manipal-blr"

    # Seed an appointment in Tenant A
    appt_a = db.create_appointment({
        "patient_name": "Patient-Tenant-A",
        "doctor_name": "Department of Cardiology",
        "appointment_date": "2026-06-01T10:00:00Z",
        "tenant_id": tenant_a,
        "status": "confirmed",
    })
    assert appt_a["id"] is not None
    assert appt_a["tenant_id"] == tenant_a

    # Seed an appointment in Tenant B
    appt_b = db.create_appointment({
        "patient_name": "Patient-Tenant-B",
        "doctor_name": "Department of General Medicine",
        "appointment_date": "2026-06-02T11:00:00Z",
        "tenant_id": tenant_b,
        "status": "confirmed",
    })
    assert appt_b["id"] is not None
    assert appt_b["tenant_id"] == tenant_b

    # Query Tenant A: must only see Tenant A appointments
    appts_a = db.get_appointments(tenant_id=tenant_a)
    patient_names_a = [a["patient_name"] for a in appts_a]
    assert "Patient-Tenant-A" in patient_names_a
    assert "Patient-Tenant-B" not in patient_names_a

    # Query Tenant B: must only see Tenant B appointments
    appts_b = db.get_appointments(tenant_id=tenant_b)
    patient_names_b = [b["patient_name"] for b in appts_b]
    assert "Patient-Tenant-B" in patient_names_b
    assert "Patient-Tenant-A" not in patient_names_b

    # Enforce tenant isolation on HITL review items
    review_a = db.create_hitl_review({
        "tenant_id": tenant_a,
        "session_id": "sess-a-101",
        "patient_name": "Arjun Patel",
        "patient_id": "pat-a-1",
        "query": "Chest tightness",
        "intent": "emergency_symptom",
        "risk_level": "HIGH",
        "risk_reason": "Cardiac symptoms flagged",
        "proposed_response": "Urgent ER care required.",
        "status": "pending_clinician_review",
    })

    reviews_a = db.get_hitl_reviews(tenant_id=tenant_a)
    reviews_b = db.get_hitl_reviews(tenant_id=tenant_b)
    assert any(r["id"] == review_a["id"] for r in reviews_a)
    assert not any(r["id"] == review_a["id"] for r in reviews_b)


# -----------------------------------------------------------------------------
# 2. LangGraph Routine Clinical Triage Workflow
# -----------------------------------------------------------------------------
def test_langgraph_routine_workflow():
    """Verify low/medium risk queries execute deterministically through multi-agent graph with auto-approval."""
    query = "What are the clinic timings and how can I prepare for a routine health checkup?"
    result = run_workflow(
        query=query,
        patient_name="Pooja Sen",
        user_id="user-pooja",
        tenant_id="tenant-test-routine",
    )

    assert result["intent"] in ["clinic_info", "clinic_policy", "general_inquiry", "symptom_triage"]
    assert result["risk_level"] in ["LOW", "MEDIUM"]
    assert result["hitl_required"] is False
    assert result["hitl_status"] == "auto_approved"
    assert len(result["final_response"]) > 20
    assert len(result["agent_trace"]) >= 4

    # Verify agent trace contains core nodes
    agent_names = [step["agent"] for step in result["agent_trace"]]
    assert "Query Classifier" in agent_names
    assert "Risk Evaluator" in agent_names
    assert any("Validator" in name for name in agent_names)


# -----------------------------------------------------------------------------
# 3. Human-in-the-Loop (HITL) Execution Suspension on Emergency
# -----------------------------------------------------------------------------
def test_hitl_suspension_on_emergency():
    """Verify high-risk/emergency inputs suspend live execution at hitl_gate, awaiting clinician sign-off."""
    query = "I have severe crushing chest pain radiating to my left jaw, shortness of breath, and profuse cold sweating."
    result = run_workflow(
        query=query,
        patient_name="Patient-Alpha",
        user_id="user-alpha",
        tenant_id="tenant-test-emergency",
    )

    assert result["risk_level"] == "HIGH"
    assert result["intent"] == "emergency_symptom"
    assert result["hitl_required"] is True
    assert result["hitl_status"] == "pending_clinician_review"
    assert result["hitl_review_id"] is not None

    # Check that execution was suspended at the HITL gate
    agent_names = [s["agent"] for s in result["agent_trace"]]
    assert "HITL Clinical Oversight Gate" in agent_names
    # Autonomous response generation should have been suspended
    assert "Response Writer" not in agent_names

    # Verify review item was enqueued in database
    review = db.get_hitl_review(result["hitl_review_id"])
    assert review is not None
    assert review["status"] == "pending_clinician_review"
    assert review["patient_name"] == "Patient-Alpha"
    assert review["risk_level"] == "HIGH"


# -----------------------------------------------------------------------------
# 4. Clinician Review & Resume Workflow
# -----------------------------------------------------------------------------
def test_hitl_clinician_approval_and_resume():
    """Verify clinician review actions (modify, approve, reject) resume the workflow properly."""
    # Create a pending review
    review = db.create_hitl_review({
        "tenant_id": "tenant-test-hitl",
        "session_id": "sess-hitl-001",
        "patient_name": "Patient-Beta",
        "patient_id": "pat-beta",
        "query": "Chest pressure and severe breathlessness",
        "intent": "emergency_symptom",
        "risk_level": "HIGH",
        "risk_reason": "Critical cardiac/pulmonary alert",
        "proposed_response": "Emergency: Call 911 or go to nearest ER immediately.",
        "status": "pending_clinician_review",
    })

    review_id = review["id"]

    # Clinician modifies and signs off
    custom_guidance = (
        "CRITICAL CLINICAL DIRECTIVE: Patient advised to call emergency services (911/108) immediately. "
        "Do not drive yourself. Chew one non-enteric coated aspirin 325mg if not contraindicated."
    )

    resumed = resume_workflow_after_hitl(
        review_id=review_id,
        action="modify",
        modified_response=custom_guidance,
        clinician_id="clinician-director",
        clinician_notes="Approved with aspirin intake instruction and ambulance dispatch warning.",
    )

    assert resumed is not None
    assert resumed["status"] == "clinician_approved"
    assert resumed["final_response"] == custom_guidance
    assert resumed["clinician_id"] == "clinician-director"

    # Verify persistent database state
    updated_review = db.get_hitl_review(review_id)
    assert updated_review["status"] == "clinician_approved"
    assert updated_review["final_response"] == custom_guidance


# -----------------------------------------------------------------------------
# 5. Safety Validator & Contraindication Screening
# -----------------------------------------------------------------------------
def test_contraindication_screening():
    """Verify validator agent flags lethal drug-disease and drug-drug contraindications."""
    draft_response = "You can take aspirin 325mg with a glass of water for your pain."
    patient_query = "Can I take Aspirin 325mg? I have an active bleeding stomach peptic ulcer."

    result, duration = run_validator_agent(
        response_draft=draft_response,
        intent="medication_query",
        risk_level="MEDIUM",
        rag_context_used=False,
        patient_query=patient_query,
    )

    assert result["passed"] is False
    assert len(result["issues"]) > 0
    assert len(result["contraindications"]) > 0
    # Must flag the Aspirin + Ulcer contraindication
    warning_text = " ".join([c["warning"] for c in result["contraindications"]])
    assert "NSAID" in warning_text or "Aspirin" in warning_text or "gastrointestinal" in warning_text.lower()
    # Must append medical safety disclaimer
    assert "Medical Disclaimer" in result["modified_response"]


# -----------------------------------------------------------------------------
# 6. Runtime Circuit Breakers & Fail-Safe Fallbacks
# -----------------------------------------------------------------------------
def test_circuit_breaker_tripping_and_fallback():
    """Verify 3-state clinical circuit breaker transitions CLOSED -> OPEN and triggers safe fallbacks."""
    breaker = ClinicalCircuitBreaker(
        name="test_clinical_service",
        failure_threshold=3,
        recovery_timeout_seconds=60,
    )

    assert breaker.state.value == "CLOSED"
    assert breaker.can_execute() is True

    # Record 2 failures (below threshold of 3)
    breaker.record_failure("Timeout 1")
    breaker.record_failure("Timeout 2")
    assert breaker.state.value == "CLOSED"
    assert breaker.can_execute() is True

    # Record 3rd failure: threshold reached -> trips to OPEN
    breaker.record_failure("Timeout 3")
    assert breaker.state.value == "OPEN"
    assert breaker.can_execute() is False

    # Attempt execution while OPEN: raises CircuitBreakerOpenException
    with pytest.raises(CircuitBreakerOpenException):
        breaker.execute(lambda: "Should not execute")

    # Safe fallback response generation
    fallback = breaker.get_fallback_response("Severe asthma attack")
    assert "temporarily" in fallback or "emergency" in fallback

    # Reset circuit breaker
    breaker.reset()
    assert breaker.state.value == "CLOSED"
    assert breaker.can_execute() is True


# -----------------------------------------------------------------------------
# 7. Non-Blocking High-Throughput Clinical Document Ingestion Pipeline
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_async_clinical_document_ingestion():
    """Verify unstructured clinical note parsing offloads to worker thread and conforms to Pydantic v2 schemas."""
    sample_clinical_note = """
    CLINICAL PROGRESS NOTE & DISCHARGE SUMMARY
    Patient Name: Anita Roy
    Patient ID: PR-94021
    Date: 2026-05-18

    CHIEF COMPLAINT:
    Exertional dyspnea and bilateral ankle edema for 2 weeks.

    HISTORY OF PRESENT ILLNESS:
    Patient reports worsening shortness of breath when walking 1 flight of stairs.

    VITAL SIGNS:
    BP: 138/88 mmHg
    HR: 84 bpm
    RR: 18 breaths/min
    SpO2: 97 %
    Temp: 98.6 F

    CURRENT MEDICATIONS:
    - Metformin 500mg PO BID
    - Lisinopril 10mg PO Daily
    - Furosemide 20mg PO QD

    ALLERGIES:
    - Penicillin (anaphylaxis)
    - Sulfa drugs

    LABORATORY RESULTS:
    - BNP: 450 pg/mL (HIGH)
    - Creatinine: 1.1 mg/dL (NORMAL)
    - HbA1c: 6.4 % (NORMAL)
    - Potassium: 4.2 mEq/L (NORMAL)

    ASSESSMENT AND PLAN:
    Compensated congestive heart failure with mild volume overload.
    1. Continue oral furosemide 20mg daily.
    2. Restrict dietary sodium to 2g/day.
    3. Low threshold for ER evaluation if resting dyspnea develops.

    ICD-10 CODES:
    I50.9, E11.9, I10
    """

    payload = await parse_clinical_document_async(
        content_bytes=sample_clinical_note.encode("utf-8"),
        filename="discharge_summary.txt",
        patient_name="Anita Roy",
        tenant_id="tenant-test-ingest",
    )

    # Validate against Pydantic schema
    assert isinstance(payload, ClinicalNotePayload)
    assert payload.patient_name == "Anita Roy"
    assert payload.tenant_id == "tenant-test-ingest"
    assert "dyspnea" in payload.chief_complaint.lower()

    # Vitals verification
    assert payload.vitals is not None
    assert payload.vitals.systolic_bp == 138
    assert payload.vitals.diastolic_bp == 88
    assert payload.vitals.heart_rate_bpm == 84
    assert payload.vitals.spo2_percent == 97.0

    # Medications verification
    med_names = [m.name for m in payload.medications]
    assert any("Metformin" in m for m in med_names)
    assert any("Lisinopril" in m for m in med_names)

    # Allergies verification
    assert any("Penicillin" in a for a in payload.allergies)

    # ICD-10 codes verification
    assert any("I50" in code for code in payload.icd10_codes)

    # High-throughput batch ingestion test
    doc_batch = [
        (sample_clinical_note.encode("utf-8"), f"note_{i}.txt", f"Patient_{i}", f"pid_{i}")
        for i in range(5)
    ]
    batch_results = await batch_ingest_documents_async(
        documents=doc_batch,
        tenant_id="tenant-test-batch",
        concurrency=3,
    )
    assert batch_results["total_documents"] == 5
    assert batch_results["valid_payloads"] == 5
    assert len(batch_results["payloads"]) == 5


# -----------------------------------------------------------------------------
# 8. End-to-End FastAPI HTTP API Tests
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_fastapi_endpoints_end_to_end():
    """Verify HTTP API contracts across triage chat, appointments, HITL queue, and circuit breaker telemetry."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "Validator" in data["agents"]

        # 2. Routine Chat endpoint
        chat_res = await client.post("/chat", json={
            "query": "Can I book a consultation for next Tuesday?",
            "patient_name": "Kavita Rao",
            "tenant_id": "tenant-fastapi-test",
        })
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert chat_data["hitl_status"] == "auto_approved"
        assert chat_data["risk_level"] in ["LOW", "MEDIUM"]
        assert len(chat_data["agent_trace"]) > 0

        # 3. Emergency Chat endpoint (HITL trigger)
        emerg_res = await client.post("/chat", json={
            "query": "Help! Sudden crushing chest pain radiating to my arm and cold sweats!",
            "patient_name": "Rohan Deshmukh",
            "tenant_id": "tenant-fastapi-test",
        })
        assert emerg_res.status_code == 200
        emerg_data = emerg_res.json()
        assert emerg_data["hitl_status"] == "pending_clinician_review"
        assert emerg_data["hitl_required"] is True
        review_id = emerg_data["hitl_review_id"]
        assert review_id is not None

        # 4. List HITL reviews via admin route
        hitl_res = await client.get("/admin/hitl/reviews?tenant_id=tenant-fastapi-test")
        assert hitl_res.status_code == 200
        hitl_items = hitl_res.json()
        assert any(item["id"] == review_id for item in hitl_items)

        # 5. Clinician Action on HITL review
        action_res = await client.post(
            f"/admin/hitl/reviews/{review_id}/action",
            json={
                "action": "modify",
                "clinician_notes": "ER alert dispatched; patient instructed to remain seated.",
                "modified_response": "EMERGENCY: Dispatching ambulance immediately. Do not exert yourself.",
            },
        )
        assert action_res.status_code == 200
        action_data = action_res.json()
        assert action_data["status"] == "clinician_approved"
        assert action_data["final_response"] == "EMERGENCY: Dispatching ambulance immediately. Do not exert yourself."

        # 6. Appointments list endpoint
        appt_res = await client.get("/appointments?tenant_id=tenant-fastapi-test")
        assert appt_res.status_code == 200
        assert isinstance(appt_res.json(), list)

        # 7. Circuit breaker status & reset endpoints
        cb_res = await client.get("/admin/circuit-breaker")
        assert cb_res.status_code == 200
        cb_data = cb_res.json()
        assert "state" in cb_data and cb_data["state"] == "CLOSED"

        reset_res = await client.post("/admin/circuit-breaker/reset")
        assert reset_res.status_code == 200
        assert reset_res.json()["message"] == "Circuit breaker reset to CLOSED"
        assert reset_res.json()["status"]["state"] == "CLOSED"

        # 7b. Strict Admin Authorization Verification (Non-Admin 403 Block)
        forbidden_res = await client.get(
            "/admin/stats",
            headers={"Authorization": "Bearer demo-patient-token"}
        )
        assert forbidden_res.status_code == 403
        assert "prannesshkva@gmail.com" in forbidden_res.json()["detail"]

        # 8. Multi-turn Session Management & Context Endpoints
        session_id = f"test-sess-{uuid.uuid4()}"
        turn1_res = await client.post("/chat", json={
            "query": "I would like to schedule a cardiology consultation tomorrow morning.",
            "patient_name": "Arjun Patel",
            "session_id": session_id,
            "tenant_id": "tenant-fastapi-test",
        })
        assert turn1_res.status_code == 200
        turn1_text = turn1_res.json()["response"]

        # Follow-up query passing conversation history
        turn2_res = await client.post("/chat", json={
            "query": "Can we reschedule that to 4 PM instead?",
            "patient_name": "Arjun Patel",
            "session_id": session_id,
            "tenant_id": "tenant-fastapi-test",
            "history": [
                {"role": "user", "content": "I would like to schedule a cardiology consultation tomorrow morning."},
                {"role": "assistant", "content": turn1_text},
            ],
        })
        assert turn2_res.status_code == 200

        # Verify session listing
        sessions_res = await client.get("/chat/sessions?tenant_id=tenant-fastapi-test")
        assert sessions_res.status_code == 200
        sessions = sessions_res.json()
        assert any(s["session_id"] == session_id for s in sessions)

        # Verify session message retrieval
        history_res = await client.get(f"/chat/sessions/{session_id}")
        assert history_res.status_code == 200
        assert len(history_res.json()) >= 2

        # Verify session deletion
        del_res = await client.delete(f"/chat/sessions/{session_id}")
        assert del_res.status_code == 200
        assert del_res.json()["success"] is True
