import { NextRequest, NextResponse } from "next/server";
import { getFileMetadata } from "@/lib/figma";

export async function POST(req: NextRequest) {
  try {
    const { fileKey, token } = await req.json();

    if (!fileKey || !token) {
      return NextResponse.json(
        { error: "fileKey and token are required" },
        { status: 400 }
      );
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
  } catch (error: any) {
    const msg: string = error.message ?? "Unknown error";
    const status = msg.includes("403") ? 403 : msg.includes("404") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
