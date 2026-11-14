import os
import random
import time
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends

from app.auth import get_current_user, User
from app.core.circuit_breaker import get_circuit_breaker
from app.database.supabase import db
from app.database.models import (
    EscalationUpdate,
    AdminStats,
    HITLReviewItem,
    HITLReviewActionRequest,
)
from app.graph.workflow import resume_workflow_after_hitl
from app.rag.ingest import parse_clinical_document_async, batch_ingest_documents_async

upload_router = APIRouter()
admin_router = APIRouter(prefix="/admin")

MOCK_SUMMARIES = [
    "Blood glucose levels slightly elevated (112 mg/dL fasting). HbA1c within normal range at 5.8%. Recommend dietary changes and follow-up in 3 months.",
    "Chest X-ray shows no significant abnormalities. Lung fields clear. Heart size normal. No active cardiopulmonary disease detected.",
    "CBC results: Hemoglobin 11.2 g/dL (slightly low - mild anemia). WBC and platelet counts normal. Recommend iron supplementation and dietary review.",
    "Lipid profile: Total cholesterol 210 mg/dL (borderline high). LDL 130 mg/dL. HDL 45 mg/dL. Triglycerides 160 mg/dL. Recommend lifestyle modifications.",
    "Thyroid function test: TSH 3.8 mIU/L (normal). T3 and T4 within normal ranges. No thyroid dysfunction detected.",
    "Urine routine: Slight proteinuria noted (+1). Suggest repeat test after 2 weeks. Other parameters normal. No infection detected.",
]

@upload_router.post("/upload-report")
async def upload_report(
    file: UploadFile = File(...),
    patient_name: str = Form(default="Anonymous"),
    patient_email: str = Form(default=""),
    tenant_id: str = Form(default="tenant-default"),
    user: User = Depends(get_current_user),
):
    content = await file.read()
    file_size_kb = len(content) / 1024

    # 1. Non-blocking asynchronous extraction of schema-compliant clinical telemetry
    t_start = time.perf_counter()
    clinical_payload = await parse_clinical_document_async(
        content_bytes=content,
        filename=file.filename or "medical_record.txt",
        patient_name=user.name if user.name != "Unknown User" else patient_name,
        patient_id=user.uid,
        tenant_id=tenant_id,
    )
    extraction_ms = round((time.perf_counter() - t_start) * 1000, 2)

    # 2. Extract natural language summary via Gemini if key configured, or structured plan
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = (
                "You are Mediflow Clinical AI. Analyze this medical report and summarize "
                "the key clinical findings, vitals, and plan in 2-3 clear sentences."
            )
            response = await asyncio.to_thread(
                model.generate_content,
                [prompt, {"mime_type": file.content_type or "text/plain", "data": content}]
            )
            summary = response.text
        except Exception as e:
            summary = clinical_payload.assessment_and_plan
    else:
        summary = (
            f"Extracted {len(clinical_payload.lab_results)} lab tests, "
            f"{len(clinical_payload.medications)} medications, and {len(clinical_payload.icd10_codes)} ICD-10 codes. "
            f"Vitals: BP {clinical_payload.vitals.systolic_bp or '--'}/{clinical_payload.vitals.diastolic_bp or '--'}, "
            f"HR {clinical_payload.vitals.heart_rate_bpm or '--'} bpm."
        )

    # 3. Store record in tenant-isolated database
    record = db.create_report({
        "tenant_id": tenant_id,
        "patient_name": user.name if user.name != "Unknown User" else patient_name,
        "patient_email": user.email or patient_email,
        "user_id": user.uid,
        "file_name": file.filename,
        "file_url": f"/uploads/{file.filename}",
        "extracted_summary": summary,
        "clinical_payload": clinical_payload.model_dump(),
    })

    return {
        "success": True,
        "report_id": record["id"],
        "tenant_id": tenant_id,
        "file_name": file.filename,
        "file_size_kb": round(file_size_kb, 1),
        "extraction_ms": extraction_ms,
        "summary": summary,
        "clinical_payload": clinical_payload.model_dump(),
        "created_at": record["created_at"],
    }

