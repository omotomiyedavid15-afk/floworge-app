"use client";

import React, { useState, useEffect, useCallback } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { extractFileKey } from "@/lib/figma";

export interface ImportedFrame {
  id: string;
  name: string;
  page: string;
  imageUrl: string | null;
}

interface FetchedFrame {
  id: string;
  name: string;
  page: string;
}

type Step = "connect" | "loading" | "frames" | "importing" | "success" | "error";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (frames: ImportedFrame[]) => void;
  initialFigmaUrl?: string;
  initialFigmaToken?: string;
}

export default function ImportModal({
  isOpen,
  onClose,
  onImport,
  initialFigmaUrl = "",
  initialFigmaToken = "",
}: ImportModalProps) {
  const [step, setStep] = useState<Step>("connect");
  const [figmaUrl, setFigmaUrl] = useState(initialFigmaUrl);
  const [figmaToken, setFigmaToken] = useState(initialFigmaToken);
  const [figmaFileKey, setFigmaFileKey] = useState("");
  const [frames, setFrames] = useState<FetchedFrame[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");

  const fetchFrames = useCallback(async (url: string, token: string) => {
    const fileKey = extractFileKey(url);
    if (!fileKey) {
      setErrorMsg("Could not extract a file key from that URL. Make sure it's a valid Figma file or design link.");
      setStep("error");
      return;
    }

    setFigmaFileKey(fileKey);
    setStep("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/figma/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      setFrames(data.frames);
      setFileName(data.fileName ?? "Figma File");
      setSelected(new Set(data.frames.map((f: FetchedFrame) => f.id)));
      setStep("frames");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Failed to fetch frames from Figma.");
      setStep("error");
    }
  }, []);

  // Auto-fetch when modal opens with pre-filled URL + token
  useEffect(() => {
    if (isOpen && initialFigmaUrl && initialFigmaToken) {
      setFigmaUrl(initialFigmaUrl);
      setFigmaToken(initialFigmaToken);
      fetchFrames(initialFigmaUrl, initialFigmaToken);
    }
  }, [isOpen, initialFigmaUrl, initialFigmaToken, fetchFrames]);

  function toggleFrame(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFetch() {
    if (!figmaUrl.trim() || !figmaToken.trim()) return;
    fetchFrames(figmaUrl, figmaToken);
  }

  async function handleImport() {
    setStep("importing");
    const selectedFrames = frames.filter((f) => selected.has(f.id));

    // Fetch actual frame images from Figma
    let imageMap: Record<string, string> = {};
    try {
      const res = await fetch("/api/figma/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKey: figmaFileKey,
          nodeIds: selectedFrames.map((f) => f.id),
          token: figmaToken,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        imageMap = data.images ?? {};
      }
    } catch {
      // Images failed — frames will still import without preview images
    }

    const framesWithImages: ImportedFrame[] = selectedFrames.map((f) => ({
      ...f,
      imageUrl: imageMap[f.id] ?? null,
    }));

    setStep("success");
    onImport?.(framesWithImages);
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("connect");
      setFigmaUrl(initialFigmaUrl);
      setFigmaToken(initialFigmaToken);
      setFigmaFileKey("");
      setFrames([]);
      setSelected(new Set());
      setErrorMsg("");
    }, 300);
  }

  const selectedCount = selected.size;

  // Group frames by page
  const pageGroups = frames.reduce<Record<string, FetchedFrame[]>>((acc, f) => {
    (acc[f.page] ??= []).push(f);
    return acc;
  }, {});

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import from Figma">

      {/* ── Step: connect ── */}
      {step === "connect" && (
        <div className="flex flex-col gap-5">
          <p className="text-[#888888]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px", lineHeight: 1.6 }}>
            Enter your Figma file URL and Personal Access Token to import frames.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="im-url" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
              Figma file URL
            </label>
            <input
              id="im-url"
              type="url"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://figma.com/design/abc123/My-Design"
              className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.05px", fontFamily: "var(--font-mono, monospace)", fontSize: "12px" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="im-token" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
              Personal Access Token
            </label>
            <input
              id="im-token"
              type="password"
              value={figmaToken}
              onChange={(e) => setFigmaToken(e.target.value)}
              placeholder="figd_…"
              className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.05px", fontFamily: "var(--font-mono, monospace)", fontSize: "12px" }}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <Button variant="glass-dark" size="sm" onClick={handleClose}>Cancel</Button>
            <Button
              variant="black-pill"
              size="sm"
              onClick={handleFetch}
              disabled={!figmaUrl.trim() || !figmaToken.trim()}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Fetch Frames
            </Button>
          </div>
        </div>
      )}

      {/* ── Step: loading / importing ── */}
      {(step === "loading" || step === "importing") && (
        <div className="flex flex-col items-center gap-5 py-8">
          <div className="relative w-12 h-12">
            <svg className="animate-spin" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.10)" strokeWidth="4" />
              <path d="M24 4a20 20 0 0120 20" stroke="#18e299" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[#ededed]" style={{ fontSize: "15px", fontWeight: 450, letterSpacing: "-0.2px" }}>
              {step === "loading" ? "Connecting to Figma…" : "Fetching frame images…"}
            </p>
            <p className="text-[#888888] mt-1" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
              {step === "loading" ? "Fetching your file structure" : `Importing ${selectedCount} frame${selectedCount !== 1 ? "s" : ""} at 2× resolution`}
            </p>
          </div>
        </div>
      )}

      {/* ── Step: frames ── */}
      {step === "frames" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#ededed]" style={{ fontSize: "14px", fontWeight: 480, letterSpacing: "-0.15px" }}>
                {fileName}
              </p>
              <p className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
                {frames.length} frame{frames.length !== 1 ? "s" : ""} found — select which to import
              </p>
            </div>
            <button
              onClick={() =>
                setSelected(
                  selected.size === frames.length
                    ? new Set()
                    : new Set(frames.map((f) => f.id))
                )
              }
              className="text-[#888888] hover:text-[#ededed] transition-colors shrink-0"
              style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.1px" }}
            >
              {selected.size === frames.length ? "Deselect all" : "Select all"}
            </button>
          </div>

          <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
            {Object.entries(pageGroups).map(([page, pageFrames]) => (
              <div key={page}>
                <p
                  className="text-[#555555] mb-2 uppercase tracking-[0.54px]"
                  style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
                >
                  {page}
                </p>
                <ul className="flex flex-col gap-1" role="list">
                  {pageFrames.map((frame) => (
                    <li key={frame.id}>
                      <label
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] border cursor-pointer transition-colors ${
                          selected.has(frame.id)
                            ? "border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)]"
                            : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                        }`}
                      >
                        <div className="w-8 h-10 bg-[#1a1a1a] rounded-[3px] border border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden shrink-0">
                          <div className="h-2.5 bg-[rgba(255,255,255,0.12)]" />
                          <div className="flex-1 p-1 flex flex-col gap-0.5">
                            <div className="w-4 h-0.5 rounded-full bg-[rgba(255,255,255,0.18)]" />
                            <div className="w-5 h-0.5 rounded-full bg-[rgba(255,255,255,0.10)]" />
                          </div>
                        </div>
                        <span className="flex-1 text-[#ededed]" style={{ fontSize: "13px", fontWeight: 430, letterSpacing: "-0.1px" }}>
                          {frame.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={selected.has(frame.id)}
                          onChange={() => toggleFrame(frame.id)}
                          className="w-4 h-4 rounded-[3px] accent-[#18e299] focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299]"
                          aria-label={`Select ${frame.name}`}
                        />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-between gap-2.5 pt-1 border-t border-[rgba(255,255,255,0.06)]">
            <Button variant="glass-dark" size="sm" onClick={() => setStep("connect")}>
              Back
            </Button>
            <Button
              variant="black-pill"
              size="sm"
              onClick={handleImport}
              disabled={selectedCount === 0}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Import Selected ({selectedCount})
            </Button>
          </div>
        </div>
      )}

      {/* ── Step: error ── */}
      {step === "error" && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="9" stroke="#ef4444" strokeWidth="1.5" />
              <path d="M11 7v4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="11" cy="15" r="1" fill="#ef4444" />
            </svg>
          </div>
          <div>
            <p className="text-[#ededed]" style={{ fontSize: "15px", fontWeight: 480, letterSpacing: "-0.2px" }}>
              Could not connect to Figma
            </p>
            <p className="text-[#888888] mt-1 max-w-xs" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px", lineHeight: 1.5 }}>
              {errorMsg}
            </p>
          </div>
          <Button variant="glass-dark" size="sm" onClick={() => setStep("connect")}>
            Try again
          </Button>
        </div>
      )}

      {/* ── Step: success ── */}
      {step === "success" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {[
              { top: "0%", left: "50%", color: "#22c55e" },
              { top: "15%", left: "80%", color: "#f97316" },
              { top: "50%", left: "95%", color: "#a855f7" },
              { top: "80%", left: "75%", color: "#3b82f6" },
              { top: "85%", left: "35%", color: "#ec4899" },
              { top: "60%", left: "5%", color: "#eab308" },
              { top: "20%", left: "10%", color: "#00d084" },
            ].map((dot, i) => (
              <span
                key={i}
                className="absolute w-2 h-2 rounded-full animate-scale-in"
                style={{ top: dot.top, left: dot.left, backgroundColor: dot.color, animationDelay: `${i * 0.05}s`, transform: "translate(-50%, -50%)" }}
                aria-hidden="true"
              />
            ))}
            <div className="w-12 h-12 rounded-full bg-[#18e299] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[#ededed]" style={{ fontSize: "16px", fontWeight: 540, letterSpacing: "-0.24px" }}>
              {selectedCount} frame{selectedCount !== 1 ? "s" : ""} imported
            </p>
            <p className="text-[#888888] mt-1" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
              Your frames are ready to annotate
            </p>
          </div>
          <Button variant="black-pill" size="sm" onClick={handleClose}>
            Start annotating
          </Button>
        </div>
      )}
    </Modal>
  );
}
