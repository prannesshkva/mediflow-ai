"use client";

import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AtlassianHero() {
  const { openSignInModal, loginAsDemoClinician } = useAuth();

  return (
    <section
      style={{
        backgroundColor: "#FFFFFF",
        paddingTop: "64px",
        paddingBottom: "48px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Top Category Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            border: "1px solid #DFE1E6",
            backgroundColor: "#F4F5F7",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "#091E42",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#0C66E4",
              display: "inline-block",
            }}
          />
          <span>Clinical Decision Support with HITL Governance</span>
          <span style={{ color: "#8993A4" }}>|</span>
          <span style={{ color: "#0C66E4", fontWeight: 700 }}>FastAPI + LangGraph</span>
        </div>

        {/* Hero Headline (Atlassian & Slack Font & Style) */}
        <h1
          style={{
            fontSize: "52px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#091E42",
            lineHeight: 1.15,
            margin: "0 0 18px 0",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Discover the power of clinical intelligence
        </h1>

        {/* Hero Subtitle */}
        <p
          style={{
            fontSize: "18.5px",
            color: "#44546F",
            lineHeight: 1.6,
            maxWidth: "720px",
            margin: "0 auto 32px auto",
          }}
        >
          Give your care teams and AI agents the shared context they need to make faster triage decisions, automate document intake, and protect patients with human-in-the-loop oversight.
        </p>

        {/* Action Button Row (Matching Image 2 CTA) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => openSignInModal("/chat")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "6px",
              backgroundColor: "#0C66E4",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(9, 30, 66, 0.2)",
              transition: "background 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0052CC")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0C66E4")}
          >
            <span>Get started with MediFlow</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => loginAsDemoClinician()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "12px 18px",
              borderRadius: "6px",
              backgroundColor: "transparent",
              color: "#0C66E4",
              fontSize: "15px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#E9F2FF")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <span>Explore live clinical demo</span>
            <span style={{ fontSize: "17px" }}>→</span>
          </button>
        </div>

        {/* Trust Badges Strip */}
        <div
          style={{
            marginTop: "44px",
            paddingTop: "24px",
            borderTop: "1px solid #EBECF0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "24px",
            fontSize: "12.5px",
            fontWeight: 600,
            color: "#626F86",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="#22A06B" />
            <span>Multi-Agent LangGraph Pipeline</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="#22A06B" />
            <span>Human-in-the-Loop MD Sign-Off</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="#22A06B" />
            <span>PostgreSQL Row-Level Security</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="#22A06B" />
            <span>Automated Contraindication Screening</span>
          </div>
        </div>

      </div>
    </section>
  );
}
