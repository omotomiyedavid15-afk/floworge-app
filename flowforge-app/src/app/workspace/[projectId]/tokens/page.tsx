"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";

// ── Types ─────────────────────────────────────────────────────────────────────

type TokenCategory = "colors" | "spacing" | "typography" | "radius";

interface DesignToken {
  name: string;
  value: string;
}

// ── Mock token data ───────────────────────────────────────────────────────────

const TOKENS: Record<TokenCategory, DesignToken[]> = {
  colors: [
    { name: "color.primary",       value: "#3b82f6" },
    { name: "color.secondary",     value: "#a855f7" },
    { name: "color.success",       value: "#22c55e" },
    { name: "color.warning",       value: "#f97316" },
    { name: "color.error",         value: "#ef4444" },
    { name: "color.brand",         value: "#18e299" },
    { name: "color.bg.base",       value: "#0d0d0d" },
    { name: "color.bg.surface",    value: "#141414" },
    { name: "color.bg.elevated",   value: "#1a1a1a" },
    { name: "color.text.primary",  value: "#ededed" },
    { name: "color.text.muted",    value: "#888888" },
    { name: "color.text.faint",    value: "#555555" },
    { name: "color.border.subtle", value: "rgba(255,255,255,0.06)" },
    { name: "color.border.strong", value: "rgba(255,255,255,0.12)" },
    { name: "color.overlay",       value: "rgba(0,0,0,0.6)" },
  ],
  spacing: [
    { name: "spacing.0",   value: "0px"  },
    { name: "spacing.px",  value: "1px"  },
    { name: "spacing.0.5", value: "2px"  },
    { name: "spacing.1",   value: "4px"  },
    { name: "spacing.2",   value: "8px"  },
    { name: "spacing.3",   value: "12px" },
    { name: "spacing.4",   value: "16px" },
    { name: "spacing.5",   value: "20px" },
    { name: "spacing.6",   value: "24px" },
    { name: "spacing.8",   value: "32px" },
    { name: "spacing.10",  value: "40px" },
    { name: "spacing.12",  value: "48px" },
    { name: "spacing.16",  value: "64px" },
    { name: "spacing.20",  value: "80px" },
    { name: "spacing.24",  value: "96px" },
  ],
  typography: [
    { name: "font.size.xs",           value: "10px"   },
    { name: "font.size.sm",           value: "12px"   },
    { name: "font.size.base",         value: "13px"   },
    { name: "font.size.md",           value: "14px"   },
    { name: "font.size.lg",           value: "16px"   },
    { name: "font.size.xl",           value: "20px"   },
    { name: "font.size.2xl",          value: "24px"   },
    { name: "font.size.3xl",          value: "28px"   },
    { name: "font.weight.light",      value: "320"    },
    { name: "font.weight.regular",    value: "400"    },
    { name: "font.weight.medium",     value: "450"    },
    { name: "font.weight.semibold",   value: "540"    },
    { name: "font.tracking.tight",    value: "-0.2px" },
    { name: "font.tracking.normal",   value: "-0.1px" },
    { name: "font.line.snug",         value: "1.4"    },
  ],
  radius: [
    { name: "radius.none",  value: "0px"    },
    { name: "radius.xs",    value: "2px"    },
    { name: "radius.sm",    value: "3px"    },
    { name: "radius.md",    value: "4px"    },
    { name: "radius.lg",    value: "6px"    },
    { name: "radius.xl",    value: "8px"    },
    { name: "radius.2xl",   value: "10px"   },
    { name: "radius.3xl",   value: "12px"   },
    { name: "radius.4xl",   value: "14px"   },
    { name: "radius.5xl",   value: "16px"   },
    { name: "radius.card",  value: "10px"   },
    { name: "radius.modal", value: "16px"   },
    { name: "radius.pill",  value: "9999px" },
    { name: "radius.badge", value: "4px"    },
    { name: "radius.input", value: "6px"    },
  ],
};

const CATEGORY_LABELS: Record<TokenCategory, string> = {
  colors:     "Colors",
  spacing:    "Spacing",
  typography: "Typography",
  radius:     "Radius",
};

// ── Export utilities ──────────────────────────────────────────────────────────

