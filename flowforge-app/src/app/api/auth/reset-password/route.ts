import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { rateLimit, getIP, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // 5 attempts per IP per 15 minutes
  const { success, retryAfter } = rateLimit(`reset-password:${getIP(req)}`, 5, 15 * 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be 8–128 characters." }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();
    const identifier = `reset:${normalizedEmail}`;

    const record = await db.verificationToken.findFirst({
      where: { identifier, token: String(code) },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid code. Please check and try again." }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await db.verificationToken.deleteMany({ where: { identifier } });
      return NextResponse.json({ error: "This code has expired. Request a new one." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password as string, 12);

    await db.$transaction([
      db.user.update({ where: { email: normalizedEmail }, data: { passwordHash } }),
      db.verificationToken.deleteMany({ where: { identifier } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