@upload_router.post("/upload-report/batch")
async def upload_reports_batch(
    files: List[UploadFile] = File(...),
    tenant_id: str = Form(default="tenant-default"),
    concurrency: int = Form(default=8),
    user: User = Depends(get_current_user),
):
    """
    High-throughput non-blocking asynchronous batch ingestion endpoint.
    Processes multiple unstructured clinical notes concurrently into schema-compliant payloads.
    """
    file_tuples = []
    for f in files:
        c = await f.read()
        file_tuples.append((c, f.filename or "clinical_doc.txt", user.name, user.uid))

    batch_result = await batch_ingest_documents_async(
        documents=file_tuples,
        tenant_id=tenant_id,
        concurrency=concurrency,
    )

    # Persist batch records into database
    created_ids = []
    for payload in batch_result["payloads"]:
        rec = db.create_report({
            "tenant_id": tenant_id,
            "patient_name": user.name,
            "patient_email": user.email,
            "user_id": user.uid,
            "file_name": payload.get("chief_complaint", "clinical_note.txt"),
            "file_url": "/uploads/batch",
            "extracted_summary": payload.get("assessment_and_plan", "Batch clinical ingestion"),
            "clinical_payload": payload,
        })
        created_ids.append(rec["id"])

    batch_result["persisted_report_ids"] = created_ids
    return batch_result

@upload_router.get("/reports")
async def list_reports(
    tenant_id: str = "tenant-default",
    user: User = Depends(get_current_user)
):
    return db.get_user_reports(user.uid, tenant_id=tenant_id)

# ----------------------------------------------------------------------
# Admin & Human-In-The-Loop (HITL) Clinical Oversight Endpoints
# ----------------------------------------------------------------------
@admin_router.get("/stats")
async def get_stats(tenant_id: str = "tenant-default"):
    return db.get_admin_stats(tenant_id=tenant_id)

@admin_router.get("/escalations")
async def get_escalations(tenant_id: str = "tenant-default"):
    return db.get_escalations(tenant_id=tenant_id)

@admin_router.patch("/escalations/{escalation_id}")
async def update_escalation(escalation_id: str, data: EscalationUpdate):
    record = db.update_escalation(escalation_id, {"status": data.status})
    if not record:
        raise HTTPException(status_code=404, detail="Escalation not found")
    return record

@admin_router.get("/chat-logs")
async def get_chat_logs(tenant_id: str = "tenant-default"):
    return db.get_chat_logs(limit=50, tenant_id=tenant_id)

@admin_router.get("/hitl/reviews", response_model=List[dict])
async def list_hitl_reviews(
    status: Optional[str] = None,
    tenant_id: str = "tenant-default",
):
    """Retrieves high-risk clinical triage cases awaiting physician review."""
    return db.get_hitl_reviews(tenant_id=tenant_id, status=status)

@admin_router.get("/hitl/reviews/{review_id}", response_model=dict)
async def get_hitl_review_detail(review_id: str):
    review = db.get_hitl_review(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="HITL review case not found")
    return review

@admin_router.post("/hitl/reviews/{review_id}/action", response_model=dict)
async def perform_hitl_action(
    review_id: str,
    action_req: HITLReviewActionRequest,
    user: User = Depends(get_current_user),
):
    """
    Submits a physician oversight sign-off: approves, modifies, or rejects
    the suspended clinical triage output and resumes the workflow.
    """
    if action_req.action not in ("approve", "modify", "reject"):
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve', 'modify', or 'reject'.")

    clinician_id = user.uid if user.uid else "clinician-oncall"
    updated = resume_workflow_after_hitl(
        review_id=review_id,
        action=action_req.action,
        modified_response=action_req.modified_response,
        clinician_id=clinician_id,
        clinician_notes=action_req.clinician_notes,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="HITL review case not found")
    return updated

@admin_router.get("/circuit-breaker")
async def get_circuit_breaker_telemetry():
    """Inspects runtime circuit breaker health, failure counts, and trip status."""
    return get_circuit_breaker().get_status()

@admin_router.post("/circuit-breaker/reset")
async def reset_circuit_breaker_endpoint():
    """Manually resets the runtime circuit breaker to CLOSED status."""
    breaker = get_circuit_breaker()
    breaker.reset()
    return {"message": "Circuit breaker reset to CLOSED", "status": breaker.get_status()}
