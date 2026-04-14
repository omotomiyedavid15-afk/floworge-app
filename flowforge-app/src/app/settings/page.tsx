"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "@/lib/auth";

// ── Primitives ────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 transition-colors duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
        checked ? "bg-[#18e299] border-[#18e299]" : "bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.08)]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-4 bg-[#0d0d0d]" : "translate-x-0 bg-[#555555]"
        }`}
      />
    </button>
  );
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-4 border-b border-[rgba(255,255,255,0.06)]">
      <h2 className="text-[#ededed]" style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.15px" }}>{title}</h2>
      {description && (
        <p className="mt-1 text-[#666666]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
          {description}
        </p>
      )}
    </div>
  );
}

function SettingRow({ label, description, control, htmlFor }: {
  label: string;
  description?: string;
  control: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-[rgba(255,255,255,0.04)] last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-[#ededed] cursor-pointer" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.1px" }}>
            {label}
          </label>
        ) : (
          <p className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.1px" }}>{label}</p>
        )}
        {description && (
          <p className="text-[#555555]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>{description}</p>
        )}
      </div>
      <div className="shrink-0 mt-0.5">{control}</div>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-[8px] bg-[rgba(24,226,153,0.08)] border border-[rgba(24,226,153,0.2)] text-[#18e299]" style={{ fontSize: "13px", fontWeight: 330 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4.5 7l1.8 1.8L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AccountSettingsPage() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  // Notifications
  const [emailDigest, setEmailDigest] = useState(true);
  const [commentMentions, setCommentMentions] = useState(true);
  const [projectInvites, setProjectInvites] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  // Integrations
  const [figmaToken, setFigmaToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const CONFIRM_PHRASE = "delete my account";

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("ff_figma_token") : null;
    if (saved) setFigmaToken(saved);
  }, []);

  function handleSaveToken() {
    if (typeof window !== "undefined") {
      localStorage.setItem("ff_figma_token", figmaToken.trim());
    }
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 3000);
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== CONFIRM_PHRASE) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        clearUser();
        if (sessionStatus === "authenticated") {
          await nextAuthSignOut({ callbackUrl: "/" });
        } else {
          router.push("/");
        }
      }
    } catch {
      // silently fail — page-level errors can be added if needed
    }
    setDeleteLoading(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[#ededed]" style={{ fontSize: "22px", fontWeight: 400, letterSpacing: "-0.44px", lineHeight: 1.2 }}>
          Account
        </h1>
        <p className="mt-1 text-[#888888]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
          Notifications, integrations, and account management.
        </p>
      </div>

      {/* ── Notifications ── */}
      <section className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 flex flex-col gap-0">
        <SectionHeading
          title="Notifications"
          description="Choose which emails FlowForge can send you."
        />
        <SettingRow
          htmlFor="toggle-digest"
          label="Weekly digest"
          description="A summary of activity across your projects every Monday."
          control={<Toggle id="toggle-digest" checked={emailDigest} onChange={setEmailDigest} />}
        />
        <SettingRow
          htmlFor="toggle-mentions"
          label="Comment mentions"
          description="Email me when someone @mentions me in a comment."
          control={<Toggle id="toggle-mentions" checked={commentMentions} onChange={setCommentMentions} />}
        />
        <SettingRow
          htmlFor="toggle-invites"
          label="Project invites"
          description="Notify me when I'm invited to collaborate on a project."
          control={<Toggle id="toggle-invites" checked={projectInvites} onChange={setProjectInvites} />}
        />
        <SettingRow
          htmlFor="toggle-updates"
          label="Product updates"
          description="News about new features, improvements, and releases."
          control={<Toggle id="toggle-updates" checked={productUpdates} onChange={setProductUpdates} />}
        />
        <div className="pt-4 flex justify-end">
          <button
            onClick={() => {}}
            className="px-5 py-2 rounded-full bg-[#ededed] text-[#0d0d0d] text-sm font-[500] hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
            style={{ letterSpacing: "-0.1px" }}
          >
            Save preferences
          </button>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 flex flex-col gap-5">
        <SectionHeading
          title="Integrations"
          description="Connect external tools to supercharge your workflow."
        />

        {tokenSaved && <SuccessBanner message="Figma token saved." />}

        {/* Figma */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#111111] border border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0">
              <svg width="14" height="18" viewBox="0 0 38 57" fill="none" aria-hidden="true">
                <path d="M19 28.5C19 20.768 12.732 14.5 5 14.5C2.239 14.5 0 16.739 0 19.5V28.5H19Z" fill="#1ABCFE"/>
                <path d="M0 47.5C0 50.261 2.239 52.5 5 52.5C12.732 52.5 19 46.232 19 38.5H0V47.5Z" fill="#0ACF83"/>
                <path d="M19 0H5C2.239 0 0 2.239 0 5V14.5H19V0Z" fill="#F24E1E"/>
                <path d="M19 0H33C35.761 0 38 2.239 38 5V14.5H19V0Z" fill="#FF7262"/>
                <path d="M38 23.75C38 31.482 31.732 37.75 24 37.75C21.239 37.75 19 35.511 19 32.75V19H38V23.75Z" fill="#A259FF"/>
              </svg>
            </div>
            <div>
              <p className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>Figma</p>
              <p className="text-[#555555]" style={{ fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px" }}>
                Personal access token — used to import frames and fetch assets.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showToken ? "text" : "password"}
                value={figmaToken}
                onChange={(e) => setFigmaToken(e.target.value)}
                placeholder="figd_••••••••••••••••"
                className="w-full border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2.5 pr-10 text-sm text-[#ededed] placeholder:text-[#444444] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: figmaToken && !showToken ? "0.1em" : "-0.1px", fontFamily: figmaToken && !showToken ? "monospace" : undefined }}
                aria-label="Figma personal access token"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
                aria-label={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={handleSaveToken}
              className="px-4 py-2 rounded-[8px] bg-[rgba(255,255,255,0.06)] text-[#ededed] text-sm font-[450] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.10)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 shrink-0"
              style={{ letterSpacing: "-0.1px" }}
            >
              Save
            </button>
          </div>
          <p className="text-[#444444]" style={{ fontSize: "11px", fontWeight: 320, letterSpacing: "-0.05px" }}>
            Generate a token at{" "}
            <span className="text-[#555555]">figma.com → Account settings → Personal access tokens</span>.
            {" "}Never share your token with others.
          </p>
        </div>
      </section>

      {/* ── Appearance ── */}
      <section className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 flex flex-col gap-0">
        <SectionHeading
          title="Appearance"
          description="Customize how FlowForge looks and feels."
        />
        <SettingRow
          label="Color theme"
          description="Currently only dark mode is supported. Light mode coming soon."
          control={
            <span
              className="px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[#888888] border border-[rgba(255,255,255,0.08)]"
              style={{ fontSize: "11px", fontWeight: 450, letterSpacing: "0.1px" }}
            >
              Dark
            </span>
          }
        />
        <SettingRow
          htmlFor="toggle-reduce-motion"
          label="Reduce motion"
          description="Minimize animations and transitions throughout the interface."
          control={<Toggle id="toggle-reduce-motion" checked={false} onChange={() => {}} />}
        />
      </section>

      {/* ── Danger zone ── */}
      <section className="bg-[#141414] border border-[rgba(239,68,68,0.15)] rounded-[14px] p-6 flex flex-col gap-5">
        <div className="pb-4 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-[#f87171]" style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.15px" }}>
            Danger zone
          </h2>
          <p className="mt-1 text-[#666666]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
            Permanent actions that cannot be undone.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.1px" }}>Delete account</p>
            <p className="mt-0.5 text-[#555555]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
              Permanently deletes your account, all projects, and all data. This cannot be reversed.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="delete-confirm" className="text-[#666666]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
              Type{" "}
              <span className="text-[#888888] font-mono">{CONFIRM_PHRASE}</span>
              {" "}to confirm.
            </label>
            <div className="flex gap-2">
              <input
                id="delete-confirm"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className="flex-1 border border-[rgba(239,68,68,0.2)] rounded-[8px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#333333] bg-[#111111] transition-colors hover:border-[rgba(239,68,68,0.35)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#f87171] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== CONFIRM_PHRASE || deleteLoading}
                className="px-4 py-2 rounded-[8px] bg-[rgba(239,68,68,0.1)] text-[#f87171] text-sm font-[450] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.18)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#f87171] focus-visible:outline-offset-2 shrink-0"
                style={{ letterSpacing: "-0.1px" }}
              >
                {deleteLoading ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
