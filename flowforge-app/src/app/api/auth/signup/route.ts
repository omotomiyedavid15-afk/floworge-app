import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash },
      select: { id: true, email: true, name: true },
    });

    // Send email verification code (non-blocking — don't fail signup if email fails)
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
