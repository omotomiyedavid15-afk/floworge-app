import { NextRequest, NextResponse } from "next/server";
import { getFrameImages } from "@/lib/figma";

export async function POST(req: NextRequest) {
  try {
    const { fileKey, nodeIds, token } = await req.json();

    if (!fileKey || !token || !Array.isArray(nodeIds) || nodeIds.length === 0) {
      return NextResponse.json(
        { error: "fileKey, token, and nodeIds are required" },
        { status: 400 }
      );
    }

    const images = await getFrameImages(fileKey, nodeIds, token);
    return NextResponse.json({ images });
  } catch (error: any) {
    const msg: string = error.message ?? "Unknown error";
    const status = msg.includes("403") ? 403 : msg.includes("404") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
