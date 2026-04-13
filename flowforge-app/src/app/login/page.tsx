"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";
import { setUser, nameFromEmail } from "@/lib/auth";

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <path d="M6 1.5a4.5 4.5 0 014.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"github" | "google" | "email" | null>(null);
  const [error, setError] = useState("");

  async function handleOAuth(provider: "github" | "google") {
    setError("");
    setLoading(provider);
    await signIn(provider, { callbackUrl });
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
    setLoading("email");
    setTimeout(() => {
      setUser({ name: nameFromEmail(email), email });
      router.push(callbackUrl);
    }, 600);
  }

  const isOAuthReady =
    !!process.env.NEXT_PUBLIC_OAUTH_ENABLED ||
    typeof window !== "undefined";

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#18e299] to-[#0fa76e]" aria-hidden="true" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 mb-10 group focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-4 rounded-sm"
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
            Welcome back
          </h1>
          <p className="text-[#888888] mb-8" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.14px" }}>
            Sign in to your FlowForge account
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-[6px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171]" style={{ fontSize: "13px", fontWeight: 330 }}>
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="flex flex-col gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth("github")}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2.5 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.13)] disabled:opacity-50 disabled:cursor-not-allowed text-[#ededed] rounded-full py-2.5 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ fontSize: "14px", fontWeight: 450, letterSpacing: "-0.14px" }}
            >
              {loading === "github" ? <Spinner /> : <GitHubIcon />}
              Continue with GitHub
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2.5 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.13)] disabled:opacity-50 disabled:cursor-not-allowed text-[#ededed] rounded-full py-2.5 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ fontSize: "14px", fontWeight: 450, letterSpacing: "-0.14px" }}
            >
              {loading === "google" ? <Spinner /> : <GoogleIcon />}
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
            <span className="text-[#666666]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "0.2px" }}>
              or with email
            </span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
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

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 rounded-sm"
                  style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.1px" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            <Button variant="black-pill" size="md" className="w-full mt-1" type="submit" disabled={loading !== null}>
              {loading === "email" ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Signing in...
                </span>
              ) : "Log in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-white/40" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.14px" }}>
          {"Don't have an account? "}
          <Link
            href="/signup"
            className="text-white hover:text-white/80 transition-colors underline underline-offset-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
