"use client";

import React from "react";
import Link from "next/link";
import { Heart, Activity, ShieldCheck, Globe } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AtlassianFooter() {
  const { openSignInModal, loginAsDemoClinician, loginAsDemoPatient } = useAuth();

  return (
    <footer className="border-t border-[#DFE1E6] bg-[#F7F8F9] text-[#44546F] text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 text-[#091E42] no-underline">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0C66E4] text-white">
                <Heart size={18} className="fill-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#091E42]">
                MEDIFLOW AI
              </span>
            </Link>

            <p className="mt-3 text-xs text-[#626F86] max-w-sm leading-relaxed">
              Clinical Intelligence and Triage Platform with licensed physician oversight, real-time diagnostic telemetry, and hospital-grade patient privacy.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#22A06B] font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-[#22A06B]" />
              <span>All Clinical Agent Services Operational</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#091E42] mb-3">
              Platform
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/chat" className="hover:text-[#0C66E4] transition-colors">
                  AI Triage Assistant
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#0C66E4] transition-colors">
                  HITL Review Queue
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-[#0C66E4] transition-colors">
                  Document Ingestion
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="hover:text-[#0C66E4] transition-colors">
                  Clinical Scheduling
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinical AI */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#091E42] mb-3">
              Clinical Intelligence
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-[#626F86]">Doctor-Supervised AI</span>
              </li>
              <li>
                <span className="text-[#626F86]">Medical Guidelines Library</span>
              </li>
              <li>
                <span className="text-[#626F86]">Medication Safety Guard</span>
              </li>
              <li>
                <span className="text-[#626F86]">Structured Patient Charts</span>
              </li>
            </ul>
          </div>

          {/* Direct Sign-In Access */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#091E42] mb-3">
              Access Points
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => openSignInModal()}
                  className="text-[#0C66E4] hover:underline font-semibold"
                >
                  Platform Sign-In
                </button>
              </li>
              <li>
                <button
                  onClick={() => loginAsDemoClinician()}
                  className="hover:text-[#0C66E4] transition-colors"
                >
                  Clinical Director (MD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => loginAsDemoPatient()}
                  className="hover:text-[#0C66E4] transition-colors"
                >
                  Patient Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => openSignInModal()}
                  className="hover:text-[#0C66E4] transition-colors"
                >
                  Single Sign-On (Google)
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-[#DFE1E6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#626F86]">
          <div>
            © 2026 MediFlow AI Platform. All rights reserved. Clinical decision support with human-in-the-loop governance.
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-[#091E42] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#091E42] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#091E42] cursor-pointer">Security &amp; HIPAA</span>
            <div className="flex items-center gap-1">
              <Globe size={13} />
              <span>English (US)</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
