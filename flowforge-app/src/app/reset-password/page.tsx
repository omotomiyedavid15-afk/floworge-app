"use client";

import React, { Suspense, useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

// ── OTP input (reused from verify-email) ─────────────────────────────────────

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
    if (raw.length > 1) {
      const pasted = raw.slice(0, 6);
      onChange(pasted);
      focusAt(pasted.length - 1);
      return;
    }
    const next = [...digits];
    next[i] = raw[raw.length - 1];
    onChange(next.join("").replace(/ /g, ""));
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
    <div className="flex items-center justify-center gap-2.5" role="group" aria-label="Reset code input">
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <input
            ref={(el) => { inputs.current[i] = el; }}
            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
            value={digits[i] === " " || !digits[i] ? "" : digits[i]}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={() => inputs.current[i]?.select()}
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
          type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
          value={digits[i] === " " || !digits[i] ? "" : digits[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={() => inputs.current[i]?.select()}
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

// ── Password strength ─────────────────────────────────────────────────────────

function getPasswordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return { score, label: ["", "Weak", "Fair", "Good", "Strong"][score] };
}

const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke={dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" />
      <path d="M6 1.5a4.5 4.5 0 014.5 4.5" stroke={dark ? "#0d0d0d" : "white"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const RESEND_COOLDOWN = 60;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  const { score, label } = getPasswordStrength(password);

  const handleSubmit = useCallback(async () => {
    if (code.length !== 6) { setError("Enter all 6 digits."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        if (data.error?.includes("Invalid code") || data.error?.includes("expired")) {
          setCode("");
        }
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [code, password, email, router]);

  // Auto-submit when code is complete and password is filled
  const submitRef = useRef(handleSubmit);
  submitRef.current = handleSubmit;
  useEffect(() => {
    if (code.length === 6 && password.length >= 8) {
      submitRef.current();
    }
  }, [code]);

  async function handleResend() {
    setResendLoading(true);
    setResendSuccess(false);
    setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendSuccess(true);
      setResendCooldown(RESEND_COOLDOWN);
    } catch {}
    setResendLoading(false);
  }

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#18e299] to-[#0fa76e]" aria-hidden="true" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 mb-10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-4 rounded-sm"
          aria-label="FlowForge home"
        >
          <svg width="24" height="24" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="8" cy="11" r="7" fill="#fff" />
            <circle cx="14" cy="11" r="7" fill="#000" stroke="#fff" strokeWidth="1.5" />
          </svg>
          <span className="text-white" style={{ fontSize: "17px", fontWeight: 540, letterSpacing: "-0.34px", lineHeight: 1 }}>
            FlowForge
          </span>
        </Link>

        <div className="w-full max-w-sm bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[20px] shadow-[rgba(0,0,0,0.5)_0px_8px_32px] overflow-hidden animate-scale-in">
          {success ? (
            <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[rgba(24,226,153,0.1)] border border-[rgba(24,226,153,0.2)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l5 5L19 7" stroke="#18e299" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-[#ededed]" style={{ fontSize: "18px", fontWeight: 450, letterSpacing: "-0.3px" }}>
                  Password updated
                </p>
                <p className="mt-1.5 text-[#888888]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
                  Redirecting you to login…
                </p>
              </div>
            </div>
          ) : (
            <div className="px-8 py-8">
              {/* Icon */}
              <div className="w-10 h-10 rounded-[10px] bg-[rgba(24,226,153,0.08)] border border-[rgba(24,226,153,0.15)] flex items-center justify-center mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#18e299" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h1 className="text-[#ededed] mb-1.5" style={{ fontSize: "22px", fontWeight: 400, letterSpacing: "-0.44px", lineHeight: 1.2 }}>
                Set new password
              </h1>
              <p className="text-[#888888] mb-7" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px", lineHeight: 1.6 }}>
                Enter the 6-digit code sent to{" "}
                {email ? <span className="text-[#ededed]">{email}</span> : "your email"}, then choose a new password.
              </p>

              {error && (
                <div className="mb-5 px-3 py-2.5 rounded-[6px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171]" style={{ fontSize: "13px", fontWeight: 330 }}>
                  {error}
                </div>
              )}

              <form
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                className="flex flex-col gap-6"
              >
                {/* OTP */}
                <div className="flex flex-col gap-3">
                  <label className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
                    Reset code
                  </label>
                  <OtpInput
                    value={code}
                    onChange={(v) => { setCode(v); setError(""); }}
                    disabled={loading}
                    hasError={!!error && error.toLowerCase().includes("code")}
                  />
                </div>

                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      required
                      className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 pr-10 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                      style={{ letterSpacing: "-0.1px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-0.5">
                      <div className="flex gap-1" role="progressbar" aria-valuenow={score} aria-valuemax={4} aria-label="Password strength">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{ backgroundColor: i <= score ? strengthColors[score] : "rgba(255,255,255,0.10)" }}
                          />
                        ))}
                      </div>
                      {label && (
                        <span style={{ fontSize: "11px", fontWeight: 450, letterSpacing: "0.2px", color: strengthColors[score], fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}>
                          {label}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="black-pill"
                  size="md"
                  className="w-full"
                  type="submit"
                  disabled={loading || code.length !== 6 || password.length < 8}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> Updating password…
                    </span>
                  ) : "Update password"}
                </Button>
              </form>

              {/* Resend */}
              <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] text-center">
                {resendSuccess && (
                  <p className="text-[#18e299] mb-3" style={{ fontSize: "12px", fontWeight: 330 }}>
                    New code sent — check your inbox.
                  </p>
                )}
                <p className="text-[#555555]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
                  {"Didn't receive a code? "}
                  {resendCooldown > 0 ? (
                    <span className="text-[#444444]">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="text-[#888888] hover:text-[#ededed] transition-colors underline underline-offset-2 disabled:opacity-50"
                    >
                      {resendLoading ? "Sending…" : "Resend code"}
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-white/40" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.14px" }}>
          <Link href="/login" className="text-white hover:text-white/80 transition-colors underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#18e299] to-[#0fa76e]" aria-hidden="true" />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm flex justify-center py-12">
          <Spinner />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
