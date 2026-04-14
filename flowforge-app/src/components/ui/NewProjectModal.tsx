"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Button from "./Button";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NewProjectData {
  name: string;
  description: string;
  coverImage: string | null; // data URL
  invitees: string[];
  figmaUrl: string;
  figmaToken: string;
}

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (data: NewProjectData) => void;
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: "Details"  },
  { number: 2, label: "Team"     },
  { number: 3, label: "Figma"    },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8" role="list" aria-label="Setup steps">
      {STEPS.map((step, i) => {
        const done = step.number < current;
        const active = step.number === current;
        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2" role="listitem" aria-current={active ? "step" : undefined}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: done ? "#18e299" : active ? "#ededed" : "rgba(255,255,255,0.10)",
                  color: done ? "#0d0d0d" : active ? "#0d0d0d" : "rgba(255,255,255,0.3)",
                }}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: "11px", fontWeight: 540, fontFamily: "var(--font-mono, monospace)" }}>
                    {step.number}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: active ? 540 : 330,
                  letterSpacing: "-0.1px",
                  color: active ? "#ededed" : done ? "#ededed" : "rgba(255,255,255,0.35)",
                }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 mx-3 h-px transition-colors duration-300"
                style={{ backgroundColor: step.number < current ? "#ededed" : "rgba(255,255,255,0.10)" }}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Project Details ───────────────────────────────────────────────────

