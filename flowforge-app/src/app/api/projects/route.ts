import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit, getIP, tooManyRequests } from "@/lib/rate-limit";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseFigmaFileKey(url: string): string | null {
  if (!url) return null;
  const match = url.match(/figma\.com\/(?:design|file|proto)\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}

function safeParseInvitees(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e): e is string => typeof e === "string" && e.length <= 254);
  } catch {
    return [];
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

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
    // figmaToken intentionally omitted — never send to client
    hasToken: !!p.figmaToken,
    invitees: safeParseInvitees(p.invitees),
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
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const userExists = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!userExists) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

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
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // 20 projects per user per hour
  const { success, retryAfter } = rateLimit(`create-project:${session.user.id}`, 20, 60 * 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  const userExists = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true } });
  if (!userExists) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

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

    if (!name?.trim()) return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    if (name.trim().length > 100) return NextResponse.json({ error: "Project name must be under 100 characters." }, { status: 400 });
    if (description && description.length > 1000) return NextResponse.json({ error: "Description must be under 1000 characters." }, { status: 400 });
    if (figmaUrl && figmaUrl.length > 500) return NextResponse.json({ error: "Invalid Figma URL." }, { status: 400 });

    // Validate and sanitize invitees
    const cleanInvitees = Array.isArray(invitees)
      ? invitees.filter((e): e is string => typeof e === "string" && isValidEmail(e)).slice(0, 50)
      : [];

    const figmaFileKey = parseFigmaFileKey(figmaUrl ?? "");

    const project = await db.project.create({
      data: {
        userId: session.user.id,
        name: name.trim().slice(0, 100),
        description: description?.trim().slice(0, 1000) || null,
        coverImage: coverImage || null,
        figmaUrl: figmaUrl?.trim().slice(0, 500) || null,
        figmaFileKey: figmaFileKey || null,
        figmaToken: figmaToken?.trim() || null,
        invitees: cleanInvitees.length > 0 ? JSON.stringify(cleanInvitees) : null,
      },
      include: { _count: { select: { screens: true } } },
    });

    return NextResponse.json(formatProject(project), { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects]", err);
    return NextResponse.json({ error: "Could not create project." }, { status: 500 });
  }
}
