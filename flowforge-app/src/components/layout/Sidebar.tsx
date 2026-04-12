"use client";

import React, { useState } from "react";
import Link from "next/link";

function IconLayers({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="5" width="12" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="2" y="8" width="12" height="2" rx="0.5" fill="currentColor" opacity="0.7" />
      <rect x="2" y="11" width="12" height="2" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function IconFrame({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden="true">
      <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconAnnotation({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 3h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-2 2-2-2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="5" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconFlow({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="3" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8h3l2-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8l2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface Screen {
  id: string;
  name: string;
  active?: boolean;
  status?: 'queued' | 'processing' | 'partial' | 'done' | 'failed';
}

const STATUS_COLORS = {
  queued: "bg-[#d4d4d4]",
  processing: "bg-[#3b82f6] animate-pulse",
  partial: "bg-[#eab308]",
  done: "bg-[#22c55e]",
  failed: "bg-[#ef4444]",
};

interface SidebarProps {
  projectName?: string;
  screens?: Screen[];
  activeScreen?: string | null;
  onScreenSelect?: (id: string) => void;
}

const TOOL_NAV = [
  { id: "layers", icon: IconLayers, label: "Layers" },
  { id: "annotations", icon: IconAnnotation, label: "Annotations" },
  { id: "flows", icon: IconFlow, label: "User Flows" },
  { id: "settings", icon: IconSettings, label: "Settings" },
];

const DEMO_SCREENS: Screen[] = [
  { id: "onboarding-1", name: "Onboarding · Welcome", status: "done" },
  { id: "onboarding-2", name: "Onboarding · Setup", status: "processing" },
  { id: "dashboard", name: "Dashboard · Home", active: true, status: "done" },
  { id: "canvas", name: "Canvas · Workspace", status: "queued" },
  { id: "inspect", name: "Inspect · Panel", status: "failed" },
];

export default function Sidebar({
  projectName = "Untitled Project",
  screens = DEMO_SCREENS,
  activeScreen,
  onScreenSelect,
}: SidebarProps) {
  const [activeTool, setActiveTool] = useState("layers");
  const [collapsed, setCollapsed] = useState(false);

  const activeId = activeScreen ?? screens.find((s) => s.active)?.id;

  if (collapsed) {
    return (
      <aside className="flex flex-col items-center w-12 shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[#141414] py-3 gap-2">
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-colors text-[#888888] hover:text-[#ededed] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
          aria-label="Expand sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="w-[1px] h-3 bg-[rgba(255,255,255,0.08)] mx-auto" />
        {TOOL_NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { setActiveTool(id); setCollapsed(false); }}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
              activeTool === id
                ? "bg-[rgba(24,226,153,0.12)] text-[#18e299]"
                : "text-[#888888] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ededed]"
            }`}
            aria-label={label}
            aria-pressed={activeTool === id}
          >
            <Icon />
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside
      className="flex flex-col w-60 shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden"
      aria-label="Project sidebar"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[rgba(255,255,255,0.06)]">
        <span
          className="text-[#ededed] truncate"
          style={{ fontSize: "13px", fontWeight: 540, letterSpacing: "-0.2px" }}
        >
          {projectName}
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-colors text-[#888888] hover:text-[#ededed] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 shrink-0"
          aria-label="Collapse sidebar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Tool tabs ── */}
      <div className="flex gap-1 px-3 py-2 border-b border-[rgba(255,255,255,0.06)]">
        {TOOL_NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTool(id)}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
              activeTool === id
                ? "bg-[rgba(24,226,153,0.12)] text-[#18e299]"
                : "text-[#888888] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ededed]"
            }`}
            aria-label={label}
            aria-pressed={activeTool === id}
            title={label}
          >
            <Icon />
          </button>
        ))}
      </div>

      {/* ── Content area ── */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {activeTool === "layers" && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span
                className="text-[#888888] uppercase tracking-[0.54px]"
                style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
              >
                Screens
              </span>
              <button
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-colors text-[#888888] hover:text-[#ededed] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                aria-label="Add screen"
              >
                <IconPlus />
              </button>
            </div>

            <ul role="list" className="px-2 pb-2 flex flex-col gap-0.5">
              {screens.map((screen) => (
                <li key={screen.id}>
                  <button
                    onClick={() => onScreenSelect?.(screen.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-left transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                      activeId === screen.id
                        ? "bg-[rgba(24,226,153,0.10)] text-[#18e299]"
                        : "text-[#888888] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#ededed]"
                    }`}
                    aria-current={activeId === screen.id ? "page" : undefined}
                  >
                    <IconFrame className="shrink-0" />
                    <span
                      className="truncate flex-1"
                      style={{ fontSize: "13px", fontWeight: activeId === screen.id ? 500 : 400, letterSpacing: "-0.1px" }}
                    >
                      {screen.name}
                    </span>
                    {screen.status && (
                      <div 
                        className={`w-2 h-2 rounded-full ${STATUS_COLORS[screen.status]}`} 
                        title={`Status: ${screen.status}`}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTool === "annotations" && (
          <div className="px-4 py-6 flex flex-col items-center gap-3 text-center">
            <IconAnnotation className="text-[#888888] w-8 h-8" />
            <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.1px", color: "#888888" }}>
              Select a node on the canvas to add an annotation.
            </p>
          </div>
        )}

        {activeTool === "flows" && (
          <div className="px-4 py-6 flex flex-col items-center gap-3 text-center">
            <IconFlow className="text-[#888888] w-8 h-8" />
            <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.1px", color: "#888888" }}>
              Connect screens to build user flow maps.
            </p>
          </div>
        )}

        {activeTool === "settings" && (
          <div className="px-4 py-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                className="text-[#888888] uppercase tracking-[0.54px]"
                style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
              >
                Project
              </label>
              <input
                type="text"
                defaultValue={projectName}
                className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-[6px] px-3 py-2 text-[#ededed] text-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-[#888888] uppercase tracking-[0.54px]"
                style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
              >
                Integrations
              </label>
              <button
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[6px] bg-[#000000] text-white text-sm font-medium border border-[rgba(255,255,255,0.1)] hover:bg-[#1a1a1a] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299]"
              >
                <svg width="14" height="14" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 28.5C19 20.768 12.732 14.5 5 14.5C2.23858 14.5 0 16.7386 0 19.5V28.5H19Z" fill="#1ABCFE"/>
                  <path d="M0 47.5C0 50.2614 2.23858 52.5 5 52.5C12.732 52.5 19 46.232 19 38.5H0V47.5Z" fill="#0ACF83"/>
                  <path d="M19 0H5C2.23858 0 0 2.23858 0 5V14.5H19V0Z" fill="#F24E1E"/>
                  <path d="M19 0H33C35.7614 0 38 2.23858 38 5V14.5H19V0Z" fill="#FF7262"/>
                  <path d="M38 23.75C38 31.482 31.732 37.75 24 37.75C21.2386 37.75 19 35.5114 19 32.75V19H38V23.75Z" fill="#A259FF"/>
                </svg>
                Connect Figma
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[#888888] hover:text-[#18e299] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
          style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.1px" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M10 6H2M2 6l3-3M2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All projects
        </Link>
      </div>
    </aside>
  );
}
