import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getIP, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // 10 attempts per IP per 15 minutes
  const { success, retryAfter } = rateLimit(`verify-confirm:${getIP(req)}`, 10, 15 * 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    const record = await db.verificationToken.findFirst({
      where: { identifier: normalizedEmail, token: String(code) },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid code. Please check and try again." }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }

    await db.$transaction([
      db.user.update({ where: { email: normalizedEmail }, data: { emailVerified: new Date() } }),
      db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-email/confirm]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
