"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUser, setUser as setLocalUser, nameFromEmail, type MockUser, type UserRole } from "@/lib/auth";
import AvatarIllustration, { AvatarPicker, AVATARS } from "@/components/ui/AvatarIllustration";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-[8px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#f87171]" style={{ fontSize: "13px", fontWeight: 330 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {message}
    </div>
  );
}

const ROLES: { id: UserRole; label: string; description: string }[] = [
  { id: "developer", label: "Developer", description: "I build the product" },
  { id: "designer", label: "Designer", description: "I shape the experience" },
  { id: "product_manager", label: "Product Manager", description: "I own the roadmap" },
];


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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const isNextAuth = sessionStatus === "authenticated";

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("developer");
  const [avatarId, setAvatarId] = useState(1);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { score, label: strengthLabel } = getPasswordStrength(newPassword);

  // Seed initial values
  useEffect(() => {
    if (isNextAuth && session?.user) {
      setName(session.user.name ?? nameFromEmail(session.user.email ?? ""));
      setEmail(session.user.email ?? "");
    } else {
      const u = getUser();
      if (u) {
        setName(u.name);
        setEmail(u.email);
        if (u.role) setRole(u.role);
      }
    }
    const savedAvatar = typeof window !== "undefined" ? localStorage.getItem("ff_avatar_id") : null;
    if (savedAvatar) {
      const id = parseInt(savedAvatar, 10);
      if (AVATARS.find((a) => a.id === id)) setAvatarId(id);
    }
  }, [isNextAuth, session]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setProfileError("Name cannot be empty."); return; }
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    if (typeof window !== "undefined") {
      localStorage.setItem("ff_avatar_id", String(avatarId));
    }

    if (isNextAuth) {
      try {
        const res = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setProfileError(data.error ?? "Could not save changes.");
        } else {
          await updateSession({ name: data.name, email: data.email });
          setProfileSuccess("Profile updated successfully.");
        }
      } catch {
        setProfileError("Something went wrong. Please try again.");
      }
    } else {
      // localStorage mock
      const u = getUser();
      if (u) {
        const updated: MockUser = { ...u, name: name.trim(), email: email.toLowerCase().trim(), role };
        setLocalUser(updated);
      }
      setProfileSuccess("Profile updated successfully.");
    }

    setProfileLoading(false);
    setTimeout(() => setProfileSuccess(""), 4000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) { setPasswordError("Enter your current password."); return; }
    if (newPassword.length < 8) { setPasswordError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match."); return; }
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? "Could not update password.");
      } else {
        setPasswordSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    }

    setPasswordLoading(false);
    setTimeout(() => setPasswordSuccess(""), 4000);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[#ededed]" style={{ fontSize: "22px", fontWeight: 400, letterSpacing: "-0.44px", lineHeight: 1.2 }}>
          Profile
        </h1>
        <p className="mt-1 text-[#888888]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
          Manage your name, email, and how you appear to teammates.
        </p>
      </div>

      {/* ── Avatar ── */}
      <section className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[#ededed]" style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.15px" }}>
            Avatar
          </h2>
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[rgba(255,255,255,0.12)] shrink-0">
            <AvatarIllustration avatarId={avatarId} size={48} />
          </div>
        </div>
        <p className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px", lineHeight: 1.5 }}>
          Pick an avatar character to represent you across FlowForge.
        </p>
        <AvatarPicker selected={avatarId} onChange={(id) => {
          setAvatarId(id);
          if (typeof window !== "undefined") {
            localStorage.setItem("ff_avatar_id", String(id));
            window.dispatchEvent(new CustomEvent("ff:avatar", { detail: id }));
          }
        }} />
      </section>

      {/* ── Profile info ── */}
      <section className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 flex flex-col gap-5">
        <h2 className="text-[#ededed]" style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.15px" }}>
          Personal information
        </h2>

        {profileSuccess && <SuccessBanner message={profileSuccess} />}
        {profileError && <ErrorBanner message={profileError} />}

        <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px" }}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                autoComplete="name"
                required
                className="w-full border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#444444] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#444444] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <p className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px" }}>
              Role
            </p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Select your role">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={role === r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col gap-0.5 px-3 py-2.5 rounded-[8px] border text-left transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                    role === r.id
                      ? "border-[rgba(24,226,153,0.35)] bg-[rgba(24,226,153,0.06)] text-[#ededed]"
                      : "border-[rgba(255,255,255,0.08)] bg-[#111111] text-[#888888] hover:border-[rgba(255,255,255,0.15)] hover:text-[#ededed]"
                  }`}
                >
                  <span style={{ fontSize: "13px", fontWeight: role === r.id ? 500 : 400, letterSpacing: "-0.1px" }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px", color: "#666666" }}>
                    {r.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2 rounded-full bg-[#ededed] text-[#0d0d0d] text-sm font-[500] hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.1px" }}
            >
              {profileLoading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* ── Password ── */}
      <section className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-[#ededed]" style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.15px" }}>
            Change password
          </h2>
          <p className="mt-1 text-[#666666]" style={{ fontSize: "12px", fontWeight: 330, letterSpacing: "-0.05px" }}>
            Choose a strong password at least 8 characters long.
          </p>
        </div>

        {passwordSuccess && <SuccessBanner message={passwordSuccess} />}
        {passwordError && <ErrorBanner message={passwordError} />}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          {/* Current password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="current-password" className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px" }}>
              Current password
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2.5 pr-10 text-sm text-[#ededed] placeholder:text-[#444444] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
              <TogglePasswordButton show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
            </div>
          </div>

          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px" }}>
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2.5 pr-10 text-sm text-[#ededed] placeholder:text-[#444444] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ letterSpacing: "-0.1px" }}
              />
              <TogglePasswordButton show={showNew} onToggle={() => setShowNew((v) => !v)} />
            </div>
            {newPassword.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-0.5">
                <div className="flex gap-1" role="progressbar" aria-valuenow={score} aria-valuemax={4} aria-label="Password strength">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{ backgroundColor: i <= score ? strengthColors[score] : "rgba(255,255,255,0.08)" }}
                    />
                  ))}
                </div>
                {strengthLabel && (
                  <span style={{ fontSize: "11px", fontWeight: 450, letterSpacing: "0.2px", color: strengthColors[score], fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}>
                    {strengthLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 450, letterSpacing: "-0.05px" }}>
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#444444] bg-[#111111] transition-colors hover:border-[rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.1px" }}
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2 rounded-full bg-[#ededed] text-[#0d0d0d] text-sm font-[500] hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.1px" }}
            >
              {passwordLoading ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TogglePasswordButton({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#888888] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
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
  );
}
