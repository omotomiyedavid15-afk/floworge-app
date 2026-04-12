# 🚀 FLOWFORGE: MASTER BUILD SPECIFICATION FOR CLAUDE CODE
## Paste This Entire Document Into Claude Code at the Start

---

## SECTION 0: EXECUTIVE SUMMARY

**Project:** FlowForge - A full-stack SaaS platform that treats Figma designs as native data and generates structured developer documentation through AI-powered annotation.

**Timeline:** 5-6 hours across 6 sequential phases
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Zustand, TanStack Query, react-konva, @xyflow/react, Supabase, Prisma, Anthropic Claude API

**Key Rule:** DESIGN.md is the absolute source of truth for all visuals. Monochrome only (#000000, #ffffff). figmaSans variable font. All UI must match exactly.

---

## SECTION 1: COMPLETE DESIGN SYSTEM (FROM DESIGN.MD)

### Colors (Monochrome Only)
- **Pure Black** (#000000): All text, borders, solid buttons
- **Pure White** (#ffffff): All backgrounds, white buttons
- **Glass Dark** (rgba(0, 0, 0, 0.08)): Secondary button overlays
- **Glass Light** (rgba(255, 255, 255, 0.16)): Buttons on dark/colored surfaces

### Typography
- **Font Family:** figmaSans (primary), figmaMono (labels)
- **Fallbacks:** SF Pro Display, system-ui, helvetica
- **Weights Available:** 320 (ultra-light), 330, 340, 450, 480, 540, 700 (bold)
- **OpenType Features:** "kern" enabled globally

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Display/Hero | figmaSans | 86px | 400 | 1.00 | -1.72px |
| Section Heading | figmaSans | 64px | 400 | 1.10 | -0.96px |
| Sub-heading | figmaSans | 26px | 540 | 1.35 | -0.26px |
| Feature Title | figmaSans | 24px | 700 | 1.45 | normal |
| Body Large | figmaSans | 20px | 330-450 | 1.30-1.40 | -0.1 to -0.14px |
| Body/Button | figmaSans | 16px | 330-400 | 1.40-1.45 | -0.14px to normal |
| Body Light | figmaSans | 18px | 320 | 1.45 | -0.26px to normal |
| Mono Label | figmaMono | 18px | 400 | 1.30 | 0.54px |
| Mono Small | figmaMono | 12px | 400 | 1.00 | 0.6px |

### Button Components

**BlackPill (Solid)**
- Background: #000000
- Text: #ffffff
- Radius: 50px (pill shape)
- Focus: dashed 2px outline
- Padding: 8px 18px

**WhitePill (Default on colored)**
- Background: #ffffff
- Text: #000000
- Radius: 50px (pill shape)
- Focus: dashed 2px outline
- Padding: 8px 18px

**GlassDark (Secondary on light)**
- Background: rgba(0, 0, 0, 0.08)
- Text: #000000
- Radius: 50% (circle)
- Focus: dashed 2px outline

**GlassLight (Secondary on dark)**
- Background: rgba(255, 255, 255, 0.16)
- Text: #ffffff
- Radius: 50% (circle)
- Focus: dashed 2px outline

### Spacing Scale (8px base unit)
1px, 2px, 4px, 4.5px, 8px, 10px, 12px, 16px, 18px, 24px, 32px, 40px, 46px, 48px, 50px

### Key Principles
- Use variable font weights precisely (not regular 400 + bold 700)
- Light as the base: body text at 320-340 (lighter than standard 400)
- Negative letter-spacing on all body text (creates tight, sophisticated feel)
- Positive letter-spacing on monospace labels (technical signpost)
- Dashed focus outlines ONLY (not solid) — this is signature
- Pill geometry for buttons (50px radius), circle for icon buttons (50%)

---

## SECTION 2: TECH STACK (LOCKED IN)

### Frontend
- **Framework:** Next.js 14+ with App Router, TypeScript (strict mode)
- **Styling:** Tailwind CSS (configured per DESIGN.md)
- **State Management:**
  - Zustand: High-frequency UI state (selected nodes, zoom, panels)
  - TanStack Query v5: Server state (projects, screens, annotations)
- **Canvas Engine:** react-konva + Konva.js (high-performance rendering)
- **Flow Mapping:** @xyflow/react (formerly React Flow)

### Backend
- **Framework:** Next.js API routes (TypeScript)
- **Database:** Supabase PostgreSQL with Prisma ORM
- **Auth:** Supabase Auth (Google OAuth, GitHub OAuth, Email/Password)
- **Storage:** Supabase Storage (frame images, exports)
- **AI:** Anthropic Claude 3.5 Sonnet API
- **Job Queue:** node-cron or Bull

### External APIs
- **Figma API:** File tree retrieval, asset exports
- **Anthropic Claude API:** Vision (element detection), Text (annotation generation)
- **Supabase Auth:** OAuth providers

---

## SECTION 3: DATABASE SCHEMA (PRISMA)

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  passwordHash      String?
  emailVerified     DateTime?
  twoFactorEnabled  Boolean   @default(false)
  authProvider      String?   // 'google', 'github', 'email'
  subscriptionTier  String    @default("free")
  projects          Project[]
  annotations       Annotation[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Project {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name              String
  description       String?
  figmaFileKey      String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  screens           Screen[]
  flows             Flow[]
  @@index([userId])
}

model Screen {
  id                String    @id @default(cuid())
  projectId         String
  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  figmaNodeId       String?
  backdropUrl       String?
  nodeTreeJSON      Json?
  processingStatus  String    @default("queued")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  annotations       Annotation[]
  @@index([projectId])
}

model Annotation {
  id                String    @id @default(cuid())
  screenId          String
  screen            Screen    @relation(fields: [screenId], references: [id], onDelete: Cascade)
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  x                 Int
  y                 Int
  w                 Int
  h                 Int
  type              String
  elementName       String?
  interaction       String?
  validation        String?
  errorState        String?
  successState      String?
  devNotes          String?
  isAIGenerated     Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  @@index([screenId])
  @@index([userId])
}

model Flow {
  id                String    @id @default(cuid())
  projectId         String
  project           Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name              String
  nodesJSON         Json
  edgesJSON         Json
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  @@index([projectId])
}

model FigmaToken {
  id                String    @id @default(cuid())
  userId            String    @unique
  encryptedToken    String
  expiresAt         DateTime?
  createdAt         DateTime  @default(now())
}
```

---

## SECTION 4: API ENDPOINTS OVERVIEW

### Auth Routes
- `POST /api/auth/signup` — Email signup
- `POST /api/auth/login` — Email login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/figma` — Figma OAuth callback
- `GET /api/auth/me` — Current user

### Project Routes
- `GET /api/projects` — List user projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project details
- `PUT /api/projects/:id` — Update project

### Import Routes
- `POST /api/projects/:id/import/figma` — Get pages/frames from Figma file
- `POST /api/projects/:id/import/figma/confirm` — Import selected frames
- `POST /api/projects/:id/import/screenshot` — Upload screenshots

### Annotation Routes
- `GET /api/screens/:id/annotations` — List annotations for screen
- `POST /api/annotations` — Create annotation
- `PUT /api/annotations/:id` — Update annotation
- `DELETE /api/annotations/:id` — Delete annotation

### Flow Routes
- `GET /api/projects/:id/flows` — List flows
- `POST /api/flows` — Create flow
- `PUT /api/flows/:id` — Save flow (nodes + edges)
- `DELETE /api/flows/:id` — Delete flow

### Export Routes
- `GET /api/features/:id/export/markdown` — Export as .md
- `GET /api/features/:id/export/pdf` — Export as PDF
- `GET /api/projects/:id/export/json` — Export as JSON

### Share Routes
- `POST /api/projects/:id/share` — Create share link
- `GET /api/share/:token` — Access shared project
- `DELETE /api/projects/:id/share/:token` — Revoke share link

---

## SECTION 5: CORE FEATURES & USER FLOWS

### Feature 1: Figma Import
**Flow:** User pastes Figma URL → selects frames → system fetches from Figma API → downloads 2x resolution images → stores in Supabase → creates Screen records → queues processing jobs

**Processing Pipeline (7 Stages):**
1. **Normalization:** Resize, format convert, store
2. **Layout Analysis:** AI segments screen (header, body, footer, sidebar)
3. **Element Detection:** AI identifies UI components with bounds
4. **Text Extraction:** OCR reads all visible text
5. **Annotation Generation:** Claude generates specs per element
6. **Flow Hints:** AI suggests screen connections
7. **Feature Grouping:** AI suggests which feature this screen belongs to

**Detected Element Types:**
- Input Controls: text input, email, password, textarea, search
- Selection: dropdown, checkbox, radio, toggle, multi-select
- Actions: button (primary, secondary, ghost), icon button, link, FAB
- Navigation: navbar, sidebar, breadcrumb, tabs, pagination, bottom nav
- Data Display: card, table, list, grid, badge, tag, avatar, chart
- Feedback: toast, modal, alert, tooltip, spinner, skeleton
- Layout: section header, divider, hero, empty state, image, icon

### Feature 2: Canvas Annotation
**Layers:**
- Layer 1: Screen image backdrop (Konva.Image)
- Layer 2: Annotation boxes (semi-transparent Konva.Rect per element)
- Layer 3: Redlines, selection handles, UI overlays

**Interactions:**
- Click annotation box → right panel shows full spec
- Hover annotation box → tooltip with element name
- Draw mode (D key) → user draws rectangle → fills annotation form → saves
- Edit mode → inline editing of all annotation fields with auto-save

### Feature 3: User Flows
**Mapping:** Screens as nodes, navigation paths as edges
**Interactions:** Drag screens onto canvas, connect with arrows, label connections
**AI Suggestions:** Analyze button labels and content to suggest likely next screens

### Feature 4: Feature Documentation
**Auto-Generation:** AI groups screens into features, generates summary
**Sections:** Overview, screens, edge cases, open questions, flow diagram, changelog

### Feature 5: Developer Handoff
**Mode:** Read-only view optimized for spec review
**Changes:** Hide editing controls, expand spec panel, always show annotations, show checklist

### Feature 6: Exports & Sharing
**Formats:** PDF, Markdown, JSON
**Sharing:** Unique read-only links with access controls and expiry dates

---

## SECTION 6: BUILD PHASES (SEQUENTIAL)

### PHASE 1: Design System & Scaffolding (30 min)
**Goal:** Next.js 14 project, Tailwind configured to DESIGN.md spec, component library

**Deliverables:**
1. Next.js 14 with App Router, TypeScript strict mode
2. Tailwind CSS with:
   - figmaSans variable font imported
   - CSS variables for colors, spacing, typography
   - Button component library (BlackPill, WhitePill, GlassDark, GlassLight)
   - Focus utilities (dashed 2px outlines)
3. Base UI shell:
   - Navigation bar (logo, product tabs, user menu placeholder)
   - Left sidebar (empty, ready for future use)
   - Main content area
4. Design system validation page at `/design-system` showing:
   - All colors as swatches
   - Typography hierarchy (all sizes and weights)
   - Button variants with focus states
   - Spacing examples

**Stop When:** Design tokens validated in browser, all colors/typography match DESIGN.md exactly

**Test Command:** `npm run dev` → visit `/design-system`

---

### PHASE 2: Authentication & Database (45 min)
**Goal:** Users can sign up, login, projects created via API

**Deliverables:**
1. Supabase project setup (PostgreSQL + Auth)
2. Prisma schema with User, Project, Screen, Annotation, Flow, FigmaToken tables
3. Database migrations
4. Supabase Auth setup:
   - Google OAuth
   - GitHub OAuth
   - Email/Password
5. Auth endpoints:
   - POST /api/auth/signup
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET /api/auth/me
6. Project endpoints:
   - POST /api/projects (create)
   - GET /api/projects (list)
   - GET /api/projects/:id (get)

**Stop When:** Users can sign up, login, create projects via API. Test with curl/Postman (no UI yet).

---

### PHASE 3: Figma Import & Canvas (60 min)
**Goal:** Can import Figma files, render on interactive Konva canvas

**Deliverables:**
1. Figma OAuth flow (users connect Figma account)
2. Figma API client:
   - GET /v1/files/:file_key → fetch node tree
   - GET /v1/images/:file_key → fetch frame renders
3. Import endpoints:
   - POST /api/projects/:id/import/figma → return pages/frames
   - POST /api/projects/:id/import/figma/confirm → download images, create Screens
4. Konva canvas component (MainCanvas.tsx):
   - Layer 1: Konva.Image (backdrop)
   - Pan (space+drag, middle mouse)
   - Zoom (scroll, Cmd+, Cmd-, double-click fit)
   - Zoom level indicator
5. Screens sidebar:
   - List screens with thumbnails
   - Processing status indicators (grey, blue, yellow, green, red dots)
   - Global progress bar

**Stop When:** Can connect Figma, paste URL, select frames, see screens render on canvas, pan/zoom works

---

### PHASE 4: AI Annotation Engine (90 min)
**Goal:** Detect UI elements, generate specs, render annotations on canvas

**Deliverables:**
1. Claude API integration (vision + text)
2. Processing pipeline (Stages 1-7):
   - Stage 2: Layout analysis (Claude vision → regions)
   - Stage 3: Element detection (Claude vision → components with bounds)
   - Stage 4: Text extraction (Claude vision → text labels)
   - Stage 5: Annotation generation (Claude LLM → specs)
3. Job queue system (background processing)
4. Annotation storage endpoints:
   - GET /api/screens/:id/annotations
   - POST /api/annotations
   - PUT /api/annotations/:id
   - DELETE /api/annotations/:id
5. Canvas annotation layer:
   - Konva.Rect per element with semi-transparent fill
   - Color by type (buttons blue, inputs purple, etc.)
   - Element type label
   - Click → right panel highlights annotation
   - Hover → tooltip
   - Toggle visibility (A key)
6. Annotation detail panel (right sidebar):
   - Show annotation fields (interaction, validation, error state, dev notes, aria label)
   - Edit inline with auto-save
   - Regenerate with AI button
   - Delete button
7. Draw mode (D key):
   - Click+drag to draw rectangle (dashed border)
   - Popover for element name + type
   - Annotation form slides in (all fields, "Ask AI" buttons)
   - Save → annotation appears on canvas with number badge

**Stop When:** Upload screenshot → AI detects elements → see boxes on canvas → click to inspect → can draw manual annotations

---

### PHASE 5: Flows & Feature Docs (60 min)
**Goal:** Create user flows, auto-generate feature documentation

**Deliverables:**
1. Flow editor (React Flow canvas):
   - Drag screens onto canvas as nodes
   - Connect with arrows (edges)
   - Double-click edges to label
   - Auto-layout, align, distribute tools
   - Minimap
2. Flow storage:
   - POST /api/flows (create)
   - PUT /api/flows/:id (save nodesJSON + edgesJSON)
3. AI flow suggestions:
   - Analyze button labels + content
   - Suggest connections
   - User accepts/rejects
4. Feature documentation:
   - AI auto-groups screens into features
   - Feature page with:
     - Name, status badge, description
     - AI summary (1-3 sentences)
     - Flow diagram
     - Screen cards
     - Edge cases (bulleted, AI-generated + manual)
     - Open questions
     - Changelog
   - All fields editable inline with auto-save

**Stop When:** Can create flows by connecting screens, see AI suggestions, generate feature docs with all sections

---

### PHASE 6: Developer Handoff & Exports (45 min)
**Goal:** Developer mode, export formats, sharing links

**Deliverables:**
1. Developer Mode toggle:
   - Read-only view
   - Wider spec panel
   - Annotations always visible
   - Implementation checklist per feature
2. Export endpoints:
   - GET /api/features/:id/export/markdown
   - GET /api/features/:id/export/pdf
   - GET /api/projects/:id/export/json
3. Export UI:
   - Modal with scope (current screen/feature/project)
   - Options (include images, overlays, flows, edge cases)
   - Download link or auto-download
4. Share endpoints:
   - POST /api/projects/:id/share (create link)
   - GET /api/share/:token (access)
   - DELETE /api/projects/:id/share/:token (revoke)
5. Share UI:
   - Modal with:
     - Copy link button
     - Access level (anyone, specific emails, team only)
     - Password protection
     - Expiry (never, 7 days, 30 days)
6. Notification system:
   - Bell icon in nav
   - Notification panel
   - Triggers: processing done, feedback added, status changed, share accessed
   - Email digest option

**Stop When:** Toggle Developer Mode, export feature as PDF/MD/JSON, generate share link, see notifications

---

## SECTION 7: ENVIRONMENT VARIABLES

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key

# Anthropic Claude
ANTHROPIC_API_KEY=your_key

# Figma OAuth
FIGMA_CLIENT_ID=your_id
FIGMA_CLIENT_SECRET=your_secret

# GitHub OAuth (optional)
GITHUB_ID=your_id
GITHUB_SECRET=your_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret

# Auth secret (for NextAuth.js)
NEXTAUTH_SECRET=generate_random_string
```

---

## SECTION 8: INSTALLATION & SETUP

```bash
# Create Next.js project
npx create-next-app@latest flowforge --typescript --tailwind --app --no-eslint
cd flowforge

# Install dependencies
npm install \
  @prisma/client \
  @supabase/supabase-js \
  @anthropic-ai/sdk \
  zustand \
  @tanstack/react-query \
  react-konva konva \
  @xyflow/react @xyflow/system \
  node-cron

# Initialize Prisma
npx prisma init

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run migrations
npx prisma migrate dev --name init

# Start dev server
npm run dev
```

---

## SECTION 9: CRITICAL RULES & CONSTRAINTS

1. **DESIGN.md is absolute truth**
   - All colors monochrome (#000000, #ffffff only)
   - figmaSans variable font with exact weights
   - Pill buttons (50px), dashed focus outlines
   - Negative letter-spacing on body
   - NO deviations

2. **Follow phases sequentially**
   - Don't skip or combine phases
   - Each phase depends on previous ones
   - Test and review before moving on

3. **Use locked tech stack**
   - No alternatives (Next.js 14, Supabase, Konva, Zustand, TanStack Query)
   - These are specified and tested

4. **Processing pipeline is mission-critical**
   - Stages 1-7 must run in order
   - Job queue prevents API rate limits
   - Claude API calls are batched

5. **Security requirements**
   - Figma tokens encrypted at rest (AES-256)
   - All API routes require auth check
   - Share tokens are random 32-char strings
   - Password hashing required

6. **Error handling**
   - Figma API: rate limit queue + exponential backoff
   - Claude API: retry 3x, queue if busy
   - Network: retry 3x with delays
   - User errors: friendly toast messages

---

## SECTION 10: KEYBOARD SHORTCUTS REFERENCE

```
Canvas:
├─ D             Activate draw mode
├─ A             Toggle annotations on/off
├─ [ / ]         Previous / Next screen
├─ Space+Drag    Pan canvas
├─ Scroll        Zoom
├─ Cmd+0         Fit to screen
└─ Cmd+Shift+F   Fit to screen

Global:
├─ Cmd+I         Import modal
├─ Cmd+E         Export modal
├─ Cmd+K         Quick search
├─ Cmd+Z         Undo
├─ Cmd+Shift+Z   Redo
└─ Escape        Close modals
```

---

## SECTION 11: SUCCESS METRICS

When complete, you'll have:

✅ User authentication (signup, login, 2FA, OAuth)
✅ Figma integration (OAuth, file import, asset download)
✅ AI annotation engine (7-stage processing pipeline)
✅ Interactive canvas (3-layer Konva rendering)
✅ Manual annotations (draw mode, form submission)
✅ User flow mapping (screen nodes, edge connections)
✅ Feature documentation (auto-grouped, editable)
✅ Developer handoff mode (read-only spec view)
✅ Export formats (PDF, Markdown, JSON)
✅ Share links (access controls, expiry)
✅ Notifications (in-app + email)
✅ Production-ready code (TypeScript, error handling, security)

**Timeline:** 5-6 hours
**Deployment:** Ready for Vercel

---

## NEXT STEP: BEGIN PHASE 1

You now have complete context. Start building:

**Copy this prompt:** "Build FlowForge Phase 1: Design System Scaffolding. I have a complete specification above. Create a Next.js 14 project with Tailwind CSS configured to DESIGN.md exactly..."

**Then proceed phase by phase.**

Good luck! 🚀
