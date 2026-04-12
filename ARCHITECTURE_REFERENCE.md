# FlowForge: Architecture & Data Flow Reference

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLOWFORGE ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Frontend (Web)     │  ← Next.js 14 App Router, TypeScript
│  ┌────────────────┐  │  State: Zustand (local UI) + TanStack Query (server)
│  │ Design System  │  │  Styling: Tailwind + figmaSans variable font
│  │ (DESIGN.md)    │  │
│  └────────────────┘  │
│  ┌────────────────┐  │
│  │ Canvas Layer   │  │  ← react-konva (Figma import display)
│  │ (Konva.js)     │  │  - Layer 1: Screen image backdrop
│  └────────────────┘  │  - Layer 2: Annotation boxes
│  ┌────────────────┐  │  - Layer 3: Redline measurements
│  │ Flow Editor    │  │  ← @xyflow/react (user journey mapping)
│  │ (React Flow)   │  │
│  └────────────────┘  │
└─────────┬────────────┘
          │ REST API + WebSocket
          │ (authenticated, rate-limited)
          ▼
┌──────────────────────────────────────────────────────────────┐
│              Backend (Next.js API Routes)                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Auth Routes:                                               │
│  ├─ /api/auth/signup                                        │
│  ├─ /api/auth/login                                         │
│  ├─ /api/auth/logout                                        │
│  ├─ /api/auth/figma (OAuth callback)                        │
│  └─ /api/auth/me (current user)                             │
│                                                              │
│  Project Routes:                                            │
│  ├─ GET  /api/projects (list)                              │
│  ├─ POST /api/projects (create)                            │
│  ├─ GET  /api/projects/:id                                 │
│  └─ PUT  /api/projects/:id (update)                        │
│                                                              │
│  Import Routes:                                             │
│  ├─ POST /api/projects/:id/import/figma                    │
│  ├─ POST /api/projects/:id/import/figma/confirm            │
│  ├─ POST /api/projects/:id/import/screenshot               │
│  └─ GET  /api/imports/:id/status                           │
│                                                              │
│  Annotation Routes:                                         │
│  ├─ GET  /api/screens/:id/annotations                      │
│  ├─ POST /api/annotations (create)                         │
│  ├─ PUT  /api/annotations/:id (edit)                       │
│  └─ DELETE /api/annotations/:id                            │
│                                                              │
│  Flow Routes:                                               │
│  ├─ GET  /api/projects/:id/flows                           │
│  ├─ POST /api/flows (create)                               │
│  ├─ PUT  /api/flows/:id (save layout)                      │
│  └─ DELETE /api/flows/:id                                  │
│                                                              │
│  Export Routes:                                             │
│  ├─ GET  /api/features/:id/export/markdown                 │
│  ├─ GET  /api/features/:id/export/pdf                      │
│  └─ GET  /api/projects/:id/export/json                     │
│                                                              │
│  Share Routes:                                              │
│  ├─ POST /api/projects/:id/share (create link)             │
│  ├─ GET  /api/share/:token (access shared project)         │
│  └─ DELETE /api/projects/:id/share/:token (revoke)         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
          │
          │ ORM: Prisma
          │
          ▼
┌──────────────────────────────────────────────────────────────┐
│           Database (Supabase PostgreSQL)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Tables:                                                      │
│  • User (auth, subscription, settings)                      │
│  • Project (container, figmaFileKey)                        │
│  • Screen (imported frame, processingStatus, nodeTreeJSON)  │
│  • Annotation (element specs, coordinates, AI-generated?)   │
│  • Flow (edges, nodes, user journeys)                       │
│  • FigmaToken (encrypted OAuth token)                       │
│  • Share (read-only access tokens, expiry)                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
          │
          │ Storage API
          │
          ▼
┌──────────────────────────────────────────────────────────────┐
│         Storage (Supabase Storage / S3-compatible)           │
├──────────────────────────────────────────────────────────────┤
│  • Frame backdrop images (2x resolution)                     │
│  • Screenshot uploads (user-provided designs)               │
│  • Cached exports (PDFs, JSONs)                             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│    External Services (Async Job Processing)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Figma API:                                                 │
│  ├─ GET /v1/files/:file_key → node tree                    │
│  └─ GET /v1/images/:file_key → frame renders               │
│                                                              │
│  Anthropic Claude API:                                      │
│  ├─ Vision tasks (element detection, layout analysis)       │
│  └─ Text tasks (annotation generation, flow suggestions)    │
│                                                              │
│  Job Queue (node-cron or Bull):                            │
│  ├─ Screen processing pipeline (Stages 1-7)                │
│  ├─ Feature documentation auto-generation                   │
│  └─ Flow suggestion analysis                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Figma Import → Annotation

