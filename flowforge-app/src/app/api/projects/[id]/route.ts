import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

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

async function getOwnedProject(userId: string, projectId: string) {
  return db.project.findFirst({
    where: { id: projectId, userId },
    include: { _count: { select: { screens: true } } },
  });
}

function formatProject(project: Awaited<ReturnType<typeof getOwnedProject>>) {
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    coverImage: project.coverImage ?? null,
    figmaFileKey: project.figmaFileKey ?? undefined,
    // figmaToken intentionally omitted — never send to client
    hasToken: !!project.figmaToken,
    invitees: safeParseInvitees(project.invitees),
    screens: project._count.screens,
    annotations: 0,
    updatedAt: formatRelativeTime(project.updatedAt),
    createdAt: project.createdAt.toISOString(),
    category: "recent",
  };
}

// ── GET /api/projects/[id] ────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const project = await getOwnedProject(session.user.id, id);
  if (!project) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json(formatProject(project));
}

// ── PATCH /api/projects/[id] ──────────────────────────────────────────────────

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProject(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  try {
    const body = await req.json();
    const { name, description, coverImage, figmaFileKey, figmaToken, invitees } = body as {
      name?: string;
      description?: string;
      coverImage?: string | null;
      figmaFileKey?: string;
      figmaToken?: string;
      invitees?: string[];
    };

    if (name !== undefined && (!name.trim() || name.length > 100)) {
      return NextResponse.json({ error: "Invalid project name." }, { status: 400 });
    }

    const cleanInvitees = Array.isArray(invitees)
      ? invitees.filter((e): e is string => typeof e === "string" && isValidEmail(e)).slice(0, 50)
      : undefined;

    const updated = await db.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim().slice(0, 100) }),
        ...(description !== undefined && { description: description.trim().slice(0, 1000) || null }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(figmaFileKey !== undefined && { figmaFileKey: figmaFileKey || null }),
        ...(figmaToken !== undefined && { figmaToken: figmaToken.trim() || null }),
        ...(cleanInvitees !== undefined && { invitees: cleanInvitees.length > 0 ? JSON.stringify(cleanInvitees) : null }),
      },
      include: { _count: { select: { screens: true } } },
    });

    return NextResponse.json(formatProject(updated));
  } catch (err) {
    console.error("[PATCH /api/projects/[id]]", err);
    return NextResponse.json({ error: "Could not update project." }, { status: 500 });
  }
}

// ── DELETE /api/projects/[id] ─────────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedProject(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  try {
    await db.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/projects/[id]]", err);
    return NextResponse.json({ error: "Could not delete project." }, { status: 500 });
  }
}
