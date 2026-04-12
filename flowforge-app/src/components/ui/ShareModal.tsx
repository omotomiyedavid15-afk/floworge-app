"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

type AccessLevel = "anyone" | "emails" | "team";
type Expiry = "never" | "7days" | "30days";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [access, setAccess] = useState<AccessLevel>("anyone");
  const [expiry, setExpiry] = useState<Expiry>("never");
  const [emailInput, setEmailInput] = useState("");
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");

  const shareLink = "https://flowforge.app/share/abc123xyz";

  function handleCopy() {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const expiryOptions: { id: Expiry; label: string }[] = [
    { id: "never", label: "Never" },
    { id: "7days", label: "7 days" },
    { id: "30days", label: "30 days" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share">
      <div className="flex flex-col gap-6">
        {/* Share link */}
        <div className="flex flex-col gap-2">
          <p
            className="text-[#888888] uppercase tracking-[0.54px]"
            style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
          >
            Share link
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 border border-[rgba(255,255,255,0.08)] rounded-[6px] px-3 py-2 text-sm text-[#888888] bg-[rgba(255,255,255,0.04)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.05px" }}
              aria-label="Share link"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 shrink-0 ${
                copied
                  ? "bg-[#ededed] text-[#0d0d0d] border-[#ededed]"
                  : "bg-[rgba(255,255,255,0.08)] text-[#ededed] border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)]"
              }`}
              style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
              aria-label={copied ? "Copied!" : "Copy link"}
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied!
                </span>
              ) : (
                "Copy"
              )}
            </button>
          </div>
        </div>

        {/* Access level */}
        <div className="flex flex-col gap-2">
          <p
            className="text-[#888888] uppercase tracking-[0.54px]"
            style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
          >
            Access
          </p>
          <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Access level">
            {([
              { id: "anyone" as AccessLevel, label: "Anyone with link", desc: "Anyone who has this link can view" },
              { id: "emails" as AccessLevel, label: "Specific emails", desc: "Only invited people can access" },
              { id: "team" as AccessLevel, label: "Team only", desc: "Only your workspace members" },
            ]).map(({ id, label, desc }) => (
              <label
                key={id}
                className={`flex items-start gap-3 p-3 rounded-[8px] border cursor-pointer transition-colors ${
                  access === id ? "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                    access === id ? "border-[#18e299]" : "border-[rgba(255,255,255,0.20)]"
                  }`}
                >
                  {access === id && <div className="w-1.5 h-1.5 rounded-full bg-[#18e299]" />}
                </div>
                <input
                  type="radio"
                  name="access"
                  value={id}
                  checked={access === id}
                  onChange={() => setAccess(id)}
                  className="sr-only"
                />
                <div>
                  <p
                    className="text-[#ededed]"
                    style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-[#888888] mt-0.5"
                    style={{ fontSize: "12px", fontWeight: 320, letterSpacing: "-0.05px" }}
                  >
                    {desc}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Email input (conditional) */}
          {access === "emails" && (
            <div className="flex gap-2 mt-1">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
                aria-label="Invite by email"
              />
              <Button variant="black-pill" size="sm" onClick={() => setEmailInput("")}>
                Invite
              </Button>
            </div>
          )}
        </div>

        {/* Expiry */}
        <div className="flex flex-col gap-2">
          <p
            className="text-[#888888] uppercase tracking-[0.54px]"
            style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
          >
            Link expiry
          </p>
          <div className="flex gap-1.5 p-1 bg-[rgba(255,255,255,0.06)] rounded-full" role="radiogroup" aria-label="Link expiry">
            {expiryOptions.map(({ id, label }) => (
              <button
                key={id}
                role="radio"
                aria-checked={expiry === id}
                onClick={() => setExpiry(id)}
                className={`flex-1 px-3 py-1.5 rounded-full text-center transition-all duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                  expiry === id ? "bg-[rgba(24,226,153,0.15)] text-[#18e299]" : "text-[#888888] hover:text-[#ededed]"
                }`}
                style={{ fontSize: "12px", fontWeight: expiry === id ? 540 : 330, letterSpacing: "-0.1px" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Password protection */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p
                className="text-[#ededed]"
                style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
              >
                Password protection
              </p>
              <p
                className="text-[#888888] mt-0.5"
                style={{ fontSize: "12px", fontWeight: 320, letterSpacing: "-0.05px" }}
              >
                Require a password to view
              </p>
            </div>
            <button
              role="switch"
              aria-checked={passwordEnabled}
              onClick={() => setPasswordEnabled((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                passwordEnabled ? "bg-[#18e299]" : "bg-[rgba(255,255,255,0.15)]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  passwordEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </label>
          {passwordEnabled && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set a password"
              className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.1px" }}
              aria-label="Share link password"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)]">
          <button
            className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-red-600 focus-visible:outline-offset-2"
            style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
            onClick={() => {}}
            aria-label="Revoke share link"
          >
            Revoke link
          </button>
          <Button variant="black-pill" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
