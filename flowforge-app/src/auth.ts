import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";

// Full config with Prisma adapter — Node.js only (not Edge)
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  secret: process.env.AUTH_SECRET ?? process.env.SESSION_SECRET,
  // JWT strategy lets the Prisma adapter create users in the DB
  // while still keeping sessions as signed JWT cookies (Edge-compatible)
  session: { strategy: "jwt" },
});
