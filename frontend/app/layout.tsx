import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "MediFlow AI — Clinical Intelligence & Patient Triage Platform",
  description:
    "Clinical decision support and intelligent patient triage platform with licensed doctor oversight, medication safety screening, and hospital-grade privacy.",
  keywords: "healthcare AI, clinical triage, doctor decision support, medical consultation, patient safety, HIPAA compliant",
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
