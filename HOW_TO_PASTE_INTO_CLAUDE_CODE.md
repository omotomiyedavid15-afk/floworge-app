# 📋 How to Paste Everything Into Claude Code

## The One-File Approach (Recommended)

### Step 1: Open the Master Spec
Open this file: `MASTER_SPEC_FOR_CLAUDE_CODE.md`

### Step 2: Copy Everything
- Select all text (Cmd+A on Mac, Ctrl+A on Windows/Linux)
- Copy (Cmd+C or Ctrl+C)

### Step 3: Open Claude Code
1. Go to https://claude.ai or open Claude app
2. Start a new chat
3. Paste everything (Cmd+V or Ctrl+V)

### Step 4: Add Initial Instruction
After pasting the master spec, add this message:

```
You now have complete context for building FlowForge. 

I'm ready to start Phase 1: Design System Scaffolding.

Please read through the entire specification above, then tell me you understand:
1. The design system requirements (colors, typography, buttons)
2. The tech stack (Next.js 14, Tailwind, figmaSans)
3. The 6 phases of build
4. The critical rules (DESIGN.md is absolute truth)

Once you confirm, I'll give you the Phase 1 prompt to execute.
```

### Step 5: Wait for Confirmation
Claude Code will:
- Read the entire spec
- Summarize back what it understands
- Ask clarifying questions (if any)
- Confirm it's ready to build

### Step 6: Copy-Paste Phase 1 Prompt
Once confirmed, copy the Phase 1 prompt from `CLAUDE_CODE_PHASE_PROMPTS.md`:

```
I'm ready for Phase 1: Design System Scaffolding.

[copy the entire Phase 1 prompt block from CLAUDE_CODE_PHASE_PROMPTS.md and paste here]
```

### Step 7: Repeat for Phases 2-6
After Phase 1 is done:
- Copy Phase 2 prompt
- Paste into same chat
- Repeat for all 6 phases

---

## Alternative: Multi-Message Approach

If pasting everything at once is too long, break it into chunks:

**Message 1:** Design system spec + tech stack
**Message 2:** Database schema + API endpoints
**Message 3:** Build phases 1-3 overview
**Message 4:** Build phases 4-6 overview
**Message 5:** Environment setup + critical rules
**Message 6:** "You're ready - here's Phase 1 prompt"

---

## What Claude Code Will See

Claude Code will have full context of:
- ✅ Design system (colors, typography, buttons)
- ✅ Tech stack (all libraries, why they're chosen)
- ✅ Database schema (all tables and relationships)
- ✅ API endpoints (what needs to be built)
- ✅ Feature specifications (import, canvas, flows, etc.)
- ✅ 6 sequential phases with deliverables
- ✅ Error handling and edge cases
- ✅ Security requirements
- ✅ Keyboard shortcuts
- ✅ Success criteria

---

## Pro Tips

1. **Keep it in one continuous chat**
   - Don't start new chats per phase
   - Claude Code keeps context across messages
   - This makes the build seamless

2. **Give feedback between phases**
   - After Phase 1: "Great! I tested the design system. All colors match. Ready for Phase 2."
   - This helps Claude Code stay aligned

3. **If Claude Code gets confused**
   - Paste the relevant section from MASTER_SPEC again
   - Say "Remember, DESIGN.md is absolute truth"
   - It will re-calibrate

4. **Save your chat**
   - You can export the chat history
   - Useful for reference or handing off to another developer

---

## Timeline

- **Message 1:** Paste master spec (2 min)
- **Phase 1:** 30 min
- **Phase 2:** 45 min
- **Phase 3:** 60 min
- **Phase 4:** 90 min
- **Phase 5:** 60 min
- **Phase 6:** 45 min

**Total: ~5-6 hours of build time (not including your testing between phases)**

---

## Ready? Here's What to Do Right Now

1. Open `MASTER_SPEC_FOR_CLAUDE_CODE.md`
2. Copy all text (Cmd+A, Cmd+C)
3. Go to Claude Code
4. Paste (Cmd+V)
5. Add: "I'm ready to build FlowForge. You now have the complete specification. Confirm you understand the design system, tech stack, 6 phases, and critical rules."
6. Hit Enter

Claude Code will read everything and confirm it understands. Then you're ready to roll!

Let's go! 🚀
