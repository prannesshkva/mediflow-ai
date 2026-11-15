import axios from "axios";
import { auth } from "./firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch {
      // fallback to demo token
    }
  }

  // Check demo authentication token from local storage
  if (typeof window !== "undefined") {
    const demoRole = localStorage.getItem("mediflow_demo_auth");
    if (demoRole === "clinician") {
      config.headers.Authorization = "Bearer demo-clinician-token";
    } else if (demoRole === "patient") {
      config.headers.Authorization = "Bearer demo-patient-token";
    } else {
      config.headers.Authorization = "Bearer demo-token";
    }
  }
  return config;
}, (error) => Promise.reject(error));

export interface AgentTraceStep {
  agent: string;
  status: "completed" | "processing" | "skipped" | "error" | "suspended";
  output?: Record<string, unknown>;
  duration_ms?: number;
}

export interface ChatResponse {
  response: string;
  intent: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  escalated: boolean;
  agent_trace: AgentTraceStep[];
  session_id: string;
  tenant_id?: string;
  hitl_status: "auto_approved" | "pending_clinician_review" | "clinician_approved" | "rejected";
  hitl_required: boolean;
  hitl_review_id?: string;
  appointment_data?: Record<string, unknown>;
  rag_context_used: boolean;
  circuit_breaker_status?: string;
}

export interface ChatSession {
  session_id: string;
  title: string;
  patient_name?: string;
  last_message?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatMessageTurn {
  role: "user" | "assistant";
  content: string;
}

export interface HITLReviewItem {
  id: string;
  tenant_id?: string;
  session_id: string;
  patient_name: string;
  patient_id: string;
  query: string;
  intent: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  risk_reason: string;
  proposed_response: string;
  status: "pending_clinician_review" | "clinician_approved" | "rejected";
  clinician_id?: string;
  clinician_notes?: string;
  final_response?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface Appointment {
  id: string;
  patient_name: string;
  patient_email?: string;
  doctor_name: string;
  appointment_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  tenant_id?: string;
  created_at: string;
}

export interface Escalation {
  id: string;
  tenant_id?: string;
  patient_name: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  issue: string;
  query: string;
  status: "open" | "reviewed" | "resolved";
  created_at: string;
}

export interface AdminStats {
  appointments_today: number;
  high_risk_alerts: number;
  pending_approvals: number;
  pending_hitl_reviews: number;
  total_chats_today: number;
  resolved_escalations: number;
  tenant_id?: string;
}

export interface VitalSigns {
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate_bpm?: number;
  respiratory_rate?: number;
  spo2_percent?: number;
  temperature_f?: number;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  route?: string;
}

export interface LabResultItem {
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  flag?: "NORMAL" | "HIGH" | "LOW" | "ABNORMAL";
}

export interface ClinicalNotePayload {
  patient_name: string;
  patient_id: string;
  tenant_id?: string;
  chief_complaint: string;
  history_of_present_illness?: string;
  vitals?: VitalSigns;
  medications: MedicationItem[];
  allergies: string[];
  lab_results: LabResultItem[];
  assessment_and_plan: string;
  icd10_codes: string[];
}

export interface Report {
  id: string;
  tenant_id?: string;
  patient_name: string;
  file_name: string;
  file_url?: string;
  extracted_summary?: string;
  clinical_payload?: ClinicalNotePayload;
  created_at: string;
}

export const chatApi = {
  send: async (
    query: string,
    patientName = "Anonymous",
    tenantId = "tenant-default",
    sessionId?: string,
    history?: { role: string; content: string }[]
  ) => {
    const res = await api.post<ChatResponse>("/chat", {
      query,
      patient_name: patientName,
      tenant_id: tenantId,
      session_id: sessionId,
      history,
    });
    return res.data;
  },
  getSessions: async (tenantId = "tenant-default"): Promise<ChatSession[]> => {
    const res = await api.get<ChatSession[]>(`/chat/sessions?tenant_id=${tenantId}`);
    return res.data;
  },
  getSessionHistory: async (sessionId: string): Promise<any[]> => {
    const res = await api.get(`/chat/sessions/${sessionId}`);
    return res.data;
  },
  deleteSession: async (sessionId: string) => {
    const res = await api.delete(`/chat/sessions/${sessionId}`);
    return res.data;
  },
};

export const appointmentsApi = {
  list: async (tenantId = "tenant-default"): Promise<Appointment[]> => {
    const res = await api.get<Appointment[]>(`/appointments?tenant_id=${tenantId}`);
    return res.data;
  },
  book: async (data: {
    patient_name: string;
    patient_email?: string;
    patient_phone?: string;
    doctor_name: string;
    appointment_date: string;
    notes?: string;
    tenant_id?: string;
  }): Promise<Appointment> => {
    const res = await api.post<Appointment>("/appointments/book", data);
    return res.data;
  },
  update: async (id: string, data: { status?: string; notes?: string }) => {
    const res = await api.patch(`/appointments/${id}`, data);
    return res.data;
  },
};

export const reportsApi = {
  list: async (tenantId = "tenant-default"): Promise<Report[]> => {
    const res = await api.get<Report[]>(`/reports?tenant_id=${tenantId}`);
    return res.data;
  },
  upload: async (file: File, patientName: string, patientEmail?: string, tenantId = "tenant-default") => {
    const form = new FormData();
    form.append("file", file);
    form.append("patient_name", patientName);
    if (patientEmail) form.append("patient_email", patientEmail);
    form.append("tenant_id", tenantId);
    const res = await api.post("/upload-report", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  uploadBatch: async (files: File[], tenantId = "tenant-default") => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("tenant_id", tenantId);
    const res = await api.post("/upload-report/batch", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export const adminApi = {
  stats: async (tenantId = "tenant-default"): Promise<AdminStats> => {
    const res = await api.get<AdminStats>(`/admin/stats?tenant_id=${tenantId}`);
    return res.data;
  },
  escalations: async (tenantId = "tenant-default"): Promise<Escalation[]> => {
    const res = await api.get<Escalation[]>(`/admin/escalations?tenant_id=${tenantId}`);
    return res.data;
  },
  updateEscalation: async (id: string, status: string) => {
    const res = await api.patch(`/admin/escalations/${id}`, { status });
    return res.data;
  },
  listHITLReviews: async (status?: string, tenantId = "tenant-default"): Promise<HITLReviewItem[]> => {
    const query = status ? `?status=${status}&tenant_id=${tenantId}` : `?tenant_id=${tenantId}`;
    const res = await api.get<HITLReviewItem[]>(`/admin/hitl/reviews${query}`);
    return res.data;
  },
  performHITLAction: async (
    reviewId: string,
    action: "approve" | "modify" | "reject",
    modifiedResponse?: string,
    clinicianNotes?: string
  ) => {
    const res = await api.post(`/admin/hitl/reviews/${reviewId}/action`, {
      action,
      modified_response: modifiedResponse,
      clinician_notes: clinicianNotes,
    });
    return res.data;
  },
  circuitBreakerStatus: async () => {
    const res = await api.get("/admin/circuit-breaker");
    return res.data;
  },
  resetCircuitBreaker: async () => {
    const res = await api.post("/admin/circuit-breaker/reset");
    return res.data;
  },
  chatLogs: async (tenantId = "tenant-default") => {
    const res = await api.get(`/admin/chat-logs?tenant_id=${tenantId}`);
    return res.data;
  },
};
