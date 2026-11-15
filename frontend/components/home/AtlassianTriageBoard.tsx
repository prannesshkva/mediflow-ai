"use client";

import React, { useState } from "react";
import {
  Heart,
  Search,
  Plus,
  Sparkles,
  Bell,
  Settings,
  HelpCircle,
  Filter,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Bot,
  Activity,
  Calendar,
  FileText,
  Stethoscope
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
  latency?: string;
  isHitl?: boolean;
}

export function AtlassianTriageBoard() {
  const { openSignInModal } = useAuth();
  const [activeTab, setActiveTab] = useState("board");
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);

  const columns: { title: string; count: number; items: BoardCard[] }[] = [
    {
      title: "Triage Intake",
      count: 3,
      items: [
        {
          id: "1",
          code: "OPD-204",
          title: "Acute retrosternal chest tightness radiating to left arm",
          tag: "emergency",
          tagColor: "bg-[#FFEBE6] text-[#DE350B]",
          priority: "Emergency" as const,
          assignee: { name: "Dr. Chen", avatarBg: "bg-[#0C66E4]", initial: "C" },
          metrics: "SpO2 97% • HR 94",
        },
        {
          id: "2",
          code: "PED-102",
          title: "Pediatric Otitis Media checkup with fever 38.4°C",
          tag: "pediatrics",
          tagColor: "bg-[#EAE6FF] text-[#403294]",
          priority: "Medium" as const,
          assignee: { name: "Dr. Patel", avatarBg: "bg-[#22A06B]", initial: "P" },
          metrics: "Temp 38.4°C • RR 22",
        },
        {
          id: "3",
          code: "RX-409",
          title: "Routine refill query: Metformin 500mg BID with lab follow-up",
          tag: "refill",
          tagColor: "bg-[#F1F2F4] text-[#44546F]",
          priority: "Low" as const,
          assignee: { name: "Triage Nurse", avatarBg: "bg-[#626F86]", initial: "N" },
          metrics: "Vitals stable",
        },
      ],
    },
    {
      title: "AI Processing",
      count: 3,
      items: [
        {
          id: "4",
          code: "AGENT-88",
          title: "LangGraph StateGraph: Query Classifier → Risk Evaluator routing",
          tag: "langgraph",
          tagColor: "bg-[#DEEBFF] text-[#0747A6]",
          priority: "High" as const,
          assignee: { name: "AI Agent", avatarBg: "bg-[#0C66E4]", initial: "AI" },
          latency: "⚡ 38ms LPU",
        },
        {
          id: "5",
          code: "RAG-19",
          title: "Pinecone Vector RAG: ACC/AHA clinical protocols retrieved",
          tag: "protocols",
          tagColor: "bg-[#DEEBFF] text-[#0747A6]",
          priority: "Medium" as const,
          assignee: { name: "Vector Index", avatarBg: "bg-[#6554C0]", initial: "RAG" },
          metrics: "99.2% match",
        },
        {
          id: "6",
          code: "INGEST-12",
          title: "Discharge summary extraction to Pydantic v2 Vitals & ICD-10",
          tag: "pydantic-v2",
          tagColor: "bg-[#E3FCEF] text-[#006644]",
          priority: "Low" as const,
          assignee: { name: "OCR Worker", avatarBg: "bg-[#00875A]", initial: "OCR" },
          metrics: "4 pages parsed",
        },
      ],
    },
    {
      title: "In Review • HITL Gate",
      count: 2,
      items: [
        {
          id: "7",
          code: "HITL-105",
          title: "SUSPENDED FOR MD SIGN-OFF: Acute Coronary Syndrome risk detected",
          tag: "needs-md",
          tagColor: "bg-[#FFF0B3] text-[#172B4D] font-bold border border-[#F5CD47]",
          priority: "Emergency" as const,
          assignee: { name: "Dr. Prannessh KVA", avatarBg: "bg-[#DE350B]", initial: "PK" },
          metrics: "Pending sign-off",
          isHitl: true,
        },
        {
          id: "8",
          code: "CONTRA-04",
          title: "Lethal Contraindication: ACE Inhibitor detected in pregnant patient",
          tag: "safety-guard",
          tagColor: "bg-[#FFEBE6] text-[#DE350B] font-bold",
          priority: "High" as const,
          assignee: { name: "Safety Gate", avatarBg: "bg-[#AE2A19]", initial: "SG" },
          metrics: "Execution blocked",
          isHitl: true,
        },
      ],
    },
    {
      title: "Signed & Dispatched",
      count: 3,
      items: [
        {
          id: "9",
          code: "CARE-72",
          title: "Hypertension step-down care plan approved by Dr. Chen",
          tag: "icd10-i10",
          tagColor: "bg-[#E3FCEF] text-[#006644]",
          priority: "Low" as const,
          assignee: { name: "Dr. Chen", avatarBg: "bg-[#0C66E4]", initial: "C" },
          metrics: "Sent to patient",
        },
        {
          id: "10",
          code: "LAB-14",
          title: "Structured Pathology Lab: Troponin normal, HbA1c 6.8%",
          tag: "ehr-synced",
          tagColor: "bg-[#E3FCEF] text-[#006644]",
          priority: "Low" as const,
          assignee: { name: "Integration", avatarBg: "bg-[#00875A]", initial: "EHR" },
          metrics: "Postgres RLS",
        },
        {
          id: "11",
          code: "APPT-55",
          title: "Automated booking confirmed: Cardiology Dr. Patel, Nov 18",
          tag: "calendar",
          tagColor: "bg-[#DEEBFF] text-[#0747A6]",
          priority: "Low" as const,
          assignee: { name: "Router", avatarBg: "bg-[#22A06B]", initial: "P" },
          metrics: "Slot locked",
        },
      ],
    },
  ];

  return (
    <section id="triage-board" className="py-12 bg-[#FAFBFC] border-y border-[#DFE1E6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0C66E4] mb-2">
            Interactive Product Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#091E42]">
            Clinical operations at the speed of thought
          </h2>
          <p className="mt-3 text-base text-[#44546F] max-w-2xl mx-auto">
            Experience how clinicians and AI agents collaborate in real-time — from autonomous symptom intake to mandatory physician sign-off.
          </p>
        </div>

        {/* The Atlassian Jira-Style Triage Board Frame */}
        <div className="overflow-hidden rounded-xl border border-[#DFE1E6] bg-white shadow-xl">
          
          {/* Top Jira / Atlassian Utility Bar */}
          <div className="flex items-center justify-between border-b border-[#DFE1E6] bg-[#F7F8F9] px-4 py-2.5 text-xs text-[#44546F]">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0C66E4] text-white font-bold text-[10px]">
                <Heart size={13} className="fill-white" />
              </div>
              <span className="font-semibold text-[#091E42]">MediFlow Triage</span>
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-2.5 top-1.5 text-[#626F86]" />
                <input
                  type="text"
                  placeholder="Search clinical board..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="h-7 w-48 rounded-md border border-[#DFE1E6] bg-white pl-8 pr-2 text-xs text-[#091E42] placeholder-[#626F86] focus:border-[#0C66E4] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openSignInModal("/chat")}
                className="flex items-center gap-1.5 rounded-md bg-[#0C66E4] px-3 py-1 font-semibold text-white hover:bg-[#0052CC] transition-colors"
              >
                <Plus size={14} />
                <span>New Triage</span>
              </button>

              <button
                onClick={() => openSignInModal("/chat")}
                className="hidden sm:flex items-center gap-1 rounded-md border border-[#DFE1E6] bg-white px-2.5 py-1 text-xs font-semibold text-[#091E42] hover:bg-[#F1F2F4] transition-colors"
              >
                <Sparkles size={13} className="text-[#0C66E4]" />
                <span>Ask MediFlow AI</span>
              </button>
            </div>
          </div>

          {/* Space / Ward Header */}
          <div className="border-b border-[#DFE1E6] bg-white px-6 py-4">
            <div className="text-[11px] font-medium text-[#626F86]">
              Spaces / Saint Jude Medical Center
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[#091E42]">
                  Emergency &amp; Inpatient Triage Roadmap
                </span>
                <span className="rounded bg-[#E9F2FF] px-2 py-0.5 text-xs font-bold text-[#0C66E4]">
                  Tenant: Saint-Jude-01
                </span>
              </div>

              {/* Clinician Avatars Stack */}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0C66E4] text-[10px] font-bold text-white ring-2 ring-white" title="Dr. Prannessh KVA (Clinical Director)">
                    PK
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22A06B] text-[10px] font-bold text-white ring-2 ring-white" title="Dr. Sarah Chen (Cardiology)">
                    SC
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6554C0] text-[10px] font-bold text-white ring-2 ring-white" title="Dr. Patel (Emergency)">
                    DP
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#172B4D] text-[9px] font-bold text-white ring-2 ring-white" title="AI Agent StateGraph">
                    AI
                  </div>
                </div>
                <span className="text-xs text-[#626F86] ml-2">4 Active Clinicians</span>
              </div>
            </div>

            {/* Navigation Tabs (Atlassian style: Summary, Board, List, Forms, Pages) */}
            <div className="flex items-center gap-6 mt-4 border-b border-[#DFE1E6] text-sm">
              {[
                { id: "summary", label: "Summary" },
                { id: "board", label: "Triage Board" },
                { id: "list", label: "Patient List" },
                { id: "ingest", label: "EHR Ingest" },
                { id: "reports", label: "Lab Reports" },
                { id: "hitl", label: "HITL Oversight" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-2.5 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-[#0C66E4] font-semibold"
                      : "text-[#44546F] hover:text-[#091E42]"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#0C66E4]" />
                  )}
                </button>
              ))}
            </div>

            {/* Sub-toolbar (Search, Filter, Group, Needs input) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#626F86]">
                  <Filter size={14} />
                  <span>Filter by:</span>
                </div>
                <span className="rounded-full bg-[#F1F2F4] px-2.5 py-1 text-xs font-semibold text-[#091E42]">
                  All Patients
                </span>
                <span className="rounded-full bg-[#F1F2F4] px-2.5 py-1 text-xs font-medium text-[#44546F] hover:bg-[#E9F2FF] hover:text-[#0C66E4] cursor-pointer">
                  Cardiology
                </span>
                <span className="rounded-full bg-[#F1F2F4] px-2.5 py-1 text-xs font-medium text-[#44546F] hover:bg-[#E9F2FF] hover:text-[#0C66E4] cursor-pointer">
                  Emergency
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#FFF0B3] px-2 py-0.5 text-xs font-bold text-[#172B4D]">
                  <AlertTriangle size={12} className="text-[#FF991F]" />
                  <span>Needs MD Sign-Off (2)</span>
                </span>
              </div>
            </div>

          </div>

          {/* Kanban Board Columns (Atlassian Jira layout) */}
          <div className="p-4 sm:p-6 bg-[#F7F8F9] overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[800px]">
              {columns.map((col, idx) => (
                <div key={idx} className="flex flex-col rounded-lg bg-[#EBECF0]/60 p-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1 text-xs font-bold text-[#44546F] uppercase tracking-wider">
                    <span>{col.title}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#091E42] shadow-xs">
                      {col.count}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div className="space-y-2.5 flex-1">
                    {col.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedCard(item)}
                        className={`group relative rounded-lg border bg-white p-3.5 shadow-xs transition-all hover:shadow-md hover:border-[#85B8FF] cursor-pointer ${
                          item.isHitl ? "border-[#FF991F] ring-1 ring-[#FF991F]/30" : "border-[#DFE1E6]"
                        }`}
                      >
                        {item.isHitl && (
                          <div className="mb-2 flex items-center gap-1 text-[11px] font-bold text-[#DE350B]">
                            <AlertTriangle size={12} />
                            <span>EXECUTION SUSPENDED</span>
                          </div>
                        )}

                        <p className="text-sm font-semibold text-[#091E42] leading-snug group-hover:text-[#0C66E4] transition-colors">
                          {item.title}
                        </p>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.tagColor}`}>
                              {item.tag}
                            </span>
                            {item.latency && (
                              <span className="text-[10px] font-bold text-[#0C66E4]">
                                {item.latency}
                              </span>
                            )}
                            {item.metrics && !item.latency && (
                              <span className="text-[11px] text-[#626F86]">
                                {item.metrics}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono font-medium text-[#626F86]">
                              {item.code}
                            </span>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full ${item.assignee.avatarBg} text-[9px] font-bold text-white`}
                              title={item.assignee.name}
                            >
                              {item.assignee.initial}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Triage Quick Action */}
                  <button
                    onClick={() => openSignInModal("/chat")}
                    className="mt-3 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-[#44546F] hover:bg-white hover:text-[#0C66E4] transition-colors"
                  >
                    <Plus size={14} />
                    <span>Create clinical task</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Card Detail Drawer/Modal */}
          {selectedCard && (
            <div className="border-t border-[#DFE1E6] bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F2FF] text-[#0C66E4] font-bold text-xs mt-0.5">
                  {selectedCard.code}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#091E42]">{selectedCard.title}</span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${selectedCard.tagColor}`}>
                      {selectedCard.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#626F86] mt-0.5">
                    Assigned: <strong className="text-[#091E42]">{selectedCard.assignee.name}</strong> • Priority: {selectedCard.priority} • {selectedCard.metrics || selectedCard.latency}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => openSignInModal(selectedCard.isHitl ? "/admin" : "/chat")}
                  className="rounded-md bg-[#0C66E4] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0052CC] transition-colors"
                >
                  {selectedCard.isHitl ? "Review & Sign Off (MD)" : "Open in Workspace"}
                </button>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="rounded-md border border-[#DFE1E6] px-3 py-1.5 text-xs font-semibold text-[#44546F] hover:bg-[#F1F2F4] transition-colors"
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
