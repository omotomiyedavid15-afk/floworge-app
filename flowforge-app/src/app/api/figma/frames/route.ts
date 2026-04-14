import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFileMetadata } from "@/lib/figma";
import { rateLimit, getIP, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { success, retryAfter } = rateLimit(`figma-frames:${session.user.id}`, 30, 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { fileKey, token } = await req.json();

    if (!fileKey || !token) {
      return NextResponse.json({ error: "fileKey and token are required." }, { status: 400 });
    }
    if (typeof fileKey !== "string" || fileKey.length > 128) {
      return NextResponse.json({ error: "Invalid fileKey." }, { status: 400 });
    }

    const metadata = await getFileMetadata(fileKey, token);

    const frames = metadata.pages.flatMap((page) =>
      page.frames.map((frame) => ({
        id: frame.id,
        name: frame.name,
        page: page.name,
      }))
    );

    return NextResponse.json({ frames, fileName: metadata.name });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const status = msg.includes("403") ? 403 : msg.includes("404") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
