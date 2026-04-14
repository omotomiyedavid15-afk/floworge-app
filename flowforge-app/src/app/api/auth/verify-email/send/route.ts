import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

const EXPIRY_MINUTES = 10;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    if (!user) {
      // Return 200 anyway to avoid email enumeration
      return NextResponse.json({ ok: true });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified." }, { status: 409 });
    }

    const code = generateVerificationCode();
    const expires = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    // Upsert: delete any existing token for this email, then create a new one
    await db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
    await db.verificationToken.create({
      data: { identifier: normalizedEmail, token: code, expires },
    });

    await sendVerificationEmail({
      to: normalizedEmail,
      name: user.name ?? undefined,
      code,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-email/send]", err);
    return NextResponse.json({ error: "Could not send verification email." }, { status: 500 });
  }
}
