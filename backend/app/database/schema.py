SCHEMA_SQL = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tenants / Clinic Organizations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tenants (id, name) VALUES ('tenant-default', 'Metro Health Central')
ON CONFLICT (id) DO NOTHING;

-- ─── Patients ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL DEFAULT 'tenant-default' REFERENCES tenants(id),
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients (tenant_id);

-- ─── Appointments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL DEFAULT 'tenant-default' REFERENCES tenants(id),
  user_id          TEXT,
  patient_name     TEXT NOT NULL,
  patient_email    TEXT,
  patient_phone    TEXT,
  doctor_name      TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

-- ─── Reports & Clinical Ingestion ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         TEXT NOT NULL DEFAULT 'tenant-default' REFERENCES tenants(id),
  user_id           TEXT,
  patient_name      TEXT,
  patient_email     TEXT,
  file_name         TEXT,
  file_url          TEXT,
  extracted_summary TEXT,
  clinical_payload  JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_tenant ON reports (tenant_id);

-- ─── Human-In-The-Loop (HITL) Clinical Oversight Queue ───────────────────────
CREATE TABLE IF NOT EXISTS hitl_reviews (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL DEFAULT 'tenant-default' REFERENCES tenants(id),
  session_id        TEXT NOT NULL,
  patient_name      TEXT NOT NULL,
  patient_id        TEXT NOT NULL,
  query             TEXT NOT NULL,
  intent            TEXT NOT NULL,
  risk_level        TEXT NOT NULL CHECK (risk_level IN ('HIGH','MEDIUM','LOW')),
  risk_reason       TEXT NOT NULL,
  proposed_response TEXT NOT NULL,
  status            TEXT DEFAULT 'pending_clinician_review'
                    CHECK (status IN ('pending_clinician_review','clinician_approved','rejected')),
  clinician_id      TEXT,
  clinician_notes   TEXT,
  final_response    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_hitl_tenant ON hitl_reviews (tenant_id);
CREATE INDEX IF NOT EXISTS idx_hitl_status ON hitl_reviews (status);

-- ─── Escalations ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escalations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL DEFAULT 'tenant-default' REFERENCES tenants(id),
  patient_name TEXT,
  risk_level   TEXT CHECK (risk_level IN ('HIGH','MEDIUM','LOW')),
  issue        TEXT NOT NULL,
  query        TEXT,
  status       TEXT DEFAULT 'open'
               CHECK (status IN ('open','reviewed','resolved')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalations_tenant ON escalations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations (status);

-- ─── Chat Logs & Audit Trail ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    TEXT NOT NULL DEFAULT 'tenant-default' REFERENCES tenants(id),
  session_id   TEXT,
  patient_name TEXT,
  query        TEXT,
  intent       TEXT,
  risk_level   TEXT,
  response     TEXT,
  agent_trace  JSONB,
  hitl_status  TEXT DEFAULT 'auto_approved',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_tenant ON chat_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs (session_id);

-- ─── PostgreSQL Row-Level Security (RLS) Policies ────────────────────────────
-- Enforces strict multi-tenant isolation via current_setting('app.current_tenant_id')

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitl_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_patients ON patients
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

CREATE POLICY tenant_isolation_appointments ON appointments
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

CREATE POLICY tenant_isolation_reports ON reports
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

CREATE POLICY tenant_isolation_hitl ON hitl_reviews
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

CREATE POLICY tenant_isolation_escalations ON escalations
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));

CREATE POLICY tenant_isolation_chat_logs ON chat_logs
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));
"""

if __name__ == "__main__":
    print(SCHEMA_SQL)
    print("\n-- Copy this SQL and run it in your Supabase SQL Editor")
    print("-- Dashboard → SQL Editor → New Query → Paste → Run")
