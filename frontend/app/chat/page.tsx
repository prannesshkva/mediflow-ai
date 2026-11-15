"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatApi, ChatResponse, AgentTraceStep, ChatSession } from "@/lib/api";
import { WorkflowTrace } from "@/components/chat/WorkflowTrace";
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

const STORAGE_SESSIONS_KEY = "mediflow_chat_sessions_v3";
const STORAGE_MESSAGES_KEY = "mediflow_chat_messages_map_v3";

const SUGGESTED_QUERIES = [
  "I want to book an appointment with Dr. Priya Mehta tomorrow",
  "What are the clinic timings and emergency contact?",
  "I have severe chest pain and radiating arm numbness",
  "How do I get my recent lab test results?",
  "What insurance plans and TPAs do you accept?",
  "Can I reschedule my appointment to next Monday?",
];

export default function ChatPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionTab[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [sessionMessagesMap, setSessionMessagesMap] = useState<Record<string, Message[]>>({});
  const [showSessionsSidebar, setShowSessionsSidebar] = useState<boolean>(true);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [liveTrace, setLiveTrace] = useState<AgentTraceStep[]>([]);
  const [showTrace, setShowTrace] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePatientName = user?.displayName || (user as any)?.name || "Patient";

  const activeMessages: Message[] = activeSessionId ? sessionMessagesMap[activeSessionId] || [] : [];
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [activeMessages, liveTrace]);

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
        ];
        initialMap[defaultId] = [];
      }

      setSessions(initialSessions);
      setSessionMessagesMap(initialMap);
      const initialActiveId = initialSessions[0].id;
      setActiveSessionId(initialActiveId);

      // Hydrate trace if the session already has messages
      const msgs = initialMap[initialActiveId] || [];
      const lastAi = msgs.slice().reverse().find((m) => m.role === "ai" && m.trace);
      if (lastAi?.trace) {
        setLiveTrace(lastAi.trace);
      }
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
    setLiveTrace([]);
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
                rag_context_used: boolRAG(log.agent_trace),
                timestamp: new Date(log.created_at || Date.now()),
              });
            }
          });
          const newMap = { ...sessionMessagesMap, [sessionId]: loadedMsgs };
          setSessionMessagesMap(newMap);
          persistToStorage(sessions, newMap);
          if (loadedMsgs.length > 0 && loadedMsgs[loadedMsgs.length - 1].trace) {
            setLiveTrace(loadedMsgs[loadedMsgs.length - 1].trace || []);
          }
          return;
        }
      } catch (err) {
        console.error("Failed to load session history from backend:", err);
      }
    }

    const msgs = sessionMessagesMap[sessionId] || [];
    const lastAi = msgs.slice().reverse().find((m) => m.role === "ai" && m.trace);
    if (lastAi?.trace) {
      setLiveTrace(lastAi.trace);
    } else {
      setLiveTrace([]);
    }
  };

  const boolRAG = (trace?: AgentTraceStep[]) => {
    if (!trace) return false;
    const rag = trace.find((t) => t.agent.includes("RAG"));
    return rag ? true : false;
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
      setLiveTrace([]);
      persistToStorage([fallbackSession], { [fallbackId]: [] });
    } else {
      setSessions(updatedSessions);
      setSessionMessagesMap(updatedMap);
      if (activeSessionId === sessionId) {
        const nextId = updatedSessions[0].id;
        setActiveSessionId(nextId);
        const nextMsgs = updatedMap[nextId] || [];
        const lastAi = nextMsgs.slice().reverse().find((m) => m.role === "ai" && m.trace);
        setLiveTrace(lastAi?.trace || []);
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

    // 1. Build conversational history array partitioned by the active session tab
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
    setLiveTrace([]);

    const agentNames = [
      "Query Classifier",
      "Risk Evaluator",
      "RAG Retrieval",
      "Appointment Router",
      "Response Writer",
      "Validator & Circuit Breaker",
    ];

    try {
      // Send with session_id and multi-turn conversational history
      const promise = chatApi.send(
        query,
        activePatientName,
        "tenant-default",
        activeSessionId,
        conversationHistory
      );

      // Progressive simulation of agent trace while backend processes
      for (let i = 0; i < agentNames.length - 1; i++) {
        await new Promise((r) => setTimeout(r, 140));
        setLiveTrace((prev) => [
          ...prev,
          {
            agent: agentNames[i],
            status: "completed",
            output: { status: "processed" },
            duration_ms: Math.floor(Math.random() * 70) + 25,
          },
        ]);
      }

      const response = await promise;
      setLiveTrace(response.agent_trace);

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

      // Update session title (if first turn or default title) and message count
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
      console.error("API Error details:", err);
      const fallbackTrace = agentNames.map((name) => ({
        agent: name,
        status: "completed" as const,
        output: { error: err.message },
        duration_ms: Math.floor(Math.random() * 80) + 20,
      }));
      setLiveTrace(fallbackTrace);

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "ai",
        content: `### ⚠️ Connection Notice\n\nI received your query: *"${query}"*\n\nHowever, the backend service was temporarily unreachable:\n\n* **Error:** ${err.message}\n* **Details:** ${err.response?.data?.detail || "Please verify local backend service or Render deployment."}\n\nTo run locally:\n\`\`\`bash\ncd backend && uvicorn app.main:app --reload\n\`\`\``,
        intent: "general_inquiry",
        risk_level: "LOW",
        escalated: false,
        trace: fallbackTrace,
        rag_context_used: false,
        timestamp: new Date(),
      };

      const finalMsgs = [...msgsWithUser, aiMsg];
      const finalMap = { ...sessionMessagesMap, [activeSessionId]: finalMsgs };
      setSessionMessagesMap(finalMap);
      persistToStorage(sessions, finalMap);
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
    setLiveTrace([]);
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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#060A12" }}>
      
      {/* ------------------------------------------------------------- */}
      {/* 1. Left Session Tabs Sidebar (Slack / Clinical Production)    */}
      {/* ------------------------------------------------------------- */}
      {showSessionsSidebar ? (
        <div
          style={{
            width: "270px",
            minWidth: "270px",
            background: "#080D18",
            borderRight: "1px solid #1E293B",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            zIndex: 10,
          }}
        >
          {/* Sidebar Top: Header + New Session CTA */}
          <div style={{ padding: "16px 14px", borderBottom: "1px solid #1E293B" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                Consultation Tabs
              </span>
              <button
                onClick={() => setShowSessionsSidebar(false)}
                title="Collapse Session Tabs"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                  borderRadius: "4px",
                }}
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            <button
              onClick={createNewSession}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "9px 12px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                border: "none",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                transition: "all 0.15s ease",
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Consultation</span>
            </button>
          </div>

          {/* Session List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px 8px",
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: isActive ? "#111A2E" : "transparent",
                    border: isActive ? "1px solid #1E3A8A" : "1px solid transparent",
                    borderLeft: isActive ? "3px solid #38BDF8" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "#0D1424";
                      (e.currentTarget as HTMLElement).style.borderColor = "#1B283E";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                    <MessageSquare
                      size={15}
                      color={isActive ? "#38BDF8" : "#64748B"}
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "#F8FAFC" : "#94A3B8",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {sess.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        <span>{sess.messageCount} msg{sess.messageCount === 1 ? "" : "s"}</span>
                        <span>•</span>
                        <span>{new Date(sess.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteSession(sess.id, e)}
                    title="Delete session"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748B",
                      cursor: "pointer",
                      padding: "4px",
                      borderRadius: "4px",
                      opacity: isActive ? 0.9 : 0.4,
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#EF4444";
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#64748B";
                      (e.currentTarget as HTMLElement).style.opacity = isActive ? "0.9" : "0.4";
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer: Session Partition Guarantee */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid #1E293B", fontSize: "11px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
            <span>Multi-turn Memory Active</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSessionsSidebar(true)}
          title="Open Consultation Tabs"
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            zIndex: 30,
            background: "#101827",
            border: "1px solid #1E293B",
            borderRadius: "8px",
            color: "#94A3B8",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <PanelLeft size={16} />
        </button>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Conversation Stream                                  */}
      {/* ------------------------------------------------------------- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Slack-style Channel Header */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid #1E293B",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#0B101D",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #1E3A8A 0%, #0284C7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #0284C7",
                boxShadow: "0 2px 8px rgba(2, 132, 199, 0.25)",
              }}
            >
              <Activity size={20} color="#FFFFFF" strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.01em" }}>
                  {activeSession?.title || "Clinical Intelligence"}
                </span>
                <span style={{
                  fontSize: "10px",
                  padding: "2px 7px",
                  borderRadius: "5px",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#60A5FA",
                  fontWeight: 700,
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  letterSpacing: "0.5px",
                }}>
                  SESSION {activeSessionId.slice(0, 9)}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", boxShadow: "0 0 6px #10B981" }} />
                <span>Multi-turn Context Synced</span>
                <span style={{ color: "#475569" }}>•</span>
                <span>Groq <code style={{ fontSize: "11px", background: "#131E31", padding: "1px 5px", borderRadius: "4px", color: "#38BDF8" }}>openai/gpt-oss-120b</code></span>
                <span style={{ color: "#475569" }}>•</span>
                <span>Pinecone RAG</span>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "#101827",
              border: "1px solid #1E293B",
              borderRadius: "8px",
              fontSize: "12.5px",
              color: "#CBD5E1",
              fontWeight: 500,
            }}>
              <User size={14} color="#38BDF8" />
              <span>{activePatientName}</span>
            </div>

            <button
              onClick={() => setShowTrace(!showTrace)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: showTrace ? "rgba(59, 130, 246, 0.15)" : "#101827",
                border: showTrace ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid #1E293B",
                borderRadius: "8px",
                color: showTrace ? "#60A5FA" : "#94A3B8",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <ShieldCheck size={14} />
              {showTrace ? "Hide Pipeline" : "Show Pipeline"}
            </button>

            {activeMessages.length > 0 && (
              <button
                onClick={clearCurrentSessionChat}
                title="Clear Current Session"
                style={{
                  padding: "7px 10px",
                  background: "#101827",
                  border: "1px solid #1E293B",
                  borderRadius: "8px",
                  color: "#94A3B8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {activeMessages.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: "60px", maxWidth: "620px", margin: "0 auto" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                  border: "1px solid #334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Sparkles size={28} color="#38BDF8" />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#F8FAFC", marginBottom: "8px", letterSpacing: "-0.015em" }}>
                MediFlow Clinical Consultation
              </h2>
              <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: 1.6, marginBottom: "32px" }}>
                Autonomous multi-agent clinical decision support with licensed clinician oversight.
                Ask follow-up questions freely — your session conversation context is automatically preserved.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                {SUGGESTED_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: "8px 16px",
                      background: "#0D1424",
                      border: "1px solid #1E2D44",
                      borderRadius: "100px",
                      color: "#CBD5E1",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = "#141F36";
                      (e.target as HTMLElement).style.borderColor = "#38BDF8";
                      (e.target as HTMLElement).style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = "#0D1424";
                      (e.target as HTMLElement).style.borderColor = "#1E2D44";
                      (e.target as HTMLElement).style.color = "#CBD5E1";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                /* Slack-style User Message */
                <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>You ({activePatientName})</span>
                    <span style={{ fontSize: "11px", color: "#64748B" }}>{formatTime(msg.timestamp)}</span>
                  </div>
                  <div
                    style={{
                      background: "#1D2B44",
                      color: "#F8FAFC",
                      border: "1px solid #2B3D5E",
                      borderRadius: "14px 14px 3px 14px",
                      padding: "12px 18px",
                      fontSize: "14.5px",
                      lineHeight: 1.55,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* Slack/Clinical Production Assistant Message */
                <div style={{ maxWidth: "88%", width: "100%", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      background: "#0F1A2E",
                      border: "1px solid #1E2D44",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Bot size={18} color="#38BDF8" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header: Author + Badges + Timestamp */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.01em" }}>
                        MediFlow Clinical Triage
                      </span>
                      <span style={{
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "#60A5FA",
                        fontWeight: 700,
                        border: "1px solid rgba(59, 130, 246, 0.25)",
                        letterSpacing: "0.5px",
                      }}>
                        CLINICAL AGENT
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* HITL Suspension Alert Banner */}
                    {msg.hitl_status === "pending_clinician_review" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "1px solid rgba(239, 68, 68, 0.35)",
                          marginBottom: "12px",
                          boxShadow: "0 2px 10px rgba(239, 68, 68, 0.15)",
                        }}
                      >
                        <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "13px", color: "#FCA5A5", fontWeight: 700 }}>
                            🚨 HITL GATE ACTIVE — Live Agent Suspended Pending Clinician Review
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#F87171", marginTop: "2px" }}>
                            Emergency or high-risk clinical symptoms detected. Autonomous output halted. Enqueued in physician review queue.
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
                          background: "rgba(245, 158, 11, 0.1)",
                          border: "1px solid rgba(245, 158, 11, 0.25)",
                          marginBottom: "10px",
                        }}
                      >
                        <AlertTriangle size={16} color="#F59E0B" />
                        <span style={{ fontSize: "12px", color: "#FDE68A", fontWeight: 600 }}>
                          HIGH RISK — Escalated for clinical review
                        </span>
                      </div>
                    )}

                    {/* Content Card with GFM Table Support */}
                    <div
                      style={{
                        background: "#0B111E",
                        border: "1px solid #1B2639",
                        borderRadius: "12px",
                        padding: "18px 22px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      <div className="markdown-output">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Metadata Pills */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                      {msg.intent && (
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "#101B2E",
                          color: "#38BDF8",
                          border: "1px solid #1E2D44",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}>
                          {msg.intent.replace(/_/g, " ")}
                        </span>
                      )}

                      {msg.risk_level && (
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: msg.risk_level === "HIGH" ? "rgba(239, 68, 68, 0.15)" : msg.risk_level === "MEDIUM" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          color: msg.risk_level === "HIGH" ? "#F87171" : msg.risk_level === "MEDIUM" ? "#FBBF24" : "#34D399",
                          border: msg.risk_level === "HIGH" ? "1px solid rgba(239, 68, 68, 0.3)" : msg.risk_level === "MEDIUM" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                          fontWeight: 700,
                        }}>
                          {msg.risk_level} RISK
                        </span>
                      )}

                      {msg.hitl_status && (
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: msg.hitl_status === "pending_clinician_review" ? "rgba(244, 63, 94, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          color: msg.hitl_status === "pending_clinician_review" ? "#F43F5E" : "#10B981",
                          border: msg.hitl_status === "pending_clinician_review" ? "1px solid rgba(244, 63, 94, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>
                          {msg.hitl_status === "pending_clinician_review" ? (
                            <>⏳ Awaiting Sign-Off</>
                          ) : (
                            <><CheckCircle2 size={11} /> Auto-Approved</>
                          )}
                        </span>
                      )}

                      {msg.rag_context_used && (
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "#16162D",
                          color: "#A78BFA",
                          border: "1px solid #2B2353",
                          fontWeight: 600,
                        }}>
                          Pinecone RAG
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "#0F1A2E",
                  border: "1px solid #1E2D44",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Bot size={18} color="#38BDF8" />
              </div>
              <div
                style={{
                  padding: "14px 20px",
                  borderRadius: "12px",
                  background: "#0B111E",
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
                  Processing clinical pipeline with Groq <code>openai/gpt-oss-120b</code>...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar — Slack / Production SaaS Style */}
        <div
          style={{
            padding: "16px 28px 20px",
            borderTop: "1px solid #1E293B",
            background: "#0B101D",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#0F172A",
              border: "1px solid #26334D",
              borderRadius: "12px",
              padding: "6px 8px 6px 16px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
              transition: "border-color 0.2s ease",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or follow up on your previous query..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#F8FAFC",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
              autoFocus
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              style={{
                width: 38,
                height: 38,
                borderRadius: "8px",
                background: !input.trim() || isLoading ? "#1E293B" : "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
                color: !input.trim() || isLoading ? "#64748B" : "#FFFFFF",
                boxShadow: !input.trim() || isLoading ? "none" : "0 2px 8px rgba(37, 99, 235, 0.35)",
                transition: "all 0.15s ease",
              }}
            >
              <Send size={16} />
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", color: "#64748B", marginTop: "8px", padding: "0 4px" }}>
            <span>Press <kbd style={{ background: "#1E293B", padding: "1px 5px", borderRadius: "3px", color: "#94A3B8" }}>Enter ↵</kbd> to send</span>
            <span>Session: {activeSessionId} • Multi-turn Continuity Enforced</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Right Pipeline Inspection Drawer (LangGraph Agent Trace)   */}
      {/* ------------------------------------------------------------- */}
      {showTrace && (
        <div
          style={{
            width: "320px",
            minWidth: "320px",
            borderLeft: "1px solid #1E293B",
            padding: "20px 18px",
            overflowY: "auto",
            background: "#080D18",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.01em" }}>
              AI Workflow Trace
            </span>
            <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "#101B2E", color: "#38BDF8", border: "1px solid #1E2D44", fontWeight: 700 }}>
              LANGGRAPH
            </span>
          </div>

          <WorkflowTrace
            steps={isLoading ? liveTrace : (activeMessages[activeMessages.length - 1]?.trace || liveTrace)}
            isLoading={isLoading}
          />

          {!isLoading && activeMessages.length > 0 && (
            <div style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "#0D1424", border: "1px solid #1B2639", fontSize: "12px", color: "#94A3B8", lineHeight: 1.5 }}>
              Deterministic state partition: state transferred across classification, safety gate, retrieval, and response subgraphs.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
