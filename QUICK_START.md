# 🚀 How to Build FlowForge with Claude Code: 30-Second Summary

You have **three comprehensive documents** that tell Claude Code exactly how to build FlowForge. Here's how to use them:

---

## 📚 Your Documents

1. **CLAUDE_CODE_BUILD_BRIEF.md**
   - The complete project specification
   - 6 phases, each with deliverables and acceptance criteria
   - Detailed architecture and tech stack
   - Environment setup instructions

2. **CLAUDE_CODE_PHASE_PROMPTS.md**
   - Copy-paste ready prompts for Claude Code
   - One prompt per phase (6 total)
   - Each prompt is self-contained and detailed

3. **ARCHITECTURE_REFERENCE.md**
   - Visual diagrams of the system
   - Data flow from import to annotation
   - Database schema and relationships
   - Component hierarchy
   - State management patterns

---

## ✅ How to Execute

### Step 1: Setup Environment
```bash
# Create a new directory
mkdir flowforge && cd flowforge

# Have these credentials ready:
# - Figma OAuth (client ID + secret)
# - Supabase URL + anon key + service key
# - Anthropic API key
# - GitHub OAuth (ID + secret)
# - Google OAuth (ID + secret)
```

### Step 2: Start with Phase 1 (Design System)
1. Open Claude Code
2. Copy the **Phase 1 prompt** from CLAUDE_CODE_PHASE_PROMPTS.md
3. Paste it into Claude Code chat
4. Wait for completion (Claude will create Next.js project + design tokens)
5. Test in browser: `npm run dev` → `http://localhost:3000/design-system`
6. Verify all colors, typography, buttons match DESIGN.md exactly

### Step 3: Move to Phase 2 (Auth & Database)
1. Once Phase 1 is validated, copy **Phase 2 prompt**
2. Paste into Claude Code
3. This sets up Supabase, Prisma schema, auth endpoints
4. Test: sign up user, create project via API

### Step 4-6: Repeat for Phases 3, 4, 5, 6
- Each phase builds on the previous one
- Each phase has clear acceptance criteria (stop when you reach them)
- Don't skip ahead; follow the sequence

---

## 🎯 Phase Overview

| Phase | What Gets Built | Duration | Stop When... |
|-------|-----------------|----------|-------------|
| **1** | Design system, Next.js, Tailwind setup | ~30 min | Design tokens validated in browser |
| **2** | Auth, database, Prisma schema | ~45 min | Users can sign up/login via API |
| **3** | Figma import, Konva canvas, pan/zoom | ~60 min | Can import Figma files and render on canvas |
| **4** | AI element detection, annotation overlays | ~90 min | AI detects elements, annotations appear, manual draw mode works |
| **5** | User flows, feature documentation | ~60 min | Can create flows, generate feature docs |
| **6** | Developer mode, exports, sharing | ~45 min | Developer mode works, exports functional, sharing links work |

**Total Build Time: ~5-6 hours for a complete, production-ready SaaS**

---

## 🔑 Critical Rules

1. **DESIGN.md is absolute truth for UI**
   - All colors must be #000000 or #ffffff (monochrome)
   - Use figmaSans variable font with specific weights
   - Pill buttons (50px radius), dashed focus outlines
   - No deviations

2. **Follow phases in order**
   - Don't skip or combine phases
   - Each phase depends on the previous one
   - Test and review before moving on

3. **Use the prompts exactly as written**
   - Copy-paste the full prompt from CLAUDE_CODE_PHASE_PROMPTS.md
   - Claude Code is optimized for these specific instructions
   - Customizing prompts may cause inconsistencies

4. **Stop at phase boundaries**
   - Each prompt ends with "Stop when..."
   - Wait for that state before moving to next phase
   - This prevents scope creep and ensures quality

---

## 🛠️ Tech Stack (Locked In)

```
Frontend:    Next.js 14 + App Router + TypeScript
Styling:     Tailwind CSS + figmaSans variable font
State:       Zustand (local) + TanStack Query (server)
Canvas:      react-konva + Konva.js
Flows:       @xyflow/react (React Flow)
Backend:     Next.js API routes
Database:    Supabase (PostgreSQL) + Prisma
Storage:     Supabase Storage
AI:          Anthropic Claude 3.5 Sonnet
Auth:        Supabase Auth (Google, GitHub, Email/Password)
Jobs:        node-cron or Bull queue
```

