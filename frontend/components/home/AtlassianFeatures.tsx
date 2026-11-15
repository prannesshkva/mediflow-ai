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
      title: "Intelligent Clinical Decision Support",
      desc: "Assists doctors, nurses, and clinicians by analyzing complex symptom presentations, cross-referencing clinical care guidelines, and prioritizing patient acuity.",
      badge: "Clinical Intelligence",
    },
    {
      icon: ShieldAlert,
      color: "bg-[#FFF0B3] text-[#172B4D]",
      title: "Physician Sign-Off on Acute Cases",
      desc: "High-risk symptoms and critical diagnoses automatically require review and sign-off by a licensed physician before care recommendations are delivered.",
      badge: "Patient Safety",
    },
    {
      icon: FileCheck2,
      color: "bg-[#E3FCEF] text-[#006644]",
      title: "Instant Medical Records & Lab Intake",
      desc: "Instantly extracts vital signs, laboratory panels, and diagnostic findings from patient records, discharge summaries, and medical histories.",
      badge: "Seamless Intake",
    },
    {
      icon: Cpu,
      color: "bg-[#EAE6FF] text-[#403294]",
      title: "Allergy & Medication Safety Screening",
      desc: "Continuous real-time safety checks screen for dangerous drug-drug interactions, known allergies, and clinical contraindications before prescribing.",
      badge: "Patient Protection",
    },
    {
      icon: Lock,
      color: "bg-[#DEEBFF] text-[#0C66E4]",
      title: "Hospital-Grade Patient Privacy",
      desc: "Strict medical record protection and encryption safeguard every patient consultation, lab report, and doctor communication under HIPAA standards.",
      badge: "HIPAA Compliant",
    },
    {
      icon: Zap,
      color: "bg-[#FFF0B3] text-[#172B4D]",
      title: "Rapid 24/7 Patient Guidance",
      desc: "Provides instant symptom guidance and appointment routing for patients around the clock, reducing clinic wait times and emergency room crowding.",
      badge: "Care Continuity",
    },
  ];

  return (
    <section id="architecture" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0C66E4] mb-2">
            Clinical Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#091E42]">
            Empowering healthcare teams with safe, reliable medical intelligence
          </h2>
          <p className="mt-3 text-base text-[#44546F] leading-relaxed">
            MediFlow AI bridges autonomous clinical decision support with doctor-supervised governance, ensuring that unverified recommendations never reach patients without physician review.
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
