"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <path d="M6 1.5a4.5 4.5 0 014.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/reset-password?email=${encodeURIComponent(email.toLowerCase().trim())}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

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

        <div className="w-full max-w-sm bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 shadow-[rgba(0,0,0,0.5)_0px_8px_32px] animate-scale-in">
          {/* Icon */}
          <div className="w-10 h-10 rounded-[10px] bg-[rgba(24,226,153,0.08)] border border-[rgba(24,226,153,0.15)] flex items-center justify-center mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#18e299" strokeWidth="1.5" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="#18e299" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-[#ededed] mb-1" style={{ fontSize: "24px", fontWeight: 400, letterSpacing: "-0.48px", lineHeight: 1.2 }}>
            Forgot your password?
          </h1>
          <p className="text-[#888888] mb-8" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.14px", lineHeight: 1.6 }}>
            Enter your email and we&apos;ll send you a 6-digit code to reset your password.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-[6px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171]" style={{ fontSize: "13px", fontWeight: 330 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
            </div>

            <Button variant="black-pill" size="md" className="w-full mt-1" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Sending code...
                </span>
              ) : "Send reset code"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-white/40" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.14px" }}>
          <Link
            href="/login"
            className="text-white hover:text-white/80 transition-colors underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
