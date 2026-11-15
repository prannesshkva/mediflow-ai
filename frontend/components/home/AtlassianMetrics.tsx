"use client";

import React from "react";
import { Activity, ShieldCheck, Zap, Award } from "lucide-react";

export function AtlassianMetrics() {
  const metrics = [
    {
      value: "< 45ms",
      label: "Triage Intent Classification",
      desc: "Fast-reflex query routing across clinical symptom domains",
      icon: Zap,
      color: "text-[#0C66E4]",
    },
    {
      value: "100%",
      label: "HITL Physician Oversight",
      desc: "Zero unverified AI advice on acute or emergency conditions",
      icon: ShieldCheck,
      color: "text-[#22A06B]",
    },
    {
      value: "Zero-Trust",
      label: "PostgreSQL RLS Partitioning",
      desc: "Tenant cryptographic data boundary enforced per clinic",
      icon: Activity,
      color: "text-[#0C66E4]",
    },
    {
      value: "8 / 8",
      label: "Safety Test Suites Passing",
      desc: "Deterministic contraindications & circuit breakers verified",
      icon: Award,
      color: "text-[#22A06B]",
    },
  ];

  return (
    <section id="compliance" className="py-14 bg-[#FAFBFC] border-t border-[#DFE1E6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-xl border border-[#DFE1E6] bg-white p-6 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-3">
                <item.icon size={18} className={item.color} />
                <span className="text-xs font-bold uppercase tracking-wider text-[#626F86]">
                  Verified Metric
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-[#091E42]">
                {item.value}
              </div>
              <div className="mt-2 text-sm font-bold text-[#172B4D]">
                {item.label}
              </div>
              <div className="mt-1 text-xs text-[#626F86] leading-relaxed">
                {item.desc}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
