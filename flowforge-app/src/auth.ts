import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, name: true, email: true, passwordHash: true },
        });
        if (!user?.passwordHash) return null;
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!isValid) return null;
        return { id: user.id, name: user.name ?? "", email: user.email ?? "" };
      },
    }),
  ],
  get secret() {
    const s = process.env.AUTH_SECRET ?? process.env.SESSION_SECRET;
    if (!s) throw new Error("AUTH_SECRET environment variable is not set.");
    return s;
  },
});
