"use client";

import React from "react";
import { AtlassianNavbar } from "@/components/home/AtlassianNavbar";
import { AtlassianHero } from "@/components/home/AtlassianHero";
import { ClinicalInstrumentsSetup } from "@/components/home/ClinicalInstrumentsSetup";
import { AtlassianTriageBoard } from "@/components/home/AtlassianTriageBoard";
import { AtlassianFeatures } from "@/components/home/AtlassianFeatures";
import { AtlassianMetrics } from "@/components/home/AtlassianMetrics";
import { AtlassianCTA } from "@/components/home/AtlassianCTA";
import { AtlassianFooter } from "@/components/home/AtlassianFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#172B4D] selection:bg-[#DEEBFF] selection:text-[#0C66E4]">
      {/* Atlassian Top Navigation Header with Sign In & Launch buttons */}
      <AtlassianNavbar />

      {/* Hero Section styled with Atlassian & Slack font & typography */}
      <AtlassianHero />

      {/* Medical Instruments & Clinical Telemetry Setup with Atlassian Sign-In Gateway */}
      <ClinicalInstrumentsSetup />

      {/* Interactive Atlassian Jira-Style Clinical Triage & Operations Board */}
      <AtlassianTriageBoard />

      {/* Architecture & Multi-Agent Feature Pillars */}
      <AtlassianFeatures />

      {/* Verified Clinical Safety & Performance Metrics */}
      <AtlassianMetrics />

      {/* Blue Action Banner */}
      <AtlassianCTA />

      {/* Multi-Column Atlassian Footer */}
      <AtlassianFooter />
    </div>
  );
}
