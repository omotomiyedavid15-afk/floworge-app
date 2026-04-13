"use client";

import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import NotificationPanel from "@/components/ui/NotificationPanel";
import ImportModal from "@/components/ui/ImportModal";
import NewProjectModal, { type NewProjectData } from "@/components/ui/NewProjectModal";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react"; // useRef used by UserMenu
import { useRouter } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { getUser, clearUser, getInitials, nameFromEmail, type MockUser } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  description?: string;
  coverImage?: string | null;
  screens: number;
  annotations: number;
  updatedAt: string;
  category: "recent" | "shared";
  invitees?: string[];
  figmaUrl?: string;
  figmaToken?: string;
}

type Filter = "all" | "recent" | "shared";

// (NewProjectModal is imported from @/components/ui/NewProjectModal)

// ── User avatar dropdown ──────────────────────────────────────────────────────

function UserMenu({ user, onLogout }: { user: MockUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.12)] flex items-center justify-center text-[#ededed] hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
        style={{ fontSize: "12px", fontWeight: 540 }}
        aria-label="User menu"
        aria-expanded={open}
      >
        {getInitials(user.name)}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-[rgba(0,0,0,0.5)_0px_8px_32px] overflow-hidden z-50 animate-scale-in">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
            <p className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 540, letterSpacing: "-0.15px" }}>
              {user.name}
            </p>
            <p className="text-[#888888] mt-0.5" style={{ fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px" }}>
              {user.email}
            </p>
          </div>
          <div className="p-1.5 flex flex-col gap-0.5">
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-left text-[#ededed] hover:bg-[rgba(255,255,255,0.06)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299]"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
              onClick={() => setOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1.5 12.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Profile settings
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-left text-[#ededed] hover:bg-[rgba(255,255,255,0.06)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299]"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
              onClick={() => setOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Settings
            </button>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.06)] p-1.5">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-left text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299]"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M9 9.5l2.5-2.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.5 7H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [user, setUserState] = useState<MockUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFigmaUrl, setImportFigmaUrl] = useState("");
  const [importFigmaToken, setImportFigmaToken] = useState("");
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [unreadCount, setUnreadCount] = useState(3);

  // Auth guard — supports both NextAuth (OAuth) and localStorage (mock) sessions
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "authenticated" && session?.user) {
      setUserState({
        name: session.user.name ?? nameFromEmail(session.user.email ?? ""),
        email: session.user.email ?? "",
      });
      return;
    }
    // Fall back to localStorage mock auth
    const u = getUser();
    if (!u) {
      router.replace("/login");
    } else {
      setUserState(u);
    }
  }, [sessionStatus, session, router]);

  async function handleLogout() {
    clearUser();
    if (sessionStatus === "authenticated") {
      await nextAuthSignOut({ callbackUrl: "/login" });
    } else {
      router.push("/login");
    }
  }

  function handleCreateProject(data: NewProjectData) {
    const id = `proj-${Date.now()}`;
    const newProject: Project = {
      id,
      name: data.name,
      description: data.description || undefined,
      coverImage: data.coverImage,
      screens: 0,
      annotations: 0,
      updatedAt: "just now",
      category: "recent",
      invitees: data.invitees.length > 0 ? data.invitees : undefined,
      figmaUrl: data.figmaUrl || undefined,
      figmaToken: data.figmaToken || undefined,
    };
    setProjects((prev) => [newProject, ...prev]);
    setActiveProject(id);

    // Persist figma credentials so the workspace page can read them
    if (data.figmaUrl && data.figmaToken) {
      try {
        localStorage.setItem(`ff_figma_${id}`, JSON.stringify({ url: data.figmaUrl, token: data.figmaToken }));
      } catch {}
      setImportFigmaUrl(data.figmaUrl);
      setImportFigmaToken(data.figmaToken);
      setImportOpen(true);
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || p.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, search, filter]);

  if (sessionStatus === "loading" || !user) return null;

  if (activeProject) {
    const project = projects.find((p) => p.id === activeProject)!;
    return (
      <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
        <Sidebar projectName={project?.name ?? "Project"} />
        <main className="flex-1 flex flex-col overflow-hidden bg-[#111111]">
          <div className="flex items-center justify-between h-11 px-4 bg-[#141414] border-b border-[rgba(255,255,255,0.06)] shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveProject(null)}
                className="flex items-center gap-1.5 text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M10 6H2M2 6l3-3M2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Dashboard
              </button>
              <span className="text-[#555555]">/</span>
              <span className="text-[#ededed]" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
                {project?.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="glass-dark" size="sm" onClick={() => {
                setImportFigmaUrl(project?.figmaUrl ?? "");
                setImportFigmaToken(project?.figmaToken ?? "");
                setImportOpen(true);
              }}>
                Import frames
              </Button>
              <Link href={`/workspace/${activeProject}`}>
                <Button variant="black-pill" size="sm">
                  Open workspace
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-[8px] border-2 border-dashed border-[rgba(255,255,255,0.15)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-[#ededed]" style={{ fontSize: "15px", fontWeight: 450, letterSpacing: "-0.2px" }}>No frames imported yet</p>
                <p className="mt-1 text-[#888888]" style={{ fontSize: "13px", fontWeight: 320, letterSpacing: "-0.1px" }}>
                  Paste a Figma file URL to begin
                </p>
              </div>
              <Button variant="black-pill" size="sm" onClick={() => {
                setImportFigmaUrl(project?.figmaUrl ?? "");
                setImportFigmaToken(project?.figmaToken ?? "");
                setImportOpen(true);
              }}>
                Connect Figma file
              </Button>
            </div>
          </div>
        </main>
        <aside className="w-64 shrink-0 border-l border-[rgba(255,255,255,0.06)] bg-[#141414] flex flex-col">
          <div className="h-11 flex items-center px-4 border-b border-[rgba(255,255,255,0.06)]">
            <span className="text-[#888888] uppercase tracking-[0.54px]" style={{ fontSize: "10px", fontFamily: "var(--font-mono, monospace)" }}>
              Inspect
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 text-center">
            <p className="text-[#555555]" style={{ fontSize: "13px", fontWeight: 320, letterSpacing: "-0.1px", lineHeight: 1.5 }}>
              Click any node on the canvas to inspect its properties.
            </p>
          </div>
        </aside>
        <ImportModal
          isOpen={importOpen}
          onClose={() => { setImportOpen(false); setImportFigmaUrl(""); setImportFigmaToken(""); }}
          initialFigmaUrl={importFigmaUrl}
          initialFigmaToken={importFigmaToken}
        />
      </div>
    );
  }

  // ── Project listing ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0d]">
      {/* Dashboard nav */}
      <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[#141414]">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="8" cy="11" r="7" fill="#ededed" />
              <circle cx="14" cy="11" r="7" fill="#0d0d0d" stroke="#ededed" strokeWidth="1.5" />
            </svg>
            <span className="text-[#ededed]" style={{ fontSize: "15px", fontWeight: 540, letterSpacing: "-0.3px" }}>FlowForge</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-[#888888]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
              {user.name}
            </span>

            {/* Bell icon */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) setUnreadCount(0); }}
                className="relative w-8 h-8 flex items-center justify-center rounded-full text-[#888888] hover:bg-[rgba(255,255,255,0.06)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
                aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
                aria-expanded={notifOpen}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1a5 5 0 015 5v3l1.5 2h-13L3 9V6a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M6 13a2 2 0 004 0" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#18e299] text-[#0d0d0d] rounded-full flex items-center justify-center pointer-events-none"
                    style={{ fontSize: "9px", fontWeight: 700 }}
                    aria-hidden="true"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* User avatar with dropdown */}
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-12 flex flex-col gap-8">
        {/* Heading */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-mono-small text-[#888888] mb-3">Projects</p>
            <h1 className="text-[#ededed]" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "-0.64px", lineHeight: 1.1 }}>
              Your workspace
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="glass-dark" size="sm" onClick={() => setImportOpen(true)}>
              Import from Figma
            </Button>
            <Button variant="black-pill" size="md" onClick={() => setNewProjectOpen(true)}>
              + New project
            </Button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25 pointer-events-none" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 border border-[rgba(255,255,255,0.10)] rounded-full text-sm text-[#ededed] placeholder:text-[#555555] bg-[#1a1a1a] hover:border-[rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              style={{ letterSpacing: "-0.1px" }}
              aria-label="Search projects"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[rgba(255,255,255,0.06)] rounded-full" role="radiogroup" aria-label="Filter projects">
            {(["all", "recent", "shared"] as Filter[]).map((f) => (
              <button
                key={f}
                role="radio"
                aria-checked={filter === f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full capitalize transition-all duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                  filter === f ? "bg-[rgba(24,226,153,0.15)] text-[#18e299]" : "text-[#888888] hover:text-[#ededed]"
                }`}
                style={{ fontSize: "12px", fontWeight: filter === f ? 540 : 330, letterSpacing: "-0.05px" }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Project grid */}
        {/* True empty state — no projects created yet */}
        {projects.length === 0 && (
          <div className="flex flex-col items-center gap-10 py-16 text-center">
            {/* Illustration */}
            <div className="relative w-48 h-32 select-none" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a]"
                  style={{
                    width: 100,
                    height: 72,
                    left: i * 22,
                    top: i * 10,
                    zIndex: 3 - i,
                    transform: `rotate(${(i - 1) * 4}deg)`,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="h-5 bg-[#111] rounded-t-[10px] border-b border-[rgba(255,255,255,0.06)]" />
                  <div className="p-2 flex flex-col gap-1.5">
                    <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.08)]" style={{ width: "60%" }} />
                    <div className="h-1 rounded-full bg-[rgba(255,255,255,0.05)]" style={{ width: "80%" }} />
                    <div className="h-1 rounded-full bg-[rgba(255,255,255,0.05)]" style={{ width: "45%" }} />
                    {i === 0 && <div className="mt-1 h-4 rounded-sm bg-[rgba(24,226,153,0.15)] border border-[rgba(24,226,153,0.2)]" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-[#ededed]" style={{ fontSize: "22px", fontWeight: 400, letterSpacing: "-0.44px" }}>
                Your workspace is empty
              </h2>
              <p className="text-[#666666] max-w-sm mx-auto" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.14px", lineHeight: 1.6 }}>
                Import a Figma file to get started. FlowForge will turn your designs into an inspectable, annotated canvas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button variant="black-pill" size="md" onClick={() => setNewProjectOpen(true)}>
                + Create first project
              </Button>
              <Button variant="glass-dark" size="md" onClick={() => setImportOpen(true)}>
                Import from Figma
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-2">
              {[
                { label: "Paste Figma link", icon: "M5 12h14M12 5l7 7-7 7" },
                { label: "Select frames", icon: "M3 5h4v4H3zM10 5h4v4h-4zM17 5h4v4h-4zM3 12h4v4H3z" },
                { label: "AI annotates", icon: "M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={step.icon} />
                    </svg>
                  </div>
                  <span className="text-[#555555]" style={{ fontSize: "11px", fontWeight: 330, letterSpacing: "-0.05px" }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(255,255,255,0.06)]">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className="group bg-[#141414] p-6 flex flex-col gap-4 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2"
              >
                {/* Canvas preview / cover */}
                <div className="w-full h-36 rounded-[8px] border border-[rgba(255,255,255,0.06)] overflow-hidden relative bg-[#1a1a1a]">
                  {project.coverImage ? (
                    <>
                      <img src={project.coverImage} alt="" className="w-full h-full object-cover" aria-hidden="true" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-20 h-28 bg-white rounded-[4px] border border-black/10 shadow-sm flex flex-col overflow-hidden">
                          <div className="h-5 bg-black" />
                          <div className="flex-1 p-1.5 flex flex-col gap-1">
                            <div className="w-10 h-1 rounded-full bg-black/10" />
                            <div className="w-14 h-0.5 rounded-full bg-black/6" />
                            <div className="w-8 h-0.5 rounded-full bg-black/6" />
                            <div className="mt-auto w-full h-3 rounded-sm bg-black/70" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Shared badge if invitees */}
                  {project.invitees && project.invitees.length > 0 && (
                    <div
                      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full border border-black/[0.06]"
                      style={{ fontSize: "10px", fontWeight: 540, letterSpacing: "-0.05px" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <circle cx="3.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="6.5" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M0.5 8.5c0-1.657 1.343-3 3-3h3c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      {project.invitees.length}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-[#ededed] group-hover:underline underline-offset-2" style={{ fontSize: "15px", fontWeight: 480, letterSpacing: "-0.2px" }}>
                    {project.name}
                  </h2>
                  {project.description ? (
                    <p className="text-[#888888] line-clamp-1" style={{ fontSize: "12px", fontWeight: 320, letterSpacing: "-0.05px" }}>
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-[#888888]" style={{ fontSize: "12px", fontWeight: 320, letterSpacing: "-0.05px" }}>
                      {project.screens} screens · {project.annotations} annotations
                    </p>
                  )}
                </div>

                <p className="mt-auto text-[#555555]" style={{ fontSize: "11px", fontWeight: 320, letterSpacing: "0.3px", fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase" }}>
                  Updated {project.updatedAt}
                </p>
              </button>
            ))}

            {/* New project card */}
            <button
              onClick={() => setNewProjectOpen(true)}
              className="bg-[#141414] p-6 flex flex-col items-center justify-center gap-3 text-left border-none hover:bg-[rgba(255,255,255,0.03)] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 min-h-[220px]"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-[rgba(255,255,255,0.15)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 2v10M2 7h10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[#888888]" style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}>
                New project
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-20 text-center border border-dashed border-[rgba(255,255,255,0.10)] rounded-[8px]">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-[rgba(255,255,255,0.12)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                <path d="M11 11l3 3" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[#ededed]" style={{ fontSize: "15px", fontWeight: 450, letterSpacing: "-0.2px" }}>No projects found</p>
              <p className="text-[#888888] mt-1" style={{ fontSize: "13px", fontWeight: 320, letterSpacing: "-0.1px" }}>
                {search ? `No results for "${search}"` : "Try a different filter"}
              </p>
            </div>
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="text-[#888888] hover:text-[#ededed] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
              style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <ImportModal
        isOpen={importOpen}
        onClose={() => { setImportOpen(false); setImportFigmaUrl(""); setImportFigmaToken(""); }}
        initialFigmaUrl={importFigmaUrl}
        initialFigmaToken={importFigmaToken}
      />
      {newProjectOpen && (
        <NewProjectModal
          onClose={() => setNewProjectOpen(false)}
          onCreate={(data) => handleCreateProject(data)}
        />
      )}
    </div>
  );
}
