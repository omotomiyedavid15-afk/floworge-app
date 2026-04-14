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

async function getOwnedProject(userId: string, projectId: string) {
  return db.project.findFirst({
    where: { id: projectId, userId },
    include: { _count: { select: { screens: true } } },
  });
}

// ── GET /api/projects/[id] ─────────────────────────────────────────────────────

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const project = await getOwnedProject(session.user.id, id);
  if (!project) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    coverImage: project.coverImage ?? null,
    figmaFileKey: project.figmaFileKey ?? undefined,
    figmaToken: project.figmaToken ?? undefined,
    invitees: project.invitees ? JSON.parse(project.invitees) : [],
    screens: project._count.screens,
    annotations: 0,
    updatedAt: formatRelativeTime(project.updatedAt),
    createdAt: project.createdAt.toISOString(),
    category: "recent",
  });
}

// ── PATCH /api/projects/[id] ───────────────────────────────────────────────────

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

    const updated = await db.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() || null }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(figmaFileKey !== undefined && { figmaFileKey: figmaFileKey || null }),
        ...(figmaToken !== undefined && { figmaToken: figmaToken.trim() || null }),
        ...(invitees !== undefined && { invitees: invitees.length > 0 ? JSON.stringify(invitees) : null }),
      },
      include: { _count: { select: { screens: true } } },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description ?? undefined,
      coverImage: updated.coverImage ?? null,
      figmaFileKey: updated.figmaFileKey ?? undefined,
      figmaToken: updated.figmaToken ?? undefined,
      invitees: updated.invitees ? JSON.parse(updated.invitees) : [],
      screens: updated._count.screens,
      annotations: 0,
      updatedAt: formatRelativeTime(updated.updatedAt),
      createdAt: updated.createdAt.toISOString(),
      category: "recent",
    });
  } catch (err) {
    console.error("[PATCH /api/projects/[id]]", err);
    return NextResponse.json({ error: "Could not update project." }, { status: 500 });
  }
}

// ── DELETE /api/projects/[id] ──────────────────────────────────────────────────

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
