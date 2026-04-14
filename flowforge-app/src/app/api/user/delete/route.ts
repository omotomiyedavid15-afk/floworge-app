import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // 3 attempts per user per hour (accidental double-click / CSRF protection)
  const { success, retryAfter } = rateLimit(`delete-account:${session.user.id}`, 3, 60 * 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    await db.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[user/delete DELETE]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
