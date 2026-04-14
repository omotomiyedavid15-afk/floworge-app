import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // 10 profile updates per user per hour
  const { success, retryAfter } = rateLimit(`update-profile:${session.user.id}`, 10, 60 * 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { name, email } = await req.json();

    if (!name?.trim() || typeof name !== "string" || name.trim().length > 100) {
      return NextResponse.json({ error: "Name must be 1–100 characters." }, { status: 400 });
    }
    if (!email?.trim() || typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    // Check email uniqueness if it changed
    if (normalizedEmail !== session.user.email) {
      const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
      }
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: { name: (name as string).trim(), email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[user/profile PATCH]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
