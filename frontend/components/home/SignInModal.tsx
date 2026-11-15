"use client";

import React, { useState } from "react";
import { X, Heart, Stethoscope, UserCheck, LogIn, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function SignInModal({ isOpen, onClose, redirectTo = "/chat" }: SignInModalProps) {
  const { user, loginAsDemoClinician, loginAsDemoPatient, signInWithGoogle, loginError } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen) return null;

  const handleClinicianEnter = () => {
    loginAsDemoClinician();
    setIsRedirecting(true);
    setTimeout(() => {
      onClose();
      router.push("/admin");
    }, 200);
  };

  const handlePatientEnter = () => {
    loginAsDemoPatient();
    setIsRedirecting(true);
    setTimeout(() => {
      onClose();
      router.push(redirectTo);
    }, 200);
  };

  const handleGoogleEnter = async () => {
    await signInWithGoogle();
    if (!loginError) {
      onClose();
      router.push(redirectTo);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(9, 30, 66, 0.54)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl transition-all"
        style={{
          border: "1px solid #DFE1E6",
          boxShadow: "0 20px 32px -8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Atlassian Top Accent Bar */}
        <div className="h-1.5 w-full bg-[#0C66E4]" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C66E4] text-white shadow-sm"
              style={{ backgroundColor: "#0C66E4" }}
            >
              <Heart size={20} className="fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#091E42]">
                Sign in to MediFlow AI
              </h2>
              <p className="text-xs text-[#626F86]">
                Clinical Intelligence &amp; Triage Operations Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[#626F86] hover:bg-[#F1F2F4] hover:text-[#091E42] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 pt-2">
          {loginError && (
            <div className="mb-4 rounded-md border border-[#F87171] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
              {loginError}
            </div>
          )}

          <div className="space-y-3">
            {/* 1-Click Clinical Director (MD) */}
            <button
              onClick={handleClinicianEnter}
              disabled={isRedirecting}
              className="group relative flex w-full items-center justify-between rounded-lg border border-[#0C66E4] bg-[#0C66E4] p-3.5 text-left text-white shadow-sm transition-all hover:bg-[#0052CC] hover:shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20 text-white">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Access as Clinical Director (MD)</span>
                    <span className="rounded bg-white/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Full Access
                    </span>
                  </div>
                  <p className="text-xs text-white/80">
                    HITL review queue, doctor sign-offs &amp; circuit breakers
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/80 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* 1-Click Patient Access */}
            <button
              onClick={handlePatientEnter}
              disabled={isRedirecting}
              className="group flex w-full items-center justify-between rounded-lg border border-[#DFE1E6] bg-[#F7F8F9] p-3.5 text-left transition-all hover:border-[#85B8FF] hover:bg-[#E9F2FF]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#DFE1E6] text-[#091E42] group-hover:bg-[#C1DCFF] group-hover:text-[#0C66E4]">
                  <UserCheck size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#091E42]">
                    Access as Patient User
                  </span>
                  <p className="text-xs text-[#626F86]">
                    Interactive symptom triage, appointments &amp; lab intake
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[#626F86] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0C66E4]" />
            </button>

            {/* Divider */}
            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#DFE1E6]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#626F86]">
                Or Single Sign-On
              </span>
              <div className="h-px flex-1 bg-[#DFE1E6]" />
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleEnter}
              disabled={isRedirecting}
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#DFE1E6] bg-white py-2.5 text-sm font-medium text-[#172B4D] shadow-sm transition-colors hover:bg-[#F7F8F9] hover:border-[#85B8FF]"
            >
              <LogIn size={16} className="text-[#0C66E4]" />
              <span>Continue with Google (Firebase)</span>
            </button>
          </div>

          {/* Security Footer Notice */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#626F86]">
            <ShieldCheck size={13} className="text-[#22A06B]" />
            <span>PostgreSQL RLS Multi-Tenant Partitioning • HIPAA-Ready HITL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
