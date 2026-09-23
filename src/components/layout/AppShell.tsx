"use client";

import type React from "react";
import { useState } from "react";
import { TelemetrySimulatorControls } from "../machine/TelemetrySimulatorControls";
import { Toaster } from "../ui/Toast";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [showSimulator, setShowSimulator] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col bg-[#080b10] text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <AppHeader
        onToggleSimulatorModal={() => setShowSimulator(!showSimulator)}
      />

      {/* Main Workspace Area: Sidebar + Scrollable Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto bg-industrial-grid p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>

      {/* Floating Simulation Control Overlay Drawer if active */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl">
            <TelemetrySimulatorControls
              onClose={() => setShowSimulator(false)}
              onUpdate={() => {
                // Telemetry updated
              }}
            />
          </div>
        </div>
      )}

      {/* Global Real-time Error / Status Toaster */}
      <Toaster />
    </div>
  );
}
