"use client";

import React, { useState } from "react";
import {
  Heart,
  Search,
  Plus,
  Sparkles,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Activity,
  FileText
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface BoardCard {
  id: string;
  code: string;
  title: string;
  tag: string;
  tagColor: string;
  priority: "High" | "Medium" | "Low" | "Emergency";
  assignee: { name: string; avatarBg: string; initial: string };
  metrics?: string;
  isHitl?: boolean;
}

export function AtlassianTriageBoard() {
  const { openSignInModal } = useAuth();
  const [activeTab, setActiveTab] = useState("board");
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);

  const columns: { title: string; count: number; items: BoardCard[] }[] = [
    {
      title: "Patient Intake",
      count: 3,
      items: [
        {
          id: "1",
          code: "OPD-204",
          title: "Acute chest tightness radiating to left arm with shortness of breath",
          tag: "emergency",
          tagColor: "bg-[#FFEBE6] text-[#DE350B]",
          priority: "Emergency",
          assignee: { name: "Dr. Chen", avatarBg: "bg-[#0C66E4]", initial: "C" },
          metrics: "SpO2 97% • HR 94",
        },
        {
          id: "2",
          code: "PED-102",
          title: "Pediatric ear ache checkup with moderate fever 38.4°C",
          tag: "pediatrics",
          tagColor: "bg-[#EAE6FF] text-[#403294]",
          priority: "Medium",
          assignee: { name: "Dr. Patel", avatarBg: "bg-[#22A06B]", initial: "P" },
          metrics: "Temp 38.4°C • Stable",
        },
        {
          id: "3",
          code: "RX-409",
          title: "Routine refill request: Metformin 500mg daily with lab follow-up",
          tag: "refill",
          tagColor: "bg-[#F1F2F4] text-[#44546F]",
          priority: "Low",
          assignee: { name: "Nurse Elena", avatarBg: "bg-[#626F86]", initial: "E" },
          metrics: "Vitals normal",
        },
      ],
    },
    {
      title: "Clinical AI Analysis",
      count: 3,
      items: [
        {
          id: "4",
          code: "CARE-88",
          title: "Symptom Assessment: Evaluating acute cardiac vs gastrointestinal symptoms",
          tag: "symptom-check",
          tagColor: "bg-[#DEEBFF] text-[#0747A6]",
          priority: "High",
          assignee: { name: "Clinical Assistant", avatarBg: "bg-[#0C66E4]", initial: "AI" },
          metrics: "Guidelines active",
        },
        {
          id: "5",
          code: "PROTO-19",
          title: "Cardiology Clinical Protocols: Matching standard ACC/AHA chest pain care pathways",
          tag: "protocol-match",
          tagColor: "bg-[#DEEBFF] text-[#0747A6]",
          priority: "Medium",
          assignee: { name: "Care Protocol", avatarBg: "bg-[#6554C0]", initial: "CP" },
          metrics: "Protocol verified",
        },
        {
          id: "6",
          code: "RECORD-12",
          title: "Medical Records Ingestion: Laboratory blood panel & discharge summary parsed",
          tag: "records-sync",
          tagColor: "bg-[#E3FCEF] text-[#006644]",
          priority: "Low",
          assignee: { name: "Records Intake", avatarBg: "bg-[#00875A]", initial: "RI" },
          metrics: "Labs structured",
        },
      ],
    },
    {
      title: "Doctor Review • Oversight",
      count: 2,
      items: [
        {
          id: "7",
          code: "MD-105",
          title: "SUSPENDED FOR DOCTOR SIGN-OFF: Acute cardiac risk flag requires attending review",
          tag: "needs-doctor",
          tagColor: "bg-[#FFF0B3] text-[#172B4D] font-bold border border-[#F5CD47]",
          priority: "Emergency",
          assignee: { name: "Dr. Prannessh KVA", avatarBg: "bg-[#DE350B]", initial: "PK" },
          metrics: "Needs signature",
          isHitl: true,
        },
        {
          id: "8",
          code: "SAFETY-04",
          title: "Medication Conflict Alert: Blood pressure prescription flagged with pregnancy",
          tag: "safety-alert",
          tagColor: "bg-[#FFEBE6] text-[#DE350B] font-bold",
          priority: "High",
          assignee: { name: "Safety Gate", avatarBg: "bg-[#AE2A19]", initial: "SG" },
          metrics: "Conflict blocked",
          isHitl: true,
        },
      ],
    },
    {
      title: "Approved & Dispatched",
      count: 3,
      items: [
        {
          id: "9",
          code: "PLAN-72",
          title: "Hypertension step-down care plan approved by Dr. Chen & dispatched to patient",
          tag: "care-plan",
          tagColor: "bg-[#E3FCEF] text-[#006644]",
          priority: "Low",
          assignee: { name: "Dr. Chen", avatarBg: "bg-[#0C66E4]", initial: "C" },
          metrics: "Care plan sent",
        },
        {
          id: "10",
          code: "LAB-14",
          title: "Blood pathology report verified: Cardiac enzymes normal, HbA1c 6.8%",
          tag: "verified-lab",
          tagColor: "bg-[#E3FCEF] text-[#006644]",
          priority: "Low",
          assignee: { name: "EHR Sync", avatarBg: "bg-[#00875A]", initial: "EHR" },
          metrics: "Patient chart updated",
        },
        {
          id: "11",
          code: "APPT-55",
          title: "Specialist consultation scheduled: Cardiology Dr. Patel, Nov 18",
          tag: "confirmed",
          tagColor: "bg-[#DEEBFF] text-[#0747A6]",
          priority: "Low",
          assignee: { name: "Reception", avatarBg: "bg-[#22A06B]", initial: "P" },
          metrics: "Appointment confirmed",
        },
      ],
    },
  ];

  return (
    <section
      id="triage-board"
      style={{
        backgroundColor: "#FAFBFC",
        padding: "56px 24px",
        borderTop: "1px solid #DFE1E6",
        borderBottom: "1px solid #DFE1E6",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#0C66E4",
              marginBottom: "8px",
            }}
          >
            Clinical Triage Board
          </div>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "#091E42",
              margin: "0 0 10px 0",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            How care teams and clinical AI collaborate in real-time
          </h2>
          <p style={{ fontSize: "16px", color: "#44546F", maxWidth: "680px", margin: "0 auto", lineHeight: 1.6 }}>
            Track patient consultations from initial symptom intake to diagnostic analysis and mandatory physician sign-off.
          </p>
        </div>

        {/* The Atlassian Jira-Style Triage Board Frame */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #DFE1E6",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 16px 36px -8px rgba(9, 30, 66, 0.14)",
            overflow: "hidden",
          }}
        >
          {/* Top Utility Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderBottom: "1px solid #DFE1E6",
              backgroundColor: "#F7F8F9",
              fontSize: "12px",
              color: "#44546F",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "5px",
                  backgroundColor: "#0C66E4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <Heart size={14} fill="#FFFFFF" color="#FFFFFF" />
              </div>
              <span style={{ fontWeight: 700, color: "#091E42" }}>MediFlow Clinical Triage</span>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "7px", color: "#626F86" }} />
                <input
                  type="text"
                  placeholder="Search triage board..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{
                    height: "28px",
                    width: "200px",
                    borderRadius: "6px",
                    border: "1px solid #DFE1E6",
                    backgroundColor: "#FFFFFF",
                    paddingLeft: "28px",
                    paddingRight: "8px",
                    fontSize: "12px",
                    color: "#091E42",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => openSignInModal("/chat")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#0C66E4",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} />
                <span>New Triage Case</span>
              </button>

              <button
                onClick={() => openSignInModal("/chat")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DFE1E6",
                  color: "#091E42",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Sparkles size={13} color="#0C66E4" />
                <span>Ask Clinical AI</span>
              </button>
            </div>
          </div>

          {/* Ward Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #DFE1E6", backgroundColor: "#FFFFFF" }}>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "#626F86" }}>
              Hospital Ward / Saint Jude Medical Center
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#091E42" }}>
                  Emergency &amp; Inpatient Triage Roadmap
                </span>
                <span style={{ backgroundColor: "#E9F2FF", color: "#0C66E4", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                  Hospital Tenant 01
                </span>
              </div>

              {/* Active Clinicians */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", marginRight: "-8px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#0C66E4", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, border: "2px solid #FFFFFF" }}>
                    PK
                  </div>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#22A06B", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, border: "2px solid #FFFFFF", marginLeft: "-6px" }}>
                    SC
                  </div>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#6554C0", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, border: "2px solid #FFFFFF", marginLeft: "-6px" }}>
                    DP
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "#626F86", marginLeft: "12px" }}>Active Doctors On Call</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: "flex", gap: "24px", marginTop: "16px", borderBottom: "1px solid #DFE1E6", fontSize: "13.5px" }}>
              {[
                { id: "summary", label: "Ward Summary" },
                { id: "board", label: "Triage Board" },
                { id: "list", label: "Patient List" },
                { id: "ingest", label: "Medical Records" },
                { id: "reports", label: "Lab Reports" },
                { id: "hitl", label: "Doctor Oversight" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    paddingBottom: "10px",
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? "#0C66E4" : "#44546F",
                    border: "none",
                    borderBottom: activeTab === tab.id ? "2px solid #0C66E4" : "2px solid transparent",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "#626F86" }}>Filter:</span>
                <span style={{ backgroundColor: "#F1F2F4", color: "#091E42", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>
                  All Patients
                </span>
                <span style={{ backgroundColor: "#F1F2F4", color: "#44546F", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", cursor: "pointer" }}>
                  Cardiology
                </span>
                <span style={{ backgroundColor: "#F1F2F4", color: "#44546F", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", cursor: "pointer" }}>
                  Emergency
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "#FFF0B3",
                    color: "#172B4D",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                  }}
                >
                  <AlertTriangle size={12} color="#FF991F" />
                  <span>Needs Doctor Sign-Off (2)</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 Kanban Columns */}
          <div style={{ padding: "20px", backgroundColor: "#F7F8F9", overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", minWidth: "860px" }}>
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "rgba(235, 236, 240, 0.7)",
                    borderRadius: "8px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "0 4px", fontSize: "12px", fontWeight: 700, color: "#44546F", textTransform: "uppercase" }}>
                    <span>{col.title}</span>
                    <span style={{ backgroundColor: "#FFFFFF", padding: "1px 7px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, color: "#091E42" }}>
                      {col.count}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {col.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedCard(item)}
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: item.isHitl ? "1px solid #FF991F" : "1px solid #DFE1E6",
                          borderRadius: "8px",
                          padding: "12px",
                          boxShadow: "0 1px 3px rgba(9, 30, 66, 0.08)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = "#0C66E4")}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = item.isHitl ? "#FF991F" : "#DFE1E6")}
                      >
                        {item.isHitl && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 800, color: "#DE350B", marginBottom: "6px" }}>
                            <AlertTriangle size={12} />
                            <span>SUSPENDED FOR DOCTOR SIGN-OFF</span>
                          </div>
                        )}

                        <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#091E42", lineHeight: 1.45, margin: "0 0 10px 0" }}>
                          {item.title}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.tagColor}`}>
                              {item.tag}
                            </span>
                            {item.metrics && (
                              <span style={{ color: "#626F86", fontSize: "11px" }}>{item.metrics}</span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#626F86" }}>{item.code}</span>
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFFFFF",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                              className={item.assignee.avatarBg}
                              title={item.assignee.name}
                            >
                              {item.assignee.initial}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => openSignInModal("/chat")}
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#44546F",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Plus size={14} />
                    <span>Create patient triage card</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card Detail Slide-Out / Drawer */}
          {selectedCard && (
            <div
              style={{
                borderTop: "1px solid #DFE1E6",
                backgroundColor: "#FFFFFF",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#091E42" }}>{selectedCard.title}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${selectedCard.tagColor}`}>
                    {selectedCard.tag}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#626F86", margin: "4px 0 0 0" }}>
                  Assigned Physician: <strong style={{ color: "#091E42" }}>{selectedCard.assignee.name}</strong> • Priority: {selectedCard.priority} • {selectedCard.metrics}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => openSignInModal(selectedCard.isHitl ? "/admin" : "/chat")}
                  style={{
                    backgroundColor: "#0C66E4",
                    color: "#FFFFFF",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {selectedCard.isHitl ? "Review & Sign Off as Doctor" : "Open in Clinical Workspace"}
                </button>
                <button
                  onClick={() => setSelectedCard(null)}
                  style={{
                    backgroundColor: "transparent",
                    color: "#44546F",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #DFE1E6",
                    fontSize: "12.5px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
