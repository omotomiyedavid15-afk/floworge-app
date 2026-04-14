import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";
import { rateLimit, getIP, tooManyRequests } from "@/lib/rate-limit";

const EXPIRY_MINUTES = 10;

export async function POST(req: Request) {
  // 3 resend requests per IP per 10 minutes
  const { success, retryAfter } = rateLimit(`verify-send:${getIP(req)}`, 3, 10 * 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || email.length > 254) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    // Return 200 to avoid enumeration
    if (!user) return NextResponse.json({ ok: true });

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified." }, { status: 409 });
    }

    const code = generateVerificationCode();
    const expires = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    await db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
    await db.verificationToken.create({ data: { identifier: normalizedEmail, token: code, expires } });

    await sendVerificationEmail({ to: normalizedEmail, name: user.name ?? undefined, code });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-email/send]", err);
    return NextResponse.json({ error: "Could not send verification email." }, { status: 500 });
  }
}
