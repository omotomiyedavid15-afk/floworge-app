# 🚀 Claude Code: FlowForge Quick-Start Prompts

Use these exact prompts in Claude Code to build each phase. Copy-paste one at a time and wait for completion before moving to the next.

---

## PHASE 1: Design System Scaffolding

```
I'm building FlowForge, a full-stack SaaS design-to-code platform. I have a complete specification including a proprietary design system (DESIGN.md) that you must implement exactly.

**Phase 1 Goal:** Scaffold Next.js 14 project and implement the design system as Tailwind config + component library.

**Tech Stack:**
- Next.js 14 (App Router, TypeScript strict)
- Tailwind CSS
- figmaSans variable font (weights: 320, 330, 340, 450, 480, 540, 700)

**Design System Requirements (Non-negotiable):**

Colors:
- Pure Black (#000000) — all text, borders, solid buttons
- Pure White (#ffffff) — backgrounds, white buttons
- Glass Dark (rgba(0, 0, 0, 0.08)) — secondary button overlays
- Glass Light (rgba(255, 255, 255, 0.16)) — buttons on dark surfaces

Typography:
- figmaSans for body text (use system-ui, SF Pro Display as fallbacks)
- figmaMono for monospace/labels
- Default weights: body at 330-340, headings at 400-540, bold at 700
- Apply negative letter-spacing to all body text: -0.14px to -0.26px
- Apply positive letter-spacing to figmaMono labels: 0.54px to 0.6px
- Enable OpenType "kern" feature globally

Button Geometry:
- Main buttons: 50px border-radius (pill shape)
- Icon buttons: 50% border-radius (circle)
- All buttons: 2px dashed outline on focus (not solid!)

Spacing:
- 8px base unit scale: 1px, 2px, 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 50px

**Your Task:**

1. Create Next.js 14 project with TypeScript and App Router
   ```bash
   npx create-next-app@latest flowforge --typescript --tailwind --app --no-eslint
   cd flowforge
   ```

2. Install tailwindcss and configure for design tokens:
   - Create CSS variables in globals.css for colors, spacing, typography
   - figmaSans variable font: either from Google Fonts (if available) or use system fallback
   - Typography scale: display (86px), section heading (64px), sub-heading (26px), body (20px/16px), mono labels

3. Create component library:
   - Button: BlackPill, WhitePill, GlassDark, GlassLight variants
   - Each variant applies correct radius (50px pill or 50% circle)
   - All variants have focus:outline-dashed focus:outline-2 focus:outline-black
   
4. Build base UI shell:
   - Global nav bar: Figma logo (text "FlowForge"), product tabs area, user menu placeholder
   - Sidebar: empty, ready for future use
   - Main content area: full-height
   - Apply dark background to nav (you choose black or dark gray from palette)

5. Create a /design-system demo page showing:
   - All colors (black, white, glass dark, glass light) as swatches
   - Typography hierarchy: display, headings, body, mono
   - Button variants: all 4 types with hover and focus states
   - Focus indicator reference (show dashed vs solid to emphasize)
   - Spacing examples

6. Validate:
   - No functional features yet
   - Focus on pixel-perfect design implementation
   - Test in browser: are colors exactly matching? Is letter-spacing correct? Are focus states dashed?

Stop when Phase 1 is complete. Do not proceed to Phase 2 until I say "PHASE 2 READY".
```

---

## PHASE 2: Authentication & Database Schema

