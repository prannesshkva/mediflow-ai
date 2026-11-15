"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Moon,
  Sun,
  Bell,
  Volume2,
  Lock,
  Save,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Hospital,
  Activity,
  KeyRound,
  LogOut,
  Sparkles
} from "lucide-react";
import { useAuth, isUserAdmin, AUTHORIZED_ADMIN_EMAIL } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";

export default function ProfilePage() {
  const { user, isAdmin, logout, updateUserProfile, activateAdminWithEmail } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [department, setDepartment] = useState("Cardiology & Emergency Triage");
  const [adminVerificationEmail, setAdminVerificationEmail] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Clinical Notification Toggles
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [hitlNotifications, setHitlNotifications] = useState(true);
  const [autoSaveContext, setAutoSaveContext] = useState(true);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ displayName });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleVerifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    const success = activateAdminWithEmail(adminVerificationEmail);
    if (success) {
      setAdminSuccess(true);
      setAdminVerificationEmail("");
      setTimeout(() => setAdminSuccess(false), 4000);
    } else {
      setAdminError("Verification failed. This email does not possess administrative privileges.");
    }
  };

  const userInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : "U";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        padding: "36px 24px 60px",
        overflowY: "auto",
        transition: "background-color 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        
        {/* Top Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <Link
            href="/chat"
            className="gemini-transition"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-secondary)",
              fontSize: "13.5px",
              fontWeight: 500,
              textDecoration: "none",
            }}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent-cyan)")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
          >
            <ArrowLeft size={16} />
            <span>Return to Clinical Consultation</span>
          </Link>

          {/* Quick Theme Switcher in Header */}
          <button
            onClick={toggleTheme}
            className="gemini-card-hover"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 14px",
              borderRadius: "20px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {theme === "dark" ? (
              <>
                <Sun size={15} color="#F59E0B" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={15} color="#38BDF8" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Page Title & Status */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              User Profile &amp; Settings
            </h1>
            {isAdmin && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                ADMIN ACCESS VERIFIED
              </span>
            )}
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
            Manage clinical identity, visual theme preferences, and security authority credentials.
          </p>
        </div>

        {savedSuccess && (
          <div
            className="gemini-transition"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 18px",
              borderRadius: "10px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34D399",
              fontSize: "13.5px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            <CheckCircle2 size={18} />
            <span>Profile and settings saved successfully.</span>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 1: CLINICAL IDENTITY & PROFILE                           */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          className="gemini-card-hover"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
            {/* Avatar Pill */}
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: isAdmin ? "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)" : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: "26px",
                fontWeight: 800,
                boxShadow: isAdmin ? "0 4px 16px rgba(2, 132, 199, 0.35)" : "0 4px 16px rgba(16, 185, 129, 0.3)",
                flexShrink: 0,
              }}
            >
              {userInitial}
            </div>

            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                {displayName || (isAdmin ? "Prannessh KVA" : "Clinical User")}
              </div>
              <div style={{ fontSize: "13px", color: "var(--accent-cyan)", fontWeight: 600, marginTop: "2px" }}>
                {isAdmin ? "Clinical Director (MD) • System Administrator" : "Attending Clinician / Patient User"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                {user?.email || "Local Clinical Session"}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Full Legal / Clinical Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Dr. Prannessh KVA"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Clinical Department / Specialty
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Cardiology & Emergency Triage"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button
                type="submit"
                className="gemini-card-hover"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 20px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                }}
              >
                <Save size={15} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 2: APPEARANCE & THEME PREFERENCES (DARK / LIGHT)         */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          className="gemini-card-hover"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Appearance &amp; Visual Theme
            </h2>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
            Choose your preferred clinical workspace contrast mode. Settings persist across browser sessions.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Dark Mode Card */}
            <div
              onClick={() => setTheme("dark")}
              className="gemini-card-hover"
              style={{
                padding: "16px 18px",
                borderRadius: "12px",
                backgroundColor: "#070B14",
                border: theme === "dark" ? "2px solid #38BDF8" : "1px solid #1E293B",
                cursor: "pointer",
                boxShadow: theme === "dark" ? "0 0 16px rgba(56, 189, 248, 0.2)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#F8FAFC", fontWeight: 700, fontSize: "14px" }}>
                  <Moon size={18} color="#38BDF8" />
                  <span>Obsidian Dark</span>
                </div>
                {theme === "dark" && <CheckCircle2 size={16} color="#38BDF8" />}
              </div>
              <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, lineHeight: 1.4 }}>
                Recommended for low-light clinical workstations, emergency rooms, and extended eye comfort.
              </p>
            </div>

            {/* Light Mode Card */}
            <div
              onClick={() => setTheme("light")}
              className="gemini-card-hover"
              style={{
                padding: "16px 18px",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                border: theme === "light" ? "2px solid #0284C7" : "1px solid #E2E8F0",
                cursor: "pointer",
                boxShadow: theme === "light" ? "0 0 16px rgba(2, 132, 199, 0.2)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0F172A", fontWeight: 700, fontSize: "14px" }}>
                  <Sun size={18} color="#F59E0B" />
                  <span>Daylight Clinical</span>
                </div>
                {theme === "light" && <CheckCircle2 size={16} color="#0284C7" />}
              </div>
              <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: 1.4 }}>
                Crisp high-brightness design tailored for daytime hospital wards and consultation rooms.
              </p>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 3: CLINICAL ALERTS & NOTIFICATION PREFERENCES             */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          className="gemini-card-hover"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Bell size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Clinical Triage &amp; Alert Preferences
            </h2>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "18px" }}>
            Configure alert thresholds for acute symptom detection and emergency physician sign-offs.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Toggle 1: Emergency Audio Chime */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Emergency Chime on Acute Symptoms
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Auditory alert when chest tightness or acute vitals are detected.
                </div>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0284C7" }}
              />
            </div>

            {/* Toggle 2: HITL Review Queue Push */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Human-in-the-Loop Sign-Off Notifications
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Real-time alerts when patient consultations require physician sign-off.
                </div>
              </div>
              <input
                type="checkbox"
                checked={hitlNotifications}
                onChange={(e) => setHitlNotifications(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0284C7" }}
              />
            </div>

            {/* Toggle 3: Multi-turn Memory */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Continuous Multi-Turn Context Synchronization
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Preserves clinical dialogue turns across consultation points.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoSaveContext}
                onChange={(e) => setAutoSaveContext(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0284C7" }}
              />
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 4: ADMINISTRATIVE AUTHORITY VERIFICATION                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          className="gemini-card-hover"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Lock size={18} color={isAdmin ? "#10B981" : "var(--accent-cyan)"} />
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              Administrative Authority &amp; Access
            </h2>
          </div>

          {isAdmin ? (
            <div
              style={{
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10B981",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700 }}>Authorized Clinical Director Credentials Active</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "2px" }}>
                  You have full administrative visibility into the HITL Review Queue, emergency overrides, and clinical circuit breakers.
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Admin access is strictly restricted to authorized Clinical Leadership. Authorized accounts can activate administrative privileges below.
              </p>

              {adminSuccess && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34D399",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "14px",
                  }}
                >
                  Administrator access verified and activated. The Admin &amp; HITL command center is now accessible.
                </div>
              )}

              {adminError && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#F87171",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "14px",
                  }}
                >
                  {adminError}
                </div>
              )}

              <form onSubmit={handleVerifyAdmin} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="email"
                  value={adminVerificationEmail}
                  onChange={(e) => setAdminVerificationEmail(e.target.value)}
                  placeholder="Enter authorized administrator email"
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    backgroundColor: "#0C66E4",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Verify Access
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CARD 5: SESSION & SIGN OUT                                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderRadius: "16px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              Session Management
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Disconnect your session and purge local clinical credentials.
            </div>
          </div>

          <button
            onClick={logout}
            className="gemini-card-hover"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#EF4444",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
