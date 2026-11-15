"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Search, ChevronDown, User, ArrowRight, ShieldCheck, Stethoscope, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AtlassianNavbar() {
  const { user, openSignInModal, logout, isAdmin } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const products = [
    { title: "Clinical Triage Engine", desc: "Multi-agent LangGraph workflow with deterministic risk scoring", href: "/chat" },
    { title: "HITL Oversight Gate", desc: "Human-in-the-loop review queue for acute symptom suspensions", href: "/admin" },
    { title: "Document Ingestion Pipeline", desc: "Non-blocking extraction to Pydantic v2 Vitals & ICD-10", href: "/reports" },
    { title: "Runtime Circuit Breakers", desc: "3-state resilience against upstream latency & contraindications", href: "/admin" },
  ];

  const clinicalAi = [
    { title: "LangGraph Multi-Agent", desc: "StateGraph orchestration across specialized diagnostic agents", href: "/chat" },
    { title: "Pinecone Semantic RAG", desc: "Vector search grounded in clinical protocols and guidelines", href: "/chat" },
    { title: "Lethal Contraindication Screening", desc: "Automated drug-disease and drug-drug safety guards", href: "/admin" },
    { title: "Fast Reflex Classification", desc: "Sub-50ms intent and risk routing for clinical queries", href: "/chat" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#DFE1E6] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 text-[#091E42] no-underline group">
            {/* Atlassian-style Blue Geometric Emblem */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0C66E4] text-white shadow-sm transition-transform group-hover:scale-105">
              <Heart size={20} className="fill-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#091E42] font-sans">
                MEDIFLOW
              </span>
              <span className="rounded bg-[#E9F2FF] px-1.5 py-0.5 text-[10px] font-bold text-[#0C66E4] uppercase tracking-wider">
                AI
              </span>
            </div>
          </Link>

          {/* Navigation Links with Hover Flyouts */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("products")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#44546F] hover:bg-[#F1F2F4] hover:text-[#091E42] transition-colors">
                <span>Products</span>
                <ChevronDown size={14} className="opacity-70" />
              </button>

              {activeDropdown === "products" && (
                <div className="absolute left-0 top-full w-80 rounded-xl border border-[#DFE1E6] bg-white p-3 shadow-xl animate-fade-in-up">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#626F86] px-3 py-1 mb-1">
                    Platform Capabilities
                  </div>
                  {products.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="block rounded-lg p-2.5 hover:bg-[#F7F8F9] transition-colors no-underline"
                    >
                      <div className="text-sm font-semibold text-[#091E42]">{item.title}</div>
                      <div className="text-xs text-[#626F86] mt-0.5 leading-snug">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Clinical AI Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("ai")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#44546F] hover:bg-[#F1F2F4] hover:text-[#091E42] transition-colors">
                <span>Clinical AI</span>
                <ChevronDown size={14} className="opacity-70" />
              </button>

              {activeDropdown === "ai" && (
                <div className="absolute left-0 top-full w-80 rounded-xl border border-[#DFE1E6] bg-white p-3 shadow-xl animate-fade-in-up">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#626F86] px-3 py-1 mb-1">
                    AI Architectures
                  </div>
                  {clinicalAi.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="block rounded-lg p-2.5 hover:bg-[#F7F8F9] transition-colors no-underline"
                    >
                      <div className="text-sm font-semibold text-[#091E42]">{item.title}</div>
                      <div className="text-xs text-[#626F86] mt-0.5 leading-snug">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a
              href="#triage-board"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#44546F] hover:bg-[#F1F2F4] hover:text-[#091E42] transition-colors no-underline"
            >
              Triage Board
            </a>

            <a
              href="#architecture"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#44546F] hover:bg-[#F1F2F4] hover:text-[#091E42] transition-colors no-underline"
            >
              Architecture
            </a>

            <a
              href="#compliance"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#44546F] hover:bg-[#F1F2F4] hover:text-[#091E42] transition-colors no-underline"
            >
              Why MediFlow
            </a>
          </nav>
        </div>

        {/* Right: Actions, Search & Sign In */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openSignInModal()}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md text-[#44546F] hover:bg-[#F1F2F4] hover:text-[#091E42] transition-colors"
            title="Search or shortcut"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {user ? (
            /* Logged in state */
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#DFE1E6] bg-[#F7F8F9] px-3 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-[#22A06B]" />
                <span className="font-semibold text-[#091E42] max-w-[120px] truncate">
                  {user.displayName || "Active Clinician"}
                </span>
              </div>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-md bg-[#0C66E4] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0052CC] transition-colors no-underline"
              >
                <span>Console</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            /* Unauthenticated state: Atlassian Sign in & Get Started buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => openSignInModal()}
                className="rounded-md px-3 py-2 text-sm font-semibold text-[#0C66E4] hover:bg-[#E9F2FF] transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => openSignInModal()}
                className="rounded-md bg-[#0C66E4] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0052CC] transition-colors"
              >
                Get started free
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