function buildExportContent(format: string, tokens: DesignToken[]): { content: string; filename: string; mime: string } {
  if (format === "css") {
    const vars = tokens.map((t) => `  --${t.name.replace(/\./g, "-")}: ${t.value};`).join("\n");
    return { content: `:root {\n${vars}\n}\n`, filename: "tokens.css", mime: "text/css" };
  }
  if (format === "js") {
    const entries = tokens.map((t) => {
      const keys = t.name.split(".");
      return `  "${keys.join(".")}": "${t.value}"`;
    }).join(",\n");
    return { content: `export const tokens = {\n${entries}\n};\n`, filename: "tokens.js", mime: "text/javascript" };
  }
  if (format === "tailwind") {
    const entries = tokens.map((t) => `    "${t.name}": "${t.value}"`).join(",\n");
    return {
      content: `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n${entries}\n    },\n  },\n};\n`,
      filename: "tailwind.config.js",
      mime: "text/javascript",
    };
  }
  // json (default)
  const obj = { tokens: tokens.map((t) => ({ name: t.name, value: t.value, type: "unknown" })) };
  return { content: JSON.stringify(obj, null, 2), filename: "tokens.json", mime: "application/json" };
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Token row renderers ───────────────────────────────────────────────────────

function ColorRow({ token, copied, onCopy }: { token: DesignToken; copied: boolean; onCopy: () => void }) {
  const isHex = token.value.startsWith("#");
  const isRgba = token.value.startsWith("rgba");
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group cursor-pointer"
      onClick={onCopy}
    >
      <div
        className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.12)] shrink-0"
        style={{ backgroundColor: isHex || isRgba ? token.value : "transparent" }}
        aria-hidden="true"
      />
      <span
        className="text-[#ededed] flex-1"
        style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px", fontFamily: "var(--font-mono, monospace)" }}
      >
        {token.name}
      </span>
      <span
        className="text-[#888888]"
        style={{ fontSize: "11px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
      >
        {copied ? <span className="text-[#18e299]">Copied!</span> : token.value}
      </span>
    </div>
  );
}

