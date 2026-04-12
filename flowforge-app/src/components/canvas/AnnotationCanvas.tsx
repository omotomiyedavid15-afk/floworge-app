"use client";

import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Annotation {
  id: number;
  type: "button" | "input" | "nav" | "text";
  label: string;
  color: string;
  bgColor: string;
  // Position as percentage of frame (0–100)
  top: number;
  left: number;
  width: number;
  height: number;
}

interface AnnotationCanvasProps {
  selectedAnnotation: number | null;
  onAnnotationClick: (id: number) => void;
  /** Controlled list — falls back to built-in if omitted */
  annotations?: Annotation[];
  /** Zoom level in percent (default 100) */
  zoom?: number;
}

// ── Default annotation data ───────────────────────────────────────────────────

const DEFAULT_ANNOTATIONS: Annotation[] = [
  { id: 1, type: "button", label: "Primary CTA",     color: "#3b82f6", bgColor: "rgba(59,130,246,0.08)",  top: 71, left: 8, width: 84, height: 8 },
  { id: 2, type: "input",  label: "Email field",     color: "#a855f7", bgColor: "rgba(168,85,247,0.08)", top: 49, left: 8, width: 84, height: 9 },
  { id: 3, type: "input",  label: "Password field",  color: "#a855f7", bgColor: "rgba(168,85,247,0.08)", top: 60, left: 8, width: 84, height: 9 },
  { id: 4, type: "nav",    label: "Top navigation",  color: "#22c55e", bgColor: "rgba(34,197,94,0.08)",   top:  4, left: 0, width:100, height: 9 },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnnotationCanvas({
  selectedAnnotation,
  onAnnotationClick,
  annotations,
  zoom = 100,
}: AnnotationCanvasProps) {
  const list = annotations ?? DEFAULT_ANNOTATIONS;

  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: "#111111",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Frame wrapper — 375×812 at 60% scale, additionally scaled by zoom */}
      <div
        className="relative shadow-2xl"
        style={{
          width: "225px",
          height: "487px",
          transform: `scale(${zoom / 100})`,
          transformOrigin: "center center",
          transition: "transform 0.15s ease",
        }}
      >
        {/* Phone frame chrome */}
        <div className="absolute inset-0 rounded-[24px] border-2 border-black/10 pointer-events-none z-20" />

        {/* Screen content */}
        <div
          className="w-full h-full rounded-[22px] bg-white overflow-hidden flex flex-col relative"
          aria-label="Login screen mockup"
        >
          {/* Status bar */}
          <div className="h-[22px] bg-[#0d0d0d] flex items-center justify-between px-4 shrink-0">
            <span
              className="text-white"
              style={{ fontSize: "8px", fontWeight: 540, fontFamily: "var(--font-mono, monospace)" }}
            >
              9:41
            </span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded-sm border border-white/60 relative">
                <div className="absolute inset-[1px] right-[2px] bg-white/80 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col px-5 py-4 gap-0 overflow-hidden">
            {/* Logo area */}
            <div className="flex items-center gap-1.5 mb-4 mt-1">
              <div className="w-5 h-5 rounded-full bg-[#0d0d0d] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <circle cx="8" cy="11" r="7" fill="#fff" />
                  <circle cx="14" cy="11" r="7" fill="#000" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>
              <span style={{ fontSize: "9px", fontWeight: 540, letterSpacing: "-0.2px" }}>FlowForge</span>
            </div>

            <h2 style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "-0.28px", lineHeight: 1.2 }} className="mb-1">
              Welcome back
            </h2>
            <p style={{ fontSize: "8px", fontWeight: 320, letterSpacing: "-0.1px", color: "rgba(0,0,0,0.4)" }} className="mb-4">
              Sign in to your account
            </p>

            {/* Email input */}
            <div className="mb-2.5">
              <div className="w-full rounded-[4px] border border-black/15 bg-white px-2 py-1.5" style={{ fontSize: "8px", color: "rgba(0,0,0,0.3)" }}>
                Email address
              </div>
            </div>

            {/* Password input */}
            <div className="mb-3">
              <div className="w-full rounded-[4px] border border-black/15 bg-white px-2 py-1.5" style={{ fontSize: "8px", color: "rgba(0,0,0,0.3)" }}>
                Password
              </div>
            </div>

            {/* Log in button */}
            <div className="w-full rounded-[50px] bg-[#0d0d0d] text-white text-center py-2 mb-3" style={{ fontSize: "9px", fontWeight: 540, letterSpacing: "-0.1px" }}>
              Log in
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-[#0d0d0d]/[0.06]" />
              <span style={{ fontSize: "7px", color: "rgba(0,0,0,0.3)" }}>or</span>
              <div className="flex-1 h-px bg-[#0d0d0d]/[0.06]" />
            </div>

            {/* Social buttons */}
            <div className="flex flex-col gap-1.5">
              <div className="w-full rounded-[50px] bg-[rgba(0,0,0,0.05)] text-center py-1.5 text-black/60" style={{ fontSize: "8px", fontWeight: 450 }}>
                Continue with GitHub
              </div>
              <div className="w-full rounded-[50px] bg-[rgba(0,0,0,0.05)] text-center py-1.5 text-black/60" style={{ fontSize: "8px", fontWeight: 450 }}>
                Continue with Google
              </div>
            </div>
          </div>
        </div>

        {/* Annotation overlays */}
        {list.map((ann) => {
          const isSelected = selectedAnnotation === ann.id;
          return (
            <button
              key={ann.id}
              onClick={() => onAnnotationClick(ann.id)}
              className="absolute cursor-pointer transition-all duration-150 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{
                top: `${ann.top}%`,
                left: `${ann.left}%`,
                width: `${ann.width}%`,
                height: `${ann.height}%`,
                backgroundColor: ann.bgColor,
                border: `2px dashed ${ann.color}`,
                borderRadius: "3px",
                opacity: isSelected ? 1 : 0.7,
                transform: isSelected ? "scale(1.015)" : "scale(1)",
                zIndex: isSelected ? 15 : 10,
                boxShadow: isSelected ? `0 0 0 2px ${ann.color}40` : "none",
              }}
              aria-label={`Annotation ${ann.id}: ${ann.label}`}
              aria-pressed={isSelected}
            >
              {/* Number badge */}
              <span
                className="absolute -top-2.5 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
                style={{
                  backgroundColor: ann.color,
                  fontSize: "8px",
                  fontWeight: 700,
                  lineHeight: 1,
                  fontFamily: "var(--font-mono, monospace)",
                }}
                aria-hidden="true"
              >
                {ann.id}
              </span>

              {/* Type badge (on selected) */}
              {isSelected && (
                <span
                  className="absolute -bottom-4 left-0 px-1.5 py-0.5 rounded-full text-white"
                  style={{
                    backgroundColor: ann.color,
                    fontSize: "7px",
                    fontWeight: 540,
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono, monospace)",
                    whiteSpace: "nowrap",
                  }}
                  aria-hidden="true"
                >
                  {ann.type}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
