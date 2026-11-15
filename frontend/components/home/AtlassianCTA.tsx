"use client";

import React from "react";
import { ArrowRight, Stethoscope, Heart, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AtlassianCTA() {
  const { openSignInModal, loginAsDemoClinician } = useAuth();

  return (
    <section className="relative overflow-hidden bg-[#0052CC] py-16 sm:py-20 text-white">
      {/* Background Subtle Wave Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white mb-6 backdrop-blur-sm">
          <Heart size={24} className="fill-white" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to experience clinical intelligence with human oversight?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
          Join clinical directors, hospital networks, and care teams automating triage with zero compromise on safety.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => openSignInModal("/chat")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-bold text-[#0052CC] shadow-md hover:bg-[#F1F2F4] transition-all"
          >
            <span>Launch MediFlow Platform</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => loginAsDemoClinician()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-xs"
          >
            <Stethoscope size={18} />
            <span>Enter as Clinical Director (MD)</span>
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/70">
          <ShieldCheck size={14} className="text-[#36B37E]" />
          <span>Zero-configuration instant access • Fully isolated PostgreSQL RLS sandbox</span>
        </div>
      </div>
    </section>
  );
}