```
┌──────────────────────────────────────────────────────────────┐
│         USER INITIATES IMPORT (Frontend)                     │
│  1. User pastes Figma URL in Import Modal                   │
│  2. Clicks "Select Frames"                                   │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│    POST /api/projects/:id/import/figma (Backend)             │
│  1. Validate Figma URL format                                │
│  2. Check Figma OAuth token (refresh if needed)              │
│  3. Call Figma API: GET /v1/files/:file_key                 │
│  4. Return { pages, frames } → UI shows selector             │
└──────────────────────────────────────────────────────────────┘
                          │
                   (User selects frames)
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│   POST /api/projects/:id/import/figma/confirm (Backend)      │
│  Input: { selectedFrameIds }                                 │
│  1. For each frame:                                          │
│     a. Create Screen record (processingStatus: 'queued')     │
│     b. Call Figma API: GET /v1/images/:file_key             │
│     c. Download 2x resolution PNG                            │
│     d. Upload to Supabase Storage                            │
│     e. Store backdropUrl in Screen.backdropUrl              │
│  2. Queue processing job for each screen                     │
│  3. Return { screenIds }                                     │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│         Background Job: process-screen.ts                    │
│         (Runs asynchronously per screen)                     │
│                                                              │
│  STAGE 1: NORMALIZATION                                     │
│  ├─ Resize image to consistent resolution                    │
│  ├─ Convert format (PNG, JPEG, WebP)                        │
│  └─ Store normalized version                                │
│                                                              │
│  STAGE 2: LAYOUT ANALYSIS                                   │
│  ├─ Send image + prompt to Claude vision                    │
│  ├─ Claude identifies: header, nav, body, sidebar, footer   │
│  └─ Save regions JSON: [{name, bounds}]                     │
│                                                              │
│  STAGE 3: ELEMENT DETECTION                                 │
│  ├─ Send image + prompt to Claude vision                    │
│  ├─ Claude identifies all UI components with bounds         │
│  └─ Save elements JSON: [{type, name, bounds}]              │
│                                                              │
│  STAGE 4: TEXT EXTRACTION                                   │
│  ├─ Send image + prompt to Claude vision                    │
│  ├─ Claude extracts all visible text labels                 │
│  └─ Save text JSON: [{content, bounds}]                     │
│                                                              │
│  STAGE 5: ANNOTATION GENERATION                             │
│  ├─ For each detected element:                              │
│  │   a. Send to Claude LLM with context                     │
│  │   b. Claude generates: interaction, validation,          │
│  │      errorState, successState, devNotes, aria_label      │
│  │   c. Create Annotation record (isAIGenerated: true)       │
│  └─ Update Screen.processingStatus: 'done'                  │
│                                                              │
│  STAGE 6: FLOW HINTS (Optional)                             │
│  ├─ Analyze buttons, labels for likely next screen          │
│  └─ Generate suggested flow connections                     │
│                                                              │
│  STAGE 7: FEATURE GROUPING (Optional)                       │
│  ├─ Analyze screen content, purpose                         │
│  └─ Suggest which feature this belongs to                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│     Frontend: Real-time Updates (WebSocket or Polling)       │
│  1. Screens sidebar shows processingStatus updates           │
│  2. When stage completes, UI updates progress bar            │
│  3. When done, annotation boxes render on canvas             │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│        User Inspects Annotation (Frontend)                   │
│  1. Click annotation box on canvas                           │
│  2. Right panel shows all annotation fields                  │
│  3. User can edit, regenerate, or delete                     │
│  4. Changes auto-save to database                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Canvas Rendering Layers (Konva.js)

```
┌─────────────────────────────────────────────────────┐
│           CANVAS: Three-Layer Stack                 │
└─────────────────────────────────────────────────────┘

Layer 3 (Top)
├─ Interactive UI: cursor tracking, focus borders
├─ Redline measurements (distance indicators)
├─ Selection handles (corner + edge resize grips)
└─ Crosshair (draw mode indicator)

Layer 2 (Middle)
├─ Konva.Rect for each annotation
├─ Semi-transparent colored fill (by element type)
├─ 2px border stroke
├─ Element type label (top-left, white text)
├─ Number badge (annotation ID)
├─ Click handler → dispatch to right panel
└─ Hover handler → show tooltip