These are non-negotiable and already specified in the prompts.

---

## 📋 Pre-Build Checklist

Before you start Phase 1, gather:

- [ ] Figma OAuth credentials (https://www.figma.com/developers/apps)
- [ ] Supabase project (https://supabase.com)
- [ ] Supabase connection string & anon key
- [ ] Anthropic API key (https://console.anthropic.com)
- [ ] GitHub OAuth credentials (optional, for demo)
- [ ] Google OAuth credentials (optional, for demo)
- [ ] A screenshot or Figma design to test with (for Phase 3+)

---

## 💡 Pro Tips

1. **Keep a progress log**
   - As you complete each phase, note the time and any issues
   - Claude Code will learn from feedback loops

2. **Test incrementally**
   - Don't wait until the end to test
   - After each phase, spend 5-10 minutes manually testing
   - Report back to Claude Code: "Phase 2 complete, tested sign-up flow"

3. **Use the architecture reference**
   - Refer to ARCHITECTURE_REFERENCE.md if you have questions
   - It shows data flows, component structure, error handling patterns

4. **Preserve database migrations**
   - Keep `prisma/migrations/` in version control
   - This makes handoff to other developers seamless

5. **Environment variables**
   - After Phase 1, create `.env.local` with all credentials
   - Add `.env.local` to `.gitignore`
   - Document what each env var does

---

## 🚨 Common Issues & Solutions

**Issue: Design tokens don't match DESIGN.md**
→ Solution: Re-run Phase 1 with emphasis on color exactness. Use browser DevTools to compare hex values.

**Issue: Figma import fails with 401 error**
→ Solution: Figma token expired. Phase 2 should handle token refresh. Check Supabase console for encrypted token.

**Issue: Claude API errors during annotation processing**
→ Solution: Check Anthropic API quota and rate limits. Phase 4 job queue should handle retries automatically.

**Issue: Canvas pan/zoom feels laggy**
→ Solution: Konva.js performance depends on number of annotation boxes. Phase 4 should optimize rendering with layer caching.

---

## 📞 If You Get Stuck

1. **Check ARCHITECTURE_REFERENCE.md** — diagrams show data flow and structure
2. **Re-read the phase prompt** — it has detailed error handling instructions
3. **Review DESIGN.md** — if UI doesn't look right
4. **Check DATABASE schema** in CLAUDE_CODE_BUILD_BRIEF.md — if data flow issues
5. **Ask Claude Code to explain** — paste the error + ask for debugging help

---

## 🎉 After All Phases Are Done

```bash
# 1. Run end-to-end test
npm run dev

# 2. Test full flow:
#    - Sign up user
#    - Create project
#    - Import Figma file
#    - See AI annotations appear
#    - Create flow
#    - Generate feature doc
#    - Export as PDF

# 3. Deploy to Vercel
vercel deploy --prod

# 4. Setup production Supabase database
#    - Migrate schema to production
#    - Setup backup schedule

# 5. Configure production OAuth credentials
#    - Figma OAuth redirect URL → vercel domain
#    - Google/GitHub OAuth → vercel domain

# 6. Launch! 🚀
```

---

## 📊 Success Metrics

By the time you're done, you'll have:

- ✅ A fully functional SaaS web app
- ✅ User authentication (signup, login, OAuth)
- ✅ Figma integration (import designs)
- ✅ AI-powered annotation engine (detect elements, generate specs)
- ✅ Interactive canvas (pan, zoom, draw annotations)
- ✅ User flow mapping (connect screens into journeys)
- ✅ Auto-generated feature documentation
- ✅ Developer handoff mode (optimized spec view)
- ✅ Export & sharing (PDF, JSON, share links)
- ✅ Production-ready (TypeScript, error handling, security)

**All built with AI assistance in 5-6 hours. Ready to sell or deploy.**

---

## 🎯 Next: Start Phase 1 Now

1. Open CLAUDE_CODE_PHASE_PROMPTS.md
2. Copy the **PHASE 1: Design System Scaffolding** prompt
3. Open Claude Code
4. Paste the prompt
5. Run it
6. Come back here when Phase 1 is complete

**Let's build FlowForge! 🚀**
