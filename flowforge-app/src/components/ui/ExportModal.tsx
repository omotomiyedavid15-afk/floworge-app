"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

type Scope = "screen" | "feature" | "project";
type Format = "pdf" | "markdown" | "json";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [scope, setScope] = useState<Scope>("screen");
  const [format, setFormat] = useState<Format>("pdf");
  const [includeImages, setIncludeImages] = useState(true);
  const [includeFlows, setIncludeFlows] = useState(true);
  const [includeEdgeCases, setIncludeEdgeCases] = useState(false);
  const [exporting, setExporting] = useState(false);

  const sizeMap: Record<Scope, Record<Format, string>> = {
    screen: { pdf: "~0.8 MB", markdown: "~12 KB", json: "~24 KB" },
    feature: { pdf: "~2.4 MB", markdown: "~48 KB", json: "~96 KB" },
    project: { pdf: "~8.2 MB", markdown: "~180 KB", json: "~340 KB" },
  };

  function handleExport() {
    setExporting(true);
    setTimeout(() => {
      const scopeLabel = scopes.find((s) => s.id === scope)?.label ?? scope;
      let content = "";
      let filename = "";
      let mimeType = "text/plain";

      if (format === "json") {
        content = JSON.stringify({
          exportedAt: new Date().toISOString(),
          scope: scopeLabel,
          project: "Mobile Banking App",
          screens: ["Login Screen", "Dashboard", "Onboarding"],
          annotations: [
            { id: 1, type: "button", label: "Primary CTA", interaction: "onClick → POST /auth/login" },
            { id: 2, type: "input",  label: "Email field",  interaction: "onChange → validate" },
          ],
          ...(includeFlows && { flows: [{ from: "Welcome", to: "Onboarding", label: "click next" }] }),
          ...(includeEdgeCases && { edgeCases: ["User enters incorrect password 5 times"] }),
        }, null, 2);
        filename = "flowforge-export.json";
        mimeType = "application/json";
      } else if (format === "markdown") {
        content = [
          `# FlowForge Export — ${scopeLabel}`,
          `> Exported ${new Date().toLocaleDateString()}`,
          "",
          "## Overview",
          "**Project:** Mobile Banking App",
          "",
          "## Annotations",
          "| # | Type | Label | Interaction |",
          "|---|------|-------|-------------|",
          "| 1 | button | Primary CTA | onClick → POST /auth/login |",
          "| 2 | input | Email field | onChange → validate |",
          "",
          ...(includeFlows ? ["## User Flows", "", "Welcome → Onboarding [click next]", "Onboarding → Dashboard [submit]", ""] : []),
          ...(includeEdgeCases ? ["## Edge Cases", "", "- User enters incorrect password 5 times", ""] : []),
        ].join("\n");
        filename = "flowforge-export.md";
        mimeType = "text/markdown";
      } else {
        // PDF: generate a simple HTML page and trigger print
        const html = `<!DOCTYPE html><html><head><title>FlowForge Export</title><style>body{font-family:sans-serif;max-width:760px;margin:40px auto;color:#111}h1{font-size:28px;font-weight:400;letter-spacing:-0.5px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee}th{font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#777}</style></head><body><h1>FlowForge Export</h1><p><strong>Project:</strong> Mobile Banking App &nbsp;|&nbsp; <strong>Scope:</strong> ${scopeLabel} &nbsp;|&nbsp; <strong>Date:</strong> ${new Date().toLocaleDateString()}</p><h2>Annotations</h2><table><thead><tr><th>#</th><th>Type</th><th>Label</th><th>Interaction</th></tr></thead><tbody><tr><td>1</td><td>button</td><td>Primary CTA</td><td>onClick → POST /auth/login</td></tr><tr><td>2</td><td>input</td><td>Email field</td><td>onChange → validate</td></tr></tbody></table></body></html>`;
        const w = window.open("", "_blank");
        if (w) { w.document.write(html); w.document.close(); w.print(); }
        setExporting(false);
        onClose();
        return;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
      onClose();
    }, 900);
  }

  const scopes: { id: Scope; label: string }[] = [
    { id: "screen", label: "Current Screen" },
    { id: "feature", label: "Current Feature" },
    { id: "project", label: "Entire Project" },
  ];

  const formats: { id: Format; label: string; ext: string }[] = [
    { id: "pdf", label: "PDF", ext: ".pdf" },
    { id: "markdown", label: "Markdown", ext: ".md" },
    { id: "json", label: "JSON", ext: ".json" },
  ];

  const formatLabel = formats.find((f) => f.id === format)?.label ?? "PDF";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export">
      <div className="flex flex-col gap-6">
        {/* Scope */}
        <div className="flex flex-col gap-2">
          <p
            className="text-[#888888] uppercase tracking-[0.54px]"
            style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
          >
            Scope
          </p>
          <div className="flex gap-1.5 p-1 bg-[rgba(255,255,255,0.06)] rounded-full" role="radiogroup" aria-label="Export scope">
            {scopes.map(({ id, label }) => (
              <button
                key={id}
                role="radio"
                aria-checked={scope === id}
                onClick={() => setScope(id)}
                className={`flex-1 px-3 py-1.5 rounded-full text-center transition-all duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                  scope === id
                    ? "bg-[rgba(24,226,153,0.15)] text-[#18e299]"
                    : "text-[#888888] hover:text-[#ededed]"
                }`}
                style={{ fontSize: "12px", fontWeight: scope === id ? 540 : 330, letterSpacing: "-0.1px" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="flex flex-col gap-2">
          <p
            className="text-[#888888] uppercase tracking-[0.54px]"
            style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
          >
            Format
          </p>
          <div className="flex gap-1.5 p-1 bg-[rgba(255,255,255,0.06)] rounded-full" role="radiogroup" aria-label="Export format">
            {formats.map(({ id, label }) => (
              <button
                key={id}
                role="radio"
                aria-checked={format === id}
                onClick={() => setFormat(id)}
                className={`flex-1 px-4 py-1.5 rounded-full text-center transition-all duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                  format === id
                    ? "bg-[rgba(24,226,153,0.15)] text-[#18e299]"
                    : "text-[#888888] hover:text-[#ededed]"
                }`}
                style={{ fontSize: "13px", fontWeight: format === id ? 540 : 330, letterSpacing: "-0.1px" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          <p
            className="text-[#888888] uppercase tracking-[0.54px]"
            style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
          >
            Options
          </p>
          <div className="flex flex-col gap-2">
            {[
              { checked: includeImages, onChange: setIncludeImages, label: "Include images" },
              { checked: includeFlows, onChange: setIncludeFlows, label: "Include flow diagrams" },
              { checked: includeEdgeCases, onChange: setIncludeEdgeCases, label: "Include edge cases" },
            ].map(({ checked, onChange, label }) => (
              <label
                key={label}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center transition-colors ${
                    checked ? "bg-[#ededed] border-[#ededed]" : "border-[rgba(255,255,255,0.20)] group-hover:border-[rgba(255,255,255,0.40)]"
                  }`}
                >
                  {checked && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                      <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange(e.target.checked)}
                  className="sr-only"
                  aria-label={label}
                />
                <span
                  className="text-[#ededed]"
                  style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* File size estimate */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[rgba(255,255,255,0.04)] rounded-[8px]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2h6l3 3v7a1 1 0 01-1 1H3a1 1 0 01-1-1V2z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M8 2v3h3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span
            className="text-[#888888]"
            style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}
          >
            Estimated size:
          </span>
          <span
            className="text-[#ededed]"
            style={{ fontSize: "12px", fontWeight: 540, letterSpacing: "-0.05px" }}
          >
            {sizeMap[scope][format]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2.5">
          <Button variant="glass-dark" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="black-pill" size="sm" onClick={handleExport} disabled={exporting} className="disabled:opacity-70">
            {exporting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  <path d="M6 1.5a4.5 4.5 0 014.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Exporting...
              </span>
            ) : (
              `Export ${formatLabel}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
