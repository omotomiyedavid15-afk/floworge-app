"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// ── OTP input ─────────────────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  function focusAt(i: number) {
    inputs.current[Math.max(0, Math.min(5, i))]?.focus();
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;

    // Handle paste of full code
    if (raw.length > 1) {
      const pasted = raw.slice(0, 6);
      onChange(pasted);
      focusAt(pasted.length - 1);
      return;
    }

    const next = [...digits];
    next[i] = raw[raw.length - 1];
    const joined = next.join("").replace(/ /g, "");
    onChange(joined);
    if (i < 5) focusAt(i + 1);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i] && next[i] !== " ") {
        next[i] = "";
        onChange(next.join("").trimEnd());
      } else if (i > 0) {
        next[i - 1] = "";
        onChange(next.join("").trimEnd());
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      focusAt(i + 1);
    }
  }

  function handleFocus(i: number) {
    inputs.current[i]?.select();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      focusAt(Math.min(pasted.length, 5));
    }
  }

  const borderColor = hasError
    ? "border-[rgba(239,68,68,0.5)] focus:border-[#f87171]"
    : "border-[rgba(255,255,255,0.10)] focus:border-[#18e299]";

  return (
    <div className="flex items-center justify-center gap-2.5" aria-label="Verification code input" role="group">
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <input
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i] === " " || !digits[i] ? "" : digits[i]}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={() => handleFocus(i)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            className={`w-12 h-14 text-center rounded-[10px] border bg-[#111111] text-[#ededed] transition-all duration-150 outline-none disabled:opacity-50 ${borderColor}`}
            style={{ fontSize: "22px", fontWeight: 600, fontFamily: "var(--font-jetbrains-mono, monospace)", caretColor: "transparent" }}
          />
          {i === 2 && (
            <span className="text-[#333333] select-none" style={{ fontSize: "18px", marginBottom: "2px" }}>·</span>
          )}
        </React.Fragment>
      ))}
      {[3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] === " " || !digits[i] ? "" : digits[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={() => handleFocus(i)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className={`w-12 h-14 text-center rounded-[10px] border bg-[#111111] text-[#ededed] transition-all duration-150 outline-none disabled:opacity-50 ${borderColor}`}
          style={{ fontSize: "22px", fontWeight: 600, fontFamily: "var(--font-jetbrains-mono, monospace)", caretColor: "transparent" }}
        />
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const RESEND_COOLDOWN = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Auto-submit when all 6 digits are filled
  const submitRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (code.length === 6 && submitRef.current) {
      submitRef.current();
    }
  }, [code]);

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) { setError("Enter all 6 digits."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid code.");
        setCode("");
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/onboarding"), 1500);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [code, email, router]);

  submitRef.current = handleVerify;

  async function handleResend() {
    setResendLoading(true);
    setResendSuccess(false);
    setError("");
    try {
      await fetch("/api/auth/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendSuccess(true);
      setResendCooldown(RESEND_COOLDOWN);
    } catch {}
    setResendLoading(false);
  }

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* Accent bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#18e299] to-[#0fa76e]" aria-hidden="true" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 mb-10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-4 rounded-sm"
          aria-label="FlowForge home"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="8" cy="11" r="7" fill="#ededed" />
            <circle cx="14" cy="11" r="7" fill="#0d0d0d" stroke="#ededed" strokeWidth="1.5" />
          </svg>
          <span className="text-white" style={{ fontSize: "17px", fontWeight: 540, letterSpacing: "-0.34px", lineHeight: 1 }}>
            FlowForge
          </span>
        </Link>

        {/* Card */}
        <div
          className="w-full max-w-sm bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[20px] shadow-[rgba(0,0,0,0.5)_0px_8px_32px] overflow-hidden animate-scale-in"
          role="main"
        >
          {success ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[rgba(24,226,153,0.1)] border border-[rgba(24,226,153,0.2)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l5 5L19 7" stroke="#18e299" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-[#ededed]" style={{ fontSize: "18px", fontWeight: 450, letterSpacing: "-0.3px" }}>
                  Email verified
                </p>
                <p className="mt-1.5 text-[#888888]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
                  Redirecting you to setup…
                </p>
              </div>
            </div>
          ) : (
            /* ── Code entry ── */
            <div className="px-8 py-8">
              {/* Icon */}
              <div className="w-10 h-10 rounded-[10px] bg-[rgba(24,226,153,0.08)] border border-[rgba(24,226,153,0.15)] flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#18e299" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h1 className="text-[#ededed] mb-1.5" style={{ fontSize: "22px", fontWeight: 400, letterSpacing: "-0.44px", lineHeight: 1.2 }}>
                Check your email
              </h1>
              <p className="text-[#888888] mb-7" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px", lineHeight: 1.6 }}>
                We sent a 6-digit code to{" "}
                {email ? (
                  <span className="text-[#ededed]">{email}</span>
                ) : (
                  "your email address"
                )}
                . Enter it below to verify your account.
              </p>

              <form
                onSubmit={(e) => { e.preventDefault(); handleVerify(); }}
                className="flex flex-col gap-6"
              >
                <OtpInput
                  value={code}
                  onChange={(v) => { setCode(v); setError(""); }}
                  disabled={loading}
                  hasError={!!error}
                />

                {error && (
                  <p className="text-center text-[#f87171]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.05px", marginTop: "-8px" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-2.5 rounded-full bg-[#ededed] text-[#0d0d0d] font-[500] hover:opacity-90 transition-opacity disabled:opacity-40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                  style={{ fontSize: "15px", letterSpacing: "-0.15px" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <circle cx="6" cy="6" r="4.5" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                        <path d="M6 1.5a4.5 4.5 0 014.5 4.5" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Verifying…
                    </span>
                  ) : "Verify email"}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] text-center">
                {resendSuccess && (
                  <p className="text-[#18e299] mb-3" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
                    New code sent — check your inbox.
                  </p>
                )}
                <p className="text-[#555555]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
                  {"Didn't receive it? "}
                  {resendCooldown > 0 ? (
                    <span className="text-[#444444]">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="text-[#888888] hover:text-[#ededed] transition-colors underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm disabled:opacity-50"
                    >
                      {resendLoading ? "Sending…" : "Resend code"}
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-[#444444]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
          <Link href="/login" className="hover:text-[#888888] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
