import { NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationCode, sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getIP, tooManyRequests } from "@/lib/rate-limit";

const EXPIRY_MINUTES = 10;

export async function POST(req: Request) {
  // 3 requests per IP per hour
  const { success, retryAfter } = rateLimit(`forgot-password:${getIP(req)}`, 3, 60 * 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || email.length > 254) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const identifier = `reset:${normalizedEmail}`;

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true },
    });

    // Always return 200 to prevent email enumeration
    if (!user) return NextResponse.json({ ok: true });

    const code = generateVerificationCode();
    const expires = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    await db.verificationToken.deleteMany({ where: { identifier } });
    await db.verificationToken.create({ data: { identifier, token: code, expires } });

    after(async () => {
      try {
        await sendPasswordResetEmail({ to: normalizedEmail, name: user.name ?? undefined, code });
      } catch (emailErr) {
        console.error("[forgot-password] email send failed:", emailErr);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
