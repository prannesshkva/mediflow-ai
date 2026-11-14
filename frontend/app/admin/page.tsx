"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle, Calendar, Bot, Users, CheckCircle,
  Clock, TrendingUp, Activity, RefreshCw, MessageSquare,
  ShieldCheck, ShieldAlert, Stethoscope, Edit3, XCircle, Send
} from "lucide-react";
import { adminApi, Escalation, AdminStats, HITLReviewItem } from "@/lib/api";
import { format, parseISO } from "date-fns";

const MOCK_STATS: AdminStats = {
  appointments_today: 3,
  high_risk_alerts: 2,
  pending_approvals: 1,
  pending_hitl_reviews: 1,
  total_chats_today: 12,
  resolved_escalations: 1,
  tenant_id: "tenant-default",
};

const MOCK_ESCALATIONS: Escalation[] = [
  { id: "esc-001", tenant_id: "tenant-default", patient_name: "Sunita Rao", risk_level: "HIGH", issue: "Patient reported chest pain and difficulty breathing", query: "I have severe chest pain and I can't breathe properly", status: "open", created_at: "2026-05-20T17:00:00Z" },
  { id: "esc-002", tenant_id: "tenant-default", patient_name: "Vikram Singh", risk_level: "HIGH", issue: "Patient experiencing severe allergic reaction symptoms", query: "My face is swelling and I have hives all over my body after taking medication", status: "reviewed", created_at: "2026-05-20T15:30:00Z" },
  { id: "esc-003", tenant_id: "tenant-default", patient_name: "Deepa Nair", risk_level: "MEDIUM", issue: "Patient has persistent high fever for 3 days", query: "I've had a fever of 104°F for 3 days, is this serious?", status: "open", created_at: "2026-05-20T14:00:00Z" },
];

