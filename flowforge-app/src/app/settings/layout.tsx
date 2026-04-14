"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getUser, nameFromEmail, type MockUser } from "@/lib/auth";
import AvatarIllustration from "@/components/ui/AvatarIllustration";

const NAV = [
  {
    href: "/settings/profile",
    label: "Profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1.5 13c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Account",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 12.07l1.06-1.06M10.01 4.99l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [user, setUser] = useState<MockUser | null>(null);
  const [avatarId, setAvatarId] = useState(1);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "authenticated" && session?.user) {
      setUser({
        name: session.user.name ?? nameFromEmail(session.user.email ?? ""),
        email: session.user.email ?? "",
      });
      return;
    }
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else {
      setUser(u);
    }
  }, [sessionStatus, session, router]);

  useEffect(() => {
    const saved = localStorage.getItem("ff_avatar_id");
    if (saved) setAvatarId(parseInt(saved, 10) || 1);
    function onPick(e: Event) { setAvatarId((e as CustomEvent<number>).detail); }
    function onStorage(e: StorageEvent) {
      if (e.key === "ff_avatar_id" && e.newValue) setAvatarId(parseInt(e.newValue, 10) || 1);
    }
    window.addEventListener("ff:avatar", onPick);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("ff:avatar", onPick);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (sessionStatus === "loading" || !user) return null;

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 h-14 border-b border-[rgba(255,255,255,0.06)] bg-[#141414] flex items-center px-6 gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 rounded-sm"
          style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M10 6H2M2 6l3-3M2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>
        <span className="text-[#333333]">/</span>
        <span className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
          Settings
        </span>

        {/* Avatar */}
        <div className="ml-auto flex items-center gap-2.5">
          <span className="text-[#555555]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
            {user.email}
          </span>
          <div className="w-7 h-7 rounded-full overflow-hidden border border-[rgba(255,255,255,0.12)] shrink-0" aria-hidden="true">
            <AvatarIllustration avatarId={avatarId} size={28} />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-6 py-12 flex gap-10">
        {/* Settings nav */}
        <nav className="w-44 shrink-0" aria-label="Settings navigation">
          <p
            className="text-[#555555] uppercase tracking-[0.6px] mb-3 px-3"
            style={{ fontSize: "10px", fontWeight: 400, fontFamily: "var(--font-mono, monospace)" }}
          >
            Settings
          </p>
          <ul role="list" className="flex flex-col gap-0.5">
            {NAV.map(({ href, label, icon }) => {
              const active =
                href === "/settings"
                  ? pathname === "/settings"
                  : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                      active
                        ? "bg-[rgba(24,226,153,0.10)] text-[#18e299]"
                        : "text-[#888888] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#ededed]"
                    }`}
                    style={{ fontSize: "13px", fontWeight: active ? 500 : 330, letterSpacing: "-0.1px" }}
                    aria-current={active ? "page" : undefined}
                  >
                    {icon}
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Page content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