function SpacingRow({ token, copied, onCopy }: { token: DesignToken; copied: boolean; onCopy: () => void }) {
  const px = parseInt(token.value) || 0;
  const barWidth = Math.min((px / 96) * 100, 100);
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group cursor-pointer"
      onClick={onCopy}
    >
      <div className="w-24 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-[#18e299] rounded-full"
          style={{ width: `${barWidth}%`, opacity: barWidth === 0 ? 0.2 : 1 }}
        />
      </div>
      <span
        className="text-[#ededed] flex-1"
        style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px", fontFamily: "var(--font-mono, monospace)" }}
      >
        {token.name}
      </span>
      <span
        className="text-[#888888]"
        style={{ fontSize: "11px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
      >
        {copied ? <span className="text-[#18e299]">Copied!</span> : token.value}
      </span>
    </div>
  );
}

function TypographyRow({ token, copied, onCopy }: { token: DesignToken; copied: boolean; onCopy: () => void }) {
  const isFontSize = token.name.includes("size");
  const fontSize = isFontSize ? parseInt(token.value) || 13 : 13;
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group cursor-pointer"
      onClick={onCopy}
    >
      {isFontSize ? (
        <span
          className="text-[#555555] shrink-0 w-16 text-right"
          style={{ fontSize: `${Math.min(fontSize, 18)}px` }}
          aria-hidden="true"
        >
          Aa
        </span>
      ) : (
        <div className="w-16 shrink-0" />
      )}
      <span
        className="text-[#ededed] flex-1"
        style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px", fontFamily: "var(--font-mono, monospace)" }}
      >
        {token.name}
      </span>
      <span
        className="text-[#888888]"
        style={{ fontSize: "11px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
      >
        {copied ? <span className="text-[#18e299]">Copied!</span> : token.value}
      </span>
    </div>
  );
}

function RadiusRow({ token, copied, onCopy }: { token: DesignToken; copied: boolean; onCopy: () => void }) {
  const px = Math.min(parseInt(token.value) || 0, 16);
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group cursor-pointer"
      onClick={onCopy}
    >
      <div
        className="w-5 h-5 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] shrink-0"
        style={{ borderRadius: `${px}px` }}
        aria-hidden="true"
      />
      <span
        className="text-[#ededed] flex-1"
        style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px", fontFamily: "var(--font-mono, monospace)" }}
      >
        {token.name}
      </span>
      <span
        className="text-[#888888]"
        style={{ fontSize: "11px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
      >
        {copied ? <span className="text-[#18e299]">Copied!</span> : token.value}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const EXPORT_FORMATS = [
  { id: "json",     label: "JSON",           ext: ".json" },
  { id: "css",      label: "CSS Variables",  ext: ".css"  },
  { id: "js",       label: "JavaScript",     ext: ".js"   },
  { id: "tailwind", label: "Tailwind Config", ext: ".js"  },
];

export default function TokensPage() {
  const [activeCategory, setActiveCategory] = useState<TokenCategory>("colors");
  const [exportOpen, setExportOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const tokens = TOKENS[activeCategory];
  const totalAll = Object.values(TOKENS).reduce((sum, arr) => sum + arr.length, 0);

  function handleCopyToken(name: string, value: string) {
    navigator.clipboard.writeText(name).catch(() => {});
    setCopiedToken(name);
    setTimeout(() => setCopiedToken(null), 1500);
  }

  function handleExport(format: string) {
    const allTokens = Object.values(TOKENS).flat();
    const { content, filename, mime } = buildExportContent(format, allTokens);
    downloadFile(content, filename, mime);
    setExportOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      <Sidebar projectName="Mobile Banking App" />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between h-11 px-4 bg-[#141414] border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M10 6H2M2 6l3-3M2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Dashboard
            </Link>
            <span className="text-[#555555]">/</span>
            <span className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>Design Tokens</span>
          </div>

          {/* Export dropdown */}
          <div className="relative">
            <Button variant="black-pill" size="sm" onClick={() => setExportOpen((v) => !v)} aria-expanded={exportOpen}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 2v6M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Export
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="ml-0.5">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[8px] shadow-[rgba(0,0,0,0.5)_0px_4px_16px] z-20 overflow-hidden animate-scale-in">
                  <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.06)]">
                    <p className="text-[#888888] uppercase tracking-[0.54px]" style={{ fontSize: "9px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}>
                      Export all {totalAll} tokens as
                    </p>
                  </div>
                  {EXPORT_FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => handleExport(fmt.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[rgba(255,255,255,0.06)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299]"
                    >
                      <span className="text-[#ededed]" style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.1px" }}>
                        {fmt.label}
                      </span>
                      <span className="text-[#555555]" style={{ fontSize: "11px", fontFamily: "var(--font-mono, monospace)" }}>
                        {fmt.ext}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl px-8 py-7 flex flex-col gap-6">

            {/* Stats */}
            <div className="flex gap-3 flex-wrap">
              {(Object.keys(TOKENS) as TokenCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[8px] border transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                    activeCategory === cat
                      ? "border-[rgba(24,226,153,0.25)] bg-[rgba(24,226,153,0.06)]"
                      : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.10)]"
                  }`}
                >
                  <span
                    className={activeCategory === cat ? "text-[#18e299]" : "text-[#888888]"}
                    style={{ fontSize: "11px", fontWeight: 540, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full ${activeCategory === cat ? "bg-[rgba(24,226,153,0.15)] text-[#18e299]" : "bg-[rgba(255,255,255,0.08)] text-[#888888]"}`}
                    style={{ fontSize: "10px", fontWeight: 540 }}
                  >
                    {TOKENS[cat].length}
                  </span>
                </button>
              ))}

              <div className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="5" stroke="#18e299" strokeWidth="1.2" />
                  <path d="M6 4v3M6 8h.01" stroke="#18e299" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="text-[#888888]" style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.05px" }}>
                  {totalAll} tokens total
                </span>
              </div>
            </div>

            {/* Category header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[#ededed]" style={{ fontSize: "18px", fontWeight: 400, letterSpacing: "-0.36px" }}>
                  {CATEGORY_LABELS[activeCategory]}
                </h2>
                <p className="text-[#888888] mt-0.5" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
                  {tokens.length} tokens · Click any token to copy its name
                </p>
              </div>
            </div>

            {/* Token list */}
            <div className="border border-[rgba(255,255,255,0.06)] rounded-[10px] overflow-hidden">
              {/* Column headers */}
              <div className="flex items-center gap-3 px-4 py-2 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.06)]">
                <div className={activeCategory === "spacing" ? "w-24 shrink-0" : activeCategory === "typography" ? "w-16 shrink-0" : "w-5 shrink-0"} />
                <span className="text-[#888888] uppercase tracking-[0.54px] flex-1" style={{ fontSize: "9px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}>
                  Token Name
                </span>
                <span className="text-[#888888] uppercase tracking-[0.54px]" style={{ fontSize: "9px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}>
                  Value
                </span>
              </div>

              {tokens.map((token) => {
                const isCopied = copiedToken === token.name;
                const props = { token, copied: isCopied, onCopy: () => handleCopyToken(token.name, token.value) };
                if (activeCategory === "colors")     return <ColorRow      key={token.name} {...props} />;
                if (activeCategory === "spacing")    return <SpacingRow    key={token.name} {...props} />;
                if (activeCategory === "typography") return <TypographyRow key={token.name} {...props} />;
                if (activeCategory === "radius")     return <RadiusRow     key={token.name} {...props} />;
              })}
            </div>

            {/* Token adoption callout */}
            <div className="flex items-start gap-3 px-4 py-4 bg-[rgba(24,226,153,0.04)] border border-[rgba(24,226,153,0.12)] rounded-[10px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="#18e299" strokeWidth="1.2" />
                <path d="M4.5 7l2 2 3-3" stroke="#18e299" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-[#18e299]" style={{ fontSize: "12px", fontWeight: 540, letterSpacing: "-0.1px" }}>
                  94.8% token adoption
                </p>
                <p className="text-[#888888] mt-0.5" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px", lineHeight: 1.5 }}>
                  73 of 77 annotated elements reference design tokens. 4 elements use raw values — open the annotation inspector to assign tokens.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
