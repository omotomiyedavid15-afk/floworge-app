import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";
import { rateLimit, getIP, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // 5 signups per IP per 15 minutes
  const { success, retryAfter } = rateLimit(`signup:${getIP(req)}`, 5, 15 * 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Input validation
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: "Name must be between 2 and 100 characters." }, { status: 400 });
    }
    if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be 8–128 characters." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name: name.trim(), email: normalizedEmail, passwordHash },
      select: { id: true, email: true, name: true },
    });

    // Send verification email (non-blocking)
    try {
      const code = generateVerificationCode();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
      await db.verificationToken.deleteMany({ where: { identifier: user.email! } });
      await db.verificationToken.create({
        data: { identifier: user.email!, token: code, expires },
      });
      await sendVerificationEmail({ to: user.email!, name: user.name ?? undefined, code });
    } catch (emailErr) {
      console.error("[signup] failed to send verification email:", emailErr);
    }

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
