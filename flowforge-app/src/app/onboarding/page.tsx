"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, setUser, markOnboardingDone, isOnboardingDone, type UserRole } from "@/lib/auth";

// ── Role data ──────────────────────────────────────────────────────────────────

const ROLES: {
  id: UserRole;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  features: { title: string; description: string; icon: React.ReactNode }[];
}[] = [
  {
    id: "developer",
    label: "Developer",
    subtitle: "I build the product",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
        ),
        title: "Pixel-perfect specs",
        description: "Inspect exact spacing, typography, and color values — no more guessing from screenshots.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        ),
        title: "AI developer annotations",
        description: "Auto-generated component notes, interaction hints, and accessibility flags on every frame.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        ),
        title: "Export-ready tokens",
        description: "Copy design tokens, CSS variables, or Tailwind classes directly from any selected layer.",
      },
    ],
  },
  {
    id: "designer",
    label: "Designer",
    subtitle: "I shape the experience",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l11.5 11.5" /><circle cx="11" cy="11" r="2" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
          </svg>
        ),
        title: "Instant Figma import",
        description: "Paste your Figma link and all frames appear as an inspectable canvas within seconds.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
        title: "Contextual annotations",
        description: "Add design intent notes and rationale directly on frames so developers get the full picture.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
        title: "User flow maps",
        description: "Connect screens visually to document navigation paths and hand off complete journeys.",
      },
    ],
  },
  {
    id: "product_manager",
    label: "Product Manager",
    subtitle: "I drive the roadmap",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    features: [
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 13h6M9 17h4" />
          </svg>
        ),
        title: "Single source of truth",
        description: "One shared workspace where design, dev, and PM all reference the same up-to-date specs.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        ),
        title: "End-to-end flow visibility",
        description: "Map every user journey from entry to conversion and spot gaps before engineering kicks off.",
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
        title: "AI-powered review",
        description: "Automatically surface missing states, edge cases, and accessibility issues before dev starts.",
      },
    ],
  },
];

// ── Animated progress dots ─────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            backgroundColor: i === current ? "#18e299" : i < current ? "rgba(24,226,153,0.35)" : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOnboardingDone()) {
      router.replace("/dashboard");
      return;
    }
    const user = getUser();
    if (!user) {
      router.replace("/signup");
      return;
    }
    setVisible(true);
  }, [router]);

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role);
  }

  function handleNext() {
    if (step === 0) {
      if (!selectedRole) return;
      const user = getUser();
      if (user) setUser({ ...user, role: selectedRole });
      setStep(1);
    } else {
      markOnboardingDone();
      router.push("/dashboard");
    }
  }

  const roleData = ROLES.find((r) => r.id === selectedRole);
  const user = typeof window !== "undefined" ? getUser() : null;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  if (!visible) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <svg className="animate-spin w-6 h-6 text-[#18e299]" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="rgba(24,226,153,0.3)" strokeWidth="1.5" />
          <path d="M6 1.5a4.5 4.5 0 014.5 4.5" stroke="#18e299" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      <div className="h-[2px] w-full bg-gradient-to-r from-[#18e299] to-[#0fa76e]" aria-hidden="true" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-4 rounded-sm"
          aria-label="FlowForge home"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="8" cy="11" r="7" fill="#fff" />
            <circle cx="14" cy="11" r="7" fill="#000" stroke="#fff" strokeWidth="1.5" />
          </svg>
          <span className="text-white" style={{ fontSize: "16px", fontWeight: 540, letterSpacing: "-0.32px" }}>
            FlowForge
          </span>
        </Link>
        <StepDots current={step} total={2} />
        <button
          onClick={() => { markOnboardingDone(); router.push("/dashboard"); }}
          className="text-[#555555] hover:text-[#888888] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
          style={{ fontSize: "13px", letterSpacing: "-0.1px" }}
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* ── Step 0: Role selection ── */}
        {step === 0 && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8 animate-scale-in">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1
                className="text-[#ededed]"
                style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "-0.64px", lineHeight: 1.2 }}
              >
                Hey {firstName}, what&apos;s your role?
              </h1>
              <p className="text-[#666666]" style={{ fontSize: "15px", fontWeight: 330, letterSpacing: "-0.15px" }}>
                We&apos;ll tailor FlowForge to show you what matters most.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {ROLES.map((role) => {
                const selected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`flex flex-col items-start gap-4 p-6 rounded-[14px] border text-left transition-all duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                      selected
                        ? "border-[#18e299] bg-[rgba(24,226,153,0.06)]"
                        : "border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] hover:border-[rgba(255,255,255,0.18)] hover:bg-[#1e1e1e]"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-[10px] flex items-center justify-center transition-colors ${
                        selected ? "bg-[rgba(24,226,153,0.12)] text-[#18e299]" : "bg-[rgba(255,255,255,0.06)] text-[#888888]"
                      }`}
                    >
                      {role.icon}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`transition-colors ${selected ? "text-[#18e299]" : "text-[#ededed]"}`}
                        style={{ fontSize: "15px", fontWeight: 520, letterSpacing: "-0.2px" }}
                      >
                        {role.label}
                      </span>
                      <span className="text-[#666666]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
                        {role.subtitle}
                      </span>
                    </div>
                    {selected && (
                      <div className="ml-auto mt-auto">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <circle cx="8" cy="8" r="7" fill="#18e299" />
                          <path d="M5 8l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedRole}
              className={`flex items-center gap-2 px-7 py-3 rounded-full font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                selectedRole
                  ? "bg-[#18e299] text-black hover:bg-[#14cc8a] cursor-pointer"
                  : "bg-[rgba(255,255,255,0.06)] text-[#555555] cursor-not-allowed"
              }`}
              style={{ fontSize: "14px", fontWeight: 520, letterSpacing: "-0.14px" }}
            >
              Continue
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Step 1: Feature highlights ── */}
        {step === 1 && roleData && (
          <div className="w-full max-w-xl flex flex-col items-center gap-8 animate-scale-in">
            <div className="flex flex-col items-center gap-2 text-center">
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-[rgba(24,226,153,0.12)] text-[#18e299] mb-1"
              >
                {roleData.icon}
              </div>
              <h1
                className="text-[#ededed]"
                style={{ fontSize: "30px", fontWeight: 400, letterSpacing: "-0.6px", lineHeight: 1.2 }}
              >
                Built for {roleData.label}s
              </h1>
              <p className="text-[#666666]" style={{ fontSize: "15px", fontWeight: 330, letterSpacing: "-0.15px" }}>
                Here&apos;s how FlowForge fits into your workflow.
              </p>
            </div>

            <div className="w-full flex flex-col gap-3">
              {roleData.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-[#1a1a1a] border border-[rgba(255,255,255,0.07)] rounded-[12px] px-5 py-4"
                >
                  <div className="w-9 h-9 rounded-[8px] flex items-center justify-center bg-[rgba(24,226,153,0.08)] text-[#18e299] shrink-0 mt-0.5">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-[#ededed]"
                      style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}
                    >
                      {feature.title}
                    </span>
                    <span className="text-[#666666]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px", lineHeight: 1.5 }}>
                      {feature.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#18e299] text-black font-medium hover:bg-[#14cc8a] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ fontSize: "14px", fontWeight: 520, letterSpacing: "-0.14px" }}
              >
                Open my workspace
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => setStep(0)}
                className="text-[#555555] hover:text-[#888888] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
                style={{ fontSize: "13px", letterSpacing: "-0.1px" }}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
