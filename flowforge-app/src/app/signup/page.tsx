"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <path d="M6 1.5a4.5 4.5 0 014.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { score, label } = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email) { setError("Please enter your email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created — please log in.");
        router.push("/login");
      } else {
        router.push("/onboarding");
      }
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
          <h1 className="text-[#ededed] mb-1" style={{ fontSize: "28px", fontWeight: 400, letterSpacing: "-0.56px", lineHeight: 1.2 }}>
            Create your account
          </h1>
          <p className="text-[#888888] mb-8" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.14px" }}>
            Start annotating designs in minutes
          </p>

          {error && (
            <div className="mb-2 px-3 py-2.5 rounded-[6px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171]" style={{ fontSize: "13px", fontWeight: 330 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>Full name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" autoComplete="name" required
                className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required
                className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters" autoComplete="new-password" required
                  className="w-full border border-[rgba(255,255,255,0.10)] rounded-[6px] px-3 py-2.5 pr-10 text-sm text-[#ededed] placeholder:text-[#555555] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                  style={{ letterSpacing: "-0.1px" }}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
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

            <Button variant="black-pill" size="md" className="w-full mt-2" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Creating account...
                </span>
              ) : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[#666666]" style={{ fontSize: "12px", fontWeight: 320, lineHeight: 1.6 }}>
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-[#888888] underline underline-offset-2 hover:text-[#ededed] transition-colors">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#888888] underline underline-offset-2 hover:text-[#ededed] transition-colors">Privacy Policy</Link>
          </p>
        </div>

        <p className="mt-6 text-white/40" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.14px" }}>
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:text-white/80 transition-colors underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
