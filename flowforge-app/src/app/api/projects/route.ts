import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract the Figma file key from a figma.com URL */
function parseFigmaFileKey(url: string): string | null {
  if (!url) return null;
  // https://www.figma.com/design/{fileKey}/... or /file/{fileKey}/...
  const match = url.match(/figma\.com\/(?:design|file|proto)\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}

/** Format a DB project row into the shape the dashboard expects */
function formatProject(p: {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  figmaUrl: string | null;
  figmaFileKey: string | null;
  figmaToken: string | null;
  invitees: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { screens: number; annotations?: number };
}) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    coverImage: p.coverImage ?? null,
    figmaUrl: p.figmaUrl ?? undefined,
    figmaFileKey: p.figmaFileKey ?? undefined,
    figmaToken: p.figmaToken ?? undefined,
    invitees: p.invitees ? (JSON.parse(p.invitees) as string[]) : [],
    screens: p._count.screens,
    annotations: 0,
    updatedAt: formatRelativeTime(p.updatedAt),
    createdAt: p.createdAt.toISOString(),
    category: "recent" as const,
  };
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── GET /api/projects ─────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Guard against stale JWT (user deleted / DB reset while cookie lives on)
  const userExists = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!userExists) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const projects = await db.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { screens: true } } },
    });

    return NextResponse.json(projects.map(formatProject));
  } catch (err) {
    console.error("[GET /api/projects]", err);
    return NextResponse.json({ error: "Could not load projects." }, { status: 500 });
  }
}

// ── POST /api/projects ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userExists = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!userExists) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, coverImage, figmaUrl, figmaToken, invitees } = body as {
      name: string;
      description?: string;
      coverImage?: string | null;
      figmaUrl?: string;
      figmaToken?: string;
      invitees?: string[];
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    const figmaFileKey = parseFigmaFileKey(figmaUrl ?? "");

    const project = await db.project.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        coverImage: coverImage || null,
        figmaUrl: figmaUrl?.trim() || null,
        figmaFileKey: figmaFileKey || null,
        figmaToken: figmaToken?.trim() || null,
        invitees: invitees && invitees.length > 0 ? JSON.stringify(invitees) : null,
      },
      include: { _count: { select: { screens: true } } },
    });

    return NextResponse.json(formatProject(project), { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/projects]", msg);
    return NextResponse.json(
      { error: "Could not create project.", detail: process.env.NODE_ENV !== "production" ? msg : undefined },
      { status: 500 }
    );
  }
}
