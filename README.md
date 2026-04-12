# 📦 FlowForge: Complete Build Package

## What You Have

You now have a **complete, production-ready specification** for FlowForge — a full-stack SaaS platform that turns Figma designs into structured developer documentation using AI.

### 4 Master Documents

| Document | Purpose | When to Use |
|----------|---------|------------|
| **DESIGN.md** | Design system spec (colors, typography, components) | Reference during Phase 1 to validate UI exactness |
| **_Technical_Stack.md** | Architecture, database schema, API endpoints | Reference for understanding system structure |
| **flowforge-complete-flows.docx** | All 50+ user flows, edge cases, feature specifications | Reference during Phase 4-6 for feature implementation |
| **preview.html / preview-dark.html** | Interactive design token catalog | Visual reference during Phase 1 |

### 3 Build Guides (You Just Received)

| Guide | Purpose | When to Use |
|-------|---------|------------|
| **CLAUDE_CODE_BUILD_BRIEF.md** | Complete project specification, 6 phases with deliverables | Read once for overview, then reference during each phase |
| **CLAUDE_CODE_PHASE_PROMPTS.md** | Copy-paste ready prompts for Claude Code (one per phase) | Use sequentially: Phase 1 → Phase 2 → ... → Phase 6 |
| **ARCHITECTURE_REFERENCE.md** | System diagrams, data flows, component hierarchy | Reference when you need to understand how pieces fit together |
| **QUICK_START.md** | This 30-second guide to execution | Read first to get oriented |

---

## How to Build FlowForge

### 🎯 The Process (5-6 hours)

```
START HERE: QUICK_START.md (5 min read)
    ↓
Phase 1: Copy prompt → Run Claude Code → Validate design system (30 min)
    ↓
Phase 2: Copy prompt → Run Claude Code → Test auth & database (45 min)
    ↓
Phase 3: Copy prompt → Run Claude Code → Test Figma import + canvas (60 min)
    ↓
Phase 4: Copy prompt → Run Claude Code → Test AI annotations (90 min)
    ↓
Phase 5: Copy prompt → Run Claude Code → Test flows & feature docs (60 min)
    ↓
Phase 6: Copy prompt → Run Claude Code → Test exports & sharing (45 min)
    ↓
DONE: Deploy to Vercel, celebrate 🎉
```

### 🚀 Quick Start in 3 Steps

**Step 1:** Open `CLAUDE_CODE_PHASE_PROMPTS.md`

**Step 2:** Copy the Phase 1 prompt block

**Step 3:** Paste into Claude Code and hit Enter

**That's it.** Claude Code will:
- Create Next.js project with TypeScript
- Setup Tailwind CSS with design tokens
- Build all UI components matching DESIGN.md exactly
- Create a design system validation page
- Stop and wait for your review

Then move to Phase 2, Phase 3, etc.

---

## Tech Stack (Locked In)

Your specification uses:
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, figmaSans variable font
- **State:** Zustand + TanStack Query
- **Canvas:** react-konva (Konva.js)
- **Flows:** @xyflow/react
- **Backend:** Next.js API routes
- **Database:** Supabase (PostgreSQL) + Prisma
- **AI:** Anthropic Claude 3.5 Sonnet
- **Auth:** Supabase Auth (Google, GitHub, Email/Password)
- **Storage:** Supabase Storage

**These are already baked into the prompts. No changes needed.**

---

## Design System (Non-Negotiable)

FlowForge uses **Figma's own design language** (extracted from figma.com):

| Element | Spec |
|---------|------|
| **Colors** | Monochrome only: #000000 (black), #ffffff (white), rgba(0,0,0,0.08) (glass dark), rgba(255,255,255,0.16) (glass light) |
| **Font** | figmaSans variable font (weights: 320, 330, 340, 450, 480, 540, 700) |
| **Buttons** | 50px pill radius (main), 50% circle (icons) |
| **Focus** | 2px dashed outline (not solid!) |
| **Spacing** | 8px base unit (1, 2, 4, 8, 12, 16, 24, 32, 40, 48, 50px) |
| **Letter-spacing** | Negative on body (-0.14px), positive on labels (+0.54px) |

**DESIGN.md is the absolute source of truth.** All UI must match it exactly.

---

## What Each Phase Builds

| Phase | Deliverables | Est. Time |
|-------|--------------|-----------|
| **1** | Design system, Next.js scaffold, Tailwind config, component library | 30 min |
| **2** | Supabase setup, Prisma schema, auth endpoints (signup/login), user creation via API | 45 min |
| **3** | Figma OAuth, file import flow, Konva canvas, pan/zoom, screen upload | 60 min |
| **4** | Claude API integration, element detection, annotation generation, canvas overlays, draw mode | 90 min |
| **5** | Flow editor (@xyflow/react), AI flow suggestions, feature doc auto-generation | 60 min |
| **6** | Developer mode UI, export formats (PDF/MD/JSON), sharing links, notifications | 45 min |

