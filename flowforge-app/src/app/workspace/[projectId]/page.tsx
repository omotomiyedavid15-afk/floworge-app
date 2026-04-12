"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MainCanvas from "@/components/canvas/MainCanvas";
import Sidebar from "@/components/layout/Sidebar";
import AnnotationPanel from "@/components/ui/AnnotationPanel";
import Button from "@/components/ui/Button";
import ExportModal from "@/components/ui/ExportModal";
import ShareModal from "@/components/ui/ShareModal";
import ImportModal, { type ImportedFrame } from "@/components/ui/ImportModal";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Screen {
  id: string;
  name: string;
  status: "queued" | "processing" | "partial" | "done" | "failed";
  imageUrl: string | null;
}

interface Annotation {
  id: string;
  type: string;
  label: string;
  interaction?: string;
  validation?: string;
  errorState?: string;
  successState?: string;
  devNotes?: string;
  aiGenerated: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

type ToolMode = "select" | "draw" | "zoom";

const FIGMA_CREDS_KEY = (projectId: string) => `ff_figma_${projectId}`;

export default function WorkspacePage() {
  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : "";

  const [screens, setScreens] = useState<Screen[]>([]);
  const [activeScreenId, setActiveScreenId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [savedFigmaUrl, setSavedFigmaUrl] = useState("");
  const [savedFigmaToken, setSavedFigmaToken] = useState("");

  // Load saved Figma credentials from localStorage
  useEffect(() => {
    if (!projectId) return;
    try {
      const raw = localStorage.getItem(FIGMA_CREDS_KEY(projectId));
      if (raw) {
        const { url, token } = JSON.parse(raw);
        setSavedFigmaUrl(url ?? "");
        setSavedFigmaToken(token ?? "");
      }
    } catch {}
  }, [projectId]);

  const activeScreen = screens.find((s) => s.id === activeScreenId) ?? screens[0] ?? null;
  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) ?? null;

  const handleNextScreen = useCallback(() => {
    const idx = screens.findIndex((s) => s.id === activeScreenId);
    if (idx < screens.length - 1) setActiveScreenId(screens[idx + 1].id);
  }, [activeScreenId, screens]);

  const handlePrevScreen = useCallback(() => {
    const idx = screens.findIndex((s) => s.id === activeScreenId);
    if (idx > 0) setActiveScreenId(screens[idx - 1].id);
  }, [activeScreenId, screens]);

  const handleImport = useCallback((importedFrames: ImportedFrame[]) => {
    const newScreens: Screen[] = importedFrames.map((f) => ({
      id: f.id,
      name: f.name,
      status: "done",
      imageUrl: f.imageUrl,
    }));

    setScreens((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const uniqueNew = newScreens.filter((s) => !existingIds.has(s.id));
      return [...prev, ...uniqueNew];
    });

    if (newScreens.length > 0) {
      setActiveScreenId(newScreens[0].id);
    }
    setImportOpen(false);
  }, []);

  const handleEditAnnotation = (id: string, data: Partial<Annotation>) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedAnnotationId(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "a" || e.key === "A") setShowAnnotations((v) => !v);
      if (e.key === "v" || e.key === "V") setToolMode("select");
      if (e.key === "d" || e.key === "D") setToolMode("draw");
      if (e.key === "z" || e.key === "Z") setToolMode("zoom");
      if (e.key === "ArrowRight") handleNextScreen();
      if (e.key === "ArrowLeft") handlePrevScreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNextScreen, handlePrevScreen]);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (screens.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
        <Sidebar projectName="Workspace" screens={[]} activeScreen={null} onScreenSelect={() => {}} />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 bg-[#111111] relative">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />

          {/* Back link */}
          <Link
            href="/dashboard"
            className="absolute top-4 left-4 flex items-center gap-1.5 text-[#888888] hover:text-[#ededed] transition-colors text-sm"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M10 6H2M2 6l3-3M2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>

          <div className="relative z-10 flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="w-20 h-20 rounded-[16px] border-2 border-dashed border-[rgba(255,255,255,0.12)] flex items-center justify-center bg-[rgba(255,255,255,0.02)]">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="6" y="4" width="13" height="17" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <rect x="13" y="11" width="13" height="17" rx="2" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <path d="M13 16h6M16 13v6" stroke="rgba(24,226,153,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[#ededed]" style={{ fontSize: "18px", fontWeight: 480, letterSpacing: "-0.36px" }}>
                No frames yet
              </p>
              <p className="mt-2 text-[#888888]" style={{ fontSize: "14px", fontWeight: 330, letterSpacing: "-0.1px", lineHeight: 1.6 }}>
                {savedFigmaUrl
                  ? "Your Figma file is connected. Import frames to start annotating."
                  : "Connect a Figma file to import your design screens."}
              </p>
            </div>
            <Button variant="brand-green" size="md" onClick={() => setImportOpen(true)}>
              {savedFigmaUrl ? "Import frames" : "Connect Figma file"}
            </Button>
          </div>
        </main>

        <ImportModal
          isOpen={importOpen}
          onClose={() => setImportOpen(false)}
          onImport={handleImport}
          initialFigmaUrl={savedFigmaUrl}
          initialFigmaToken={savedFigmaToken}
        />
      </div>
    );
  }

  // ── Workspace ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      <Sidebar
        projectName="Workspace"
        screens={screens.map((s) => ({ ...s, active: s.id === activeScreenId }))}
        activeScreen={activeScreenId}
        onScreenSelect={setActiveScreenId}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between h-11 px-4 bg-[#141414] border-b border-[rgba(255,255,255,0.06)] shrink-0 gap-3">
          {/* Left: breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-[#888888] hover:text-[#ededed] transition-colors shrink-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] rounded-sm"
              style={{ fontSize: "13px", fontWeight: 330, letterSpacing: "-0.1px" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M10 6H2M2 6l3-3M2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Dashboard
            </Link>
            <span className="text-[rgba(255,255,255,0.2)]">/</span>
            <span className="text-[#ededed] truncate" style={{ fontSize: "13px", fontWeight: 450, letterSpacing: "-0.1px" }}>
              {activeScreen?.name ?? "Workspace"}
            </span>
            <button
              onClick={() => setImportOpen(true)}
              className="ml-2 flex items-center gap-1 text-[#18e299] hover:text-[#18e299]/80 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 rounded-sm"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Import
            </button>
          </div>

          {/* Center: tools */}
          {!isDeveloperMode && (
            <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.06)] rounded-full p-1" role="toolbar" aria-label="Canvas tools">
              {(
                [
                  { id: "select" as ToolMode, label: "Select (V)", icon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 2l8 4.5-4 1-2 4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill={toolMode === "select" ? "white" : "none"} />
                    </svg>
                  )},
                  { id: "draw" as ToolMode, label: "Draw (D)", icon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 10l2-2 5-5-2-2-5 5-2 2 2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                      <path d="M9 1l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )},
                  { id: "zoom" as ToolMode, label: "Zoom (Z)", icon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M3.5 5h3M5 3.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )},
                ] as const
              ).map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setToolMode(id)}
                  aria-pressed={toolMode === id}
                  aria-label={label}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                    toolMode === id ? "bg-[rgba(24,226,153,0.10)] text-[#18e299]" : "text-[#888888] hover:text-[#ededed] hover:bg-[rgba(255,255,255,0.06)]"
                  }`}
                >
                  {icon}
                </button>
              ))}

              <div className="w-px h-4 bg-[rgba(255,255,255,0.10)] mx-0.5" aria-hidden="true" />
              <span className="text-[#888888] text-[11px] font-mono w-10 text-center">{zoom}%</span>
              <div className="w-px h-4 bg-[rgba(255,255,255,0.10)] mx-0.5" aria-hidden="true" />

              <button
                onClick={() => setShowAnnotations((v) => !v)}
                aria-pressed={showAnnotations}
                aria-label="Toggle annotations (A)"
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#18e299] focus-visible:outline-offset-2 ${
                  showAnnotations ? "bg-[rgba(24,226,153,0.10)] text-[#18e299]" : "text-[#888888] hover:text-[#ededed] hover:bg-[rgba(255,255,255,0.06)]"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1h10a1 1 0 011 1v6a1 1 0 01-1 1H7.5L6 11l-1.5-2H1a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <line x1="3" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[#888888] text-[10px] font-mono uppercase tracking-wider">Dev Mode</span>
              <button
                onClick={() => setIsDeveloperMode(!isDeveloperMode)}
                className={`w-8 h-4 rounded-full relative transition-colors ${isDeveloperMode ? "bg-[#18e299]" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDeveloperMode ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>

            <div className="w-px h-4 bg-[rgba(255,255,255,0.10)]" />
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={handlePrevScreen}
                disabled={screens.findIndex((s) => s.id === activeScreenId) === 0}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#888888] hover:text-[#ededed] hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-30 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7 2L4 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="text-[#888888] text-[11px] font-mono uppercase tracking-wider">
                {screens.findIndex((s) => s.id === activeScreenId) + 1}/{screens.length}
              </span>
              <button
                onClick={handleNextScreen}
                disabled={screens.findIndex((s) => s.id === activeScreenId) === screens.length - 1}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#888888] hover:text-[#ededed] hover:bg-[rgba(255,255,255,0.06)] disabled:opacity-30 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="w-px h-4 bg-[rgba(255,255,255,0.10)]" />
            <Button variant="glass-dark" size="sm" onClick={() => setShareOpen(true)}>Share</Button>
            <Button variant="black-pill" size="sm" onClick={() => setExportOpen(true)}>Export</Button>
          </div>
        </div>

        {/* ── Canvas + Inspect row ── */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-hidden relative bg-[#111111]">
            {activeScreen && (
              <MainCanvas
                imageUrl={activeScreen.imageUrl ?? ""}
                frameName={activeScreen.name}
                annotations={annotations}
                selectedAnnotationId={selectedAnnotationId}
                onAnnotationClick={setSelectedAnnotationId}
                onZoomChange={setZoom}
                onNextScreen={handleNextScreen}
                onPrevScreen={handlePrevScreen}
                toolMode={toolMode}
                showAnnotations={showAnnotations}
              />
            )}
          </main>

          <aside
            className={`${isDeveloperMode ? "w-96" : "w-72"} shrink-0 border-l border-[rgba(255,255,255,0.06)] bg-[#141414] flex flex-col overflow-hidden transition-all duration-300`}
            aria-label="Inspect panel"
          >
            <div className="flex items-center justify-between px-4 h-11 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[#888888] uppercase tracking-[0.54px] text-[10px] font-mono">Inspect</span>
            </div>
            <AnnotationPanel
              annotation={selectedAnnotation}
              onEdit={handleEditAnnotation}
              onDelete={handleDeleteAnnotation}
              isReadOnly={isDeveloperMode}
            />
          </aside>
        </div>
      </div>

      {/* Modals */}
      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        initialFigmaUrl={savedFigmaUrl}
        initialFigmaToken={savedFigmaToken}
      />
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