```
Phase 2: Build authentication and database schema for FlowForge.

**Goal:** Users can sign up, log in, and projects can be created. No UI yet (API-only for now).

**Tech Stack:**
- Supabase (PostgreSQL + Auth)
- Prisma ORM
- NextAuth.js or Supabase Auth integration

**Database Schema (Prisma):**

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  passwordHash      String?
  emailVerified     DateTime?
  twoFactorEnabled  Boolean   @default(false)
  authProvider      String?   // 'google', 'github', 'email'
  subscriptionTier  String    @default("free") // 'free', 'pro', 'enterprise'
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
  backdropUrl       String?   // URL to stored image in Supabase Storage
  nodeTreeJSON      Json?     // Figma node tree for this frame
  processingStatus  String    @default("queued") // 'queued', 'processing', 'partial', 'done', 'failed'
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
  x                 Int       // canvas x coordinate
  y                 Int       // canvas y coordinate
  w                 Int       // width
  h                 Int       // height
  type              String    // 'Button', 'Input', 'Label', etc.
  elementName       String?   // user-given name
  interaction       String?   // what happens on click
  validation        String?   // validation rules
  errorState        String?   // error description
  successState      String?   // success description
  devNotes          String?   // dev implementation notes
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
  name              String    // e.g. "User Onboarding"
  nodesJSON         Json      // Array of nodes: {id, screenId, label, position}
  edgesJSON         Json      // Array of edges: {source, target, label}
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([projectId])
}

model FigmaToken {
  id                String    @id @default(cuid())
  userId            String    @unique
  encryptedToken    String    // Figma PAT encrypted at rest
  expiresAt         DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

**Your Tasks:**

1. Setup Supabase:
   - Create a Supabase project (local or cloud)
   - Get connection string and anon key
   - Store in .env.local

2. Initialize Prisma:
   ```bash
   npm install @prisma/client
   npx prisma init
   ```
   - Set DATABASE_URL in .env.local to your Supabase PostgreSQL connection string
   - Copy the schema above into prisma/schema.prisma

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Setup Supabase Auth:
   - Enable Google OAuth in Supabase Console (https://console.supabase.com)
   - Enable GitHub OAuth
   - Enable Email/Password auth
   - Get OAuth credentials and store in .env.local

5. Implement NextAuth.js or Supabase Auth integration:
   - Install @supabase/supabase-js and @supabase/auth-js
   - Create app/api/auth/[...nextauth]/route.ts (if using NextAuth)
   - Or create Supabase auth client in lib/supabase.ts
   - Implement signup endpoint: POST /api/auth/signup
   - Implement login endpoint: POST /api/auth/login
   - Implement logout endpoint: POST /api/auth/logout
   - Implement get current user: GET /api/auth/me

6. Create basic API endpoints (no UI, test via curl/Postman):
   - POST /api/projects (create project, requires auth)
   - GET /api/projects (list user's projects)
   - GET /api/projects/:id (get project details)

7. Test via API:
   - Sign up a user via email
   - Create a project
   - Verify in Supabase console that data appears

Stop when users can sign up, log in, and projects can be created via API. No UI yet.
```

---

## PHASE 3: Figma Import & Canvas Rendering

