import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "MediFlow AI — Clinical Intelligence Platform with Human-in-the-Loop Oversight",
  description:
    "Production-grade clinical intelligence and multi-agent triage platform built with LangGraph, FastAPI, and PostgreSQL Row-Level Security.",
  keywords: "healthcare AI, clinical triage, LangGraph, HITL, medical assistant, clinical decision support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
