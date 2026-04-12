"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  cta: string;
  ctaVariant: "black-pill" | "white-pill" | "glass-dark";
  highlighted: boolean;
  features: string[];
}

// ── Plans ─────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Perfect for solo designers",
    cta: "Get started free",
    ctaVariant: "white-pill",
    highlighted: false,
    features: [
      "3 projects",
      "Up to 10 screens per project",
      "AI annotations (50/mo)",
      "PDF export",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "per month",
    tagline: "Best for power users",
    cta: "Start with Pro",
    ctaVariant: "black-pill",
    highlighted: true,
    features: [
      "Unlimited projects",
      "Unlimited screens",
      "AI annotations (unlimited)",
      "PDF, Markdown & JSON export",
      "User flow editor",
      "Share with public link",
      "Figma plugin access",
      "Priority support",
      "Custom annotation types",
      "Version history (30 days)",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$49",
    period: "per seat / month",
    tagline: "For design & dev teams",
    cta: "Contact us",
    ctaVariant: "glass-dark",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Team workspaces",
      "Role-based access control",
      "SSO / SAML",
      "Audit logs",
      "SLA & uptime guarantee",
      "Dedicated onboarding",
      "Custom integrations",
      "Invoice billing",
    ],
  },
];

// ── Comparison table ──────────────────────────────────────────────────────────

const COMPARISON_FEATURES: { feature: string; free: string | boolean; pro: string | boolean; team: string | boolean }[] = [
  { feature: "Projects", free: "3", pro: "Unlimited", team: "Unlimited" },
  { feature: "Screens per project", free: "10", pro: "Unlimited", team: "Unlimited" },
  { feature: "AI annotations", free: "50/mo", pro: "Unlimited", team: "Unlimited" },
  { feature: "Team members", free: "1", pro: "1", team: "Unlimited" },
  { feature: "Export formats", free: "PDF", pro: "PDF, MD, JSON", team: "PDF, MD, JSON" },
  { feature: "User flow editor", free: false, pro: true, team: true },
  { feature: "Figma plugin", free: false, pro: true, team: true },
  { feature: "Public sharing", free: false, pro: true, team: true },
  { feature: "SSO / SAML", free: false, pro: false, team: true },
  { feature: "Audit logs", free: false, pro: false, team: true },
  { feature: "SLA", free: false, pro: false, team: true },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Can I try Pro before paying?",
    a: "Yes — every new account gets a 14-day Pro trial, no credit card required. Your work is preserved when you downgrade or upgrade.",
  },
  {
    q: "How does the AI annotation limit work?",
    a: "Each time AI generates annotations for a screen, it uses one credit. On Free you get 50 per month; on Pro it's unlimited.",
  },
  {
    q: "What does the Figma plugin do?",
    a: "It lets you import frames directly from an open Figma file without needing to copy/paste file URLs — a significantly faster workflow.",
  },
  {
    q: "Can I export to custom formats?",
    a: "Pro supports PDF, Markdown, and JSON. If you need a custom format, reach out — Team plans can include custom export pipelines.",
  },
  {
    q: "What happens when I hit the screen limit on Free?",
    a: "You can still view existing screens but won't be able to import new ones until you upgrade or remove older screens.",
  },
  {
    q: "Is there a discount for annual billing?",
    a: "Yes — annual billing saves 20% (effectively 2 months free). Switch to annual in your billing settings at any time.",
  },
];

// ── Check icon ────────────────────────────────────────────────────────────────

