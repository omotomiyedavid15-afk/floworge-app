import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFrameImages } from "@/lib/figma";
import { rateLimit, getIP, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { success, retryAfter } = rateLimit(`figma-images:${session.user.id}`, 30, 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { fileKey, nodeIds, token } = await req.json();

    if (!fileKey || !token || !Array.isArray(nodeIds) || nodeIds.length === 0) {
      return NextResponse.json({ error: "fileKey, token, and nodeIds are required." }, { status: 400 });
    }
    if (typeof fileKey !== "string" || fileKey.length > 128) {
      return NextResponse.json({ error: "Invalid fileKey." }, { status: 400 });
    }
    if (nodeIds.length > 100) {
      return NextResponse.json({ error: "Too many nodeIds (max 100)." }, { status: 400 });
    }

    const images = await getFrameImages(fileKey, nodeIds, token);
    return NextResponse.json({ images });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const status = msg.includes("403") ? 403 : msg.includes("404") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
