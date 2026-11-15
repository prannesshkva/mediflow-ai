"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Search, ChevronDown, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AtlassianNavbar() {
  const { user, openSignInModal } = useAuth();
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
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #DFE1E6",
        boxShadow: "0 1px 3px rgba(9, 30, 66, 0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Left: Brand & Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            {/* Atlassian-style Blue Geometric Emblem */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#0C66E4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 2px 4px rgba(12, 102, 228, 0.3)",
              }}
            >
              <Heart size={18} fill="#FFFFFF" color="#FFFFFF" />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span
                style={{
                  fontSize: "19px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "#091E42",
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                MEDIFLOW
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: "#E9F2FF",
                  color: "#0C66E4",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  letterSpacing: "0.5px",
                }}
              >
                AI
              </span>
            </div>
          </Link>

          {/* Navigation Links (Atlassian Style) */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {/* Products Dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setActiveDropdown("products")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#44546F",
                  backgroundColor: activeDropdown === "products" ? "#F1F2F4" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>Products</span>
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
              </button>

              {activeDropdown === "products" && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "320px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #DFE1E6",
                    borderRadius: "10px",
                    padding: "12px",
                    boxShadow: "0 12px 24px -4px rgba(9, 30, 66, 0.18)",
                    zIndex: 100,
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#626F86", padding: "4px 8px 8px" }}>
                    Platform Capabilities
                  </div>
                  {products.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      style={{
                        display: "block",
                        padding: "10px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        transition: "background 0.15s ease",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#F7F8F9")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#091E42" }}>{item.title}</div>
                      <div style={{ fontSize: "12px", color: "#626F86", marginTop: "2px" }}>{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Clinical AI Dropdown */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setActiveDropdown("ai")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#44546F",
                  backgroundColor: activeDropdown === "ai" ? "#F1F2F4" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span>Clinical AI</span>
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
              </button>

              {activeDropdown === "ai" && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    width: "320px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #DFE1E6",
                    borderRadius: "10px",
                    padding: "12px",
                    boxShadow: "0 12px 24px -4px rgba(9, 30, 66, 0.18)",
                    zIndex: 100,
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#626F86", padding: "4px 8px 8px" }}>
                    AI Architectures
                  </div>
                  {clinicalAi.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      style={{
                        display: "block",
                        padding: "10px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        transition: "background 0.15s ease",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#F7F8F9")}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#091E42" }}>{item.title}</div>
                      <div style={{ fontSize: "12px", color: "#626F86", marginTop: "2px" }}>{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a
              href="#triage-board"
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#44546F",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Triage Board
            </a>

            <a
              href="#clinical-setup"
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#44546F",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Medical Setup
            </a>

            <a
              href="#architecture"
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#44546F",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Architecture
            </a>
          </nav>
        </div>

        {/* Right: Actions, Search & Sign In */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => openSignInModal()}
            style={{
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "6px",
              color: "#44546F",
              cursor: "pointer",
            }}
            title="Search triage protocols"
          >
            <Search size={18} />
          </button>

          {user ? (
            /* Logged in state */
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  border: "1px solid #DFE1E6",
                  backgroundColor: "#F7F8F9",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#091E42",
                }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22A06B" }} />
                <span>{user.displayName || "Active Clinician"}</span>
              </div>
              <Link
                href="/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#0C66E4",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 1px 2px rgba(9, 30, 66, 0.12)",
                }}
              >
                <span>Console</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            /* Unauthenticated state */
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => openSignInModal()}
                style={{
                  padding: "8px 14px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0C66E4",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
              <button
                onClick={() => openSignInModal()}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  backgroundColor: "#0C66E4",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(9, 30, 66, 0.15)",
                }}
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
