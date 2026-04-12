"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-mono-small text-black/30">{label}</span>
      <h2 className="text-black" style={{ fontSize: "24px", fontWeight: 400, letterSpacing: "-0.48px" }}>
        {title}
      </h2>
    </div>
  );
}

function Token({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-black/[0.06] rounded-[6px] overflow-hidden">
      {children}
    </div>
  );
}

// ── Animations state ──────────────────────────────────────────────────────────

const ANIMATION_CLASSES = [
  { name: "animate-fade-in", label: "Fade in" },
  { name: "animate-fade-in-up", label: "Fade in up" },
  { name: "animate-slide-in-right", label: "Slide in right" },
  { name: "animate-slide-in-left", label: "Slide in left" },
  { name: "animate-scale-in", label: "Scale in" },
  { name: "animate-float", label: "Float" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const [animKeys, setAnimKeys] = useState<Record<string, number>>({});
  const [selectValue, setSelectValue] = useState("option1");
  const [textareaValue, setTextareaValue] = useState("Sample textarea value.\nSecond line.");
  const [inputValue, setInputValue] = useState("");

  function triggerAnimation(name: string) {
    setAnimKeys((prev) => ({ ...prev, [name]: (prev[name] ?? 0) + 1 }));
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl px-6 py-16 flex flex-col gap-20">
        {/* ── Page heading ── */}
        <div>
          <p className="text-mono-label text-black/30 mb-4">Tokens</p>
          <h1 className="text-section-heading text-black">Design System</h1>
          <p className="text-body-light text-black/40 mt-3 max-w-lg">
            FlowForge visual language — monochrome chrome, variable weights, dashed focus, pill geometry.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* COLORS */}
        {/* ══════════════════════════════════════════════════ */}
        <section aria-labelledby="colors-heading">
          <SectionHeader label="01" title="Colors" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Black */}
            <Token>
              <div className="h-24 bg-black" />
              <div className="px-3 py-2.5">
                <p style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>Black</p>
                <p className="text-black/40 font-mono mt-0.5" style={{ fontSize: "11px", letterSpacing: "0.2px" }}>#000000</p>
              </div>
            </Token>

            {/* White */}
            <Token>
              <div className="h-24 bg-white border-b border-black/[0.06]" />
              <div className="px-3 py-2.5">
                <p style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>White</p>
                <p className="text-black/40 font-mono mt-0.5" style={{ fontSize: "11px", letterSpacing: "0.2px" }}>#FFFFFF</p>
              </div>
            </Token>

            {/* Glass dark */}
            <Token>
              <div className="h-24 bg-[#f4f4f4] flex items-center justify-center">
                <div className="w-full h-full bg-[rgba(0,0,0,0.08)]" />
              </div>
              <div className="px-3 py-2.5">
                <p style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>Glass dark</p>
                <p className="text-black/40 font-mono mt-0.5" style={{ fontSize: "11px", letterSpacing: "0.2px" }}>rgba(0,0,0,0.08)</p>
              </div>
            </Token>

            {/* Glass light */}
            <Token>
              <div className="h-24 bg-black flex items-center justify-center">
                <div className="w-full h-full bg-[rgba(255,255,255,0.16)]" />
              </div>
              <div className="px-3 py-2.5 bg-black">
                <p className="text-white" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>Glass light</p>
                <p className="text-white/40 font-mono mt-0.5" style={{ fontSize: "11px", letterSpacing: "0.2px" }}>rgba(255,255,255,0.16)</p>
              </div>
            </Token>
          </div>

          {/* Gray scale */}
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {[
              { name: "50", hex: "#fafafa" },
              { name: "100", hex: "#f5f5f5" },
              { name: "200", hex: "#e5e5e5" },
              { name: "300", hex: "#d4d4d4" },
              { name: "400", hex: "#a3a3a3" },
              { name: "500", hex: "#737373" },
              { name: "600", hex: "#525252" },
              { name: "700", hex: "#404040" },
              { name: "800", hex: "#262626" },
              { name: "900", hex: "#171717" },
            ].map(({ name, hex }) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-[4px] border border-black/[0.06]"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <span
                  className="text-black/40"
                  style={{ fontSize: "9px", fontWeight: 400, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════ */}
        {/* TYPOGRAPHY */}
        {/* ══════════════════════════════════════════════════ */}
        <section aria-labelledby="typography-heading">
          <SectionHeader label="02" title="Typography" />
          <div className="flex flex-col divide-y divide-black/[0.06]">
            {[
              { className: "text-display", label: "Display", size: "86px", weight: 400, tracking: "-1.72px", sample: "Aa" },
              { className: "text-section-heading", label: "Section Heading", size: "64px", weight: 400, tracking: "-0.96px", sample: "Heading" },
              { className: "text-subheading", label: "Subheading", size: "26px", weight: 540, tracking: "-0.26px", sample: "Subheading text" },
              { className: "text-subheading-light", label: "Subheading Light", size: "26px", weight: 340, tracking: "-0.26px", sample: "Subheading light" },
              { className: "text-feature-title", label: "Feature Title", size: "24px", weight: 700, tracking: "normal", sample: "Feature title text" },
              { className: "text-body-large", label: "Body Large", size: "20px", weight: 330, tracking: "-0.14px", sample: "Body large paragraph text" },
              { className: "text-body", label: "Body", size: "16px", weight: 330, tracking: "-0.14px", sample: "Body paragraph text used throughout" },
              { className: "text-body-light", label: "Body Light", size: "18px", weight: 320, tracking: "-0.26px", sample: "Body light — softer weight" },
              { className: "text-mono-label", label: "Mono Label", size: "18px mono", weight: 400, tracking: "0.54px", sample: "MONO LABEL" },
              { className: "text-mono-small", label: "Mono Small", size: "12px mono", weight: 400, tracking: "0.6px", sample: "MONO SMALL" },
            ].map(({ className, label, size, weight, tracking, sample }) => (
              <div key={label} className="flex items-baseline gap-6 py-4">
                <div className="w-36 shrink-0 flex flex-col gap-0.5">
                  <span style={{ fontSize: "11px", fontWeight: 450, letterSpacing: "-0.05px" }}>{label}</span>
                  <span
                    className="text-black/30"
                    style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                  >
                    {size} / w{weight} / {tracking}
                  </span>
                </div>
                <span className={`${className} text-black`}>{sample}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════ */}
        {/* BUTTONS */}
        {/* ══════════════════════════════════════════════════ */}
        <section aria-labelledby="buttons-heading">
          <SectionHeader label="03" title="Buttons" />

          {/* Variants × Sizes */}
          <div className="flex flex-col gap-8">
            {/* Light bg */}
            <div className="border border-black/[0.06] rounded-[8px] p-6">
              <p
                className="text-black/30 uppercase tracking-[0.54px] mb-5"
                style={{ fontSize: "9px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
              >
                On white background
              </p>
              <div className="flex flex-col gap-5">
                {(["black-pill", "white-pill", "glass-dark"] as const).map((variant) => (
                  <div key={variant} className="flex items-center gap-3 flex-wrap">
                    <span
                      className="w-28 text-black/40 shrink-0"
                      style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "0.2px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                    >
                      {variant}
                    </span>
                    {(["sm", "md", "lg", "icon"] as const).map((size) => (
                      <Button key={size} variant={variant} size={size} aria-label={`${variant} ${size}`}>
                        {size === "icon" ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        ) : (
                          `Button ${size}`
                        )}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Dark bg */}
            <div className="bg-black rounded-[8px] p-6">
              <p
                className="text-white/30 uppercase tracking-[0.54px] mb-5"
                style={{ fontSize: "9px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
              >
                On black background
              </p>
              <div className="flex flex-col gap-5">
                {(["white-pill", "glass-light"] as const).map((variant) => (
                  <div key={variant} className="flex items-center gap-3 flex-wrap">
                    <span
                      className="w-28 text-white/30 shrink-0"
                      style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "0.2px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                    >
                      {variant}
                    </span>
                    {(["sm", "md", "lg", "icon"] as const).map((size) => (
                      <Button key={size} variant={variant} size={size} aria-label={`${variant} ${size}`}>
                        {size === "icon" ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        ) : (
                          `Button ${size}`
                        )}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Focus note */}
            <div className="flex items-center gap-3 px-4 py-3 border border-dashed border-black/30 rounded-[6px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" />
                <path d="M7 5v2.5M7 9v.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px", color: "rgba(0,0,0,0.5)" }}>
                <strong style={{ fontWeight: 540 }}>Focus state:</strong> dashed 2px outline — Tab to any button to see it
              </span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════ */}
        {/* SPACING */}
        {/* ══════════════════════════════════════════════════ */}
        <section aria-labelledby="spacing-heading">
          <SectionHeader label="04" title="Spacing Scale" />
          <div className="flex items-end gap-4 flex-wrap">
            {[
              { size: 2, label: "1px" },
              { size: 4, label: "2px" },
              { size: 8, label: "4px" },
              { size: 12, label: "6px" },
              { size: 16, label: "8px" },
              { size: 24, label: "12px" },
              { size: 32, label: "16px" },
              { size: 48, label: "24px" },
              { size: 64, label: "32px" },
              { size: 80, label: "40px" },
              { size: 96, label: "48px" },
            ].map(({ size, label }) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <div
                  className="bg-black rounded-[2px]"
                  style={{ width: `${size}px`, height: `${size}px` }}
                  aria-hidden="true"
                />
                <span
                  className="text-black/40"
                  style={{ fontSize: "9px", fontWeight: 400, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════ */}
        {/* ANIMATIONS */}
        {/* ══════════════════════════════════════════════════ */}
        <section aria-labelledby="animations-heading">
          <SectionHeader label="05" title="Animations" />
          <div className="flex flex-wrap gap-3">
            {ANIMATION_CLASSES.map(({ name, label }) => (
              <div key={name} className="flex flex-col items-center gap-3">
                <div
                  key={animKeys[name] ?? 0}
                  className={`w-16 h-16 bg-black rounded-[8px] ${animKeys[name] ? name : ""}`}
                  aria-hidden="true"
                />
                <button
                  onClick={() => triggerAnimation(name)}
                  className="px-3 py-1.5 bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.09)] text-black rounded-[50px] transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black focus-visible:outline-offset-2"
                  style={{ fontSize: "11px", fontWeight: 450, letterSpacing: "-0.05px" }}
                  aria-label={`Play ${label} animation`}
                >
                  {label}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════ */}
        {/* FORM INPUTS */}
        {/* ══════════════════════════════════════════════════ */}
        <section aria-labelledby="forms-heading">
          <SectionHeader label="06" title="Form Inputs" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {/* Text input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="demo-input"
                style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
              >
                Text input
              </label>
              <input
                id="demo-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Placeholder text"
                className="w-full border border-black/10 rounded-[6px] px-3 py-2.5 text-sm text-black placeholder:text-black/25 bg-white hover:border-black/20 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
              <span className="text-black/30" style={{ fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px" }}>
                border-black/10, rounded-[6px], px-3 py-2.5
              </span>
            </div>

            {/* Select */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="demo-select"
                style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
              >
                Select
              </label>
              <select
                id="demo-select"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                className="w-full border border-black/10 rounded-[6px] px-3 py-2.5 text-sm text-black bg-white hover:border-black/20 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black focus-visible:outline-offset-2 cursor-pointer"
                style={{ letterSpacing: "-0.1px" }}
              >
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
              <span className="text-black/30" style={{ fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px" }}>
                Same token as input
              </span>
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="demo-textarea"
                style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
              >
                Textarea
              </label>
              <textarea
                id="demo-textarea"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={4}
                className="w-full border border-black/10 rounded-[6px] px-3 py-2.5 text-sm text-black bg-white resize-none hover:border-black/20 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px", lineHeight: 1.5 }}
              />
              <span className="text-black/30" style={{ fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px" }}>
                resize-none; same token styling
              </span>
            </div>

            {/* Disabled state */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="demo-disabled"
                className="text-black/40"
                style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
              >
                Disabled input
              </label>
              <input
                id="demo-disabled"
                type="text"
                disabled
                placeholder="Disabled state"
                className="w-full border border-black/[0.06] rounded-[6px] px-3 py-2.5 text-sm text-black/30 placeholder:text-black/15 bg-[rgba(0,0,0,0.02)] cursor-not-allowed"
                style={{ letterSpacing: "-0.1px" }}
              />
            </div>

            {/* Error state */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="demo-error"
                style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
              >
                Error state
              </label>
              <input
                id="demo-error"
                type="email"
                defaultValue="invalid-email"
                className="w-full border border-red-400 rounded-[6px] px-3 py-2.5 text-sm text-black bg-white focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-red-500 focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
                aria-describedby="demo-error-msg"
                aria-invalid="true"
              />
              <span id="demo-error-msg" className="text-red-500" style={{ fontSize: "12px", fontWeight: 330 }}>
                Please enter a valid email address
              </span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════ */}
        {/* BORDER RADIUS */}
        {/* ══════════════════════════════════════════════════ */}
        <section aria-labelledby="radius-heading">
          <SectionHeader label="07" title="Border Radius" />
          <div className="flex gap-6 flex-wrap items-end">
            {[
              { token: "xs", px: "2px", radius: 2 },
              { token: "sm", px: "6px", radius: 6 },
              { token: "md", px: "8px", radius: 8 },
              { token: "lg", px: "12px", radius: 12 },
              { token: "pill", px: "50px", radius: 50 },
              { token: "circle", px: "50%", radius: 999 },
            ].map(({ token, px, radius }) => (
              <div key={token} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 bg-black border-2 border-black"
                  style={{ borderRadius: radius >= 999 ? "50%" : `${radius}px` }}
                  aria-hidden="true"
                />
                <div className="text-center">
                  <p style={{ fontSize: "11px", fontWeight: 450, letterSpacing: "-0.05px" }}>{token}</p>
                  <p className="text-black/30" style={{ fontSize: "9px", fontWeight: 400, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}>
                    {px}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-8">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between">
          <span className="text-mono-small text-black/20">FlowForge Design System</span>
          <span className="text-mono-small text-black/20">v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}
