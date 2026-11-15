"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Stethoscope, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AtlassianHero() {
  const { openSignInModal, loginAsDemoClinician } = useAuth();

  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
      {/* Background Subtle Radial Gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(12, 102, 228, 0.08), transparent)",
        }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Category Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#DFE1E6] bg-[#F7F8F9] px-3.5 py-1.5 text-xs font-semibold text-[#091E42] mb-6 shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-[#0C66E4] animate-pulse" />
          <span>Clinical Decision Support with HITL Governance</span>
          <span className="text-[#626F86]">|</span>
          <span className="text-[#0C66E4] font-bold">FastAPI + LangGraph</span>
        </div>

        {/* Hero Headline (Atlassian & Slack font & style) */}
        <h1
          className="mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#091E42] leading-[1.12]"
          style={{ letterSpacing: "-0.03em" }}
        >
          Discover the power of clinical intelligence
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-[#44546F] leading-relaxed">
          Give your care teams and AI agents the shared context they need to make faster triage decisions, automate document intake, and protect patients with human-in-the-loop oversight.
        </p>

        {/* Primary CTA Row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => openSignInModal("/chat")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0C66E4] px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#0052CC] transition-all hover:shadow"
            style={{ backgroundColor: "#0C66E4" }}
          >
            <span>Get started with MediFlow</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => loginAsDemoClinician()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-transparent px-5 py-3.5 text-base font-semibold text-[#0C66E4] hover:bg-[#E9F2FF] transition-colors"
          >
            <span>Explore live clinical demo</span>
            <span className="text-lg">→</span>
          </button>
        </div>

        {/* Trust & Compliance Strip */}
        <div className="mt-12 pt-8 border-t border-[#DFE1E6]/80 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-semibold text-[#626F86]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#22A06B]" />
            <span>Multi-Agent LangGraph Pipeline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#22A06B]" />
            <span>Human-in-the-Loop MD Sign-Off</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#22A06B]" />
            <span>PostgreSQL Row-Level Security</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#22A06B]" />
            <span>Automated Contraindication Screening</span>
          </div>
        </div>

      </div>
    </section>
  );
}
