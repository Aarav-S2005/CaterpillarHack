"use client";

import {
  Activity,
  AlertOctagon,
  BarChart3,
  Bot,
  CheckSquare,
  Cpu,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    category: "OPERATIONS & TELEMETRY",
    items: [
      { name: "Command Center", href: "/", icon: LayoutDashboard, badge: null },
      {
        name: "Daily Tasks",
        href: "/tasks",
        icon: CheckSquare,
        badge: "3 Active",
      },
      { name: "Live Machine", href: "/machine", icon: Gauge, badge: "Live" },
    ],
  },
  {
    category: "SAFETY & COMPLIANCE",
    items: [
      {
        name: "Safety Center",
        href: "/safety",
        icon: ShieldAlert,
        badge: "Envelope",
      },
      {
        name: "Incident Log",
        href: "/safety/incidents",
        icon: AlertOctagon,
        badge: "1 Open",
      },
    ],
  },
  {
    category: "INTELLIGENCE & PREDICTIONS",
    items: [
      {
        name: "Behavior & Patterns",
        href: "/behavior",
        icon: Activity,
        badge: "+89% Idle",
      },
      {
        name: "ETA & Predictions",
        href: "/predictions",
        icon: TrendingUp,
        badge: "+18m Delay",
      },
      {
        name: "What-If Simulator",
        href: "/simulator",
        icon: Sparkles,
        badge: "Novelty",
      },
    ],
  },
  {
    category: "OPERATOR & LEARNING",
    items: [
      {
        name: "Operator Digital Twin",
        href: "/operator",
        icon: UserCheck,
        badge: "Score 94",
      },
      {
        name: "Training Hub",
        href: "/training",
        icon: GraduationCap,
        badge: "1 Recom",
      },
      { name: "AI Copilot", href: "/copilot", icon: Bot, badge: "AI" },
    ],
  },
  {
    category: "SITE & SYSTEM",
    items: [
      {
        name: "Site Intelligence",
        href: "/site",
        icon: MapPin,
        badge: "4 Units",
      },
      {
        name: "Analytics & Fleet",
        href: "/analytics",
        icon: BarChart3,
        badge: null,
      },
      {
        name: "System Settings",
        href: "/settings",
        icon: Settings,
        badge: null,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-[#0a0d14] flex flex-col justify-between overflow-y-auto">
      <div className="p-4 space-y-6">
        {navigationItems.map((group) => (
          <div key={group.category} className="space-y-1.5">
            <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {group.category}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "bg-yellow-500/10 text-[#ffcd11] border border-yellow-500/30 font-bold shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          active
                            ? "text-[#ffcd11]"
                            : "text-slate-400 group-hover:text-slate-300"
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                          active
                            ? "bg-yellow-500/20 text-[#ffcd11]"
                            : item.badge.includes("Open") ||
                                item.badge.includes("Delay")
                              ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                              : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Closed-Loop Learning Status Footnote */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 m-2 rounded-xl">
        <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-300">
          <Cpu className="h-3.5 w-3.5 text-[#ffcd11] animate-spin" />
          <span>Adaptive Loop: Active</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400 leading-tight">
          Observing telemetry & worker vectors. RL intervention policy operating
          in safe envelope.
        </p>
      </div>
    </aside>
  );
}
