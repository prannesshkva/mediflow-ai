"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Stethoscope,
  Syringe,
  TestTube,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Radio,
  FileText,
  UserCheck,
  LogIn,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export function ClinicalInstrumentsSetup() {
  const { user, loginAsDemoClinician, loginAsDemoPatient, signInWithGoogle, loginError } = useAuth();
  const router = useRouter();

  // Simulated live heart rate pulse animation
  const [heartRate, setHeartRate] = useState(74);
  const [pulseTick, setPulseTick] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick(true);
      setTimeout(() => setPulseTick(false), 200);
      // Small natural physiological variance (72-76 bpm)
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
    <section className="relative overflow-hidden bg-[#FAFBFC] py-12 sm:py-16 border-b border-[#DFE1E6]">
      {/* Background Subtle Medical Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(#DFE1E6 1px, transparent 1px), linear-gradient(90deg, #DFE1E6 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Atlassian-Style Section Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0C66E4]/30 bg-[#E9F2FF] px-3.5 py-1 text-xs font-bold text-[#0C66E4] mb-3">
            <Activity size={14} className="animate-pulse text-[#0C66E4]" />
            <span>Clinical Workstation &amp; Medical Instruments Setup</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#091E42]">
            Where clinical diagnostic equipment meets AI intelligence
          </h2>
          <p className="mt-3 text-base text-[#44546F] leading-relaxed">
            Connected to hospital telemetry, electronic stethoscopes, and point-of-care analyzers — governed by licensed physician oversight.
          </p>
        </div>

        {/* Two-Column Layout: Left = Clinical Instruments & ICU Monitor, Right = Atlassian Sign-In Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Medical Instruments & ICU Monitor (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Multi-Parameter ICU / Vital Signs Telemetry Monitor */}
            <div className="rounded-xl border border-[#DFE1E6] bg-[#0A101D] text-white shadow-lg overflow-hidden">
              {/* Monitor Top Frame */}
              <div className="flex items-center justify-between border-b border-white/10 bg-[#0F172A] px-4 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-2 w-2 rounded-full bg-[#22C55E] animate-ping" />
                  <span className="font-mono font-bold text-white tracking-wider">
                    ICU TELEMETRY • BED 04 (EMERGENCY TRIAGE)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/70 font-mono text-[11px]">
                  <span>LEAD II FILTER: 0.5-40Hz</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[#38BDF8]">CALIBRATED</span>
                </div>
              </div>

              {/* Monitor Main Screen */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  
                  {/* Heart Rate / ECG Parameter */}
                  <div className="rounded-lg bg-[#050B14] p-3 border border-[#22C55E]/30 relative overflow-hidden">
                    <div className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider flex items-center justify-between">
                      <span>ECG / HR</span>
                      <Heart
                        size={12}
                        className={`text-[#22C55E] transition-transform ${pulseTick ? "scale-125 fill-[#22C55E]" : "scale-100"}`}
                      />
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-black font-mono text-[#22C55E]">{heartRate}</span>
                      <span className="text-[11px] font-mono text-[#22C55E]/70">BPM</span>
                    </div>
                    <div className="text-[9px] font-mono text-white/50 mt-1">SINUS RHYTHM</div>
                  </div>

                  {/* Non-Invasive Blood Pressure */}
                  <div className="rounded-lg bg-[#050B14] p-3 border border-[#F59E0B]/30">
                    <div className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">
                      NIBP CUFF
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-[#F59E0B]">120/78</span>
                    </div>
                    <div className="text-[9px] font-mono text-white/50 mt-1">MAP: 92 mmHg</div>
                  </div>

                  {/* Pulse Oximeter SpO2 */}
                  <div className="rounded-lg bg-[#050B14] p-3 border border-[#06B6D4]/30">
                    <div className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-wider">
                      SpO2 OXIMETER
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-black font-mono text-[#06B6D4]">99</span>
                      <span className="text-[11px] font-mono text-[#06B6D4]/70">%</span>
                    </div>
                    <div className="text-[9px] font-mono text-white/50 mt-1">PLETH NORMAL</div>
                  </div>

                  {/* Respiration & Temperature */}
                  <div className="rounded-lg bg-[#050B14] p-3 border border-[#A855F7]/30">
                    <div className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">
                      RESP / TEMP
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xl font-black font-mono text-[#A855F7]">16</span>
                      <span className="text-[11px] font-mono text-[#A855F7]/70">/min</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/70 mt-1">36.8°C (98.2°F)</div>
                  </div>

                </div>

                {/* Animated ECG Real-Time Rhythm Waveform */}
                <div className="relative rounded-lg bg-[#03070E] p-3 border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#22C55E]/80 mb-1">
                    <span>LEAD II CONTINUOUS RHYTHM TRACE (25mm/s • 10mm/mV)</span>
                    <span className="text-[#22C55E] font-bold">QRS STABLE</span>
                  </div>
                  <svg className="w-full h-14" viewBox="0 0 600 60" preserveAspectRatio="none">
                    <path
                      d="M0,30 L60,30 L70,30 L75,25 L80,35 L85,5 L90,50 L95,30 L105,30 L115,20 L125,30 L200,30 L210,30 L215,25 L220,35 L225,5 L230,50 L235,30 L245,30 L255,20 L265,30 L340,30 L350,30 L355,25 L360,35 L365,5 L370,50 L375,30 L385,30 L395,20 L405,30 L480,30 L490,30 L495,25 L500,35 L505,5 L510,50 L515,30 L525,30 L535,20 L545,30 L600,30"
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

            {/* 2. Medical Diagnostic Instruments Grid (Stethoscope, Infusion Pump, POC Labs, Imaging) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Instrument 1: Digital Acoustic Stethoscope */}
              <div className="rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-xs hover:border-[#85B8FF] transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E9F2FF] text-[#0C66E4]">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#091E42]">
                      Electronic Stethoscope
                    </div>
                    <div className="text-xs text-[#626F86]">
                      Cardiovascular &amp; Pulmonary Filter
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DFE1E6]/60 pt-2.5">
                  <span className="text-[#44546F]">Auscultation: Distinct S1/S2</span>
                  <span className="rounded bg-[#E3FCEF] px-1.5 py-0.5 text-[10px] font-bold text-[#006644]">
                    CLEAR
                  </span>
                </div>
              </div>

              {/* Instrument 2: Smart Infusion Pump with Safety Check */}
              <div className="rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-xs hover:border-[#85B8FF] transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0B3] text-[#172B4D]">
                    <Syringe size={22} className="text-[#FF991F]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#091E42]">
                      Smart Infusion Pump
                    </div>
                    <div className="text-xs text-[#626F86]">
                      Contraindication Guard Active
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DFE1E6]/60 pt-2.5">
                  <span className="text-[#44546F]">Rate: 100 mL/hr Normal Saline</span>
                  <span className="rounded bg-[#E3FCEF] px-1.5 py-0.5 text-[10px] font-bold text-[#006644]">
                    SAFETY PASSED
                  </span>
                </div>
              </div>

              {/* Instrument 3: Point-of-Care Laboratory Analyzer */}
              <div className="rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-xs hover:border-[#85B8FF] transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E3FCEF] text-[#006644]">
                    <TestTube size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#091E42]">
                      POC Lab Analyzer
                    </div>
                    <div className="text-xs text-[#626F86]">
                      Troponin I, HbA1c, Chem-7
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DFE1E6]/60 pt-2.5">
                  <span className="text-[#44546F]">Troponin: &lt; 0.01 ng/mL</span>
                  <span className="rounded bg-[#DEEBFF] px-1.5 py-0.5 text-[10px] font-bold text-[#0747A6]">
                    NORMAL
                  </span>
                </div>
              </div>

              {/* Instrument 4: Hospital PACS & EHR Ingest */}
              <div className="rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-xs hover:border-[#85B8FF] transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAE6FF] text-[#403294]">
                    <FileText size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#091E42]">
                      EHR Ingest Pipeline
                    </div>
                    <div className="text-xs text-[#626F86]">
                      Pydantic v2 Vitals &amp; ICD-10
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DFE1E6]/60 pt-2.5">
                  <span className="text-[#44546F]">Codes: ICD-10 I10, E11</span>
                  <span className="rounded bg-[#E3FCEF] px-1.5 py-0.5 text-[10px] font-bold text-[#006644]">
                    SYNCED
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Side: The Atlassian Sign-In Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div
              className="rounded-2xl border border-[#DFE1E6] bg-white p-6 sm:p-8 shadow-xl transition-all"
              style={{
                boxShadow: "0 20px 32px -8px rgba(9, 30, 66, 0.15), 0 0 1px rgba(9, 30, 66, 0.31)",
              }}
            >
              {/* Card Header in Atlassian Styling */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0C66E4] text-white shadow-sm">
                  <Heart size={24} className="fill-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#091E42]">
                    Welcome to MediFlow AI
                  </h3>
                  <p className="text-xs text-[#626F86]">
                    Clinical Decision Support with HITL Governance
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#44546F] mb-6 leading-relaxed">
                Connect your medical instruments, triage queues, and physician workflows. Authenticate below to enter your clinical tenant workspace.
              </p>

              {loginError && (
                <div className="mb-4 rounded-lg border border-[#F87171] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
                  {loginError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                
                {/* 1. Enter as Clinical Director (MD) - Atlassian Blue Primary */}
                <button
                  onClick={handleClinicianAccess}
                  className="group relative flex w-full items-center justify-between rounded-lg bg-[#0C66E4] p-3.5 text-left text-white shadow-sm transition-all hover:bg-[#0052CC] hover:shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20 text-white">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Enter as Clinical Director</span>
                        <span className="rounded bg-white/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          MD ROOT
                        </span>
                      </div>
                      <p className="text-xs text-white/80">
                        Full HITL sign-off queue &amp; circuit breaker control
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-white/80 transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* 2. Enter as Patient User */}
                <button
                  onClick={handlePatientAccess}
                  className="group flex w-full items-center justify-between rounded-lg border border-[#DFE1E6] bg-[#F7F8F9] p-3.5 text-left transition-all hover:border-[#85B8FF] hover:bg-[#E9F2FF]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#DFE1E6] text-[#091E42] group-hover:bg-[#C1DCFF] group-hover:text-[#0C66E4]">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#091E42]">
                        Enter as Patient User
                      </span>
                      <p className="text-xs text-[#626F86]">
                        Symptom triage, appointment booking &amp; lab reports
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#626F86] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0C66E4]" />
                </button>

                {/* Divider */}
                <div className="my-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#DFE1E6]" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#626F86]">
                    Or Single Sign-On
                  </span>
                  <div className="h-px flex-1 bg-[#DFE1E6]" />
                </div>

                {/* 3. Continue with Google (Firebase SSO) */}
                <button
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#DFE1E6] bg-white py-3 text-sm font-semibold text-[#172B4D] shadow-xs transition-colors hover:bg-[#F7F8F9] hover:border-[#85B8FF]"
                >
                  <LogIn size={16} className="text-[#0C66E4]" />
                  <span>Continue with Google (Firebase)</span>
                </button>

              </div>

              {/* Security & Hospital Tenant Badges */}
              <div className="mt-6 pt-5 border-t border-[#DFE1E6] space-y-2 text-xs text-[#626F86]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-[#172B4D]">
                    <ShieldCheck size={14} className="text-[#22A06B]" />
                    PostgreSQL Row-Level Security
                  </span>
                  <span className="text-[11px] font-bold text-[#0C66E4]">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-[#172B4D]">
                    <Activity size={14} className="text-[#0C66E4]" />
                    Tenant Isolation
                  </span>
                  <span className="text-[11px] font-mono text-[#626F86]">tenant-default</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
