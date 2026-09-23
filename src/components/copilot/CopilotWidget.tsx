"use client";

import { ArrowRight, Bot, Loader2, Send, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { CopilotMessage } from "@/lib/types";

interface CopilotWidgetProps {
  embedded?: boolean;
}

export function CopilotWidget({ embedded = false }: CopilotWidgetProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.getCopilotHistory().then(setMessages).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    // Optimistically add user message
    const tempUserMsg: CopilotMessage = {
      id: `temp-${Date.now()}`,
      sender: "operator",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: textToSend,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiClient.sendCopilotQuery(textToSend);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Why am I behind schedule?",
    "What is affecting my ETA?",
    "Show current proximity hazards",
    "What should I improve today?",
    "What is my next task?",
  ];

  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-800 bg-slate-900/95 shadow-xl ${
        embedded ? "h-[620px]" : "h-full min-h-[420px]"
      }`}
    >
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffcd11] text-slate-950 font-black shadow-md shadow-yellow-500/10">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              CAT OPERATOR COPILOT
              <span className="rounded bg-yellow-500/20 px-1.5 py-0.2 text-[9px] font-mono text-[#ffcd11] border border-yellow-500/30">
                Context-Aware AI
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Fused Telemetry • Safety Engine • Task ETA Reasoning
            </p>
          </div>
        </div>
        <Link
          href="/copilot"
          className="text-xs font-mono text-[#ffcd11] hover:underline flex items-center gap-1"
        >
          Full Hub <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "operator" ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 mb-1 px-1">
              {m.sender === "operator" ? (
                <>
                  <span>Raj Kumar (You)</span>
                  <User className="h-3 w-3 text-slate-400" />
                </>
              ) : (
                <>
                  <Bot className="h-3 w-3 text-[#ffcd11]" />
                  <span className="text-[#ffcd11] font-bold">CAT Copilot</span>
                </>
              )}
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.sender === "operator"
                  ? "bg-[#ffcd11] text-slate-950 font-medium rounded-tr-none shadow-md"
                  : "bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Referenced context card if present */}
              {m.referencedData && (
                <div className="mt-2.5 rounded-lg border border-slate-800 bg-slate-900/90 p-2 text-[11px] font-mono">
                  <div className="text-[9px] uppercase text-[#ffcd11] font-bold">
                    [REF: {m.referencedData.type}] {m.referencedData.title}
                  </div>
                  <div className="text-slate-300 mt-0.5">
                    {m.referencedData.snippet}
                  </div>
                </div>
              )}

              {/* Action buttons if present */}
              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {m.suggestedActions.map((act) => (
                    <Link
                      key={act.label}
                      href={act.payload.startsWith("/") ? act.payload : "#"}
                      onClick={() => {
                        if (!act.payload.startsWith("/")) {
                          handleSend(act.label);
                        }
                      }}
                      className="rounded bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-2.5 py-1 text-[10px] font-mono font-bold text-[#ffcd11] transition-colors flex items-center gap-1"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono py-2">
            <Loader2 className="h-4 w-4 text-[#ffcd11] animate-spin" />
            <span>Analyzing machine telemetry & safety state...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Chips */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto">
        <div className="flex space-x-1.5 text-[10px] font-mono text-slate-400 pb-1">
          <Sparkles className="h-3 w-3 text-[#ffcd11] shrink-0 self-center" />
          <span className="shrink-0">Quick Queries:</span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-slate-300 hover:border-yellow-500/50 hover:text-[#ffcd11] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask CAT Copilot about tasks, delay factors, warnings, or training..."
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#ffcd11] focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffcd11] text-slate-950 font-bold hover:bg-yellow-400 disabled:opacity-40 transition-colors shadow-md"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