function StepDetails({
  name, setName, description, setDescription, coverImage, setCoverImage,
}: {
  name: string; setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  coverImage: string | null; setCoverImage: (v: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const COVER_PALETTES = [
    "linear-gradient(135deg, #000 0%, #444 100%)",
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2d2d2d 100%)",
    "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
    "linear-gradient(135deg, #000428 0%, #004e92 100%)",
    "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
          Cover image
        </label>

        {coverImage ? (
          <div className="relative w-full h-36 rounded-[10px] overflow-hidden group">
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 bg-[#ededed] text-[#0d0d0d] rounded-full transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-white"
                style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.1px" }}
              >
                Change
              </button>
              <button
                onClick={() => setCoverImage(null)}
                className="px-3 py-1.5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-white"
                style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.1px" }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-36 rounded-[10px] border-2 border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.02)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            role="button"
            aria-label="Upload cover image"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          >
            <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v8M4 7l4-4 4 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13h12" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.1px", color: "rgba(255,255,255,0.5)" }}>
                Drop image or click to upload
              </p>
              <p style={{ fontSize: "11px", fontWeight: 320, letterSpacing: "-0.05px", color: "rgba(255,255,255,0.3)" }}>
                PNG, JPG, GIF up to 10 MB
              </p>
            </div>
          </div>
        )}

        {/* Quick colour palettes */}
        {!coverImage && (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "11px", fontWeight: 330, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.05px" }}>
              Quick picks:
            </span>
            <div className="flex gap-1.5">
              {COVER_PALETTES.map((gradient, i) => (
                <button
                  key={i}
                  onClick={() => {
                    // Create a canvas to generate a data URL from a gradient
                    const canvas = document.createElement("canvas");
                    canvas.width = 800; canvas.height = 400;
                    const ctx = canvas.getContext("2d")!;
                    const colors = gradient.match(/#[0-9a-f]{3,8}/gi) ?? ["#000", "#444"];
                    const grad = ctx.createLinearGradient(0, 0, 800, 400);
                    grad.addColorStop(0, colors[0]);
                    grad.addColorStop(1, colors[colors.length - 1]);
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, 800, 400);
                    setCoverImage(canvas.toDataURL());
                  }}
                  className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.10)] hover:scale-110 transition-transform focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299] shrink-0"
                  style={{ background: gradient }}
                  aria-label={`Colour palette ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} aria-hidden="true" tabIndex={-1} />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="proj-name" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
          Project name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          ref={nameRef}
          id="proj-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mobile Banking App"
          className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
          style={{ letterSpacing: "-0.1px" }}
          aria-required="true"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="proj-desc" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
          Description
          <span className="ml-1.5 text-[rgba(255,255,255,0.3)]" style={{ fontSize: "11px", fontWeight: 330 }}>(optional)</span>
        </label>
        <textarea
          id="proj-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about? What problem does it solve?"
          rows={3}
          className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] resize-none transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
          style={{ letterSpacing: "-0.1px", lineHeight: 1.6 }}
        />
      </div>
    </div>
  );
}

// ── Step 2: Invite Team ───────────────────────────────────────────────────────

function StepTeam({
  invitees, setInvitees,
}: {
  invitees: string[];
  setInvitees: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function addEmail(raw: string) {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) { setError("Please enter a valid email address."); return; }
    if (invitees.includes(email)) { setError("Already added."); return; }
    setInvitees([...invitees, email]);
    setInput("");
    setError("");
  }

  function removeEmail(email: string) {
    setInvitees(invitees.filter((e) => e !== email));
  }

  const ROLE_LABELS: Record<string, string> = {};
  const [roles, setRoles] = useState<Record<string, "editor" | "viewer">>(ROLE_LABELS as Record<string, "editor" | "viewer">);

  function toggleRole(email: string) {
    setRoles((prev) => ({ ...prev, [email]: prev[email] === "viewer" ? "editor" : "viewer" }));
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[#ededed]" style={{ fontSize: "15px", fontWeight: 450, letterSpacing: "-0.25px", lineHeight: 1.3 }}>
          Invite your team
        </p>
        <p className="text-[#888888] mt-1" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
          Collaborators can view and edit annotations, flows, and feature docs.
        </p>
      </div>

      {/* Email input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-email" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
          Email address
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="invite-email"
            type="email"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmail(input); }
              if (e.key === "Backspace" && !input && invitees.length) {
                removeEmail(invitees[invitees.length - 1]);
              }
            }}
            placeholder="colleague@company.com"
            className="flex-1 border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
            style={{ letterSpacing: "-0.1px" }}
            aria-describedby={error ? "invite-error" : undefined}
          />
          <Button
            variant="black-pill"
            size="sm"
            onClick={() => addEmail(input)}
            disabled={!input.trim()}
            className="disabled:opacity-40 shrink-0"
          >
            Invite
          </Button>
        </div>
        {error && (
          <p id="invite-error" className="text-red-500" style={{ fontSize: "12px", fontWeight: 330 }}>
            {error}
          </p>
        )}
        <p className="text-[rgba(255,255,255,0.3)]" style={{ fontSize: "11px", fontWeight: 320, letterSpacing: "-0.05px" }}>
          Press Enter or comma to add multiple emails
        </p>
      </div>

      {/* Invited list */}
      {invitees.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-[#888888] uppercase tracking-[0.54px]" style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}>
            Invited ({invitees.length})
          </p>
          <ul className="flex flex-col gap-1" role="list">
            {invitees.map((email) => {
              const role = roles[email] ?? "editor";
              return (
                <li
                  key={email}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] group"
                >
                  {/* Avatar initials */}
                  <div
                    className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.10)] text-[#ededed] flex items-center justify-center shrink-0"
                    style={{ fontSize: "10px", fontWeight: 540 }}
                    aria-hidden="true"
                  >
                    {email[0].toUpperCase()}
                  </div>

                  <span
                    className="flex-1 truncate text-[#ededed]"
                    style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
                  >
                    {email}
                  </span>

                  {/* Role toggle */}
                  <button
                    onClick={() => toggleRole(email)}
                    className="shrink-0 px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.10)] text-[#888888] hover:border-[rgba(255,255,255,0.25)] hover:text-[#ededed] transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299]"
                    style={{ fontSize: "11px", fontWeight: 450, letterSpacing: "-0.05px" }}
                    aria-label={`Role: ${role}. Click to toggle.`}
                  >
                    {role}
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => removeEmail(email)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[rgba(255,255,255,0.25)] hover:text-[#ededed] hover:bg-[rgba(255,255,255,0.06)] transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299] opacity-0 group-hover:opacity-100"
                    aria-label={`Remove ${email}`}
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                      <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center border border-dashed border-[rgba(255,255,255,0.08)] rounded-[10px]">
          <div className="flex -space-x-2">
            {["A", "B", "C"].map((l, i) => (
              <div
                key={l}
                className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.08)] border-2 border-[#1a1a1a] flex items-center justify-center"
                style={{ fontSize: "11px", fontWeight: 540, color: "rgba(255,255,255,0.4)", zIndex: 3 - i }}
              >
                {l}
              </div>
            ))}
          </div>
          <p style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px", color: "rgba(255,255,255,0.4)" }}>
            No one invited yet — you can always add people later.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Import from Figma ─────────────────────────────────────────────────

function StepFigma({
  figmaUrl, setFigmaUrl, figmaToken, setFigmaToken,
}: {
  figmaUrl: string; setFigmaUrl: (v: string) => void;
  figmaToken: string; setFigmaToken: (v: string) => void;
}) {
  const [showToken, setShowToken] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [urlError, setUrlError] = useState("");
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => { urlRef.current?.focus(); }, []);

  function isFigmaUrl(url: string) {
    return url.includes("figma.com/") && (url.includes("/file/") || url.includes("/design/"));
  }

  function handleConnect() {
    if (!figmaUrl.trim()) { setUrlError("Please enter a Figma file URL."); return; }
    if (!isFigmaUrl(figmaUrl)) { setUrlError("This doesn't look like a valid Figma URL."); return; }
    if (!figmaToken.trim()) { setUrlError("Please enter your Personal Access Token."); return; }
    setUrlError("");
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1400);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[#ededed]" style={{ fontSize: "15px", fontWeight: 450, letterSpacing: "-0.25px", lineHeight: 1.3 }}>
          Connect Figma
        </p>
        <p className="text-[#888888] mt-1" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
          FlowForge will import frames and auto-generate AI annotations.
        </p>
      </div>

      {connected ? (
        /* Success state */
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="relative">
            {[
              { top: "-10%", left: "50%",  color: "#22c55e" },
              { top: "10%",  left: "90%",  color: "#3b82f6" },
              { top: "50%",  left: "100%", color: "#a855f7" },
              { top: "85%",  left: "75%",  color: "#f97316" },
              { top: "90%",  left: "25%",  color: "#ec4899" },
              { top: "50%",  left: "-5%",  color: "#eab308" },
              { top: "10%",  left: "10%",  color: "#00d084" },
            ].map((dot, i) => (
              <span
                key={i}
                className="absolute w-2 h-2 rounded-full animate-scale-in"
                style={{ top: dot.top, left: dot.left, backgroundColor: dot.color, transform: "translate(-50%, -50%)", animationDelay: `${i * 0.06}s` }}
                aria-hidden="true"
              />
            ))}
            <div className="w-16 h-16 rounded-full bg-[#18e299] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l4 4 10-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-[#ededed]" style={{ fontSize: "16px", fontWeight: 540, letterSpacing: "-0.24px" }}>
              Figma connected!
            </p>
            <p className="text-[#888888] mt-1" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
              Frames will start importing once the project is created.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Figma URL */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="figma-url" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
              Figma file URL
            </label>
            <input
              ref={urlRef}
              id="figma-url"
              type="url"
              value={figmaUrl}
              onChange={(e) => { setFigmaUrl(e.target.value); setUrlError(""); setConnected(false); }}
              placeholder="https://figma.com/design/abc123/My-Design"
              className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.1px", fontFamily: "var(--font-mono, monospace)", fontSize: "12px" }}
              aria-describedby={urlError ? "figma-error" : undefined}
            />
            {urlError && (
              <p id="figma-error" className="text-red-500" style={{ fontSize: "12px", fontWeight: 330 }}>
                {urlError}
              </p>
            )}
          </div>

          {/* Personal Access Token */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="figma-token" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
                Personal Access Token
              </label>
              <a
                href="https://www.figma.com/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299] rounded-sm"
                style={{ fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px" }}
              >
                Get token ↗
              </a>
            </div>
            <div className="relative">
              <input
                id="figma-token"
                type={showToken ? "text" : "password"}
                value={figmaToken}
                onChange={(e) => { setFigmaToken(e.target.value); setConnected(false); }}
                placeholder="figd_••••••••••••••••••••••••••••••••"
                className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 pr-10 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: showToken ? "0px" : "0px", fontFamily: "var(--font-mono, monospace)", fontSize: "12px" }}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.6)] transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299] rounded-sm"
                aria-label={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Help callout */}
            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-[rgba(255,255,255,0.04)] rounded-[8px] mt-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                <path d="M7 6.5v3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="7" cy="4.5" r="0.75" fill="rgba(255,255,255,0.4)" />
              </svg>
              <p style={{ fontSize: "11px", fontWeight: 320, letterSpacing: "-0.05px", lineHeight: 1.6, color: "rgba(255,255,255,0.5)" }}>
                Go to <strong className="font-medium">figma.com → Settings → Security</strong> and generate a Personal Access Token. FlowForge only reads your files — it never writes.
              </p>
            </div>
          </div>

          {/* Connect button */}
          <Button
            variant="black-pill"
            size="md"
            onClick={handleConnect}
            disabled={connecting || !figmaUrl.trim() || !figmaToken.trim()}
            className="w-full disabled:opacity-40"
          >
            {connecting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                  <path d="M6 1.5a4.5 4.5 0 014.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Connecting to Figma...
              </span>
            ) : "Connect Figma"}
          </Button>
        </>
      )}

      {/* Skip option */}
      <div className="text-center -mt-1">
        <p className="text-[rgba(255,255,255,0.3)]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
          You can also connect Figma later from the workspace.
        </p>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function NewProjectModal({ onClose, onCreate }: NewProjectModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [invitees, setInvitees] = useState<string[]>([]);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [figmaToken, setFigmaToken] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("ff_figma_token") ?? "") : ""
  );

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleNext() {
    if (step === 1 && !name.trim()) return;
    if (step < 3) setStep((s) => s + 1);
    else handleCreate();
  }

  function handleCreate() {
    onCreate({ name, description, coverImage, invitees, figmaUrl, figmaToken });
    onClose();
  }

  const canNext = step === 1 ? !!name.trim() : true;
  const isLastStep = step === 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
      aria-label="Create new project"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative z-10 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[16px] w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Top accent */}
        <div className="h-1 w-full gradient-hero animate-gradient" aria-hidden="true" />

        <div className="overflow-y-auto" style={{ maxHeight: "calc(92dvh - 4px)" }}>
          <div className="p-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-[#ededed]" style={{ fontSize: "22px", fontWeight: 400, letterSpacing: "-0.44px", lineHeight: 1.2 }}>
                  New project
                </h2>
                <p className="text-[#888888] mt-1" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
                  {step === 1 && "Set up your project details and cover."}
                  {step === 2 && "Invite collaborators to work with you."}
                  {step === 3 && "Connect your Figma file to import designs."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#ededed] transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299]"
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Step indicator */}
            <StepIndicator current={step} />

            {/* Step content */}
            <div className="min-h-[280px]">
              {step === 1 && (
                <StepDetails
                  name={name} setName={setName}
                  description={description} setDescription={setDescription}
                  coverImage={coverImage} setCoverImage={setCoverImage}
                />
              )}
              {step === 2 && (
                <StepTeam invitees={invitees} setInvitees={setInvitees} />
              )}
              {step === 3 && (
                <StepFigma
                  figmaUrl={figmaUrl} setFigmaUrl={setFigmaUrl}
                  figmaToken={figmaToken} setFigmaToken={setFigmaToken}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-4 border-t border-[rgba(255,255,255,0.06)]">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1.5 text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299] rounded-sm"
                  style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299] rounded-sm"
                  style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
                >
                  Cancel
                </button>
              )}

              <div className="flex items-center gap-2">
                {/* Step dots */}
                <div className="flex gap-1 mr-2" aria-hidden="true">
                  {STEPS.map((s) => (
                    <div
                      key={s.number}
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: step === s.number ? "16px" : "6px",
                        height: "6px",
                        backgroundColor: step === s.number ? "#ededed" : s.number < step ? "#ededed" : "rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                </div>

                {!isLastStep ? (
                  <Button
                    variant="black-pill"
                    size="sm"
                    onClick={handleNext}
                    disabled={!canNext}
                    className="disabled:opacity-40"
                  >
                    Continue
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="ml-1">
                      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                ) : (
                  <Button
                    variant="black-pill"
                    size="sm"
                    onClick={handleCreate}
                  >
                    Create project
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