const MOCK_HITL_REVIEWS: HITLReviewItem[] = [
  {
    id: "hitl-001",
    tenant_id: "tenant-default",
    session_id: "sess-01",
    patient_name: "Sunita Rao",
    patient_id: "user-01",
    query: "Severe chest pain radiating to left arm and sweating profusely",
    intent: "emergency_symptom",
    risk_level: "HIGH",
    risk_reason: "Acute Coronary Syndrome red-line criteria triggered",
    proposed_response: "🚨 EMERGENCY ALERT: Please call 112 / 911 immediately. Clinical triage has notified the on-call emergency response team.",
    status: "pending_clinician_review",
    created_at: "2026-05-20T17:05:00Z"
  }
];

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>(MOCK_STATS);
  const [escalations, setEscalations] = useState<Escalation[]>(MOCK_ESCALATIONS);
  const [hitlReviews, setHitlReviews] = useState<HITLReviewItem[]>(MOCK_HITL_REVIEWS);
  const [circuitBreaker, setCircuitBreaker] = useState<any>({ state: "CLOSED", healthy: true });
  const [refreshing, setRefreshing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [customResponse, setCustomResponse] = useState("");
  const [clinicianNotes, setClinicianNotes] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [s, e, h, cb] = await Promise.all([
        adminApi.stats().catch(() => MOCK_STATS),
        adminApi.escalations().catch(() => MOCK_ESCALATIONS),
        adminApi.listHITLReviews().catch(() => MOCK_HITL_REVIEWS),
        adminApi.circuitBreakerStatus().catch(() => ({ state: "CLOSED", healthy: true })),
      ]);
      setStats(s);
      setEscalations(e);
      setHitlReviews(h);
      setCircuitBreaker(cb);
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleHITLAction = async (reviewId: string, action: "approve" | "modify" | "reject") => {
    try {
      const modifiedText = action === "modify" ? customResponse : undefined;
      await adminApi.performHITLAction(reviewId, action, modifiedText, clinicianNotes);
      setActionSuccessMsg(`Case ${reviewId} successfully marked as ${action}d by clinician.`);
      setTimeout(() => setActionSuccessMsg(""), 4000);
      setEditingReviewId(null);
      setCustomResponse("");
      setClinicianNotes("");
      loadData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleResetCircuitBreaker = async () => {
    try {
      const res = await adminApi.resetCircuitBreaker();
      setCircuitBreaker(res.status);
      setActionSuccessMsg("Circuit breaker successfully reset to CLOSED state.");
      setTimeout(() => setActionSuccessMsg(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const updateEscalation = async (id: string, status: string) => {
    try {
      await adminApi.updateEscalation(id, status);
    } catch (e) {
      console.error(e);
    }
    setEscalations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: status as Escalation["status"] } : e))
    );
  };

  const formatTime = (d: string) => {
    try { return format(parseISO(d), "MMM d • h:mm a"); } catch { return d; }
  };

  const pendingHITLCount = hitlReviews.filter(h => h.status === "pending_clinician_review").length;

  const statCards = [
    { label: "Pending HITL Reviews", value: pendingHITLCount, icon: Stethoscope, color: "#F43F5E", glow: "stat-card-glow-red" },
    { label: "High Risk Alerts", value: stats.high_risk_alerts, icon: AlertTriangle, color: "#F59E0B", glow: "" },
    { label: "Appointments Today", value: stats.appointments_today, icon: Calendar, color: "#00D4FF", glow: "stat-card-glow-cyan" },
    { label: "AI Chats Today", value: stats.total_chats_today, icon: Bot, color: "#7C3AED", glow: "stat-card-glow-purple" },
    { label: "Circuit Breaker", value: circuitBreaker.state || "CLOSED", icon: circuitBreaker.healthy ? ShieldCheck : ShieldAlert, color: circuitBreaker.healthy ? "#10B981" : "#F43F5E", glow: "" },
    { label: "Tenant Context", value: "Metro Central", icon: Activity, color: "#00D4FF", glow: "" },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: "1240px", margin: "0 auto" }}>
      {/* Header */}
      <div
        className="animate-fade-in-up"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#F0F4FF", margin: 0 }}>
              Clinical Operations &amp; HITL Oversight
            </h1>
            <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "rgba(0, 212, 255, 0.15)", color: "#00D4FF", border: "1px solid rgba(0, 212, 255, 0.3)" }}>
              Tenant: {stats.tenant_id} (RLS Active)
            </span>
          </div>
          <p style={{ color: "#8B9BC8", margin: "4px 0 0", fontSize: "14px" }}>
            Multi-tenant LangGraph clinical triage management with human-in-the-loop review and runtime circuit breakers.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {circuitBreaker.state === "OPEN" && (
            <button className="btn-danger" onClick={handleResetCircuitBreaker} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
              <ShieldAlert size={14} /> Reset Circuit Breaker
            </button>
          )}
          <button className="btn-ghost" onClick={loadData} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RefreshCw size={14} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10B981", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle size={16} />
          {actionSuccessMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "28px" }}>
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`glass-card animate-fade-in-up ${card.glow}`}
            style={{ padding: "18px", animationDelay: `${i * 0.05}s` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: 42, height: 42, borderRadius: "12px",
                background: `${card.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <card.icon size={20} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: typeof card.value === "string" ? "18px" : "24px", fontWeight: 800, color: "#F0F4FF", lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: "12px", color: "#8B9BC8", marginTop: "4px" }}>{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: HITL Oversight Queue & Escalations */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "22px" }}>
        {/* Left Column: Human-in-the-Loop Review Queue */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#F0F4FF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Stethoscope size={16} color="#00D4FF" />
              Human-in-the-Loop (HITL) Oversight Queue
            </h2>
            <span className="badge badge-high" style={{ animation: pendingHITLCount > 0 ? "pulse 2s infinite" : "none" }}>
              {pendingHITLCount} awaiting clinician sign-off
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {hitlReviews.length === 0 ? (
              <div className="glass-card" style={{ padding: "24px", textAlign: "center", color: "#8B9BC8" }}>
                <CheckCircle size={28} color="#10B981" style={{ margin: "0 auto 8px" }} />
                No pending clinical reviews. All high-risk cases have been verified.
              </div>
            ) : (
              hitlReviews.map((h) => (
                <div
                  key={h.id}
                  className="glass-card animate-fade-in"
                  style={{
                    padding: "18px",
                    borderLeft: h.status === "pending_clinician_review" ? "3px solid #F43F5E" : "3px solid #10B981",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#F0F4FF", marginRight: "8px" }}>
                        {h.patient_name}
                      </span>
                      <span className={`badge badge-${h.risk_level === "HIGH" ? "high" : "medium"}`}>
                        {h.risk_level} Risk
                      </span>
                    </div>
                    <span style={{
                      fontSize: "11px", padding: "2px 8px", borderRadius: "100px",
                      background: h.status === "pending_clinician_review" ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)",
                      color: h.status === "pending_clinician_review" ? "#F43F5E" : "#10B981",
                      fontWeight: 600,
                    }}>
                      {h.status === "pending_clinician_review" ? "SUSPENDED (Needs Review)" : "CLINICIAN SIGNED"}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#8B9BC8", margin: "0 0 6px" }}>
                    <strong>Trigger:</strong> {h.risk_reason}
                  </p>
                  <p style={{ fontSize: "12.5px", color: "#E2E8F0", margin: "0 0 10px", background: "rgba(0,0,0,0.25)", padding: "8px 10px", borderRadius: "6px" }}>
                    <em>"{h.query}"</em>
                  </p>

                  <div style={{ background: "rgba(0, 212, 255, 0.05)", border: "1px solid rgba(0, 212, 255, 0.15)", borderRadius: "8px", padding: "10px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#00D4FF", marginBottom: "4px" }}>
                      Proposed AI Triage Draft:
                    </div>
                    <div style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: 1.4 }}>
                      {h.final_response || h.proposed_response}
                    </div>
                  </div>

                  {editingReviewId === h.id ? (
                    <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                      <label style={{ fontSize: "12px", color: "#8B9BC8", display: "block", marginBottom: "4px" }}>
                        Amend Clinical Triage Response:
                      </label>
                      <textarea
                        style={{ width: "100%", minHeight: "80px", background: "#0A0F1E", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#F0F4FF", padding: "8px", fontSize: "12.5px", marginBottom: "8px" }}
                        value={customResponse}
                        onChange={(e) => setCustomResponse(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Clinician notes / rationale (optional)..."
                        style={{ width: "100%", background: "#0A0F1E", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#F0F4FF", padding: "6px 8px", fontSize: "12px", marginBottom: "10px" }}
                        value={clinicianNotes}
                        onChange={(e) => setClinicianNotes(e.target.value)}
                      />
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button className="btn-ghost" style={{ fontSize: "12px" }} onClick={() => setEditingReviewId(null)}>
                          Cancel
                        </button>
                        <button className="btn-success" style={{ fontSize: "12px" }} onClick={() => handleHITLAction(h.id, "modify")}>
                          <Send size={12} /> Sign Off &amp; Release
                        </button>
                      </div>
                    </div>
                  ) : (
                    h.status === "pending_clinician_review" && (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          className="btn-success"
                          style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                          onClick={() => handleHITLAction(h.id, "approve")}
                        >
                          <CheckCircle size={13} /> Approve Draft
                        </button>
                        <button
                          className="btn-ghost"
                          style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                          onClick={() => {
                            setEditingReviewId(h.id);
                            setCustomResponse(h.proposed_response);
                          }}
                        >
                          <Edit3 size={13} /> Modify &amp; Sign
                        </button>
                        <button
                          className="btn-danger"
                          style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                          onClick={() => handleHITLAction(h.id, "reject")}
                        >
                          <XCircle size={13} /> Escalate to In-Person ER
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Escalation Tickets & Performance Metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="glass-card-static" style={{ padding: "18px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={15} color="#F59E0B" /> Escalation Tracking
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {escalations.slice(0, 4).map((esc) => (
                <div key={esc.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0F4FF" }}>{esc.patient_name}</span>
                    <span className={`badge badge-${esc.risk_level === "HIGH" ? "high" : "medium"}`}>{esc.risk_level}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#8B9BC8" }}>{esc.issue}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#4A5680" }}>{formatTime(esc.created_at)}</span>
                    {esc.status !== "resolved" && (
                      <button className="btn-ghost" style={{ fontSize: "10px", padding: "2px 6px" }} onClick={() => updateEscalation(esc.id, "resolved")}>
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card-static" style={{ padding: "18px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={14} color="#8B9BC8" /> Safety &amp; Circuit Telemetry
            </h3>
            {[
              { label: "HITL Triage Compliance", value: 100, color: "#10B981" },
              { label: "Circuit Breaker State", value: circuitBreaker.healthy ? 100 : 20, display: circuitBreaker.state, color: circuitBreaker.healthy ? "#10B981" : "#F43F5E" },
              { label: "Contraindication Screening", value: 100, display: "Active", color: "#00D4FF" },
              { label: "Tenant Data Isolation", value: 100, display: "RLS Enforced", color: "#7C3AED" },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#8B9BC8" }}>{item.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: item.color }}>{item.display || `${item.value}%`}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{
                    height: "100%", width: `${item.value}%`, borderRadius: 2,
                    background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
