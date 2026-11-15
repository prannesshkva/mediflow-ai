"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Bot,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  Edit3,
  XCircle,
  Send,
  Lock,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";
import { adminApi, Escalation, AdminStats, HITLReviewItem } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { format, parseISO } from "date-fns";

const INITIAL_STATS: AdminStats = {
  appointments_today: 0,
  high_risk_alerts: 0,
  pending_approvals: 0,
  pending_hitl_reviews: 0,
  total_chats_today: 0,
  resolved_escalations: 0,
  tenant_id: "tenant-default",
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === "prannesshkva@gmail.com";

  const [activeTab, setActiveTab] = useState<"hitl" | "escalations" | "circuit" | "logs">("hitl");
  const [stats, setStats] = useState<AdminStats>(INITIAL_STATS);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [hitlReviews, setHitlReviews] = useState<HITLReviewItem[]>([]);
  const [circuitBreaker, setCircuitBreaker] = useState<any>({ state: "CLOSED", healthy: true });
  const [refreshing, setRefreshing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [customResponse, setCustomResponse] = useState("");
  const [clinicianNotes, setClinicianNotes] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [s, e, h, cb] = await Promise.all([
        adminApi.stats().catch(() => INITIAL_STATS),
        adminApi.escalations().catch(() => []),
        adminApi.listHITLReviews().catch(() => []),
        adminApi.circuitBreakerStatus().catch(() => ({ state: "CLOSED", healthy: true })),
      ]);
      setStats(s);
      setEscalations(e);
      setHitlReviews(h);
      setCircuitBreaker(cb);
    } catch (e) {
      console.error("Failed to load clinical admin data", e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleHITLAction = async (reviewId: string, action: "approve" | "modify" | "reject") => {
    try {
      const modifiedText = action === "modify" ? customResponse : undefined;
      await adminApi.performHITLAction(reviewId, action, modifiedText, clinicianNotes);
      setActionSuccessMsg(`Case ${reviewId} successfully recorded as ${action}d by Clinical Director.`);
      setTimeout(() => setActionSuccessMsg(""), 4500);
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
      setActionSuccessMsg("Safety Circuit Breaker manually reset to CLOSED status.");
      setTimeout(() => setActionSuccessMsg(""), 3500);
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
    try {
      return format(parseISO(d), "MMM d • h:mm a");
    } catch {
      return d;
    }
  };

  // --------------------------------------------------------------------------
  // STRICT ADMIN ROLE ENFORCEMENT: ONLY prannesshkva@gmail.com
  // --------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#030712" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#38BDF8" }}>
          <Activity className="animate-spin" size={24} />
          <span style={{ fontSize: "14px", fontWeight: 600 }}>Verifying Clinical Authority Credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030712",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "540px",
            width: "100%",
            textAlign: "center",
            background: "#0B0F19",
            border: "1px solid #1F2937",
            borderRadius: "16px",
            padding: "48px 36px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <ShieldAlert size={32} color="#EF4444" />
          </div>

          <div style={{ fontSize: "11px", fontWeight: 700, color: "#EF4444", letterSpacing: "1.2px", marginBottom: "8px", textTransform: "uppercase" }}>
            Security Level: Restricted Access (403)
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F8FAFC", marginBottom: "12px", letterSpacing: "-0.01em" }}>
            Restricted Clinical Authority
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
            This command center governs Human-in-the-Loop emergency triage sign-offs, runtime circuit breakers, and protected clinical data. Access is strictly restricted to the Clinical Director (<code style={{ color: "#38BDF8", background: "#111827", padding: "2px 6px", borderRadius: "4px" }}>prannesshkva@gmail.com</code>).
          </p>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
              color: "#FFFFFF",
              fontSize: "13.5px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
            }}
          >
            Return to Patient Portal
          </Link>
        </div>
      </div>
    );
  }

  const pendingHITLCount = hitlReviews.filter((h) => h.status === "pending_clinician_review").length;

  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "#F8FAFC", padding: "28px 36px" }}>
      {/* ------------------------------------------------------------- */}
      {/* 1. Executive Clinical Command Bar                             */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          background: "#080D1A",
          border: "1px solid #1E293B",
          borderRadius: "14px",
          padding: "18px 24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)",
              border: "1px solid #38BDF8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(56, 189, 248, 0.3)",
            }}
          >
            <Cpu size={22} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.015em", margin: 0 }}>
                MediFlow Clinical Command Center
              </h1>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "5px",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38BDF8",
                  fontWeight: 700,
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  letterSpacing: "0.8px",
                }}
              >
                LEVEL 4 OVERSIGHT
              </span>
            </div>
            <div style={{ fontSize: "12.5px", color: "#94A3B8", marginTop: "3px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Director: <strong style={{ color: "#E2E8F0" }}>prannesshkva@gmail.com</strong></span>
              <span style={{ color: "#475569" }}>•</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#10B981", fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                Real-Time Telemetry Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              background: circuitBreaker.healthy ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.15)",
              border: circuitBreaker.healthy ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.4)",
              fontSize: "12px",
              fontWeight: 700,
              color: circuitBreaker.healthy ? "#34D399" : "#F87171",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {circuitBreaker.healthy ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            <span>CIRCUIT BREAKER: {circuitBreaker.state || "CLOSED"}</span>
          </div>

          <button
            onClick={loadData}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "8px",
              background: "#111827",
              border: "1px solid #1F2937",
              color: "#CBD5E1",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#6EE7B7",
            fontSize: "13.5px",
            fontWeight: 500,
          }}
        >
          <CheckCircle size={16} color="#10B981" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Command Telemetry Deck (Key Metrics)                       */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ background: "#0B101D", border: "1px solid #1E293B", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94A3B8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
            <span>HITL Review Queue</span>
            <Stethoscope size={16} color="#F43F5E" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: pendingHITLCount > 0 ? "#F87171" : "#F8FAFC", marginTop: "8px" }}>
            {pendingHITLCount}
          </div>
          <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
            Cases suspended pending clinician sign-off
          </div>
        </div>

        <div style={{ background: "#0B101D", border: "1px solid #1E293B", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94A3B8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
            <span>Clinical Escalations</span>
            <AlertTriangle size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#F8FAFC", marginTop: "8px" }}>
            {escalations.length}
          </div>
          <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
            Acute risk alerts logged
          </div>
        </div>

        <div style={{ background: "#0B101D", border: "1px solid #1E293B", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94A3B8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
            <span>Safety Circuit Breaker</span>
            <ShieldCheck size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#34D399", marginTop: "8px" }}>
            {circuitBreaker.state || "CLOSED"}
          </div>
          <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
            Failures: {circuitBreaker.failure_count || 0} / Threshold: {circuitBreaker.failure_threshold || 3}
          </div>
        </div>

        <div style={{ background: "#0B101D", border: "1px solid #1E293B", borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94A3B8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
            <span>Consultations Today</span>
            <Bot size={16} color="#38BDF8" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#F8FAFC", marginTop: "8px" }}>
            {stats.total_chats_today || 0}
          </div>
          <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "4px" }}>
            Deterministic state partitioned runs
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Navigation Tabs                                            */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #1E293B",
          paddingBottom: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => setActiveTab("hitl")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            background: activeTab === "hitl" ? "#1E293B" : "transparent",
            color: activeTab === "hitl" ? "#38BDF8" : "#94A3B8",
            border: activeTab === "hitl" ? "1px solid #38BDF8" : "1px solid transparent",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Stethoscope size={15} />
          <span>HITL Physician Review Queue</span>
          {pendingHITLCount > 0 && (
            <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "10px", background: "#EF4444", color: "#FFFFFF", fontWeight: 700 }}>
              {pendingHITLCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("escalations")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            background: activeTab === "escalations" ? "#1E293B" : "transparent",
            color: activeTab === "escalations" ? "#38BDF8" : "#94A3B8",
            border: activeTab === "escalations" ? "1px solid #38BDF8" : "1px solid transparent",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <AlertTriangle size={15} />
          <span>Clinical Escalation Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab("circuit")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            background: activeTab === "circuit" ? "#1E293B" : "transparent",
            color: activeTab === "circuit" ? "#38BDF8" : "#94A3B8",
            border: activeTab === "circuit" ? "1px solid #38BDF8" : "1px solid transparent",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <ShieldCheck size={15} />
          <span>Safety Circuit Breaker Console</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Tab 1: HITL Physician Review Queue                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "hitl" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {hitlReviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 20px", background: "#0B101D", borderRadius: "12px", border: "1px solid #1E293B" }}>
              <ShieldCheck size={44} color="#10B981" style={{ margin: "0 auto 12px", opacity: 0.8 }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#F8FAFC" }}>HITL Oversight Queue Clear</h3>
              <p style={{ color: "#94A3B8", fontSize: "13px", maxWidth: "480px", margin: "6px auto 0" }}>
                All current patient triage interactions are operating within safe clinical bounds. High-risk symptoms or red-line emergencies will immediately trigger suspension here for physician sign-off.
              </p>
            </div>
          ) : (
            hitlReviews.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#0B101D",
                  border: item.status === "pending_clinician_review" ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid #1E293B",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  boxShadow: item.status === "pending_clinician_review" ? "0 4px 20px rgba(239, 68, 68, 0.15)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>
                      Patient: {item.patient_name}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#F87171",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        fontWeight: 700,
                      }}
                    >
                      {item.risk_level} RISK
                    </span>
                    <span style={{ fontSize: "11.5px", color: "#64748B" }}>
                      {formatTime(item.created_at)}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      background: item.status === "pending_clinician_review" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                      color: item.status === "pending_clinician_review" ? "#FBBF24" : "#34D399",
                      fontWeight: 600,
                    }}
                  >
                    {item.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600, marginBottom: "4px" }}>PATIENT QUERY:</div>
                  <div style={{ background: "#0F172A", padding: "10px 14px", borderRadius: "8px", fontSize: "13.5px", color: "#E2E8F0" }}>
                    &ldquo;{item.query}&rdquo;
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 600, marginBottom: "4px" }}>PROPOSED CLINICAL DRAFT:</div>
                  <div style={{ background: "#080D1A", padding: "12px 14px", borderRadius: "8px", fontSize: "13px", color: "#CBD5E1", border: "1px solid #1E293B", whiteSpace: "pre-wrap" }}>
                    {item.final_response || item.proposed_response}
                  </div>
                </div>

                {item.status === "pending_clinician_review" && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      onClick={() => handleHITLAction(item.id, "approve")}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ✓ Approve &amp; Release to Patient
                    </button>

                    <button
                      onClick={() => {
                        setEditingReviewId(item.id);
                        setCustomResponse(item.proposed_response);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "#1E293B",
                        border: "1px solid #334155",
                        color: "#38BDF8",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ✎ Modify Response Draft
                    </button>

                    <button
                      onClick={() => handleHITLAction(item.id, "reject")}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#F87171",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ✕ Reject &amp; Suspend Triage
                    </button>
                  </div>
                )}

                {editingReviewId === item.id && (
                  <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #1E293B" }}>
                    <label style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                      Physician Modified Response:
                    </label>
                    <textarea
                      value={customResponse}
                      onChange={(e) => setCustomResponse(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        background: "#080D1A",
                        border: "1px solid #38BDF8",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        color: "#F8FAFC",
                        fontSize: "13px",
                        marginBottom: "10px",
                        outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleHITLAction(item.id, "modify")}
                        style={{
                          padding: "7px 14px",
                          borderRadius: "6px",
                          background: "#0284C7",
                          color: "#FFF",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Submit Physician Modification
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: "6px",
                          background: "#1E293B",
                          color: "#94A3B8",
                          border: "none",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. Tab 2: Clinical Risk & Escalations                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "escalations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {escalations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 20px", background: "#0B101D", borderRadius: "12px", border: "1px solid #1E293B" }}>
              <ShieldCheck size={44} color="#10B981" style={{ margin: "0 auto 12px", opacity: 0.8 }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#F8FAFC" }}>No Active Risk Escalations</h3>
              <p style={{ color: "#94A3B8", fontSize: "13px" }}>Zero critical triage emergencies currently unresolved.</p>
            </div>
          ) : (
            escalations.map((esc) => (
              <div
                key={esc.id}
                style={{
                  background: "#0B101D",
                  border: "1px solid #1E293B",
                  borderRadius: "10px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>{esc.patient_name}</span>
                    <span
                      style={{
                        fontSize: "10.5px",
                        padding: "2px 7px",
                        borderRadius: "5px",
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#F87171",
                        fontWeight: 700,
                      }}
                    >
                      {esc.risk_level}
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748B" }}>{formatTime(esc.created_at)}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#CBD5E1" }}>{esc.issue}</div>
                </div>

                <select
                  value={esc.status}
                  onChange={(e) => updateEscalation(esc.id, e.target.value)}
                  style={{
                    background: "#1E293B",
                    color: "#F8FAFC",
                    border: "1px solid #334155",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <option value="open">Open</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. Tab 3: Safety Circuit Breaker Console                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "circuit" && (
        <div style={{ background: "#0B101D", border: "1px solid #1E293B", borderRadius: "12px", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
                Runtime Safety Circuit Breaker Architecture
              </h2>
              <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "4px" }}>
                Automatic fail-safe isolation preventing corrupted or hallucinated clinical model output during API anomalies.
              </p>
            </div>
            <button
              onClick={handleResetCircuitBreaker}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                border: "none",
                color: "#FFFFFF",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Force Reset Circuit Breaker
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
            <div style={{ background: "#080D1A", padding: "16px", borderRadius: "8px", border: "1px solid #1E293B" }}>
              <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Breaker State</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: circuitBreaker.healthy ? "#34D399" : "#F87171", marginTop: "4px" }}>
                {circuitBreaker.state || "CLOSED"}
              </div>
            </div>

            <div style={{ background: "#080D1A", padding: "16px", borderRadius: "8px", border: "1px solid #1E293B" }}>
              <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Failure Threshold</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#F8FAFC", marginTop: "4px" }}>
                {circuitBreaker.failure_threshold || 3} Consecutive Errors
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