```
Phase 3: Build Figma import and Konva.js canvas rendering.

**Goal:** Connect to Figma, import frames, render on interactive canvas with pan/zoom.

**Libraries to Install:**
```bash
npm install react-konva konva @supabase/storage-js
```

**Your Tasks:**

1. Setup Figma OAuth:
   - Register FlowForge as a Figma app (https://www.figma.com/developers/apps)
   - Get Client ID and Client Secret
   - Store in .env.local as FIGMA_CLIENT_ID and FIGMA_CLIENT_SECRET
   - Create /api/auth/figma endpoint to handle OAuth callback
   - On callback: fetch OAuth token, encrypt, store in FigmaToken table
   - Add 'Connect Figma' button in project settings (placeholder UI for now)

2. Build Figma API client (lib/figma.ts):
   - Create async function to fetch file metadata: getFileMetadata(fileKey, token)
     - Calls GET https://api.figma.com/v1/files/:file_key
     - Returns pages and frames list
   - Create async function to fetch frame images: getFrameImages(fileKey, nodeIds, token)
     - Calls GET https://api.figma.com/v1/images/:file_key
     - Returns PNG URLs at 2x resolution
   - Implement rate limiting queue (use p-queue library)
   - Handle API errors and retries

3. Create import flow endpoints:
   - POST /api/projects/:id/import/figma
     - Accepts { figmaFileUrl }
     - Validates URL format
     - Fetches file metadata using Figma API
     - Returns { pages, frames } for UI to show selector
   - POST /api/projects/:id/import/figma/confirm
     - Accepts { selectedFrameIds }
     - Creates Screen records in database
     - Downloads frame images and stores in Supabase Storage
     - Queues processing jobs
     - Returns { screenIds, processingStatus }

4. Build Konva canvas component (components/MainCanvas.tsx):
   - Create a Stage with Canvas context
   - Layer 1: Konva.Image (the backdrop frame image)
   - Interactive controls:
     - Mouse wheel zoom in/out (1.1x per scroll)
     - Ctrl+Mouse wheel zoom (finer control)
     - Space + drag to pan canvas
     - Middle mouse button to pan
     - Double-click to fit image to screen (auto-zoom)
     - Cmd+0 or Cmd+Shift+F to fit to screen
   - Show zoom level in corner (e.g., "200%")
   - Show screen name in top bar (e.g., "Login Screen 1 of 5")
   - Keyboard shortcuts: [ and ] to go prev/next screen

5. Build Screens sidebar (components/ScreensList.tsx):
   - List all screens in project
   - Show thumbnail preview (small, maybe 100px wide)
   - Show screen name
   - Show processing status indicator:
     - Grey dot: queued
     - Blue spinning dot: processing
     - Yellow dot: partial
     - Green dot: done
     - Red dot: error
   - Click screen to load in canvas
   - At top of sidebar: global progress bar "3 of 8 screens imported"

6. Create coordinate transformation utility (lib/coordinates.ts):
   - Function to convert Figma absoluteBoundingBox to local canvas coordinates
   - Account for zoom and pan offsets
   - Used later in Phase 4 for annotation rendering

7. Connect everything:
   - Update dashboard to show import button
   - Clicking import shows modal with Figma URL input
   - User pastes Figma URL → calls POST /api/projects/:id/import/figma
   - Shows frame selector
   - User selects frames → calls POST /api/projects/:id/import/figma/confirm
   - New screens appear in sidebar
   - Clicking screen loads it in canvas

Stop when you can:
- Connect Figma account via OAuth
- Paste a Figma file URL and see page/frame selector
- Select frames to import
- See imported screens in sidebar with status
- Load screen on canvas
- Pan and zoom the canvas smoothly
```

---

## PHASE 4: AI Annotation Engine

