"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { SignInModal } from "@/components/home/SignInModal";

export const ADMIN_EMAIL = "prannesshkva@gmail.com";
export const ADMIN_EMAILS = ["prannesshkva@gmail.com", "prannesshkva2@gmail.com"];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

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
  loginError: string;
  showSignInModal: boolean;
  openSignInModal: (redirectPath?: string) => void;
  closeSignInModal: () => void;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoClinician: () => void;
  loginAsDemoPatient: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemoUser: false,
  isAdmin: false,
  loginError: "",
  showSignInModal: false,
  openSignInModal: () => {},
  closeSignInModal: () => {},
  signInWithGoogle: async () => {},
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
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/chat");

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
      displayName: "Prannessh KVA (Clinical Director)",
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
    setLoginError("");
  };

  const setDemoPatientState = () => {
    const demo: DemoUser = {
      uid: "patient-user",
      email: "patient@mediflow.internal",
      displayName: "Alex Johnson (Patient)",
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
    setLoginError("");
  };

  const signInWithGoogle = async () => {
    try {
      setLoginError("");
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.warn("Firebase sign in error; offering zero-config demo bypass.", error);
      setLoginError(
        `Firebase Error: ${error.code || error.message}. Use "Access as Clinical Director" for instant access.`
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

  const openSignInModal = (path?: string) => {
    if (path) setRedirectPath(path);
    setShowSignInModal(true);
  };

  const closeSignInModal = () => {
    setShowSignInModal(false);
  };

  const isAdmin = Boolean(user?.email && isUserAdmin(user.email));

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoUser,
        isAdmin,
        loginError,
        showSignInModal,
        openSignInModal,
        closeSignInModal,
        signInWithGoogle,
        loginAsDemoClinician: setDemoClinicianState,
        loginAsDemoPatient: setDemoPatientState,
        logout,
      }}
    >
      {children}
      <SignInModal
        isOpen={showSignInModal}
        onClose={closeSignInModal}
        redirectTo={redirectPath}
      />
    </AuthContext.Provider>
  );
};
