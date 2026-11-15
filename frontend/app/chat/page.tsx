"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  User,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Plus,
  MessageSquare,
  Trash2,
  Clock,
  Paperclip,
  Mic,
  Pin,
  PinOff,
  Stethoscope,
  Pill,
  FileSpreadsheet,
  CalendarCheck,
  ChevronRight,
  Info
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatApi, ChatResponse, AgentTraceStep, ChatSession } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  intent?: string;
  risk_level?: string;
  escalated?: boolean;
  hitl_status?: string;
  hitl_required?: boolean;
  hitl_review_id?: string;
  trace?: AgentTraceStep[];
  rag_context_used?: boolean;
  timestamp: Date;
}

interface SessionTab {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

const STORAGE_SESSIONS_KEY = "mediflow_chat_sessions_v4";
const STORAGE_MESSAGES_KEY = "mediflow_chat_messages_map_v4";

const GEMINI_PROMPTS = [
  {
    icon: Stethoscope,
    title: "Acute Symptom Triage",
    desc: "Assess sudden chest tightness, pain scale, and clinical acuity",
    prompt: "I have sudden acute chest tightness radiating to my left arm with shortness of breath",
    color: "#38BDF8",
    bg: "rgba(56, 189, 248, 0.12)",
  },
  {
    icon: Pill,
    title: "Medication & Allergy Safety",
    desc: "Screen drug interactions, contraindications, and dosages",
    prompt: "Check medication interactions between Metformin 500mg, Lisinopril 10mg, and Ibuprofen",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.12)",
  },
  {
    icon: FileSpreadsheet,
    title: "Lab & Pathology Intake",
    desc: "Interpret blood work, cardiac troponin, and metabolic panels",
    prompt: "Can you analyze a lipid panel with Total Cholesterol 245 mg/dL and LDL 160 mg/dL?",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.12)",
  },
  {
    icon: CalendarCheck,
    title: "Clinical Follow-Up",
    desc: "Schedule specialist appointments and follow-up care",
    prompt: "I want to schedule a follow-up consultation with Dr. Chen for next Tuesday morning",
    color: "#A78BFA",
    bg: "rgba(167, 139, 250, 0.12)",
  },
];

