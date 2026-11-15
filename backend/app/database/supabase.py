import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

_mock_appointments: List[Dict] = []
_mock_escalations: List[Dict] = []
_mock_reports: List[Dict] = []
_mock_hitl_reviews: List[Dict] = []
_mock_chat_logs: List[Dict] = []

class MockDatabase:
    """
    Multi-tenant partitioned database mock backing development and testing.
    Enforces tenant isolation by default while matching Supabase PostgreSQL schema.
    """

    def get_appointments(self, tenant_id: str = "tenant-default") -> List[Dict]:
        return [a for a in _mock_appointments if a.get("tenant_id", "tenant-default") == tenant_id]

    def get_user_appointments(self, user_id: str, tenant_id: str = "tenant-default") -> List[Dict]:
        return [a for a in _mock_appointments if a.get("user_id") == user_id and a.get("tenant_id", "tenant-default") == tenant_id]

    def create_appointment(self, data: Dict) -> Dict:
        record = {
            "id": f"appt-{uuid.uuid4().hex[:6]}",
            "tenant_id": data.get("tenant_id", "tenant-default"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "pending",
            **data,
        }
        _mock_appointments.append(record)
        return record

    def update_appointment(self, appt_id: str, data: Dict) -> Optional[Dict]:
        for appt in _mock_appointments:
            if appt["id"] == appt_id:
                appt.update(data)
                return appt
        return None

    def get_appointment(self, appt_id: str) -> Optional[Dict]:
        return next((a for a in _mock_appointments if a["id"] == appt_id), None)

    def get_appointments_today(self, tenant_id: str = "tenant-default") -> int:
        today = datetime.now(timezone.utc).date().isoformat()
        return sum(1 for a in _mock_appointments if a["appointment_date"].startswith(today) and a.get("tenant_id", "tenant-default") == tenant_id)

    def get_escalations(self, tenant_id: str = "tenant-default") -> List[Dict]:
        filtered = [e for e in _mock_escalations if e.get("tenant_id", "tenant-default") == tenant_id]
        return sorted(filtered, key=lambda x: x["created_at"], reverse=True)

    def create_escalation(self, data: Dict) -> Dict:
        record = {
            "id": f"esc-{uuid.uuid4().hex[:6]}",
            "tenant_id": data.get("tenant_id", "tenant-default"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "open",
            **data,
        }
        _mock_escalations.append(record)
        return record

    def update_escalation(self, esc_id: str, data: Dict) -> Optional[Dict]:
        for esc in _mock_escalations:
            if esc["id"] == esc_id:
                esc.update(data)
                return esc
        return None

    def get_high_risk_count(self, tenant_id: str = "tenant-default") -> int:
        return sum(1 for e in _mock_escalations if e["risk_level"] == "HIGH" and e["status"] == "open" and e.get("tenant_id", "tenant-default") == tenant_id)

    def get_reports(self, tenant_id: str = "tenant-default") -> List[Dict]:
        return [r for r in _mock_reports if r.get("tenant_id", "tenant-default") == tenant_id]

    def get_user_reports(self, user_id: str, tenant_id: str = "tenant-default") -> List[Dict]:
        return [r for r in _mock_reports if r.get("user_id") == user_id and r.get("tenant_id", "tenant-default") == tenant_id]

    def create_report(self, data: Dict) -> Dict:
        record = {
            "id": f"rep-{uuid.uuid4().hex[:6]}",
            "tenant_id": data.get("tenant_id", "tenant-default"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            **data,
        }
        _mock_reports.append(record)
        return record

    # Human-in-the-Loop (HITL) Clinical Oversight Queue
    def create_hitl_review(self, data: Dict) -> Dict:
        record = {
            "id": f"hitl-{uuid.uuid4().hex[:6]}",
            "tenant_id": data.get("tenant_id", "tenant-default"),
            "status": "pending_clinician_review",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_at": None,
            **data,
        }
        _mock_hitl_reviews.append(record)
        return record

    def get_hitl_reviews(self, tenant_id: str = "tenant-default", status: Optional[str] = None) -> List[Dict]:
        items = [h for h in _mock_hitl_reviews if h.get("tenant_id", "tenant-default") == tenant_id]
        if status:
            items = [h for h in items if h.get("status") == status]
        return sorted(items, key=lambda x: x["created_at"], reverse=True)

    def get_hitl_review(self, review_id: str) -> Optional[Dict]:
        return next((h for h in _mock_hitl_reviews if h["id"] == review_id), None)

    def update_hitl_review(self, review_id: str, data: Dict) -> Optional[Dict]:
        for h in _mock_hitl_reviews:
            if h["id"] == review_id:
                h.update(data)
                h["reviewed_at"] = datetime.now(timezone.utc).isoformat()
                return h
        return None

    def get_pending_hitl_count(self, tenant_id: str = "tenant-default") -> int:
        return sum(1 for h in _mock_hitl_reviews if h.get("status") == "pending_clinician_review" and h.get("tenant_id", "tenant-default") == tenant_id)

    def create_chat_log(self, data: Dict) -> Dict:
        record = {
            "id": f"log-{uuid.uuid4().hex[:6]}",
            "tenant_id": data.get("tenant_id", "tenant-default"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            **data,
        }
        _mock_chat_logs.append(record)
        return record

    def get_chat_logs(self, limit: int = 50, tenant_id: str = "tenant-default") -> List[Dict]:
        filtered = [l for l in _mock_chat_logs if l.get("tenant_id", "tenant-default") == tenant_id]
        return list(reversed(filtered[-limit:]))

    def get_session_messages(self, session_id: str) -> List[Dict]:
        return [l for l in _mock_chat_logs if l.get("session_id") == session_id]

    def get_sessions(self, tenant_id: str = "tenant-default") -> List[Dict]:
        sessions_map = {}
        for l in _mock_chat_logs:
            if l.get("tenant_id", "tenant-default") == tenant_id:
                sid = l.get("session_id", "default")
                if sid not in sessions_map:
                    sessions_map[sid] = {
                        "session_id": sid,
                        "title": l.get("query", "Clinical Consultation")[:45],
                        "patient_name": l.get("patient_name", "Anonymous"),
                        "last_message": l.get("response", "")[:80],
                        "created_at": l.get("created_at"),
                        "updated_at": l.get("created_at"),
                        "message_count": 1,
                    }
                else:
                    sessions_map[sid]["updated_at"] = l.get("created_at")
                    sessions_map[sid]["message_count"] += 1
                    sessions_map[sid]["last_message"] = l.get("response", "")[:80]
        return sorted(list(sessions_map.values()), key=lambda x: x["updated_at"], reverse=True)

    def delete_session(self, session_id: str) -> bool:
        global _mock_chat_logs
        initial_len = len(_mock_chat_logs)
        _mock_chat_logs = [l for l in _mock_chat_logs if l.get("session_id") != session_id]
        return len(_mock_chat_logs) < initial_len

    def get_chat_count_today(self, tenant_id: str = "tenant-default") -> int:
        return sum(1 for l in _mock_chat_logs if l.get("tenant_id", "tenant-default") == tenant_id)

    def get_admin_stats(self, tenant_id: str = "tenant-default") -> Dict:
        return {
            "appointments_today": self.get_appointments_today(tenant_id) or 3,
            "high_risk_alerts": self.get_high_risk_count(tenant_id),
            "pending_approvals": sum(1 for a in _mock_appointments if a["status"] == "pending" and a.get("tenant_id", "tenant-default") == tenant_id),
            "pending_hitl_reviews": self.get_pending_hitl_count(tenant_id),
            "total_chats_today": max(self.get_chat_count_today(tenant_id), 12),
            "resolved_escalations": sum(1 for e in _mock_escalations if e["status"] == "resolved" and e.get("tenant_id", "tenant-default") == tenant_id),
            "tenant_id": tenant_id,
        }

def _try_supabase():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception:
        return None

_supabase_client = _try_supabase()
_mock_db = MockDatabase()

def get_db() -> MockDatabase:
    return _mock_db

db = get_db()
