"use client";

import React from "react";
import {
  GitFork,
  ShieldAlert,
  FileCheck2,
  Cpu,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Heart
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AtlassianFeatures() {
  const { openSignInModal } = useAuth();

  const features = [
    {
      icon: GitFork,
      color: "bg-[#DEEBFF] text-[#0C66E4]",
      title: "LangGraph Multi-Agent StateGraph",
      desc: "Deterministic state machine coordinating specialized agents: Query Classifier, Risk Evaluator, Protocol RAG, and Response Validator with partitioned state.",
      badge: "Orchestration",
    },
    {
      icon: ShieldAlert,
      color: "bg-[#FFF0B3] text-[#172B4D]",
      title: "Human-in-the-Loop (HITL) Oversight",
      desc: "Suspends autonomous execution on acute or emergency symptoms. Enqueues clinical drafts for physician approval, modification, or rejection.",
      badge: "Patient Safety",
    },
    {
      icon: FileCheck2,
      color: "bg-[#E3FCEF] text-[#006644]",
      title: "Non-Blocking Document Pipeline",
      desc: "Offloads CPU-bound PDF extraction and regex parsing to async OS threads. Converts unstructured summaries into Pydantic v2 Vitals, Labs & ICD-10.",
      badge: "High Throughput",
    },
    {
      icon: Cpu,
      color: "bg-[#EAE6FF] text-[#403294]",
      title: "Runtime Clinical Circuit Breakers",
      desc: "Three-state circuit breaker (CLOSED, OPEN, HALF_OPEN) protects against upstream LLM latency, HTTP 429 limits, and lethal contraindications.",
      badge: "Resilience",
    },
    {
      icon: Lock,
      color: "bg-[#DEEBFF] text-[#0C66E4]",
      title: "PostgreSQL Row-Level Security (RLS)",
      desc: "Cryptographic tenant isolation at the database layer. Every clinical record, note, and appointment is strictly partitioned per healthcare tenant.",
      badge: "Zero Trust",
    },
    {
      icon: Zap,
      color: "bg-[#FFF0B3] text-[#172B4D]",
      title: "Sub-50ms Fast Reflex Triage",
      desc: "Instant query classification routes high-frequency symptom questions within milliseconds while reserving deep reasoning for complex multi-hop cases.",
      badge: "Performance",
    },
  ];

  return (
    <section id="architecture" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0C66E4] mb-2">
            Enterprise Clinical Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#091E42]">
            Engineering safety into every clinical touchpoint
          </h2>
          <p className="mt-3 text-base text-[#44546F] leading-relaxed">
            MediFlow AI bridges autonomous clinical decision support with safety-first governance, guaranteeing that unverified AI recommendations never reach vulnerable patients.
          </p>
        </div>

        {/* Feature Cards Grid (Atlassian 3-column style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-xl border border-[#DFE1E6] bg-white p-6 shadow-xs transition-all hover:shadow-md hover:border-[#85B8FF]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.color}`}>
                    <item.icon size={22} />
                  </div>
                  <span className="rounded bg-[#F1F2F4] px-2.5 py-0.5 text-[11px] font-bold text-[#44546F]">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#091E42] group-hover:text-[#0C66E4] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#44546F] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DFE1E6]/60 flex items-center justify-between text-xs font-semibold text-[#0C66E4]">
                <button
                  onClick={() => openSignInModal("/chat")}
                  className="flex items-center gap-1 hover:underline text-[#0C66E4]"
                >
                  <span>Explore in platform</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Flow Banner */}
        <div className="mt-14 rounded-2xl border border-[#DFE1E6] bg-[#F7F8F9] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E9F2FF] px-2.5 py-0.5 text-xs font-bold text-[#0C66E4] mb-2">
                <Heart size={12} className="fill-[#0C66E4]" />
                <span>Deterministic Clinical Safety Guard</span>
              </div>
              <h3 className="text-xl font-bold text-[#091E42]">
                Zero-tolerance contraindication screening
              </h3>
              <p className="mt-1 text-sm text-[#44546F] max-w-2xl">
                Every draft response is screened across lethal drug-disease and drug-drug contraindication matrices (NSAIDs with active ulcers, PDE5 inhibitors with nitrates, ACE inhibitors during pregnancy) before release.
              </p>
            </div>

            <button
              onClick={() => openSignInModal("/admin")}
              className="flex-shrink-0 rounded-lg bg-[#0C66E4] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#0052CC] transition-colors"
            >
              View Clinical Rules Engine
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
