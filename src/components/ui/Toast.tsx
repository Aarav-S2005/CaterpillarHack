"use client";

import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface ToastItem {
  id: string;
  type: "error" | "success" | "warning" | "info";
  message: string;
  description?: string;
}

type ToastListener = (toasts: ToastItem[]) => void;

let listeners: ToastListener[] = [];
let memoryToasts: ToastItem[] = [];

function notify() {
  for (const listener of listeners) {
    listener([...memoryToasts]);
  }
}

export const toast = {
  error: (message: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    memoryToasts = [
      { id, type: "error", message, description },
      ...memoryToasts,
    ];
    notify();
    setTimeout(() => toast.dismiss(id), 5000);
  },
  success: (message: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    memoryToasts = [
      { id, type: "success", message, description },
      ...memoryToasts,
    ];
    notify();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  warning: (message: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    memoryToasts = [
      { id, type: "warning", message, description },
      ...memoryToasts,
    ];
    notify();
    setTimeout(() => toast.dismiss(id), 4500);
  },
  info: (message: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    memoryToasts = [
      { id, type: "info", message, description },
      ...memoryToasts,
    ];
    notify();
    setTimeout(() => toast.dismiss(id), 4000);
  },
  dismiss: (id: string) => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    notify();
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((t) => {
        const isError = t.type === "error";
        const isSuccess = t.type === "success";
        const isWarning = t.type === "warning";

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all font-mono text-xs ${
              isError
                ? "bg-rose-950/95 border-rose-500 text-rose-100 shadow-rose-950/50"
                : isSuccess
                  ? "bg-emerald-950/95 border-emerald-500 text-emerald-100 shadow-emerald-950/50"
                  : isWarning
                    ? "bg-amber-950/95 border-amber-500 text-amber-100 shadow-amber-950/50"
                    : "bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/50"
            }`}
          >
            <div className="flex items-start space-x-3">
              {isError && (
                <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              {isSuccess && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {isWarning && (
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              {!isError && !isSuccess && !isWarning && (
                <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              )}

              <div className="space-y-0.5">
                <div className="font-bold text-sm leading-tight text-white">
                  {t.message}
                </div>
                {t.description && (
                  <p className="text-xs opacity-90 leading-relaxed text-slate-300">
                    {t.description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-3 shrink-0 rounded p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