Layer 1 (Bottom)
├─ Konva.Image (the actual screen backdrop)
├─ Pan/zoom context applied to all layers
├─ Background events (click empty area to deselect)
└─ Grid background (optional, subtle)

┌─ Canvas Context ─────────────────────────────────┐
│ • Zoom level (1 = 100%, 0.5 = 50%, 2 = 200%)     │
│ • Pan offset (x, y coordinates)                  │
│ • Selected annotation ID                         │
│ • Draw mode active? (true/false)                 │
│ • Draw rectangle (draft coordinates)             │
│ • Hover annotation ID                            │
└──────────────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
User (1) ─────────────────┬───────────────────── (Many) Project
                          │
                    (1 user, many projects)
                          │
                          ├─ figmaFileKey: str (link to Figma file)
                          │
                    Project (1) ────┬──────────── (Many) Screen
                                    │
                            (1 project, many screens)
                                    │
                    Screen (1) ──────┬──────────── (Many) Annotation
                                    │
                           (1 screen, many annotations)
                                    │
                    Annotation (Many) ── (1) User
                                    │
                        (annotations created by users)

User (1) ──────────────────────────── (1) FigmaToken
            (user's Figma connection)

Project (1) ─────────────────────────── (Many) Flow
            (project can have multiple flows/journeys)

Flow: {
  nodesJSON: [{id, screenId, label, position}],
  edgesJSON: [{source, target, label}]
}
```

---

## Processing Pipeline Status States

```
Screen.processingStatus Timeline:

┌──────┐     ┌───────────┐     ┌─────────┐     ┌──────┐     ┌────┐
│queued│ ──→ │processing │ ──→ │ partial │ ──→ │ done │  or │fail│
└──────┘     └───────────┘     └─────────┘     └──────┘     └────┘

Queued:   Just imported, waiting for job queue
Processing: Currently running Stages 1-7
Partial: Some stages done (e.g., image normalized but not annotated)
Done:     All stages complete, annotations visible on canvas
Failed:   Error occurred, shows error message, user can retry

UI Indicator (Screens Sidebar):
├─ Grey dot:   queued
├─ Blue spinner: processing
├─ Yellow dot:   partial
├─ Green dot:   done
└─ Red dot:     failed

Annotation Record Created?
├─ No:  Stages 1-4 complete (layout, elements, text detected)
└─ Yes: Stage 5 complete (specs generated, saved as Annotation records)
```

---

## Component Hierarchy

```
App (root)
├─ Layout
│  ├─ Navbar
│  │  ├─ Logo
│  │  ├─ Product tabs
│  │  ├─ Share button
│  │  ├─ Export button
│  │  ├─ DevMode toggle
│  │  ├─ NotificationBell
│  │  └─ UserMenu
│  │
│  └─ Sidebar (left)
│     ├─ ScreensList
│     │  ├─ ImportButton
│     │  └─ ScreenCard (per screen)
│     │     ├─ Thumbnail
│     │     ├─ Name
│     │     └─ StatusIndicator
│     │
│     ├─ FlowsList
│     │  ├─ NewFlowButton
│     │  └─ FlowCard (per flow)
│     │
│     └─ FeaturesList
│        ├─ NewFeatureButton
│        └─ FeatureCard (per feature)
│
├─ MainContent
│  ├─ MainCanvas (Konva)
│  │  ├─ Layer 1: Image
│  │  ├─ Layer 2: AnnotationBoxes
│  │  └─ Layer 3: Redlines/UI
│  │
│  ├─ ToolBar (canvas controls)
│  │  ├─ ZoomControls
│  │  ├─ DrawButton (D)
│  │  ├─ ShowAnnotationsToggle (A)
│  │  ├─ FitToScreenButton
│  │  └─ ResetViewButton
│  │
│  └─ RightPanel
│     ├─ AnnotationDetail (when annotation selected)
│     │  ├─ ElementName
│     │  ├─ TypeBadge
│     │  ├─ Field cards (interaction, validation, etc.)
│     │  ├─ EditButtons
│     │  ├─ RegenerateButton
│     │  └─ DeleteButton
│     │
│     └─ (or) AnnotationList (when no selection)
│
├─ Modals
│  ├─ ImportModal
│  ├─ ExportModal
│  ├─ ShareModal
│  └─ ConfirmDialog
│
└─ NotificationCenter
   └─ NotificationCard (per notification)
```

---

## State Management (Zustand)

```javascript
// Workspace Store
const useWorkspace = create((set) => ({
  // Canvas state
  currentScreenId: null,
  selectedAnnotationId: null,
  hoveredAnnotationId: null,
  zoomLevel: 1,
  panX: 0,
  panY: 0,
  drawMode: false,
  drawRect: null, // {x, y, w, h, startX, startY}
  
  // UI state
  showAnnotations: true,
  showRedlines: false,
  developerMode: false,
  
  // Sidebar state
  expandedFlows: [],
  expandedFeatures: [],
  
  // Actions
  setCurrentScreen: (screenId) => set({ currentScreenId: screenId }),
  selectAnnotation: (id) => set({ selectedAnnotationId: id }),
  setZoom: (level) => set({ zoomLevel: level }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  setDrawMode: (active) => set({ drawMode: active }),
  // ... etc
}));

// React Query for Server State
const { data: project } = useQuery({
  queryKey: ['project', projectId],
  queryFn: () => fetch(`/api/projects/${projectId}`).then(r => r.json())
});

const { data: annotations } = useQuery({
  queryKey: ['annotations', screenId],
  queryFn: () => fetch(`/api/screens/${screenId}/annotations`).then(r => r.json())
});
```

---

## Keyboard Shortcuts Reference

```
Canvas Navigation:
├─ [ / ]          Previous / Next screen
├─ Space + Drag   Pan canvas
├─ Scroll         Zoom in/out
├─ Cmd+0          Fit to screen
├─ Cmd++          Zoom in
├─ Cmd+-          Zoom out

Annotation Tools:
├─ D              Activate draw mode
├─ A              Toggle annotation overlays
├─ Delete         Delete selected annotation
├─ Escape         Cancel draw / close modals
├─ Cmd+D          Duplicate selected annotation

Global:
├─ Cmd+I          Open import modal
├─ Cmd+E          Open export modal
├─ Cmd+K          Quick search (screens, annotations, flows)
├─ Cmd+Z          Undo
├─ Cmd+Shift+Z    Redo
└─ Cmd+F          Search within screen annotations
```

---

## Security & Auth Flow

```
User Signs Up
├─ Email/Password: hash password, store in Supabase Auth
├─ Google OAuth: redirect to Google, capture OAuth code
└─ GitHub OAuth: redirect to GitHub, capture OAuth code

User Logs In
├─ Supabase Auth validates credentials
├─ JWT token issued (httpOnly cookie)
├─ Token used for all API calls

Protected API Routes
├─ Middleware: check JWT in header/cookie
├─ Verify user owns resource (project, annotation)
├─ Return 401 Unauthorized if invalid
└─ Proceed with request if valid

Figma Token Storage
├─ User connects Figma account
├─ Figma OAuth token captured
├─ Encrypt token with AES-256 (at rest)
├─ Store in FigmaToken table
├─ Decrypt on demand to call Figma API
└─ Refresh token if expired

Shared Links
├─ User generates share link
├─ System creates unique token (random 32-char string)
├─ Store in Share table with accessLevel, expiresAt
├─ GET /api/share/:token (no auth required)
├─ Check token valid + not expired
└─ Return project data with isReadOnly: true
```

---

## Error Handling & Retry Logic

```
Figma API Errors:
├─ 401 Unauthorized: Token expired → refresh or prompt re-auth
├─ 429 Too Many Requests: Rate limited → queue system, exponential backoff
├─ 500 Server Error: Figma down → retry after 30s, show user "retrying..."
└─ Network timeout: → retry 3x with exponential backoff (1s, 2s, 4s)

Claude API Errors:
├─ Rate limit: queue jobs, retry after delay
├─ Token limit exceeded: split large image into regions, process separately
├─ API error: retry once, then show user "Processing failed, try again"
└─ Timeout: cancel job after 30s, mark as failed, allow user to retry

Database Errors:
├─ Unique constraint violation: show user "Project name already exists"
├─ Connection error: retry connection, show "Reconnecting..."
└─ Transaction rollback: retry entire operation

UI Error Display:
├─ Toast notifications: "Error: [friendly message]" (auto-dismiss after 5s)
├─ Inline errors: show under form fields
├─ Modal errors: show in centered error dialog with "Retry" / "Dismiss" buttons
└─ Processing errors: show in red banner, allow user to continue or retry
```

---

This reference should guide Claude Code through the entire architecture. Save it and refer back as needed!
