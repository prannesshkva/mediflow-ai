"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, isUserAdmin } from "@/components/AuthProvider";
import {
  Activity,
  Bot,
  Calendar,
  FileText,
  LayoutDashboard,
  Heart,
  Shield,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Home
} from "lucide-react";

const navItems = [
  { href: "/chat", icon: Bot, label: "AI Assistant", section: "patient" },
  { href: "/appointments", icon: Calendar, label: "Appointments", section: "patient" },
  { href: "/reports", icon: FileText, label: "Reports Ingest", section: "patient" },
  { href: "/admin", icon: Shield, label: "Admin & HITL", section: "admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Sign out failed", error);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("mediflow_demo_auth");
      window.location.href = "/";
    }
  };

  return (
    <aside
      style={{
        width: "240px",
        minWidth: "240px",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "16px 12px",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: "4px 8px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              background: "#0C66E4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Heart size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.2px",
              }}
            >
              MediFlow AI
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
              CLINIC OPERATIONS
            </div>
          </div>
        </div>

        {/* Back to Public Atlassian Homepage Link */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "14px",
            padding: "8px 10px",
            borderRadius: "6px",
            background: "rgba(12, 102, 228, 0.12)",
            border: "1px solid rgba(12, 102, 228, 0.25)",
            color: "#60A5FA",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <Home size={14} />
          <span>← Public Homepage</span>
        </Link>
      </div>

      {/* Patient Workspace Section */}
      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#4A5680",
            letterSpacing: "1px",
            padding: "0 10px",
            marginBottom: "6px",
          }}
        >
          CLINICAL WORKSPACE
        </div>
        {navItems
          .filter((i) => i.section === "patient")
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight
                    size={14}
                    style={{ marginLeft: "auto", opacity: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
      </div>

      {/* Admin Section — STRICTLY AUTHORIZED FOR CLINICAL DIRECTORS */}
      {isUserAdmin(user?.email) && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#38BDF8",
              letterSpacing: "1px",
              padding: "0 10px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>CLINICAL DIRECTOR</span>
            <span style={{ fontSize: "9px", background: "rgba(56, 189, 248, 0.15)", padding: "1px 5px", borderRadius: "4px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
              ROOT
            </span>
          </div>
          {navItems
            .filter((i) => i.section === "admin")
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  style={{
                    background: isActive ? "linear-gradient(90deg, rgba(2, 132, 199, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)" : undefined,
                    border: isActive ? "1px solid rgba(56, 189, 248, 0.3)" : undefined,
                    color: isActive ? "#38BDF8" : undefined,
                  }}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} color={isActive ? "#38BDF8" : undefined} />
                  <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                  {isActive && (
                    <ChevronRight
                      size={14}
                      color="#38BDF8"
                      style={{ marginLeft: "auto", opacity: 0.8 }}
                    />
                  )}
                </Link>
              );
            })}
        </div>
      )}

      {/* User profile & Sign Out */}
      <div style={{ marginTop: "auto" }}>
        {loading ? (
          <div className="glass-card-static" style={{ padding: "12px 14px", opacity: 0.5 }}>Loading...</div>
        ) : user ? (
          <div className="glass-card-static" style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isUserAdmin(user?.email) ? "#0C66E4" : "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {user.displayName || (isUserAdmin(user?.email) ? "Clinical Director" : "Patient User")}
                </div>
                <div style={{ fontSize: "10px", color: isUserAdmin(user?.email) ? "#38BDF8" : "var(--text-secondary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {isUserAdmin(user?.email) ? "Clinical Director (MD)" : "Patient Account"}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-danger"
              style={{ width: "100%", justifyContent: "center", padding: "6px 10px", fontSize: "12px" }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
