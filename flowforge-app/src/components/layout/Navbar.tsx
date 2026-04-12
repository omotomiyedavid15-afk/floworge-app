"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Flows", href: "#flows" },
  { label: "Inspect", href: "#inspect" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d0d0d]/90 backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.08)]">
      <nav
        className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6"
        aria-label="Main navigation"
      >
        {/* ── Wordmark ── */}
        <Link
          href="/"
          className="flex items-center gap-2 select-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 rounded-sm"
          aria-label="FlowForge home"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="8" cy="11" r="7" fill="#ededed" />
            <circle cx="14" cy="11" r="7" fill="#0d0d0d" stroke="#ededed" strokeWidth="1.5" />
          </svg>
          <span
            className="text-[#ededed]"
            style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.3px", lineHeight: 1 }}
          >
            FlowForge
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="px-3 py-1.5 text-[#888888] rounded-[8px] transition-colors hover:text-[#18e299] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ fontSize: "15px", fontWeight: 500 }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Right side actions ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:inline text-[#888888] transition-colors hover:text-[#18e299] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 rounded-sm"
            style={{ fontSize: "15px", fontWeight: 500 }}
          >
            Log in
          </Link>
          <Button variant="black-pill" size="sm" href="/signup">
            Get started
          </Button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-full hover:bg-[rgba(255,255,255,0.06)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span className={`block w-4 h-[1.5px] bg-[#ededed] transition-transform origin-center ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <span className={`block w-4 h-[1.5px] bg-[#ededed] transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-4 h-[1.5px] bg-[#ededed] transition-transform origin-center ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.08)] bg-[#0d0d0d] px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-3 py-2 text-[#888888] rounded-full hover:text-[#18e299] transition-colors"
              style={{ fontSize: "15px", fontWeight: 500 }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3">
            <Link
              href="/login"
              className="flex-1 text-center py-2 text-[#ededed] rounded-full border border-[rgba(255,255,255,0.12)] text-[15px] font-[500]"
            >
              Log in
            </Link>
            <Button variant="black-pill" size="sm" href="/signup" className="flex-1 justify-center">
              Get started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
