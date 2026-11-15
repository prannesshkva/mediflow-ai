"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Heart, LogIn, UserCheck, Stethoscope } from "lucide-react";

export const ADMIN_EMAIL = "prannesshkva@gmail.com";

export interface DemoUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  tenant_id?: string;
  role?: string;
  getIdToken: () => Promise<string>;
}

interface AuthContextType {
  user: User | DemoUser | null;
  loading: boolean;
  isDemoUser: boolean;
  isAdmin: boolean;
  loginAsDemoClinician: () => void;
  loginAsDemoPatient: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemoUser: false,
  isAdmin: false,
  loginAsDemoClinician: () => {},
  loginAsDemoPatient: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check if demo user was previously activated in local storage
    if (typeof window !== "undefined") {
      const savedDemo = localStorage.getItem("mediflow_demo_auth");
      if (savedDemo === "clinician") {
        setDemoClinicianState();
        setLoading(false);
        return;
      } else if (savedDemo === "patient") {
        setDemoPatientState();
        setLoading(false);
        return;
      }
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setIsDemoUser(false);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const setDemoClinicianState = () => {
    const demo: DemoUser = {
      uid: "admin-prannessh",
      email: ADMIN_EMAIL,
      displayName: "Prannessh KVA",
      photoURL: null,
      tenant_id: "tenant-default",
      role: "clinician",
      getIdToken: async () => "demo-clinician-token",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("mediflow_demo_auth", "clinician");
    }
    setUser(demo);
    setIsDemoUser(true);
  };

  const setDemoPatientState = () => {
    const demo: DemoUser = {
      uid: "patient-user",
      email: "patient@mediflow.internal",
      displayName: "Patient User",
      photoURL: null,
      tenant_id: "tenant-default",
      role: "patient",
      getIdToken: async () => "demo-patient-token",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("mediflow_demo_auth", "patient");
    }
    setUser(demo);
    setIsDemoUser(true);
  };

  const handleSignIn = async () => {
    try {
      setLoginError("");
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.warn("Firebase sign in error; offering zero-config demo bypass.", error);
      setLoginError(
        `Firebase Error: ${error.code || error.message}. You can click "Access as Demo Clinician" below to enter immediately.`
      );
    }
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mediflow_demo_auth");
    }
    setIsDemoUser(false);
    setUser(null);
    try {
      await auth.signOut();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0F1E" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(0, 212, 255, 0.2)",
          borderTopColor: "#00D4FF",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "url('https://www.transparenttextures.com/patterns/stardust.png'), linear-gradient(135deg, #0A0F1E 0%, #1A1F35 100%)",
        padding: "24px",
      }}>
        <div className="glass-card" style={{
          padding: "40px",
          maxWidth: "460px",
          width: "100%",
          textAlign: "center",
          borderRadius: "24px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div style={{
            width: 68,
            height: 68,
            borderRadius: "18px",
            background: "linear-gradient(135deg, #00D4FF, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 12px 24px rgba(124, 58, 237, 0.4)"
          }}>
            <Heart size={34} color="white" strokeWidth={2.5} />
          </div>
          
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Welcome to MediFlow AI
          </h1>
          <p style={{ color: "#8B9BC8", fontSize: "14px", marginBottom: "24px", lineHeight: 1.5 }}>
            Clinical Intelligence Platform with Human-in-the-Loop (HITL) Oversight &amp; Document Ingestion.
          </p>

          {loginError && (
            <div style={{ color: "#ff6b6b", fontSize: "12px", marginBottom: "16px", background: "rgba(255,77,79,0.12)", padding: "10px", borderRadius: "8px", textAlign: "left" }}>
              {loginError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 1-Click Zero-Config Clinical Director Access */}
            <button
              onClick={setDemoClinicianState}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "linear-gradient(135deg, #00D4FF 0%, #0099FF 100%)",
                border: "none",
                borderRadius: "12px",
                color: "#0A0F1E",
                fontSize: "14px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(0, 212, 255, 0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <Stethoscope size={18} color="#0A0F1E" strokeWidth={2.5} />
              Enter as Clinical Director (prannesshkva@gmail.com)
            </button>

            {/* Patient Access */}
            <button
              onClick={setDemoPatientState}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "#E2E8F0",
                fontSize: "13.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
            >
              <UserCheck size={18} color="#00D4FF" />
              Enter as Patient User
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "6px 0", color: "#64748B", fontSize: "12px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
              OR GOOGLE SIGN IN
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Google Firebase Login */}
            <button
              onClick={handleSignIn}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#fff",
                border: "none",
                borderRadius: "12px",
                color: "#0A0F1E",
                fontSize: "13.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <LogIn size={18} color="#0A0F1E" />
              Continue with Google (Firebase)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isDemoUser,
      isAdmin,
      loginAsDemoClinician: setDemoClinicianState,
      loginAsDemoPatient: setDemoPatientState,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
