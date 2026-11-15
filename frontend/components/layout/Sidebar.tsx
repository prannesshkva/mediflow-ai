"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, isUserAdmin } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
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
  Home,
  Settings,
  Sun,
  Moon,
  User as UserIcon
} from "lucide-react";

const navItems = [
  { href: "/chat", icon: Bot, label: "AI Assistant", section: "patient" },
  { href: "/appointments", icon: Calendar, label: "Appointments", section: "patient" },
  { href: "/reports", icon: FileText, label: "Reports Ingest", section: "patient" },
  { href: "/profile", icon: Settings, label: "Profile & Settings", section: "patient" },
  { href: "/admin", icon: Shield, label: "Admin & HITL", section: "admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--accent-cyan)",
              letterSpacing: "1px",
              padding: "0 10px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>CLINICAL DIRECTOR</span>
            <span style={{ fontSize: "9px", background: "rgba(12, 102, 228, 0.12)", color: "var(--accent-cyan)", padding: "1px 5px", borderRadius: "4px", border: "1px solid rgba(12, 102, 228, 0.25)" }}>
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
                    background: isActive ? (theme === "dark" ? "#162032" : "#EFF6FF") : undefined,
                    border: isActive ? (theme === "dark" ? "1px solid #233650" : "1px solid #BFDBFE") : undefined,
                    color: isActive ? (theme === "dark" ? "#60A5FA" : "#0C66E4") : undefined,
                  }}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} color={isActive ? (theme === "dark" ? "#60A5FA" : "#0C66E4") : undefined} />
                  <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                  {isActive && (
                    <ChevronRight
                      size={14}
                      color={theme === "dark" ? "#60A5FA" : "#0C66E4"}
                      style={{ marginLeft: "auto", opacity: 0.8 }}
                    />
                  )}
                </Link>
              );
            })}
        </div>
      )}

      {/* User profile & Settings Access (Bottom Left) */}
      <div style={{ marginTop: "auto" }}>
        {loading ? (
          <div className="glass-card-static" style={{ padding: "12px 14px", opacity: 0.5 }}>Loading...</div>
        ) : user ? (
          <div
            className="glass-card-static"
            style={{
              padding: "12px 12px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
            }}
          >
            {/* Clickable Profile Card -> /profile */}
            <Link
              href="/profile"
              title="Open User Profile & Settings"
              className="gemini-card-hover"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
                textDecoration: "none",
                padding: "6px 6px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: isUserAdmin(user?.email)
                    ? "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)"
                    : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: isUserAdmin(user?.email)
                    ? "0 2px 8px rgba(2, 132, 199, 0.4)"
                    : "0 2px 8px rgba(16, 185, 129, 0.4)",
                }}
              >
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
              </div>

              <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12.5px",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                >
                  {user.displayName || (isUserAdmin(user?.email) ? "Prannessh KVA" : "Clinical User")}
                </div>
                <div
                  style={{
                    fontSize: "10.5px",
                    color: isUserAdmin(user?.email) ? "var(--accent-cyan)" : "var(--text-secondary)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>{isUserAdmin(user?.email) ? "Clinical Director (MD)" : "Attending Clinician"}</span>
                </div>
              </div>

              <Settings size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </Link>

            {/* Bottom Actions: Theme Toggle & Sign Out */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
                className="gemini-transition"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                }}
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={13} color="#F59E0B" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} color="#0C66E4" />
                    <span>Dark</span>
                  </>
                )}
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                title="Sign out of clinical session"
                className="gemini-transition"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#EF4444",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239, 68, 68, 0.2)";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                }}
              >
                <LogOut size={13} />
                <span>Exit</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
