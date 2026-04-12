# FlowForge: Claude Code Build Brief
## Complete Handoff Package for Full-Stack Product Build

---

## 🎯 EXECUTIVE SUMMARY

You are building **FlowForge** — a full-stack SaaS application that treats Figma designs as native data (not pixels) and generates structured developer documentation through an AI-powered annotation and flow-mapping engine.

**Tech Stack (Non-Negotiable):**
- Frontend: Next.js 14+ (App Router, TypeScript)
- State: Zustand (local UI) + TanStack Query v5 (server)
- Canvas Engine: react-konva + Konva.js (performance-critical)
- Flow Mapping: @xyflow/react (formerly React Flow)
- Backend: Supabase (Auth + PostgreSQL + Storage)
- ORM: Prisma
- AI: Anthropic Claude 3.5 Sonnet API
- Design: Figma's design system (see DESIGN.md) — monochrome + figmaSans variable font

**Design Enforcement:**
- DESIGN.md is your absolute source of truth for all visuals
- Monochrome only (#000000, #ffffff, rgba shadows)
- figmaSans variable font (weights: 320, 330, 340, 450, 480, 540, 700)
- Pill buttons (50px radius), dashed focus outlines (2px)
- Negative letter-spacing on body text (-0.1px to -0.14px)

---

## 📋 BUILD PHASES (EXECUTE SEQUENTIALLY)

### PHASE 1: Scaffolding & Design System
**Goal:** Project structure, Tailwind config, base UI chrome, no data yet

**Deliverables:**
1. Next.js 14 App Router project with TypeScript strict mode
2. Tailwind CSS configured to match DESIGN.md exactly:
   - figmaSans variable font imported and available
   - Color palette as CSS variables: `--black`, `--white`, `--glass-dark`, `--glass-light`
   - Typography scale: display (86px), section heading (64px), sub-heading (26px), body (20px/16px), mono labels
   - Button component library: BlackPill, WhitePill, GlassDark, GlassLight with 50px/50% radius
   - Focus utilities: `focus:outline-dashed focus:outline-2` 
3. Base navigation bar + sidebar layout
4. Empty dashboard/welcome page
5. Tailwind config testing page showing all design tokens live

**Acceptance Criteria:**
- Design tokens match DESIGN.md pixel-for-pixel
- All interactive elements have dashed focus states
- Typography hierarchy matches spec exactly
- No functional features, design system validation only

**Prompt for Claude Code:**
```
Build FlowForge Phase 1: Scaffolding & Design System

I have a comprehensive design system (DESIGN.md) and technical specification.

Start with:
1. Create Next.js 14 project with App Router and strict TypeScript
2. Install Tailwind CSS
3. Configure Tailwind to implement DESIGN.md exactly:
   - Import figmaSans variable font (use system fallback if unavailable)
   - Create color palette CSS variables matching monochrome spec
   - Build typography scale with variable font weights
   - Create button component library (BlackPill, WhitePill, GlassDark, GlassLight)
   - Add focus utilities for 2px dashed outlines
4. Build base UI shell:
   - Navigation bar with Figma logo, product tabs, user menu
   - Left sidebar (empty, for future use)
   - Main content area
   - Empty dashboard page
5. Create a design system validation page that shows:
   - All colors (black, white, glass dark/light)
   - Typography hierarchy (all font sizes and weights)
   - Button variants (all 4 types)
   - Focus states (dashed outlines)
   - Spacing scale

Reference DESIGN.md for:
- Exact color values (#000000, #ffffff, rgba(0,0,0,0.08), rgba(255,255,255,0.16))
- figmaSans weights: 320, 330, 340, 450, 480, 540, 700
- Button radius: 50px (pill), 50% (circle)
- Letter-spacing: negative on body (-0.14px to -0.26px), positive on mono (0.54px)

Stop when design system is validated. Do not proceed to Phase 2 until I review.
```

---

### PHASE 2: Authentication & Database
**Goal:** User auth, database schema, Prisma setup, no UI yet (use CLI or temp endpoints)

**Deliverables:**
1. Supabase project setup (auth + PostgreSQL)
2. Prisma schema with tables:
   - User (auth mapping, subscription status)
   - Project (name, description, figmaFileKey, metadata)
   - Screen (projectId, figmaNodeId, backdropUrl, nodeTreeJSON, processing status)
   - Annotation (screenId, coordinates, type, content, createdBy)
   - Flow (projectId, edges, nodes, name)
   - FigmaToken (userId, encrypted token, expiresAt)
3. Supabase Auth setup:
   - Google OAuth
   - GitHub OAuth
   - Email/Password
4. NextAuth.js or Supabase Auth integration
5. Database migrations
6. Prisma seed script (optional test data)

**Acceptance Criteria:**
- Auth endpoints functional (signup, login, logout)
- Database schema matches spec
- Can create users and projects via direct API
- Tokens encrypted at rest
- No UI, testing via API or curl only

**Prompt for Claude Code:**
```
Build FlowForge Phase 2: Authentication & Database

Setup Supabase and Prisma:

1. Create Supabase project (use provided credentials or local emulator)
2. Define Prisma schema:
   - User: id, email, name, authProvider, subscriptionTier, workspaceSettings
   - Project: id, userId, name, description, figmaFileKey, createdAt, updatedAt
   - Screen: id, projectId, figmaNodeId, backdropUrl, nodeTreeJSON, processingStatus
   - Annotation: id, screenId, x, y, w, h, type, content, isAIGenerated
   - Flow: id, projectId, name, nodes (JSON), edges (JSON)
   - FigmaToken: id, userId, encryptedToken, expiresAt
3. Setup Supabase Auth integration (Google, GitHub, Email/Password)
4. Create NextAuth.js or Supabase Auth wrapper
5. Implement auth endpoints:
   - POST /api/auth/signup
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET /api/auth/me (current user)
6. Create protected route middleware
7. Create Prisma client configuration
8. Run migrations and validate schema

Test via curl or Postman (no UI yet). Stop when users can sign up and authenticate.
```

---

### PHASE 3: Figma API Integration & Canvas Rendering
**Goal:** Import designs from Figma, render them on Konva canvas, no annotations yet

**Deliverables:**
1. Figma OAuth flow (users can connect Figma account)
2. Figma API client:
   - GET /v1/files/:file_key (fetch node tree)
   - GET /v1/images/:file_key (fetch frame renders)
3. File structure API endpoints:
   - POST /api/projects/:id/import/figma (trigger import)
   - POST /api/projects/:id/import/screenshot (handle image uploads)
4. Konva.js canvas component:
   - Render imported screen as backdrop image
   - Pan (space + drag, middle mouse)
   - Zoom (scroll, pinch, Cmd+)
   - Viewport controls (fit to screen, etc.)
5. Coordinate transformation utility (Figma → FlowForge canvas)
6. Screen processing pipeline (Stage 1: Normalization)
7. Screens sidebar showing imported screens with status indicators

**Acceptance Criteria:**
- Can connect Figma account via OAuth
- Can import a Figma file and see page/frame selector
- Imported screens display on Konva canvas
- Pan/zoom fully functional
- Processing status shows in UI (queued, processing, done, failed)

**Prompt for Claude Code:**
```
Build FlowForge Phase 3: Figma Import & Canvas Rendering

1. Implement Figma OAuth flow:
   - Setup Figma OAuth app credentials
   - Create /api/auth/figma endpoint for OAuth callback
   - Store encrypted Figma token in FigmaToken table
   - Add 'Connect Figma' button in project settings

2. Build Figma API client:
   - GET /v1/files/:file_key → fetch full node tree
   - GET /v1/images/:file_key → fetch frame renders at 2x resolution
   - Handle rate limiting (queue-based system)
   - Implement exponential backoff for API retries

3. Create import endpoints:
   - POST /api/projects/:id/import/figma
     - Validate Figma file URL
     - Fetch file metadata and pages
     - Return page/frame list for user selection
   - POST /api/projects/:id/import/figma/confirm
     - Accept selected frames
     - Create Screen records
     - Queue Normalization job

4. Build Konva canvas component (MainCanvas.tsx):
   - Layer 1: Konva.Image (backdrop frame image)
   - Interactive controls:
     - Mouse scroll zoom
     - Space + drag pan
     - Middle mouse pan
     - Double-click fit to screen
     - Cmd+ / Cmd- zoom in/out
   - Status overlay showing "Screen 1 of 5" and current zoom level

5. Create Screens sidebar panel:
   - List all screens in project
   - Show thumbnail, name, processing status
   - Status indicators: grey (queued), blue (processing), yellow (partial), green (done), red (error)

6. Implement coordinate transformation utility:
   - Convert Figma absoluteBoundingBox to local canvas coordinates
   - Handle scale factors for zoom levels

Stop when you can import a Figma file and render screens on the canvas with pan/zoom working.
```

---

### PHASE 4: AI Annotation Pipeline & Canvas Highlighting
**Goal:** Detect UI elements, generate annotations via Claude API, highlight on canvas

**Deliverables:**
1. AI processing pipeline (Stages 2-5):
   - Stage 2: Layout Analysis (AI segments screen into regions)
   - Stage 3: Element Detection (CV identifies UI components)
   - Stage 4: Text Extraction (OCR reads labels)
   - Stage 5: Annotation Generation (Claude generates specs)
2. Claude Anthropic SDK integration:
   - Prompt engineering for element detection + annotation
   - Batch processing with queue system
3. Annotation storage in database (Annotation table)
4. Annotation overlay on canvas:
   - Semi-transparent colored boxes per element type
   - Click to inspect → right panel shows full annotation
   - Hover to highlight
5. Draw mode for manual annotations:
   - Press D to activate draw mode
   - Click and drag to draw rectangle
   - Inline popover for element name + type
   - Annotation form panel (interaction, validation, error state, dev notes)
   - Save → annotation appears on canvas with number badge

**Acceptance Criteria:**
- Upload a screenshot → AI detects elements
- Annotation boxes appear on canvas
- Click annotation → right panel shows full spec
- Can draw manual annotations with form
- Saved annotations persist in database

**Prompt for Claude Code:**
```
Build FlowForge Phase 4: AI Annotation Pipeline & Canvas Highlighting

1. Create AI processing pipeline in app/api/jobs/process-screen.ts:
   - Stage 2: Layout Analysis
     - Use Claude to segment screen into header, body, footer, sidebar
   - Stage 3: Element Detection
     - Analyze image to identify UI components (buttons, inputs, modals, etc.)
     - Generate bounding boxes (x, y, w, h)
     - Categorize by type: Input, Button, Navigation, Data Display, Feedback, Layout
   - Stage 4: Text Extraction
     - OCR to read all visible text
     - Extract labels, placeholders, error messages
   - Stage 5: Annotation Generation
     - For each detected element, use Claude to generate:
       - Interaction description (what happens on click)
       - Validation rules (if applicable)
       - Error state (what error shows and when)
       - Success state (what happens on success)
       - Dev notes (implementation guidance)
       - ARIA label suggestion

2. Implement Anthropic Claude API client:
   - Use @anthropic-ai/sdk
   - Create prompt templates for each stage
   - Implement batch processing queue (Bull or pg_boss)
   - Add retry logic for API failures

3. Create annotation storage:
   - POST /api/annotations → save to Annotation table
   - GET /api/screens/:id/annotations → fetch all annotations for screen
   - PUT /api/annotations/:id → update annotation
   - DELETE /api/annotations/:id → delete annotation

4. Build annotation canvas layer (in MainCanvas.tsx):
   - Render Konva.Rect for each annotation
   - Semi-transparent fill (color by type: red for buttons, blue for inputs, etc.)
   - Show element type label in top-left
   - Click rect → dispatch to right panel
   - Hover rect → show tooltip with element name
   - Toggle visibility with 'A' key or button

5. Build annotation detail panel (right side):
   - Show element name, type badge, annotation fields
   - Fields: interaction, validation, error state, success state, dev notes
   - Edit buttons for each field
   - 'Ask AI to fill' button for any field
   - Regenerate with AI button (re-runs Stage 5 for just this element)

6. Implement draw mode:
   - Press D to activate (cursor → crosshair)
   - Click and drag to draw rectangle (dashed purple border while drawing)
   - Release → rectangle locked, resize handles appear
   - Popover above rectangle for: element name, element type
   - Next button → annotation form slides in from right
   - Form fields: interaction, validation, error state, dev notes
   - 'Ask AI to fill' button pre-fills form based on visual region
   - Save → annotation saved, dashed border → solid with number badge

Stop when you can upload a screenshot, see AI-detected annotations on canvas, and create manual annotations.
```

---

### PHASE 5: User Flows & Feature Documentation
**Goal:** Flow editor, AI flow suggestions, feature documentation auto-generation

**Deliverables:**
1. Flow editor UI:
   - Canvas with grid, nodes for screens, directed edges
   - Drag screens from sidebar onto canvas
   - Connect nodes by clicking port dots
   - Double-click edges to label (e.g., "On success")
   - Auto-layout, align tools, minimap
2. Flow storage in database (Flow table with JSON edges/nodes)
3. AI flow suggestions:
   - Analyze button labels and screen content
   - Suggest connections between screens
   - User accepts/rejects suggestions
4. Feature documentation pages:
   - AI groups screens into suggested features
   - User can rename, move screens, create custom features
   - Feature pages show: summary, screens, edge cases, open questions, flow diagram
   - Editable fields throughout

**Acceptance Criteria:**
- Can create flows by connecting screens
- AI suggests flows based on content
- Can generate feature docs (auto-grouped screens)
- Feature pages show all required sections

---

### PHASE 6: Developer Handoff & Exports
**Goal:** Developer mode, export formats, sharing links

**Deliverables:**
1. Developer Mode toggle:
   - Read-only view optimized for spec review
   - Wider right panel with structured specs
   - Annotation overlays always visible
   - Implementation checklist per feature
2. Export formats:
   - Markdown (.md)
   - PDF (with images and overlays)
   - JSON (raw data)
   - Notion integration (OAuth)
3. Share links:
   - Unique read-only URLs
   - Access controls (anyone, email list, team only)
   - Password protection, expiry dates
4. Notification system:
   - Bell icon in nav, notification panel
   - Triggers: AI processing done, feedback added, status changes, share link accessed

**Acceptance Criteria:**
- Toggle Developer Mode → UI re-arranges, editing controls hidden
- Can export current feature as PDF/MD/JSON
- Can generate share link with access controls
- In-app notifications appear and can be dismissed

---

## 🔧 ENVIRONMENT SETUP

### Required Credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_KEY=<service-key>
ANTHROPIC_API_KEY=<your-key>
FIGMA_CLIENT_ID=<client-id>
FIGMA_CLIENT_SECRET=<client-secret>
GITHUB_ID=<github-oauth-id>
GITHUB_SECRET=<github-oauth-secret>
GOOGLE_CLIENT_ID=<google-oauth-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>
```

### Installation Commands:
```bash
npm install next@14 react@19 typescript tailwindcss zustand @tanstack/react-query react-konva konva @xyflow/react @supabase/supabase-js @anthropic-ai/sdk prisma next-auth
npx prisma init
npx tailwindcss init -p
```

---

## 🎨 DESIGN SYSTEM REFERENCE

**Colors:**
- `#000000` — Black text, solid buttons, borders
- `#ffffff` — White backgrounds, white buttons
- `rgba(0, 0, 0, 0.08)` — Glass Dark (secondary buttons)
- `rgba(255, 255, 255, 0.16)` — Glass Light (buttons on dark/colored)

**Typography:**
- figmaSans weights: 320 (ultra-light), 330, 340, 450, 480, 540, 700 (bold)
- figmaMono for labels (uppercase, letter-spacing 0.54px)
- Kern all text (OpenType `"kern"` feature enabled)
- Negative letter-spacing on body: -0.14px to -0.26px

**Components:**
- BlackPill: `bg-black text-white rounded-full px-6 py-3`
- WhitePill: `bg-white text-black rounded-full px-6 py-3`
- All buttons: `focus:outline-dashed focus:outline-2 focus:outline-black`
- Icon buttons: `rounded-full` (50%)
- Main buttons: `rounded-[50px]` (pill)

---

## 📚 ADDITIONAL RESOURCES

1. **DESIGN.md** — Complete design system spec (use as source of truth)
2. **flowforge-complete-flows.docx** — All 50+ user flows and edge cases
3. **_Technical_Stack.md** — Architecture details (Prisma schema, API structure)
4. **preview.html / preview-dark.html** — Interactive design token catalog

---

## ✅ HANDOFF CHECKLIST

- [ ] Phase 1: Design system validated, all tokens match DESIGN.md
- [ ] Phase 2: Users can sign up/login, projects can be created via API
- [ ] Phase 3: Can import Figma files, render on canvas, pan/zoom works
- [ ] Phase 4: AI detects elements, annotations appear, manual draw mode works
- [ ] Phase 5: Flows can be created, features auto-grouped, documentation pages work
- [ ] Phase 6: Developer mode works, exports in all formats, sharing links functional

---

## 🚀 FINAL DEPLOYMENT

Once all phases are complete:
1. Configure Vercel deployment
2. Setup Supabase production database
3. Add production Figma OAuth credentials
4. Run final E2E tests
5. Deploy to vercel.app

---

**Built with precision engineering and AI assistance. Ready for production.**