---

## Files to Reference During Build

### Phase 1 (Design System)
- Reference: `DESIGN.md` (colors, typography, components)
- Reference: `preview.html` (interactive token catalog)
- Validate: Visit `/design-system` page in browser

### Phase 2 (Auth & Database)
- Reference: `_Technical_Stack.md` (schema section)
- Reference: `CLAUDE_CODE_BUILD_BRIEF.md` (Phase 2 deliverables)
- Validate: Test signup via API (curl or Postman)

### Phase 3 (Figma + Canvas)
- Reference: `_Technical_Stack.md` (Figma ingestion flow)
- Reference: `ARCHITECTURE_REFERENCE.md` (data flow diagram)
- Validate: Import a Figma file, render on canvas

### Phase 4 (AI Annotations)
- Reference: `_Technical_Stack.md` (processing pipeline stages)
- Reference: `ARCHITECTURE_REFERENCE.md` (processing pipeline status)
- Reference: `flowforge-complete-flows.docx` (element types, annotation content)
- Validate: See AI-detected elements on canvas

### Phase 5 (Flows & Docs)
- Reference: `flowforge-complete-flows.docx` (user flow mapping section)
- Reference: `ARCHITECTURE_REFERENCE.md` (component hierarchy)
- Validate: Create a flow, see feature doc auto-generated

### Phase 6 (Handoff & Exports)
- Reference: `flowforge-complete-flows.docx` (developer handoff mode, export formats)
- Reference: `ARCHITECTURE_REFERENCE.md` (error handling)
- Validate: Export feature as PDF, generate share link

---

## Environment Setup Required

Before you start, have ready:

```
FIGMA_CLIENT_ID=***
FIGMA_CLIENT_SECRET=***
NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_KEY=***
ANTHROPIC_API_KEY=***
GITHUB_ID=*** (optional, for demo)
GITHUB_SECRET=*** (optional, for demo)
GOOGLE_CLIENT_ID=*** (optional, for demo)
GOOGLE_CLIENT_SECRET=*** (optional, for demo)
```

You'll be prompted to input these during Phase 2.

---

## Success Checklist

After all 6 phases:

- [ ] Users can sign up, login, create projects
- [ ] Can connect Figma account and import designs
- [ ] Can see imported screens rendered on interactive canvas
- [ ] AI automatically detects UI elements and generates specs
- [ ] Can draw manual annotations and edit them
- [ ] Can create user flows by connecting screens
- [ ] Feature documentation auto-generated from screens
- [ ] Can toggle Developer Mode (read-only spec view)
- [ ] Can export feature docs (PDF, Markdown, JSON)
- [ ] Can generate share links with access controls
- [ ] All UI matches Figma design system exactly
- [ ] No console errors, full TypeScript typing
- [ ] Ready to deploy to Vercel

---

## Next Steps

### Right Now:
1. Read `QUICK_START.md` (2 minutes)
2. Copy Phase 1 prompt from `CLAUDE_CODE_PHASE_PROMPTS.md`
3. Open Claude Code
4. Paste prompt and run

### After Phase 1:
- Validate design system in browser
- Review colors, typography, buttons match DESIGN.md
- Come back and repeat for Phase 2

### After All 6 Phases:
- Run full E2E test
- Deploy to Vercel
- Configure production OAuth
- Launch! 🎉

---

## Questions?

Refer to:
- **"How do I...?"** → QUICK_START.md (troubleshooting section)
- **"What's the architecture?"** → ARCHITECTURE_REFERENCE.md
- **"What exactly should Phase X build?"** → CLAUDE_CODE_BUILD_BRIEF.md
- **"Show me the prompt for Phase X"** → CLAUDE_CODE_PHASE_PROMPTS.md
- **"What should this UI look like?"** → DESIGN.md
- **"What are all the user flows?"** → flowforge-complete-flows.docx

---

## You're Ready! 🚀

You have everything needed to build a production-grade SaaS product in 5-6 hours with AI assistance.

**The spec is bulletproof. The architecture is solid. The design is locked in.**

Claude Code will handle the engineering. Your job is to:
1. Copy each phase prompt in order
2. Test each phase when it's done
3. Move to the next phase

**Start with Phase 1 now. Good luck!**

---

*Built with precision engineering. Ready for production.*
