"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Heart, Stethoscope, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, openSignInModal, loginAsDemoClinician, loginAsDemoPatient } = useAuth();
  const isHomePage = pathname === "/";

  // Public Atlassian-style homepage renders full-width without console sidebar
  if (isHomePage) {
    return (
      <div className="min-h-screen bg-white text-[#172B4D]">
        {children}
      </div>
    );
  }

  // If user is accessing console routes without signing in, show a clean Atlassian auth card
  if (!loading && !user) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0A0F1E]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-white p-8 text-[#091E42] shadow-2xl border border-[#DFE1E6]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0C66E4] text-white mb-5 shadow-sm">
              <Heart size={24} className="fill-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#091E42] mb-2">
              Clinical Workspace Restricted
            </h1>
            <p className="text-sm text-[#44546F] mb-6 leading-relaxed">
              You are accessing a safety-governed clinical area. Please authenticate to view patient records, active triage workflows, and HITL oversight queues.
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={loginAsDemoClinician}
                className="w-full flex items-center justify-between rounded-lg bg-[#0C66E4] hover:bg-[#0052CC] text-white p-3.5 text-sm font-semibold transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Stethoscope size={18} />
                  <span>Access as Clinical Director (MD)</span>
                </div>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={loginAsDemoPatient}
                className="w-full flex items-center justify-between rounded-lg border border-[#DFE1E6] bg-[#F7F8F9] hover:bg-[#E9F2FF] hover:border-[#85B8FF] text-[#091E42] p-3.5 text-sm font-semibold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={18} />
                  <span>Access as Patient User</span>
                </div>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="pt-4 border-t border-[#DFE1E6] flex items-center justify-between text-xs text-[#626F86]">
              <Link href="/" className="text-[#0C66E4] hover:underline font-medium">
                ← Return to Public Homepage
              </Link>
              <span className="flex items-center gap-1 text-[#22A06B]">
                <ShieldCheck size={14} /> HIPAA HITL Governed
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Clinical console workspace layout (with sidebar)
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