function Check({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7l3 3 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3l6 6M9 3l-6 6" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex flex-col">
        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center px-6 pt-20 pb-16">
          <p className="text-mono-label text-black/30 mb-5">Pricing</p>
          <h1 className="text-section-heading text-black max-w-2xl">
            Simple, transparent pricing
          </h1>
          <p
            className="mt-4 text-black/50 max-w-md"
            style={{ fontSize: "18px", fontWeight: 330, letterSpacing: "-0.26px", lineHeight: 1.5 }}
          >
            Start free. Scale as your team grows. No hidden fees, no per-seat surprises on Free.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex items-center gap-1 p-1 bg-[rgba(0,0,0,0.04)] rounded-[50px]" role="radiogroup" aria-label="Billing period">
              <button
                role="radio"
                aria-checked={billing === "monthly"}
                onClick={() => setBilling("monthly")}
                className={`px-4 py-1.5 rounded-[50px] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black focus-visible:outline-offset-2 ${
                  billing === "monthly" ? "bg-black text-white shadow-sm" : "text-black/50 hover:text-black"
                }`}
                style={{ fontSize: "13px", fontWeight: billing === "monthly" ? 540 : 330 }}
              >
                Monthly
              </button>
              <button
                role="radio"
                aria-checked={billing === "annual"}
                onClick={() => setBilling("annual")}
                className={`px-4 py-1.5 rounded-[50px] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black focus-visible:outline-offset-2 ${
                  billing === "annual" ? "bg-black text-white shadow-sm" : "text-black/50 hover:text-black"
                }`}
                style={{ fontSize: "13px", fontWeight: billing === "annual" ? 540 : 330 }}
              >
                Annual
              </button>
            </div>
            {billing === "annual" && (
              <span
                className="px-2.5 py-1 rounded-full bg-black text-white animate-scale-in"
                style={{ fontSize: "11px", fontWeight: 540, letterSpacing: "0.2px" }}
              >
                Save 20%
              </span>
            )}
          </div>
        </section>

        {/* ── Plan cards ── */}
        <section className="px-6 pb-20" aria-label="Pricing plans">
          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {PLANS.map((plan) => {
              const annualPrice = plan.price === "$19"
                ? "$15"
                : plan.price === "$49"
                ? "$39"
                : plan.price;

              const displayPrice = billing === "annual" ? annualPrice : plan.price;

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col rounded-[12px] border p-7 ${
                    plan.highlighted
                      ? "border-black bg-black text-white shadow-2xl scale-[1.02]"
                      : "border-black/[0.08] bg-white text-black"
                  }`}
                >
                  {/* Plan name */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 540,
                        letterSpacing: "0.3px",
                        fontFamily: "var(--font-mono, monospace)",
                        textTransform: "uppercase",
                        color: plan.highlighted ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)",
                      }}
                    >
                      {plan.name}
                    </span>
                    {plan.highlighted && (
                      <span
                        className="px-2.5 py-1 rounded-full bg-white/10 text-white/80"
                        style={{ fontSize: "10px", fontWeight: 540, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}
                      >
                        Most popular
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span
                      style={{
                        fontSize: "48px",
                        fontWeight: 400,
                        letterSpacing: "-1.44px",
                        lineHeight: 1,
                        color: plan.highlighted ? "#fff" : "#000",
                      }}
                    >
                      {displayPrice}
                    </span>
                    {plan.price !== "$0" && (
                      <span
                        className="ml-1.5"
                        style={{
                          fontSize: "13px",
                          fontWeight: 330,
                          color: plan.highlighted ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                        }}
                      >
                        /{billing === "annual" ? "mo billed annually" : plan.period}
                      </span>
                    )}
                  </div>

                  <p
                    className="mb-6"
                    style={{
                      fontSize: "14px",
                      fontWeight: 330,
                      letterSpacing: "-0.14px",
                      color: plan.highlighted ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)",
                    }}
                  >
                    {plan.tagline}
                  </p>

                  {/* CTA */}
                  <Button
                    variant={plan.highlighted ? "white-pill" : plan.ctaVariant}
                    size="md"
                    href="/signup"
                    className="w-full mb-7"
                  >
                    {plan.cta}
                  </Button>

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5 flex-1" role="list">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-white" : "text-black"}`}>
                          <Check color={plan.highlighted ? "#fff" : "#000"} />
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 330,
                            letterSpacing: "-0.1px",
                            color: plan.highlighted ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
                          }}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Comparison table ── */}
        <section className="px-6 pb-24 mx-auto w-full max-w-4xl" aria-labelledby="comparison-heading">
          <h2
            id="comparison-heading"
            className="text-black text-center mb-12"
            style={{ fontSize: "28px", fontWeight: 400, letterSpacing: "-0.56px" }}
          >
            Feature comparison
          </h2>

          <div className="border border-black/[0.06] rounded-[12px] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 bg-[rgba(0,0,0,0.02)] border-b border-black/[0.06]">
              <div className="px-5 py-3.5" />
              {PLANS.map((plan) => (
                <div key={plan.id} className="px-5 py-3.5 text-center">
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 540,
                      letterSpacing: "0.3px",
                      fontFamily: "var(--font-mono, monospace)",
                      textTransform: "uppercase",
                    }}
                  >
                    {plan.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {COMPARISON_FEATURES.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 ${i < COMPARISON_FEATURES.length - 1 ? "border-b border-black/[0.04]" : ""}`}
              >
                <div
                  className="px-5 py-3.5 text-black/60"
                  style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
                >
                  {row.feature}
                </div>
                {([row.free, row.pro, row.team] as (string | boolean)[]).map((val, j) => (
                  <div key={j} className="px-5 py-3.5 flex items-center justify-center">
                    {typeof val === "boolean" ? (
                      val ? (
                        <Check />
                      ) : (
                        <Cross />
                      )
                    ) : (
                      <span
                        className="text-black"
                        style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
                      >
                        {val}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 pb-28 mx-auto w-full max-w-2xl" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-black text-center mb-12"
            style={{ fontSize: "28px", fontWeight: 400, letterSpacing: "-0.56px" }}
          >
            Frequently asked questions
          </h2>

          <div className="flex flex-col divide-y divide-black/[0.06]">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black focus-visible:outline-offset-2 rounded-sm"
                  aria-expanded={openFaq === i}
                >
                  <span
                    className="text-black"
                    style={{ fontSize: "15px", fontWeight: 450, letterSpacing: "-0.2px", lineHeight: 1.4 }}
                  >
                    {item.q}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`shrink-0 mt-0.5 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M2.5 5l4.5 4.5L11.5 5" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div
                    className="pb-4 animate-fade-in"
                    style={{
                      fontSize: "14px",
                      fontWeight: 330,
                      letterSpacing: "-0.14px",
                      lineHeight: 1.7,
                      color: "rgba(0,0,0,0.55)",
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA band ── */}
        <section className="gradient-hero animate-gradient py-20 px-6 flex flex-col items-center text-center">
          <h2 className="text-white" style={{ fontSize: "36px", fontWeight: 400, letterSpacing: "-0.72px" }}>
            Start for free today
          </h2>
          <p
            className="text-white/70 mt-3 mb-8 max-w-md"
            style={{ fontSize: "16px", fontWeight: 330, letterSpacing: "-0.14px" }}
          >
            No credit card required. Your first 3 projects are always free.
          </p>
          <div className="flex gap-3">
            <Button variant="white-pill" size="lg" href="/signup">
              Create free account
            </Button>
            <Button variant="glass-light" size="lg" href="#pricing">
              View plans
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-10">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="8" cy="11" r="7" fill="#000" />
              <circle cx="14" cy="11" r="7" fill="#fff" stroke="#000" strokeWidth="1.5" />
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 540, letterSpacing: "-0.28px" }}>FlowForge</span>
          </div>
          <div className="flex items-center gap-6">
            {["Product", "Pricing", "Docs", "Blog", "Terms", "Privacy"].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-black/40 hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black rounded-sm"
                style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
              >
                {link}
              </Link>
            ))}
          </div>
          <span className="text-black/25 text-mono-small">© 2026 FlowForge</span>
        </div>
      </footer>
    </div>
  );
}
