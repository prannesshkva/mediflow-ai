"use client";

import React from "react";
import { AtlassianNavbar } from "@/components/home/AtlassianNavbar";
import { AtlassianHero } from "@/components/home/AtlassianHero";
import { AtlassianTriageBoard } from "@/components/home/AtlassianTriageBoard";
import { ClinicalInstrumentsSetup } from "@/components/home/ClinicalInstrumentsSetup";
import { AtlassianFeatures } from "@/components/home/AtlassianFeatures";
import { AtlassianMetrics } from "@/components/home/AtlassianMetrics";
import { AtlassianCTA } from "@/components/home/AtlassianCTA";
import { AtlassianFooter } from "@/components/home/AtlassianFooter";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        color: "#172B4D",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      {/* Atlassian Top Navigation Header */}
      <AtlassianNavbar />

      {/* Atlassian Hero Section */}
      <AtlassianHero />

      {/* Atlassian Jira-Style Clinical Triage & Operations Board (Directly Matching Image 2 Showcase) */}
      <AtlassianTriageBoard />

      {/* Clinical Telemetry & Medical Diagnostic Instruments Setup with Sign-In Portal */}
      <ClinicalInstrumentsSetup />

      {/* Architecture & Multi-Agent Feature Pillars */}
      <AtlassianFeatures />

      {/* Verified Clinical Safety & Performance Metrics */}
      <AtlassianMetrics />

      {/* Action Banner */}
      <AtlassianCTA />

      {/* Multi-Column Atlassian Footer */}
      <AtlassianFooter />
    </div>
  );
}