```
Phase 4: Implement AI-powered element detection and annotation generation.

**Goal:** Upload a screenshot, detect UI elements with vision, generate specs with LLM, render highlights on canvas.

**Libraries to Install:**
```bash
npm install @anthropic-ai/sdk sharp node-cron
```

**Your Tasks:**

1. Setup Anthropic Claude API:
   - Get API key from https://console.anthropic.com
   - Store as ANTHROPIC_API_KEY in .env.local
   - Install @anthropic-ai/sdk

2. Build annotation processing pipeline (app/api/jobs/process-screen.ts):
   
   **Stage 2: Layout Analysis**
   - Input: Screen image
   - Use Claude vision + JSON mode to segment screen
   - Prompt Claude: "Analyze this UI screenshot. Identify major regions: header, navigation, main content area, sidebar, footer. Output as JSON: {regions: [{name, bounds: {x, y, w, h}}]}"
   - Save regionJSON to Screen table
   
   **Stage 3: Element Detection**
   - Input: Screen image + regions
   - Use Claude vision to identify all UI elements
   - Prompt Claude with vision: "In this UI screenshot, identify all interactive and structural elements. For each element, provide: name (e.g., 'Login Button'), type (Button, Input, Dropdown, Navbar, Card, etc.), bounds (x, y, width, height in pixels). Output as JSON: {elements: [{name, type, bounds}]}"
   - Save elementsJSON to Screen table
   
   **Stage 4: Text Extraction**
   - Use Claude vision to read all visible text
   - Prompt: "Extract all text from this UI screenshot. Return as JSON: {text: [{content, bounds}]}"
   - Save textJSON to Screen table
   
   **Stage 5: Annotation Generation**
   - Input: elementsJSON
   - For each element, call Claude:
     - Prompt: "This is a [TYPE] element with label '[LABEL]' on a [PRODUCT] app. Generate developer documentation: 1) What happens when user clicks/interacts? 2) Any validation rules? 3) What error state appears? 4) What success state? 5) Any accessibility notes (ARIA label)? 6) Any dev implementation notes? Format as JSON: {interaction, validation, errorState, successState, aria_label, devNotes}"
   - Save each annotation as Annotation record (with isAIGenerated: true)

3. Create processing queue:
   - Use node-cron or Bull to process screens one at a time
   - After import, each Screen gets processingStatus: 'queued'
   - Job picks up screen, runs Stages 2-5
   - Updates Screen.processingStatus: 'processing' while running
   - On success: 'done'
   - On error: 'failed', shows error message
   - Updates UI in real-time via WebSocket (optional) or polling

4. Build annotation canvas layer (in MainCanvas.tsx):
   - Layer 2: Konva.Rect for each annotation
   - Render semi-transparent rectangle with:
     - Fill color based on element type (buttons=blue, inputs=purple, nav=grey, etc.)
     - Opacity: 0.2
     - Stroke: 2px solid, same color
   - Show element type label in top-left corner (small, white text on semi-transparent dark bg)
   - Interactive:
     - Click rect → dispatch annotation ID to right panel
     - Hover rect → show tooltip with element name + type
     - Right panel highlights corresponding annotation card
   - Toggle visibility:
     - 'A' key toggles all annotations on/off
     - Show/Hide button in toolbar
   - Z-index: Layer 1 (image), Layer 2 (annotation rects)

5. Build annotation detail panel (components/AnnotationPanel.tsx):
   - Right sidebar, width: 350px
   - Shows annotation details for selected annotation:
     - Element name (large, bold)
     - Type badge (small pill: "Button", "Input", etc.)
     - isAIGenerated badge (sparkle icon) or isManual badge (pencil icon)
     - Expandable card showing all fields:
       - Interaction (text)
       - Validation (text)
       - Error State (text)
       - Success State (text)
       - Dev Notes (text)
       - ARIA Label (text)
     - Edit button: makes all fields editable inline, auto-save on blur
     - 'Ask AI to fill' button: calls Claude to suggest content for any field
     - Regenerate button: re-runs Stage 5 for just this element
     - Delete button: removes annotation (confirmation if AI-generated)
     - Reposition button: re-enters draw mode to redraw region

6. Implement draw mode for manual annotations (components/DrawMode.tsx):
   - Activated by pressing 'D' or clicking 'Draw' button in toolbar
   - Cursor changes to crosshair
   - User clicks and drags on canvas to draw rectangle
   - While drawing: dashed purple border (2px)
   - On release:
     - Rectangle turns solid with 8 resize handles (corners + edges)
     - Popover appears above rectangle with inline form:
       - Element name input (required)
       - Element type dropdown (Button, Input, Label, Image, Custom)
       - 'Next' button
   - After Next:
     - Annotation form slides in from right with fields:
       - Interaction (textarea)
       - Validation (textarea)
       - Error State (textarea)
       - Dev Notes (textarea)
       - 'Ask AI to fill [field]' buttons (optional)
     - 'Save Annotation' button
   - On Save:
     - Creates Annotation record (isAIGenerated: false)
     - Dashed border → solid with number badge
     - Rectangle added to annotations layer
   - Cancel/Escape: discards unsaved annotation

7. Connect to existing project:
   - After importing screens, automatically trigger processing jobs
   - Show processing status in screens sidebar
   - As annotations complete, render them on canvas
   - User can click to inspect or re-process

Stop when you can:
- Import a screenshot (Phase 3)
- AI processes it and detects elements
- See annotation boxes on canvas
- Click annotation to see specs in right panel
- Draw manual annotations with form
- Edit annotations inline
```

---

## PHASE 5: User Flows & Feature Docs

