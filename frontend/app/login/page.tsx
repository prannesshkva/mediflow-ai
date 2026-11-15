"use client";

import React from "react";
import { AtlassianNavbar } from "@/components/home/AtlassianNavbar";
import { ClinicalInstrumentsSetup } from "@/components/home/ClinicalInstrumentsSetup";
import { AtlassianFooter } from "@/components/home/AtlassianFooter";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-[#172B4D]">
      <AtlassianNavbar />
      <div className="py-8">
        <ClinicalInstrumentsSetup />
      </div>
      <AtlassianFooter />
    </div>
  );
}
