from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from enum import Enum
import uuid
from datetime import datetime

class RiskLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class HITLStatus(str, Enum):
    AUTO_APPROVED = "auto_approved"
    PENDING_CLINICIAN_REVIEW = "pending_clinician_review"
    CLINICIAN_APPROVED = "clinician_approved"
    REJECTED = "rejected"

class HITLAction(str, Enum):
    APPROVE = "approve"
    MODIFY = "modify"
    REJECT = "reject"

class ChatRequest(BaseModel):
    query: str
    patient_name: Optional[str] = "Anonymous"
    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: Optional[str] = "tenant-default"

class AgentTraceStep(BaseModel):
    agent: str
    status: str
    output: Optional[Any] = None
    duration_ms: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    risk_level: str
    escalated: bool
    agent_trace: List[AgentTraceStep]
    session_id: str
    tenant_id: str = "tenant-default"
    hitl_status: str = "auto_approved"
    hitl_required: bool = False
    hitl_review_id: Optional[str] = None
    appointment_data: Optional[dict] = None
    rag_context_used: bool = False
    circuit_breaker_status: str = "CLOSED"

class HITLReviewItem(BaseModel):
    id: str
    tenant_id: str
    session_id: str
    patient_name: str
    patient_id: str
    query: str
    intent: str
    risk_level: str
    risk_reason: str
    proposed_response: str
    status: str = "pending_clinician_review"
    clinician_id: Optional[str] = None
    clinician_notes: Optional[str] = None
    final_response: Optional[str] = None
    created_at: str
    reviewed_at: Optional[str] = None

class HITLReviewActionRequest(BaseModel):
    action: str = Field(..., description="Action to take: 'approve', 'modify', or 'reject'")
    clinician_notes: Optional[str] = None
    modified_response: Optional[str] = None

class AppointmentCreate(BaseModel):
    patient_name: str
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None
    doctor_name: str
    appointment_date: str
    notes: Optional[str] = None
    tenant_id: Optional[str] = "tenant-default"

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    appointment_date: Optional[str] = None
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: str
    patient_name: str
    patient_email: Optional[str] = None
    doctor_name: str
    appointment_date: str
    status: str
    notes: Optional[str] = None
    tenant_id: str = "tenant-default"
    created_at: str

# Clinical Document Ingestion Schemas
class VitalSigns(BaseModel):
    systolic_bp: Optional[int] = Field(None, ge=40, le=300)
    diastolic_bp: Optional[int] = Field(None, ge=20, le=200)
    heart_rate_bpm: Optional[int] = Field(None, ge=30, le=250)
    respiratory_rate: Optional[int] = Field(None, ge=6, le=60)
    spo2_percent: Optional[float] = Field(None, ge=50.0, le=100.0)
    temperature_f: Optional[float] = Field(None, ge=85.0, le=110.0)

class MedicationItem(BaseModel):
    name: str
    dosage: str
    frequency: str
    route: Optional[str] = "oral"

class LabResultItem(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    flag: Optional[str] = "NORMAL"

class ClinicalNotePayload(BaseModel):
    patient_name: str
    patient_id: str
    tenant_id: str = "tenant-default"
    chief_complaint: str
    history_of_present_illness: Optional[str] = None
    vitals: Optional[VitalSigns] = None
    medications: List[MedicationItem] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    lab_results: List[LabResultItem] = Field(default_factory=list)
    assessment_and_plan: str
    icd10_codes: List[str] = Field(default_factory=list)

class ReportUpload(BaseModel):
    patient_name: str
    patient_email: Optional[str] = None
    file_name: str
    file_url: Optional[str] = None
    extracted_summary: Optional[str] = None
    tenant_id: Optional[str] = "tenant-default"
    clinical_payload: Optional[ClinicalNotePayload] = None

class Report(BaseModel):
    id: str
    patient_name: str
    file_name: str
    file_url: Optional[str]
    extracted_summary: Optional[str]
    tenant_id: str = "tenant-default"
    clinical_payload: Optional[Dict[str, Any]] = None
    created_at: str

class EscalationCreate(BaseModel):
    patient_name: str
    risk_level: str
    issue: str
    query: str
    tenant_id: Optional[str] = "tenant-default"

class Escalation(BaseModel):
    id: str
    patient_name: str
    risk_level: str
    issue: str
    query: str
    status: str
    tenant_id: str = "tenant-default"
    created_at: str

class EscalationUpdate(BaseModel):
    status: str

class AdminStats(BaseModel):
    appointments_today: int
    high_risk_alerts: int
    pending_approvals: int
    pending_hitl_reviews: int
    total_chats_today: int
    resolved_escalations: int
    tenant_id: str = "tenant-default"