```
Phase 5: Build user flow mapping editor and auto-generated feature documentation.

**Libraries to Install:**
```bash
npm install @xyflow/react @xyflow/system zustand
```

**Your Tasks:**

1. Build Flow Editor UI (components/FlowEditor.tsx):
   - React Flow canvas with nodes for screens, edges for connections
   - Left sidebar: list of screens to drag onto canvas
   - Canvas:
     - Grid background
     - Screen nodes: thumbnail + name, port dots on edges
     - Directed edges with arrow heads
     - Node selected state: purple border
     - Edge selected state: thicker stroke, label visible
   - Toolbar:
     - Auto layout button (left-to-right arrangement)
     - Align buttons (top, bottom, left, right, center)
     - Distribute evenly button
     - Fit to screen button (Cmd+Shift+F)
   - Minimap in bottom-left corner

2. Create Flow storage endpoints:
   - POST /api/flows (create new flow)
   - GET /api/projects/:id/flows (list all flows in project)
   - PUT /api/flows/:id (save flow nodesJSON and edgesJSON)
   - DELETE /api/flows/:id (delete flow)

3. Implement Flow node interactions:
   - Drag screens from sidebar onto canvas → creates node
   - Connect two nodes: click port dot on node A, drag to node B
   - Double-click edge to add label (e.g., "On success", "On error")
   - Select node → 'Open Screen' button jumps to that screen
   - Select edge → press Delete to remove connection
   - Multi-select: Cmd+click or drag selection box
   - Drag multiple selected nodes together
   - Add Decision Node (diamond): right-click canvas → 'Add Decision Node'
     - Label field (e.g., "Is user logged in?")
     - Multiple outgoing connections with Yes/No/Other labels

4. AI Flow Suggestions:
   - After all screens processed, run AI suggestion job
   - Analyze all screen content, button labels, navigation patterns
   - Generate suggested flow connections (e.g., Login → Dashboard because "Dashboard" button found)
   - Show 'AI Suggested Flow' card in Flows tab with:
     - 'Accept All' button
     - 'Review One by One' button
   - Review modal shows each suggestion:
     - Screen A thumbnail → arrow → Screen B thumbnail
     - Reason: "[Element] found on Screen A matches Screen B"
     - Accept / Reject / Modify buttons
   - Accepted suggestions auto-added to flow canvas

5. Build Feature Documentation pages (components/FeaturePage.tsx):
   - After screens processed, AI groups them into suggested features
   - Show notification: "AI suggested 4 feature groups"
   - Features tab shows suggestions with:
     - Suggested name (e.g., "Authentication", "Checkout")
     - Screens grouped under it
     - Confidence score (High/Medium/Low)
     - Accept / Rename / Move screens / Reject buttons
   - Feature page structure:
     - Header: feature name, status badge (Draft/Ready/In Development/Shipped), description
     - Summary section: 1-3 sentence AI overview (editable with 'Regenerate' button)
     - Flow diagram: mini flow showing this feature's screens
     - Screens section: grid of screen cards from this feature
     - Edge Cases section: bulleted list of edge cases (AI-generated + user-added)
     - Open Questions section: list of unresolved design decisions
     - Changelog: auto-logged history of changes
   - All text fields editable inline, auto-save on blur
   - 'Add Edge Case' button to manually add custom edge cases
   - Edge cases can be marked 'Resolved' (collapse to separate section)

6. Connect flows to features:
   - Feature page includes 'Associated Flows' section
   - Shows which flow(s) this feature appears in
   - User can add/remove flows

7. Feature status workflow:
   - Status dropdown: Draft → In Review → Ready for Dev → In Development → Shipped
   - Status changes logged to Changelog
   - 'Ready for Dev' sends notification to tagged developers

Stop when you can:
- Create a flow by connecting screens on canvas
- See AI-suggested flows and accept/reject them
- Generate feature doc pages (auto-grouped screens)
- View feature page with all sections filled in
- Edit feature name, summary, add edge cases
```

---

## PHASE 6: Developer Handoff & Exports

