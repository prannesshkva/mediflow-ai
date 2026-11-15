"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Stethoscope,
  Syringe,
  TestTube,
  ShieldCheck,
  FileText,
  UserCheck,
  LogIn,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export function ClinicalInstrumentsSetup() {
  const { loginAsDemoClinician, loginAsDemoPatient, signInWithGoogle, loginError } = useAuth();
  const router = useRouter();

  // Simulated physiological ECG heart rate variance
  const [heartRate, setHeartRate] = useState(74);
  const [pulseTick, setPulseTick] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick(true);
      setTimeout(() => setPulseTick(false), 200);
      setHeartRate(Math.floor(72 + Math.random() * 5));
    }, 850);
    return () => clearInterval(interval);
  }, []);

  const handleClinicianAccess = () => {
    loginAsDemoClinician();
    router.push("/admin");
  };

  const handlePatientAccess = () => {
    loginAsDemoPatient();
    router.push("/chat");
  };

  return (
    <section
      id="clinical-setup"
      style={{
        backgroundColor: "#F7F8F9",
        padding: "64px 24px",
        borderTop: "1px solid #DFE1E6",
        borderBottom: "1px solid #DFE1E6",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 40px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(12, 102, 228, 0.3)",
              backgroundColor: "#E9F2FF",
              fontSize: "12px",
              fontWeight: 700,
              color: "#0C66E4",
              marginBottom: "12px",
            }}
          >
            <Activity size={14} color="#0C66E4" />
            <span>Clinical Workstation &amp; Medical Instruments Setup</span>
          </div>

          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#091E42",
              margin: "0 0 12px 0",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Where clinical diagnostic equipment meets AI intelligence
          </h2>

          <p style={{ fontSize: "16px", color: "#44546F", lineHeight: 1.6, margin: 0 }}>
            Connected to hospital telemetry, electronic stethoscopes, and point-of-care analyzers — governed by licensed physician oversight.
          </p>
        </div>

        {/* Grid: Left = Telemetry & Instruments, Right = Sign-In Card */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "28px",
            alignItems: "start",
          }}
        >
          
          {/* Left Column: Instruments & ICU Telemetry */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* 1. Multi-Parameter ICU Telemetry Monitor */}
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid #DFE1E6",
                backgroundColor: "#0A101D",
                color: "#FFFFFF",
                boxShadow: "0 8px 24px rgba(9, 30, 66, 0.12)",
                overflow: "hidden",
              }}
            >
              {/* Monitor Top Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  backgroundColor: "#0F172A",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "11.5px",
                  fontFamily: "monospace",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#22C55E",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>
                    ICU TELEMETRY • BED 04 (EMERGENCY TRIAGE)
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    color: "#38BDF8",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                  }}
                >
                  CALIBRATED
                </span>
              </div>

              {/* Vitals Tiles */}
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  {/* HR Tile */}
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "#050B14",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#22C55E", display: "flex", justifyContent: "space-between" }}>
                      <span>ECG / HR</span>
                      <Heart size={11} fill={pulseTick ? "#22C55E" : "none"} color="#22C55E" />
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginTop: "4px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 900, fontFamily: "monospace", color: "#22C55E" }}>
                        {heartRate}
                      </span>
                      <span style={{ fontSize: "10px", color: "rgba(34, 197, 94, 0.7)", fontFamily: "monospace" }}>BPM</span>
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>SINUS</div>
                  </div>

                  {/* NIBP Tile */}
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "#050B14",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#F59E0B" }}>NIBP CUFF</div>
                    <div style={{ marginTop: "4px" }}>
                      <span style={{ fontSize: "18px", fontWeight: 900, fontFamily: "monospace", color: "#F59E0B" }}>
                        120/78
                      </span>
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>MAP: 92</div>
                  </div>

                  {/* SpO2 Tile */}
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "#050B14",
                      border: "1px solid rgba(6, 182, 212, 0.3)",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#06B6D4" }}>SpO2</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginTop: "4px" }}>
                      <span style={{ fontSize: "24px", fontWeight: 900, fontFamily: "monospace", color: "#06B6D4" }}>
                        99
                      </span>
                      <span style={{ fontSize: "10px", color: "rgba(6, 182, 212, 0.7)", fontFamily: "monospace" }}>%</span>
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>NORMAL</div>
                  </div>

                  {/* Resp Tile */}
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: "#050B14",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#A855F7" }}>RESP / T</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginTop: "4px" }}>
                      <span style={{ fontSize: "20px", fontWeight: 900, fontFamily: "monospace", color: "#A855F7" }}>
                        16
                      </span>
                      <span style={{ fontSize: "9px", color: "rgba(168, 85, 247, 0.7)", fontFamily: "monospace" }}>/min</span>
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.7)", marginTop: "2px" }}>36.8°C</div>
                  </div>
                </div>

                {/* Animated ECG Waveform */}
                <div
                  style={{
                    backgroundColor: "#03070E",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "monospace", color: "rgba(34, 197, 94, 0.8)", marginBottom: "4px" }}>
                    <span>LEAD II CONTINUOUS RHYTHM TRACE</span>
                    <span style={{ fontWeight: 700, color: "#22C55E" }}>QRS STABLE</span>
                  </div>
                  <svg style={{ width: "100%", height: "48px" }} viewBox="0 0 600 50" preserveAspectRatio="none">
                    <path
                      d="M0,25 L60,25 L70,25 L75,20 L80,30 L85,4 L90,44 L95,25 L105,25 L115,16 L125,25 L200,25 L210,25 L215,20 L220,30 L225,4 L230,44 L235,25 L245,25 L255,16 L265,25 L340,25 L350,25 L355,20 L360,30 L365,4 L370,44 L375,25 L385,25 L395,16 L405,25 L480,25 L490,25 L495,20 L500,30 L505,4 L510,44 L515,25 L525,25 L535,16 L545,25 L600,25"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. Medical Diagnostic Instruments 2x2 Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              
              {/* Electronic Stethoscope */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DFE1E6",
                  borderRadius: "10px",
                  padding: "14px",
                  boxShadow: "0 1px 2px rgba(9, 30, 66, 0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#E9F2FF",
                      color: "#0C66E4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#091E42" }}>Electronic Stethoscope</div>
                    <div style={{ fontSize: "11px", color: "#626F86" }}>Cardio &amp; Pulmonary Filter</div>
                  </div>
                </div>
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #EBECF0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                  <span style={{ color: "#44546F" }}>Auscultation S1/S2</span>
                  <span style={{ backgroundColor: "#E3FCEF", color: "#006644", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, fontSize: "10px" }}>
                    CLEAR
                  </span>
                </div>
              </div>

              {/* Smart Infusion Pump */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DFE1E6",
                  borderRadius: "10px",
                  padding: "14px",
                  boxShadow: "0 1px 2px rgba(9, 30, 66, 0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#FFF0B3",
                      color: "#172B4D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Syringe size={20} color="#FF991F" />
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#091E42" }}>Smart Infusion Pump</div>
                    <div style={{ fontSize: "11px", color: "#626F86" }}>Safety Guard Active</div>
                  </div>
                </div>
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #EBECF0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                  <span style={{ color: "#44546F" }}>Rate: 100 mL/hr NS</span>
                  <span style={{ backgroundColor: "#E3FCEF", color: "#006644", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, fontSize: "10px" }}>
                    SCREENED
                  </span>
                </div>
              </div>

              {/* Point-of-Care Lab Analyzer */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DFE1E6",
                  borderRadius: "10px",
                  padding: "14px",
                  boxShadow: "0 1px 2px rgba(9, 30, 66, 0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#E3FCEF",
                      color: "#006644",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TestTube size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#091E42" }}>POC Lab Analyzer</div>
                    <div style={{ fontSize: "11px", color: "#626F86" }}>Troponin I &amp; Chem-7</div>
                  </div>
                </div>
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #EBECF0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                  <span style={{ color: "#44546F" }}>Trop I: &lt; 0.01 ng/mL</span>
                  <span style={{ backgroundColor: "#DEEBFF", color: "#0747A6", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, fontSize: "10px" }}>
                    NORMAL
                  </span>
                </div>
              </div>

              {/* Diagnostic Radiology & EHR Ingest */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DFE1E6",
                  borderRadius: "10px",
                  padding: "14px",
                  boxShadow: "0 1px 2px rgba(9, 30, 66, 0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#EAE6FF",
                      color: "#403294",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#091E42" }}>EHR Ingest Station</div>
                    <div style={{ fontSize: "11px", color: "#626F86" }}>Pydantic v2 Vitals</div>
                  </div>
                </div>
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #EBECF0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                  <span style={{ color: "#44546F" }}>ICD-10 I10, E11</span>
                  <span style={{ backgroundColor: "#E3FCEF", color: "#006644", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, fontSize: "10px" }}>
                    SYNCED
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: The Atlassian Sign-In Card */}
          <div>
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #DFE1E6",
                backgroundColor: "#FFFFFF",
                padding: "32px",
                boxShadow: "0 16px 32px -4px rgba(9, 30, 66, 0.12)",
              }}
            >
              {/* Card Header in Atlassian Styling */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    backgroundColor: "#0C66E4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 6px rgba(12, 102, 228, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <Heart size={22} fill="#FFFFFF" color="#FFFFFF" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#091E42",
                      letterSpacing: "-0.5px",
                      margin: 0,
                    }}
                  >
                    Welcome to MediFlow AI
                  </h3>
                  <p style={{ fontSize: "12px", color: "#626F86", margin: "2px 0 0 0" }}>
                    Clinical Decision Support with HITL Governance
                  </p>
                </div>
              </div>

              <p style={{ fontSize: "13.5px", color: "#44546F", lineHeight: 1.55, marginBottom: "24px" }}>
                Authenticate to connect with real-time patient monitors, triage queues, and licensed physician oversight.
              </p>

              {loginError && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #F87171",
                    color: "#991B1B",
                    fontSize: "12px",
                  }}
                >
                  {loginError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                
                {/* 1. Enter as Clinical Director (MD) - Atlassian Blue Primary */}
                <button
                  onClick={handleClinicianAccess}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#0C66E4",
                    border: "none",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(9, 30, 66, 0.15)",
                    transition: "background 0.15s ease",
                    textAlign: "left",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0052CC")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0C66E4")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Stethoscope size={18} color="#FFFFFF" />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>Enter as Clinical Director</span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          MD ROOT
                        </span>
                      </div>
                      <p style={{ fontSize: "11.5px", color: "rgba(255, 255, 255, 0.8)", margin: "2px 0 0 0" }}>
                        Full HITL sign-off queue &amp; circuit breaker control
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} color="rgba(255, 255, 255, 0.8)" />
                </button>

                {/* 2. Enter as Patient User */}
                <button
                  onClick={handlePatientAccess}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#F7F8F9",
                    border: "1px solid #DFE1E6",
                    color: "#091E42",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#E9F2FF";
                    e.currentTarget.style.borderColor = "#85B8FF";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#F7F8F9";
                    e.currentTarget.style.borderColor = "#DFE1E6";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "6px",
                        backgroundColor: "#DFE1E6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UserCheck size={18} color="#091E42" />
                    </div>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#091E42" }}>
                        Enter as Patient User
                      </span>
                      <p style={{ fontSize: "11.5px", color: "#626F86", margin: "2px 0 0 0" }}>
                        Symptom triage, appointment booking &amp; lab reports
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#626F86" />
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#DFE1E6" }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#626F86", textTransform: "uppercase" }}>
                    Or Single Sign-On
                  </span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#DFE1E6" }} />
                </div>

                {/* 3. Continue with Google (Firebase SSO) */}
                <button
                  onClick={signInWithGoogle}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #DFE1E6",
                    color: "#172B4D",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(9, 30, 66, 0.08)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#F7F8F9";
                    e.currentTarget.style.borderColor = "#85B8FF";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.borderColor = "#DFE1E6";
                  }}
                >
                  <LogIn size={16} color="#0C66E4" />
                  <span>Continue with Google (Firebase)</span>
                </button>

              </div>

              {/* Security & Hospital Tenant Badges */}
              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #EBECF0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#626F86",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "#172B4D" }}>
                    <ShieldCheck size={14} color="#22A06B" />
                    PostgreSQL Row-Level Security
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0C66E4" }}>ACTIVE</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "#172B4D" }}>
                    <Activity size={14} color="#0C66E4" />
                    Tenant Isolation
                  </span>
                  <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#626F86" }}>tenant-default</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