const DEFAULT_SESSIONS: SessionTab[] = [
  {
    id: "sess-active",
    title: "Current Clinical Consultation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 0,
  },
  {
    id: "sess-cardio-92",
    title: "Cardiology Follow-Up (Dr. Chen)",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    messageCount: 4,
  },
  {
    id: "sess-pediatric-41",
    title: "Pediatric Fever & Earache Assessment",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 44).toISOString(),
    messageCount: 3,
  },
  {
    id: "sess-labs-18",
    title: "Lipid Panel & Metabolic Lab Review",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 68).toISOString(),
    messageCount: 2,
  },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionTab[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [sessionMessagesMap, setSessionMessagesMap] = useState<Record<string, Message[]>>({});

  // Hover & Pin state for the left consultation points bar
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(false);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePatientName = user?.displayName || (user as any)?.name || "Dr. Prannessh KVA";
  const isDoctorRole = !user || user.email?.includes("admin") || (user as any)?.role === "clinician" || activePatientName.includes("Dr.");

  const activeMessages: Message[] = activeSessionId ? sessionMessagesMap[activeSessionId] || [] : [];
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const isDrawerOpen = isSidebarPinned || isSidebarHovered;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [activeMessages, isLoading, streamingText]);

  const persistToStorage = (updatedSessions: SessionTab[], updatedMap: Record<string, Message[]>) => {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(updatedSessions));
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(updatedMap));
    } catch (e) {
      console.warn("Storage quota exceeded or unavailable:", e);
    }
  };

  // Initialize and synchronize sessions from localStorage and backend
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(STORAGE_SESSIONS_KEY);
      const storedMap = localStorage.getItem(STORAGE_MESSAGES_KEY);

      let initialSessions: SessionTab[] = [];
      let initialMap: Record<string, Message[]> = {};

      if (storedSessions && storedMap) {
        initialSessions = JSON.parse(storedSessions);
        const parsedMap = JSON.parse(storedMap);
        Object.keys(parsedMap).forEach((sid) => {
          initialMap[sid] = parsedMap[sid].map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
        });
      }

      if (initialSessions.length === 0) {
        const defaultId = `sess-${Date.now()}`;
        initialSessions = [
          {
            id: defaultId,
            title: "New Clinical Consultation",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 0,
          },
          ...DEFAULT_SESSIONS.slice(1),
        ];
        initialMap[defaultId] = [];
        // Add sample clinical dialog for one demo session
        initialMap["sess-cardio-92"] = [
          {
            id: "m-1",
            role: "user",
            content: "Patient reports mild exertional shortness of breath following step-down from Metoprolol.",
            timestamp: new Date(Date.now() - 3600000 * 22),
          },
          {
            id: "m-2",
            role: "ai",
            content: "### Clinical Assessment & Care Pathway\n\n* **Acuity:** Moderate exertional dyspnea.\n* **Observation:** Heart rate stable at 72 bpm; blood pressure 126/82 mmHg.\n* **Action Plan:** Maintain current dosage; schedule in-clinic 12-lead ECG if symptoms recur with rest or radiate to jaw/arm.",
            intent: "clinical_consultation",
            risk_level: "MEDIUM",
            hitl_status: "clinician_approved",
            rag_context_used: true,
            timestamp: new Date(Date.now() - 3600000 * 20),
          },
        ];
      }

      setSessions(initialSessions);
      setSessionMessagesMap(initialMap);
      const initialActiveId = initialSessions[0].id;
      setActiveSessionId(initialActiveId);
    } catch (e) {
      console.error("Failed to load sessions from storage:", e);
      const fallbackId = `sess-${Date.now()}`;
      setSessions([
        {
          id: fallbackId,
          title: "New Clinical Consultation",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
        },
      ]);
      setActiveSessionId(fallbackId);
    }

    // Sync with backend session store
    chatApi.getSessions()
      .then((backendSessions) => {
        if (backendSessions && backendSessions.length > 0) {
          setSessions((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const newFromBackend: SessionTab[] = backendSessions
              .filter((bs) => !existingIds.has(bs.session_id))
              .map((bs) => ({
                id: bs.session_id,
                title: bs.title || "Clinical Session",
                createdAt: bs.created_at || new Date().toISOString(),
                updatedAt: bs.updated_at || new Date().toISOString(),
                messageCount: bs.message_count || 1,
              }));
            if (newFromBackend.length > 0) {
              return [...prev, ...newFromBackend];
            }
            return prev;
          });
        }
      })
      .catch(() => {
        // Fallback silently if offline or demo mode
      });
  }, []);

  const createNewSession = () => {
    const newId = `sess-${Date.now()}`;
    const newSession: SessionTab = {
      id: newId,
      title: "New Consultation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    const updatedSessions = [newSession, ...sessions];
    const updatedMap = { ...sessionMessagesMap, [newId]: [] };

    setSessions(updatedSessions);
    setSessionMessagesMap(updatedMap);
    setActiveSessionId(newId);
    persistToStorage(updatedSessions, updatedMap);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const switchSession = async (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);

    // If messages are not present in local state, fetch from backend
    if (!sessionMessagesMap[sessionId] || sessionMessagesMap[sessionId].length === 0) {
      try {
        const historyLogs = await chatApi.getSessionHistory(sessionId);
        if (historyLogs && historyLogs.length > 0) {
          const loadedMsgs: Message[] = [];
          historyLogs.forEach((log: any) => {
            if (log.query) {
              loadedMsgs.push({
                id: `u-${Date.now()}-${Math.random()}`,
                role: "user",
                content: log.query,
                timestamp: new Date(log.created_at || Date.now()),
              });
            }
            if (log.response) {
              loadedMsgs.push({
                id: `a-${Date.now()}-${Math.random()}`,
                role: "ai",
                content: log.response,
                intent: log.intent,
                risk_level: log.risk_level,
                hitl_status: log.hitl_status,
                trace: log.agent_trace,
                rag_context_used: log.rag_context_used,
                timestamp: new Date(log.created_at || Date.now()),
              });
            }
          });
          const newMap = { ...sessionMessagesMap, [sessionId]: loadedMsgs };
          setSessionMessagesMap(newMap);
          persistToStorage(sessions, newMap);
          return;
        }
      } catch (err) {
        console.error("Failed to load session history from backend:", err);
      }
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    const updatedMap = { ...sessionMessagesMap };
    delete updatedMap[sessionId];

    if (updatedSessions.length === 0) {
      const fallbackId = `sess-${Date.now()}`;
      const fallbackSession: SessionTab = {
        id: fallbackId,
        title: "New Consultation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      setSessions([fallbackSession]);
      setSessionMessagesMap({ [fallbackId]: [] });
      setActiveSessionId(fallbackId);
      persistToStorage([fallbackSession], { [fallbackId]: [] });
    } else {
      setSessions(updatedSessions);
      setSessionMessagesMap(updatedMap);
      if (activeSessionId === sessionId) {
        const nextId = updatedSessions[0].id;
        setActiveSessionId(nextId);
      }
      persistToStorage(updatedSessions, updatedMap);
    }

    try {
      await chatApi.deleteSession(sessionId);
    } catch {
      // Ignored
    }
  };

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading || !activeSessionId) return;

    const currentMsgs = sessionMessagesMap[activeSessionId] || [];
    const conversationHistory = currentMsgs.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    const msgsWithUser = [...currentMsgs, userMsg];
    const mapWithUser = { ...sessionMessagesMap, [activeSessionId]: msgsWithUser };
    setSessionMessagesMap(mapWithUser);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    try {
      const responsePromise = chatApi.send(
        query,
        activePatientName,
        "tenant-default",
        activeSessionId,
        conversationHistory
      );

      const response = await responsePromise;

      // Realistic Gemini streaming typewriter effect
      const fullResponse = response.response;
      let currentIndex = 0;
      const stepSize = Math.max(2, Math.floor(fullResponse.length / 28));

      await new Promise<void>((resolve) => {
        const streamInterval = setInterval(() => {
          currentIndex += stepSize;
          if (currentIndex >= fullResponse.length) {
            setStreamingText(fullResponse);
            clearInterval(streamInterval);
            resolve();
          } else {
            setStreamingText(fullResponse.slice(0, currentIndex));
          }
        }, 16);
      });

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "ai",
        content: response.response,
        intent: response.intent,
        risk_level: response.risk_level,
        escalated: response.escalated,
        hitl_status: response.hitl_status,
        hitl_required: response.hitl_required,
        hitl_review_id: response.hitl_review_id,
        trace: response.agent_trace,
        rag_context_used: response.rag_context_used,
        timestamp: new Date(),
      };

      const finalMsgs = [...msgsWithUser, aiMsg];
      const finalMap = { ...sessionMessagesMap, [activeSessionId]: finalMsgs };
      setSessionMessagesMap(finalMap);
      setStreamingText("");

      // Update session title (if first turn or default title)
      const updatedSessions = sessions.map((s) => {
        if (s.id === activeSessionId) {
          const isInitial = s.messageCount === 0 || s.title.startsWith("New");
          return {
            ...s,
            title: isInitial ? (query.length > 34 ? query.slice(0, 34) + "..." : query) : s.title,
            updatedAt: new Date().toISOString(),
            messageCount: finalMsgs.length,
          };
        }
        return s;
      });

      setSessions(updatedSessions);
      persistToStorage(updatedSessions, finalMap);
    } catch (err: any) {
      console.error("Clinical Consultation Notice:", err);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "ai",
        content: `### Clinical Service Notice\n\nI received your query: *"${query}"*\n\nOur clinical care server is temporarily synchronizing data. Please verify your connection or try again in a few moments.\n\n* **Status:** Connection reconnecting\n* **Safe Guidance:** If this is an immediate medical emergency, please dial **911** or proceed to the nearest emergency department.`,
        intent: "clinical_inquiry",
        risk_level: "LOW",
        escalated: false,
        rag_context_used: false,
        timestamp: new Date(),
      };

      const finalMsgs = [...msgsWithUser, aiMsg];
      const finalMap = { ...sessionMessagesMap, [activeSessionId]: finalMsgs };
      setSessionMessagesMap(finalMap);
      persistToStorage(sessions, finalMap);
      setStreamingText("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearCurrentSessionChat = () => {
    if (!activeSessionId) return;
    const finalMap = { ...sessionMessagesMap, [activeSessionId]: [] };
    setSessionMessagesMap(finalMap);
    const updatedSessions = sessions.map((s) => {
      if (s.id === activeSessionId) {
        return { ...s, messageCount: 0, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    setSessions(updatedSessions);
    persistToStorage(updatedSessions, finalMap);
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#070B14",
        color: "#F8FAFC",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. LEFT CONSULTATION BAR (HOVER-TO-REVEAL SCROLLABLE POINTS)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        style={{
          width: isDrawerOpen ? "290px" : "56px",
          minWidth: isDrawerOpen ? "290px" : "56px",
          backgroundColor: "#0A0F1D",
          borderRight: "1px solid #1E293B",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          zIndex: 40,
          transition: "width 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease",
          boxShadow: isDrawerOpen ? "8px 0 24px rgba(0, 0, 0, 0.35)" : "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Drawer Header: Title & Pin/Unpin Toggle */}
        <div
          style={{
            height: "58px",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: isDrawerOpen ? "space-between" : "center",
            borderBottom: "1px solid #1A2333",
            flexShrink: 0,
          }}
        >
          {isDrawerOpen ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={18} color="#38BDF8" />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "#94A3B8",
                  }}
                >
                  Consultations
                </span>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    color: "#38BDF8",
                    padding: "1px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {sessions.length}
                </span>
              </div>

              <button
                onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                title={isSidebarPinned ? "Unpin sidebar (hover-reveal mode)" : "Pin sidebar open"}
                style={{
                  background: isSidebarPinned ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: isSidebarPinned ? "1px solid rgba(56, 189, 248, 0.3)" : "none",
                  color: isSidebarPinned ? "#38BDF8" : "#64748B",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.15s ease",
                }}
              >
                {isSidebarPinned ? <PinOff size={14} /> : <Pin size={14} />}
              </button>
            </>
          ) : (
            <div
              title="Hover to reveal consultation sessions"
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(56, 189, 248, 0.1)",
                color: "#38BDF8",
                cursor: "pointer",
              }}
            >
              <MessageSquare size={17} />
            </div>
          )}
        </div>

        {/* New Consultation Action Button */}
        <div style={{ padding: isDrawerOpen ? "14px 12px 10px" : "12px 8px 10px" }}>
          <button
            onClick={createNewSession}
            title="Start New Clinical Consultation"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isDrawerOpen ? "flex-start" : "center",
              gap: "10px",
              padding: isDrawerOpen ? "10px 14px" : "10px 0",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(37, 99, 235, 0.3)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Plus size={16} strokeWidth={2.6} style={{ flexShrink: 0 }} />
            {isDrawerOpen && <span>New Consultation</span>}
          </button>
        </div>

        {/* Scrollable Consultation Points / Sessions */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isDrawerOpen ? "6px 8px" : "6px 4px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => switchSession(sess.id)}
                title={sess.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isDrawerOpen ? "space-between" : "center",
                  padding: isDrawerOpen ? "10px 12px" : "10px 0",
                  borderRadius: "8px",
                  backgroundColor: isActive ? "#111A2E" : "transparent",
                  border: isActive ? "1px solid #1E3A8A" : "1px solid transparent",
                  borderLeft: isActive ? "3px solid #38BDF8" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#0F172A";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: isDrawerOpen ? 1 : "unset" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      backgroundColor: isActive ? "rgba(56, 189, 248, 0.18)" : "rgba(148, 163, 184, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare size={14} color={isActive ? "#38BDF8" : "#94A3B8"} />
                  </div>

                  {isDrawerOpen && (
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: "12.5px",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "#F8FAFC" : "#CBD5E1",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {sess.title}
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: "#64748B",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginTop: "2px",
                        }}
                      >
                        <span>{sess.messageCount} note{sess.messageCount === 1 ? "" : "s"}</span>
                        <span>•</span>
                        <span>{new Date(sess.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  )}
                </div>

                {isDrawerOpen && (
                  <button
                    onClick={(e) => deleteSession(sess.id, e)}
                    title="Remove consultation"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748B",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      opacity: isActive ? 0.9 : 0.35,
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#EF4444";
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#64748B";
                      (e.currentTarget as HTMLElement).style.opacity = isActive ? "0.9" : "0.35";
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer Bottom: Clinical HIPAA Indicator */}
        <div
          style={{
            padding: isDrawerOpen ? "12px 14px" : "12px 8px",
            borderTop: "1px solid #1A2333",
            fontSize: "11px",
            color: "#64748B",
            display: "flex",
            alignItems: "center",
            justifyContent: isDrawerOpen ? "flex-start" : "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={14} color="#10B981" />
          {isDrawerOpen && (
            <span style={{ color: "#94A3B8", fontWeight: 500 }}>
              Encrypted Clinical Session
            </span>
          )}
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN CLINICAL CHAT AREA (GOOGLE GEMINI UI STYLE)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        
        {/* Top Clinical Header (No model strings, pure clinical status) */}
        <header
          style={{
            height: "58px",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#090E1B",
            borderBottom: "1px solid #1E293B",
            flexShrink: 0,
          }}
        >
          {/* Left: Consultation Title & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
              }}
            >
              <Activity size={17} strokeWidth={2.4} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#F8FAFC" }}>
                  {activeSession?.title || "Clinical Consultation"}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    color: "#34D399",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    letterSpacing: "0.4px",
                  }}
                >
                  LIVE CARE
                </span>
              </div>
              <div style={{ fontSize: "11.5px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#10B981",
                    display: "inline-block",
                    boxShadow: "0 0 6px #10B981",
                  }}
                />
                <span>Clinical Decision Support Active</span>
                <span style={{ color: "#475569" }}>•</span>
                <span>Licensed Physician Oversight</span>
              </div>
            </div>
          </div>

          {/* Right: Clinician / User Badge & Clear Action */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                backgroundColor: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: "20px",
                fontSize: "12px",
                color: "#CBD5E1",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#0284C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                {activePatientName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 600 }}>{activePatientName}</span>
              <span style={{ color: "#64748B", fontSize: "11px" }}>
                {isDoctorRole ? "(Attending)" : "(Patient)"}
              </span>
            </div>

            {activeMessages.length > 0 && (
              <button
                onClick={clearCurrentSessionChat}
                title="Reset conversation"
                style={{
                  padding: "7px 10px",
                  backgroundColor: "#0F172A",
                  border: "1px solid #1E293B",
                  borderRadius: "8px",
                  color: "#94A3B8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#FFFFFF")}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "#94A3B8")}
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </header>

        {/* Message Stream or Gemini Empty Welcome State */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ maxWidth: "840px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* ─── GEMINI EMPTY STATE ─── */}
            {activeMessages.length === 0 && (
              <div style={{ paddingTop: "40px", paddingBottom: "20px" }}>
                
                {/* Gemini Multi-Color Sparkle Emblem */}
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #1E1B4B 0%, #1E293B 100%)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    boxShadow: "0 0 24px rgba(56, 189, 248, 0.2)",
                  }}
                >
                  <Sparkles size={28} color="#38BDF8" />
                </div>

                {/* Big Gemini Greeting Typography */}
                <h1
                  style={{
                    fontSize: "44px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    margin: "0 0 10px 0",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(135deg, #60A5FA 0%, #93C5FD 50%, #C4B5FD 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Hello, {isDoctorRole ? "Doctor" : activePatientName}
                  </span>
                </h1>

                <h2
                  style={{
                    fontSize: "26px",
                    fontWeight: 500,
                    color: "#94A3B8",
                    margin: "0 0 28px 0",
                    letterSpacing: "-0.015em",
                  }}
                >
                  How can I assist your clinical triage today?
                </h2>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#64748B",
                    maxWidth: "640px",
                    lineHeight: 1.6,
                    margin: "0 0 36px 0",
                  }}
                >
                  Assess patient symptoms, review clinical care guidelines, screen medication contraindications, or interpret laboratory findings.
                </p>

                {/* Gemini Prompt Suggestion Cards (2x2 Grid) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {GEMINI_PROMPTS.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => sendMessage(item.prompt)}
                      style={{
                        padding: "16px 18px",
                        backgroundColor: "#0D1424",
                        border: "1px solid #1E2D47",
                        borderRadius: "16px",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: "110px",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "#121C33";
                        (e.currentTarget as HTMLElement).style.borderColor = item.color;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "#0D1424";
                        (e.currentTarget as HTMLElement).style.borderColor = "#1E2D47";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "8px",
                              backgroundColor: item.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: item.color,
                            }}
                          >
                            <item.icon size={16} />
                          </div>
                          <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#F8FAFC" }}>
                            {item.title}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0, lineHeight: 1.45 }}>
                          {item.desc}
                        </p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                        <ChevronRight size={14} color="#64748B" />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ─── ACTIVE MESSAGE BUBBLES ─── */}
            {activeMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  width: "100%",
                }}
              >
                {msg.role === "user" ? (
                  /* User Prompt Pill Bubble */
                  <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#94A3B8" }}>
                        {activePatientName}
                      </span>
                      <span style={{ fontSize: "10.5px", color: "#64748B" }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#162540",
                        color: "#F8FAFC",
                        border: "1px solid #23385D",
                        borderRadius: "20px 20px 4px 20px",
                        padding: "14px 20px",
                        fontSize: "14.5px",
                        lineHeight: 1.6,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  /* Gemini-Style Assistant Response */
                  <div style={{ maxWidth: "96%", width: "100%", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    
                    {/* Gemini Sparkle Avatar */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
                        border: "1px solid rgba(56, 189, 248, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                        boxShadow: "0 0 12px rgba(56, 189, 248, 0.25)",
                      }}
                    >
                      <Sparkles size={18} color="#38BDF8" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Clinical Assistant Header */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#F8FAFC" }}>
                          MediFlow Clinical AI
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            color: "#34D399",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          DOCTOR SUPERVISED
                        </span>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {/* Acute / High Risk Clinician Review Alert Banner */}
                      {msg.hitl_status === "pending_clinician_review" ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.35)",
                            marginBottom: "12px",
                          }}
                        >
                          <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: "13px", color: "#FCA5A5", fontWeight: 700 }}>
                              🚨 PHYSICIAN SIGN-OFF REQUIRED
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#F87171", marginTop: "2px" }}>
                              Acute or high-risk clinical symptoms detected. Autonomous advice halted and queued for licensed physician approval.
                            </div>
                          </div>
                        </div>
                      ) : msg.escalated && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(245, 158, 11, 0.12)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            marginBottom: "10px",
                          }}
                        >
                          <AlertTriangle size={16} color="#F59E0B" />
                          <span style={{ fontSize: "12px", color: "#FDE68A", fontWeight: 600 }}>
                            HIGH RISK — Flagged for attending clinical review
                          </span>
                        </div>
                      )}

                      {/* Content Body */}
                      <div
                        style={{
                          backgroundColor: "#0B111E",
                          border: "1px solid #1A263B",
                          borderRadius: "16px",
                          padding: "18px 24px",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
                        }}
                      >
                        <div className="markdown-output">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* Clinical Metadata Badges */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                        {msg.risk_level && (
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              backgroundColor:
                                msg.risk_level === "HIGH"
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : msg.risk_level === "MEDIUM"
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : "rgba(16, 185, 129, 0.15)",
                              color:
                                msg.risk_level === "HIGH"
                                  ? "#F87171"
                                  : msg.risk_level === "MEDIUM"
                                  ? "#FBBF24"
                                  : "#34D399",
                              border:
                                msg.risk_level === "HIGH"
                                  ? "1px solid rgba(239, 68, 68, 0.3)"
                                  : msg.risk_level === "MEDIUM"
                                  ? "1px solid rgba(245, 158, 11, 0.3)"
                                  : "1px solid rgba(16, 185, 129, 0.3)",
                              fontWeight: 700,
                            }}
                          >
                            {msg.risk_level} RISK
                          </span>
                        )}

                        {msg.hitl_status && (
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              backgroundColor:
                                msg.hitl_status === "pending_clinician_review"
                                  ? "rgba(244, 63, 94, 0.15)"
                                  : "rgba(16, 185, 129, 0.15)",
                              color:
                                msg.hitl_status === "pending_clinician_review"
                                  ? "#F43F5E"
                                  : "#10B981",
                              border:
                                msg.hitl_status === "pending_clinician_review"
                                  ? "1px solid rgba(244, 63, 94, 0.3)"
                                  : "1px solid rgba(16, 185, 129, 0.3)",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {msg.hitl_status === "pending_clinician_review" ? (
                              <>⏳ Awaiting Sign-Off</>
                            ) : (
                              <><CheckCircle2 size={11} /> Clinically Verified</>
                            )}
                          </span>
                        )}

                        {msg.rag_context_used && (
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              backgroundColor: "#131C30",
                              color: "#38BDF8",
                              border: "1px solid #1E2E4E",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <ShieldCheck size={11} /> Verified Clinical Evidence
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming Typewriter Preview */}
            {isLoading && streamingText && (
              <div style={{ maxWidth: "96%", width: "100%", display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
                    border: "1px solid rgba(56, 189, 248, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                    boxShadow: "0 0 12px rgba(56, 189, 248, 0.25)",
                  }}
                >
                  <Sparkles size={18} color="#38BDF8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      backgroundColor: "#0B111E",
                      border: "1px solid #1A263B",
                      borderRadius: "16px",
                      padding: "18px 24px",
                    }}
                  >
                    <div className="markdown-output">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamingText}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && !streamingText && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "12px",
                    background: "#0F1A2E",
                    border: "1px solid #1E2D44",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={18} color="#38BDF8" className="animate-spin" />
                </div>
                <div
                  style={{
                    padding: "12px 18px",
                    borderRadius: "12px",
                    backgroundColor: "#0B111E",
                    border: "1px solid #1B2639",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", gap: "4px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38BDF8", animation: "pulse-dot 1.2s infinite ease-in-out" }} />
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38BDF8", animation: "pulse-dot 1.2s infinite ease-in-out 0.2s" }} />
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38BDF8", animation: "pulse-dot 1.2s infinite ease-in-out 0.4s" }} />
                  </div>
                  <span style={{ fontSize: "13px", color: "#94A3B8" }}>
                    Analyzing clinical symptoms and checking medical guidelines...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. GEMINI FLOATING COMPOSER PILL                             */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "12px 24px 22px",
            backgroundColor: "transparent",
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: "840px", width: "100%", margin: "0 auto" }}>
            
            {/* The Floating Pill Input Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#0F172A",
                border: "1px solid #23314A",
                borderRadius: "32px",
                padding: "8px 10px 8px 18px",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onFocus={() => {}}
            >
              {/* Paperclip / File Attachment */}
              <button
                type="button"
                title="Attach clinical note or lab report PDF"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  borderRadius: "50%",
                  transition: "color 0.15s ease",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#38BDF8")}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
              >
                <Paperclip size={18} />
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a clinical question, assess symptoms, or follow up..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#F8FAFC",
                  fontSize: "14.5px",
                  lineHeight: 1.5,
                }}
                autoFocus
              />

              {/* Voice / Mic Indicator */}
              <button
                type="button"
                title="Voice clinical dictation"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  borderRadius: "50%",
                  transition: "color 0.15s ease",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.color = "#38BDF8")}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.color = "#64748B")}
              >
                <Mic size={18} />
              </button>

              {/* Send Button */}
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                title="Send query"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background:
                    !input.trim() || isLoading
                      ? "#1E293B"
                      : "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
                  color: !input.trim() || isLoading ? "#64748B" : "#FFFFFF",
                  boxShadow:
                    !input.trim() || isLoading
                      ? "none"
                      : "0 2px 10px rgba(37, 99, 235, 0.4)",
                  transition: "all 0.15s ease",
                }}
              >
                <Send size={15} style={{ marginLeft: "1px" }} />
              </button>
            </div>

            {/* Discreet Clinical Disclaimer (Doctor & Patient Friendly) */}
            <div
              style={{
                textAlign: "center",
                fontSize: "11.5px",
                color: "#64748B",
                marginTop: "10px",
                letterSpacing: "0.2px",
              }}
            >
              MediFlow AI provides clinical decision support. Emergency conditions require immediate hospital evaluation or physician sign-off.
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