```
Phase 6: Build Developer Mode, export formats, and sharing.

**Libraries to Install:**
```bash
npm install pdfkit html2pdf
```

**Your Tasks:**

1. Implement Developer Mode:
   - Toggle switch in top nav: "Developer Mode"
   - When on:
     - Editing controls hidden (Draw button, Edit buttons, etc.)
     - Right panel expands wider (450px instead of 350px)
     - Annotation overlays always visible (can't toggle off)
     - Implementation checklist appears for feature docs
   - Preference saved in localStorage per user

2. Build export endpoints:
   - GET /api/features/:id/export/markdown
     - Generates full feature doc as .md file
     - Includes: title, summary, flow diagram (as ASCII), screens, annotations as code blocks, edge cases, dev notes
     - Returns markdown string
   - GET /api/features/:id/export/pdf
     - Generates PDF with formatted content
     - Includes images of screens with annotation overlays
     - Uses pdfkit or html2pdf
     - Returns PDF buffer, triggers download
   - GET /api/projects/:id/export/json
     - Exports entire project as JSON
     - Includes: screens, annotations, flows, features
     - Returns JSON file for download
   - GET /api/features/:id/export/notion
     - Pushes feature doc to Notion (requires Notion OAuth)
     - Creates new page in workspace with feature content
     - Returns Notion page URL

3. Build export UI (components/ExportModal.tsx):
   - Modal triggered by 'Export' button in top nav
   - Tabs: Markdown | PDF | JSON | Notion
   - Options:
     - Scope: Current screen / Current feature / Entire project
     - Include: Screen images, Annotation overlays, Flow diagrams, Edge cases, Dev notes
   - For Notion: requires OAuth connection (shows 'Connect Notion' button if not connected)
   - 'Generate Export' button
   - For large projects: show progress indicator (background job)
   - Download link appears or auto-downloads file

4. Build sharing UI (components/ShareModal.tsx):
   - 'Share' button in top nav
   - Share modal with:
     - 'Copy link' button → generates unique read-only URL
     - Access level dropdown:
       - Anyone with link
       - Specific emails (add email addresses)
       - Team only
     - Password protection toggle (optional password input)
     - Link expiry: Never / 7 days / 30 days
   - When link copied: toast notification "Link copied!"
   - When recipient opens link: loads project in read-only/Developer Mode
   - No login required for 'Anyone with link'

5. Create shared link endpoint:
   - POST /api/projects/:id/share
     - Creates unique token
     - Stores in Share table: {projectId, token, accessLevel, password, expiresAt}
   - GET /api/share/:token
     - Validates token (not expired, not deleted)
     - Returns project data with isReadOnly: true
   - DELETE /api/projects/:id/share/:token (revoke link)

6. Build notification system (components/NotificationCenter.tsx):
   - Bell icon in top nav with unread count badge
   - Click opens notification panel from right
   - Notifications triggered by:
     - AI processing batch complete
     - Collaborator adds feedback annotation
     - Feature status changes to 'Ready for Dev'
     - Developer marks feature 'In Development'
     - Shared link first accessed
     - Figma token expired
     - Export ready to download
   - Each notification:
     - Icon, message, timestamp
     - 'Go to' link (jumps to related item)
     - Dismiss button
   - Options:
     - 'Mark all as read'
     - 'Clear all'
   - Opt-in email digest (daily summary)

7. Connect everything:
   - Developer can toggle 'Developer Mode'
   - Can export current feature as PDF/MD/JSON
   - Can generate share link with access controls
   - Gets notified of project activity

Stop when you can:
- Toggle Developer Mode → UI adjusts
- Export current feature as PDF/Markdown/JSON
- Generate share link, set access controls, expiry
- Open shared link in read-only mode
- See in-app notifications
```

---

## 🎯 How to Use These Prompts

1. **Start with Phase 1:** Copy the Phase 1 prompt, paste into Claude Code, and run it to completion.
2. **Wait for confirmation:** Each prompt ends with "Stop when..." — wait for that state before moving on.
3. **Review:** Test each phase in browser or via API before proceeding.
4. **Move to Phase 2:** Once Phase 1 is validated, copy Phase 2 prompt.
5. **Repeat:** Follow this pattern for all 6 phases.

---

## ✅ Final Checklist

- [ ] Phase 1: Design system working, all tokens match DESIGN.md
- [ ] Phase 2: Users sign up, login, projects created
- [ ] Phase 3: Figma import, canvas rendering, pan/zoom
- [ ] Phase 4: AI detects elements, annotations visible, manual draw mode
- [ ] Phase 5: Flows created, features auto-grouped, feature docs
- [ ] Phase 6: Developer mode, exports, sharing

**Ready to deploy!**
