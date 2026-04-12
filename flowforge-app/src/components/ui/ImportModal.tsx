"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface Frame {
  id: string;
  name: string;
  width: number;
  height: number;
  imageUrl?: string;
}

const MOCK_FRAMES: Frame[] = [
  { id: "f1", name: "Login Screen", width: 375, height: 812, imageUrl: "https://placehold.co/750x1624/white/black?text=Login+Screen" },
  { id: "f2", name: "Dashboard", width: 375, height: 812, imageUrl: "https://placehold.co/750x1624/white/black?text=Dashboard" },
  { id: "f3", name: "Onboarding", width: 375, height: 812, imageUrl: "https://placehold.co/750x1624/white/black?text=Onboarding" },
  { id: "f4", name: "Settings", width: 375, height: 812, imageUrl: "https://placehold.co/750x1624/white/black?text=Settings" },
  { id: "f5", name: "Profile", width: 375, height: 812, imageUrl: "https://placehold.co/750x1624/white/black?text=Profile" },
];

type Step = "connect" | "frames" | "loading" | "success";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (frames: Frame[]) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [step, setStep] = useState<Step>("connect");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(["f1", "f2", "f3"]));

  function toggleFrame(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFetch() {
    if (figmaUrl.trim()) setStep("frames");
  }

  function handleImport() {
    setStep("loading");
    const selectedFrames = MOCK_FRAMES.filter(f => selected.has(f.id));
    
    setTimeout(() => {
      setStep("success");
      onImport?.(selectedFrames);
    }, 2000);
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep("connect");
      setFigmaUrl("");
      setSelected(new Set(["f1", "f2", "f3"]));
    }, 300);
  }

  const selectedCount = selected.size;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import from Figma">
      {step === "connect" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p
              className="text-[#888888]"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px", lineHeight: 1.6 }}
            >
              Paste your Figma file URL to import frames. Make sure the file is publicly viewable or you are logged in.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="figma-url"
              className="text-[#ededed]"
              style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
            >
              Figma file URL
            </label>
            <input
              id="figma-url"
              type="url"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://figma.com/file/abc123/My-Design"
              className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.1px" }}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <Button variant="glass-dark" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="black-pill"
              size="sm"
              onClick={handleFetch}
              disabled={!figmaUrl.trim()}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Fetch Frames
            </Button>
          </div>
        </div>
      )}

      {step === "frames" && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p
              className="text-[#888888]"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
            >
              Found {MOCK_FRAMES.length} frames. Select to import.
            </p>
            <button
              onClick={() =>
                setSelected(
                  selected.size === MOCK_FRAMES.length
                    ? new Set()
                    : new Set(MOCK_FRAMES.map((f) => f.id))
                )
              }
              className="text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-[#18e299] rounded-sm"
              style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.1px" }}
            >
              {selected.size === MOCK_FRAMES.length ? "Deselect all" : "Select all"}
            </button>
          </div>

          <ul className="flex flex-col gap-1.5" role="list">
            {MOCK_FRAMES.map((frame) => (
              <li key={frame.id}>
                <label
                  className={`flex items-center gap-3 p-3 rounded-[8px] border cursor-pointer transition-colors ${
                    selected.has(frame.id)
                      ? "border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.04)]"
                      : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-[54px] bg-[#1a1a1a] rounded-[4px] border border-[rgba(255,255,255,0.08)] flex flex-col overflow-hidden shrink-0">
                    <div className="h-3 bg-[rgba(255,255,255,0.15)]" />
                    <div className="flex-1 p-1 flex flex-col gap-0.5">
                      <div className="w-5 h-0.5 rounded-full bg-[rgba(255,255,255,0.20)]" />
                      <div className="w-7 h-0.5 rounded-full bg-[rgba(255,255,255,0.10)]" />
                      <div className="mt-auto w-full h-2 rounded-sm bg-[rgba(255,255,255,0.15)]" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[#ededed]"
                      style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
                    >
                      {frame.name}
                    </p>
                    <p
                      className="text-[#555555]"
                      style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                    >
                      {frame.width}×{frame.height}
                    </p>
                  </div>

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

          <div className="flex justify-end gap-2.5 pt-1">
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

      {step === "loading" && (
        <div className="flex flex-col items-center gap-5 py-8">
          {/* Spinner */}
          <div className="relative w-12 h-12">
            <svg
              className="animate-spin"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.10)" strokeWidth="4" />
              <path d="M24 4a20 20 0 0120 20" stroke="#18e299" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p
              className="text-[#ededed]"
              style={{ fontSize: "15px", fontWeight: 450, letterSpacing: "-0.2px" }}
            >
              Importing frames...
            </p>
            <p
              className="text-[#888888] mt-1"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
            >
              Fetching {selectedCount} frame{selectedCount !== 1 ? "s" : ""} from Figma
            </p>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center gap-5 py-6">
          {/* Confetti dots */}
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
                style={{
                  top: dot.top,
                  left: dot.left,
                  backgroundColor: dot.color,
                  animationDelay: `${i * 0.05}s`,
                  transform: "translate(-50%, -50%)",
                }}
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
            <p
              className="text-[#ededed]"
              style={{ fontSize: "16px", fontWeight: 540, letterSpacing: "-0.24px" }}
            >
              {selectedCount} frames imported
            </p>
            <p
              className="text-[#888888] mt-1"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
            >
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
