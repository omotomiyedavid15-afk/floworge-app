import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { name, email } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email cannot be empty." }, { status: 400 });
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
