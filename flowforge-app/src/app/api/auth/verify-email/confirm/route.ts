import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    const record = await db.verificationToken.findFirst({
      where: { identifier: normalizedEmail, token: code as string },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid code. Please check and try again." }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }

    // Mark email as verified and clean up the token
    await db.$transaction([
      db.user.update({
        where: { email: normalizedEmail },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-email/confirm]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
