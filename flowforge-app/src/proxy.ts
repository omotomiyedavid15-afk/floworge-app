import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use only the Edge-safe config (no Prisma adapter) in middleware
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    // Protect these paths — everything else is public
    "/dashboard/:path*",
    "/workspace/:path*",
    "/onboarding/:path*",
  ],
};
