# FlowForge

Design-to-engineering handoff tool. Import Figma designs as structured, inspectable canvases. Annotate, map user flows, and generate developer specifications.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Location**: `flowforge-app/` subdirectory
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database ORM**: Prisma (PostgreSQL)
- **AI**: Anthropic Claude SDK (screen analysis)
- **Canvas**: Konva / react-konva, @xyflow/react
- **Storage**: @supabase/storage-js (Figma frame images)

## Running the App

Workflow: `Start application`
Command: `cd flowforge-app && npx next dev -p 5000 -H 0.0.0.0`

## Required Secrets

| Secret | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (set by Replit DB) |
| `ANTHROPIC_API_KEY` | Enables AI-powered screen analysis |
| `FIGMA_TOKEN_ENCRYPTION_SECRET` | Encrypts Figma PATs stored in the database |

## Key Directories

```
flowforge-app/
  src/
    app/                  # Next.js App Router pages
      api/jobs/           # API routes (AI processing)
      dashboard/          # Dashboard UI
      workspace/          # Canvas workspace
      login/ signup/      # Auth pages
    components/           # Shared React components
    lib/                  # auth.ts, figma.ts, coordinates.ts
  prisma/
    schema.prisma         # DB schema (User, Project, Screen, Annotation, Flow, FigmaToken)
```

## Notes

- Auth is currently localStorage-based (mock). Production auth via Prisma `User` model.
- Figma PATs are encrypted at rest using `FIGMA_TOKEN_ENCRYPTION_SECRET` before DB storage.
- `next.config.ts` uses `REPLIT_DEV_DOMAIN` to allow hot-reload in the Replit preview pane.
- `lucide-react` was upgraded to `^0.511.0` for React 19 compatibility.
