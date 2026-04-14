import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not set. AI features will be disabled.");
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function groqChat(prompt: string, maxTokens = 1024): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
      max_completion_tokens: maxTokens,
      top_p: 1,
      stream: false,
      stop: null,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Groq API error: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "AI Processing Service is not configured." },
      { status: 503 }
    );
  }

  // Proper session-based authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // 10 requests per user per minute
  const { success, retryAfter } = rateLimit(`process-screen:${session.user.id}`, 10, 60 * 1000);
  if (!success) return tooManyRequests(retryAfter);

  try {
    const { screenId } = await req.json();
    if (!screenId || typeof screenId !== "string") {
      return NextResponse.json({ error: "screenId is required." }, { status: 400 });
    }

    // Verify the screen belongs to the authenticated user
    const screen = await db.screen.findFirst({
      where: {
        id: screenId,
        project: { userId: session.user.id },
      },
    });

    if (!screen || !screen.backdropUrl) {
      return NextResponse.json({ error: "Screen not found." }, { status: 404 });
    }

    await db.screen.update({ where: { id: screenId }, data: { processingStatus: "processing" } });

    const layoutResult = await groqChat(
      "Analyze a UI screen and identify its major regions: header, navigation, main content area, sidebar, footer. " +
      "Output only valid JSON in this shape: {\"regions\": [{\"name\": string, \"bounds\": {\"x\": number, \"y\": number, \"w\": number, \"h\": number}}]}"
    );

    const elementResult = await groqChat(
      "Identify all interactive and structural UI elements in a screen. For each element provide: " +
      "name (e.g. 'Login Button'), type (Button, Input, Dropdown, Navbar, Card, etc.), bounds (x, y, width, height in pixels). " +
      "Output only valid JSON: {\"elements\": [{\"name\": string, \"type\": string, \"bounds\": {\"x\": number, \"y\": number, \"w\": number, \"h\": number}}]}",
      2048
    );

    await db.screen.update({ where: { id: screenId }, data: { processingStatus: "done" } });

    return NextResponse.json({ success: true, message: "Screen processed successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[process-screen]", msg);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
