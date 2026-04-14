import Navbar from "@/components/layout/Navbar";
import { DottedSurface } from "@/components/ui/dotted-surface";
import Button from "@/components/ui/Button";

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    tag: "Inspect",
    title: "Designs as data, not pixels",
    body:
      "FlowForge imports Figma files as structured JSON node trees. Every frame, component, and property is queryable — not a flat image.",
    detail: "absoluteBoundingBox → canvas coordinates, instantly.",
  },
  {
    tag: "Annotate",
    title: "Pin context directly on canvas",
    body:
      "Drop Manual Pins, AI Insights, and Redline Remarks onto any element. Annotations live with coordinates, not comments threads.",
    detail: "Coordinate-anchored. Never drift.",
  },
  {
    tag: "Flow",
    title: "Map every user journey",
    body:
      "Connect screens with directional edges. Visualise the entire flow graph — happy paths, edge cases, and error states.",
    detail: "Powered by @xyflow/react.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0d]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="gradient-hero relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-28 md:py-40">
        <DottedSurface className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
        {/* Mono label */}
        <p
          className="text-mono-label mb-8"
          style={{ color: "#0fa76e" }}
          aria-label="Section label: Design Handoff"
        >
          Design Handoff
        </p>

        <h1 className="text-display text-[#ededed] max-w-4xl">
          Figma designs,<br />fully inspectable.
        </h1>

        <p
          className="mt-6 max-w-lg"
          style={{ fontSize: "18px", fontWeight: 400, color: "#888888", lineHeight: 1.5 }}
        >
          Import any Figma file as a structured node tree. Annotate, measure,
          and map user journeys — without leaving your browser.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button variant="black-pill" size="lg" href="/signup">
            Start for free
          </Button>
          <Button variant="white-pill" size="lg" href="#product">
            See how it works
          </Button>
        </div>

        {/* Social proof */}
        <p
          className="mt-10 text-[#666666]"
          style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.3px" }}
        >
          Trusted by design-forward engineering teams
        </p>
        </div>
      </section>

      {/* ── Product preview strip ── */}
      <section
        id="product"
        className="bg-[#141414] border-y border-[rgba(255,255,255,0.06)] px-6 py-20 flex flex-col items-center gap-16"
      >
        {/* Section label */}
        <p className="text-mono-label text-[#888888]">The Workspace</p>

        {/* Mock canvas shell */}
        <div
          className="w-full max-w-5xl rounded-[16px] border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-[rgba(0,0,0,0.4)_0px_4px_24px]"
          role="img"
          aria-label="FlowForge workspace preview"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-4 h-9 bg-[#0d0d0d] border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span
              className="ml-4 text-white/40 uppercase tracking-[0.54px]"
              style={{ fontSize: "10px", fontFamily: "var(--font-mono, monospace)" }}
            >
              flowforge — Dashboard · Home
            </span>
          </div>
          {/* Shell layout */}
          <div className="flex h-80 bg-[#111111]">
            {/* Sidebar mock */}
            <div className="w-48 shrink-0 bg-[#1a1a1a] border-r border-[rgba(255,255,255,0.06)] flex flex-col">
              <div className="px-4 h-10 flex items-center border-b border-[rgba(255,255,255,0.06)]">
                <span className="w-20 h-2 rounded-full bg-[rgba(255,255,255,0.10)]" />
              </div>
              <div className="px-3 py-3 flex flex-col gap-1.5">
                {["Welcome", "Onboarding", "Dashboard", "Inspect", "Settings"].map((name, i) => (
                  <div
                    key={name}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-[8px] ${i === 2 ? "bg-[#0d0d0d]" : ""}`}
                  >
                    <span className={`w-3 h-3 rounded-sm border ${i === 2 ? "border-white/40" : "border-[rgba(255,255,255,0.15)]"}`} />
                    <span className={`h-1.5 rounded-full ${i === 2 ? "bg-white/60 w-14" : "bg-[rgba(255,255,255,0.12)] w-16"}`} />
                  </div>
                ))}
              </div>
            </div>
            {/* Canvas mock */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              {/* Grid dots */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              {/* Frame mock */}
              <div className="relative w-56 h-40 bg-[#1a1a1a]rounded-[8px] border border-[rgba(255,255,255,0.10)] shadow-[rgba(0,0,0,0.03)_0px_2px_4px] flex flex-col overflow-hidden">
                <div className="h-7 bg-[#0d0d0d] flex items-center px-3 gap-1.5">
                  <span className="w-12 h-1.5 rounded-full bg-white/30" />
                </div>
                <div className="flex-1 p-3 flex flex-col gap-2">
                  <span className="w-24 h-2 rounded-full bg-black/10" />
                  <span className="w-32 h-1.5 rounded-full bg-black/6" />
                  <span className="w-20 h-1.5 rounded-full bg-black/6" />
                  <div className="mt-2 w-16 h-6 rounded-full bg-[#0d0d0d] flex items-center justify-center">
                    <span className="w-8 h-1.5 rounded-full bg-white/50" />
                  </div>
                </div>
                {/* Redline indicator */}
                <div className="absolute top-7 right-0 w-px h-full bg-[#18e299] opacity-70" />
                <div className="absolute top-16 right-1" style={{ fontSize: "8px", color: "#18e299", fontFamily: "monospace" }}>
                  16px
                </div>
              </div>
              {/* Annotation pin */}
              <div className="absolute top-8 left-24 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#0d0d0d] flex items-center justify-center text-white" style={{ fontSize: "9px", fontFamily: "monospace" }}>
                  1
                </div>
                <div className="bg-[#0d0d0d] text-white rounded-[6px] px-2 py-1" style={{ fontSize: "9px", fontFamily: "monospace" }}>
                  Primary CTA
                </div>
              </div>
            </div>
            {/* Inspect panel mock */}
            <div className="w-44 shrink-0 bg-[#1a1a1a]border-l border-[rgba(255,255,255,0.06)] flex flex-col">
              <div className="px-4 h-10 flex items-center border-b border-[rgba(255,255,255,0.06)]">
                <span className="w-16 h-2 rounded-full bg-black/10" />
              </div>
              <div className="px-4 py-3 flex flex-col gap-3">
                {[["Type", "FRAME"], ["W", "375"], ["H", "812"], ["Fill", "#0d0d0d"], ["Radius", "8"]].map(([k]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="h-1.5 w-8 rounded-full bg-black/10" />
                    <span className="h-1.5 w-10 rounded-full bg-black/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="flows" className="bg-[#0d0d0d] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-mono-label text-[#888888] mb-4">Features</p>
          <h2 className="text-section-heading text-[#ededed] max-w-xl mb-16">
            Everything the handoff is missing.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <article
                key={f.tag}
                className="bg-[#141414] border border-[rgba(255,255,255,0.06)] rounded-[16px] p-8 flex flex-col gap-4 hover:border-[rgba(255,255,255,0.10)] transition-colors"
              >
                <span className="text-mono-small text-[#18e299]">{f.tag}</span>
                <h3 className="text-feature-title text-[#ededed]">{f.title}</h3>
                <p
                  className="text-[#666666]"
                  style={{ fontSize: "15px", fontWeight: 400, lineHeight: 1.55 }}
                >
                  {f.body}
                </p>
                <p
                  className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.06)]"
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    fontFamily: "var(--font-mono, monospace)",
                    letterSpacing: "0.3px",
                    color: "#888888",
                  }}
                >
                  {f.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="bg-[#0d0d0d] px-6 py-24 flex flex-col items-center text-center gap-8">
        {/* Green accent label */}
        <span
          className="inline-flex px-3 py-1 rounded-full text-[#ededed] text-[13px] font-[500] tracking-[0.3px]"
          style={{ background: "#18e299" }}
        >
          Free to start
        </span>
        <h2
          className="text-white max-w-lg"
          style={{ fontSize: "48px", fontWeight: 600, letterSpacing: "-0.96px", lineHeight: 1.1 }}
        >
          Your designs deserve better than a PDF.
        </h2>
        <p
          className="max-w-sm"
          style={{ fontSize: "17px", fontWeight: 400, color: "#888888", lineHeight: 1.5 }}
        >
          Connect your Figma file and have an inspectable, annotatable canvas
          in under two minutes.
        </p>
        <Button variant="brand-green" size="lg" href="/signup">
          Get started — it&apos;s free
        </Button>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0d0d0d] border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="8" cy="11" r="7" fill="#fff" />
              <circle cx="14" cy="11" r="7" fill="#0d0d0d" stroke="#fff" strokeWidth="1.5" />
            </svg>
            <span className="text-white" style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.2px" }}>
              FlowForge
            </span>
          </div>
          <p className="text-white/30" style={{ fontSize: "12px", fontWeight: 400 }}>
            © {new Date().getFullYear()} FlowForge. Built on Next.js.
          </p>
        </div>
      </footer>
    </div>
  );
}
