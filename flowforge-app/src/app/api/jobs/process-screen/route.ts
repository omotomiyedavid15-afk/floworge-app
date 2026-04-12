import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 10;

export async function POST(req: NextRequest) {
  try {
    // 1. Check if API key is configured
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI Processing Service is not configured (Missing GROQ_API_KEY)" },
        { status: 503 }
      );
    }

    // 2. Authentication guard
    const sessionToken = req.headers.get("x-flowforge-session");
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized: Missing active session" },
        { status: 401 }
      );
    }

    // 3. Rate limiting
    const now = Date.now();
    const lastRequest = rateLimitMap.get(sessionToken) || 0;
    if (now - lastRequest < RATE_LIMIT_WINDOW / MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }
    rateLimitMap.set(sessionToken, now);

    const { screenId } = await req.json();
    if (!screenId) {
      return NextResponse.json({ error: "screenId is required" }, { status: 400 });
    }

    // 4. Fetch screen from DB
    const screen = await prisma.screen.findUnique({ where: { id: screenId } });
    if (!screen || !screen.backdropUrl) {
      return NextResponse.json({ error: "Screen or backdropUrl not found" }, { status: 404 });
    }

    await prisma.screen.update({
      where: { id: screenId },
      data: { processingStatus: "processing" },
    });

    // ── STAGE 2: Layout Analysis ──
    const layoutResult = await groqChat(
      "Analyze a UI screen and identify its major regions: header, navigation, main content area, sidebar, footer. " +
      "Output only valid JSON in this shape: {\"regions\": [{\"name\": string, \"bounds\": {\"x\": number, \"y\": number, \"w\": number, \"h\": number}}]}"
    );
    console.log("Layout Analysis:", layoutResult);

    // ── STAGE 3: Element Detection ──
    const elementResult = await groqChat(
      "Identify all interactive and structural UI elements in a screen. For each element provide: " +
      "name (e.g. 'Login Button'), type (Button, Input, Dropdown, Navbar, Card, etc.), bounds (x, y, width, height in pixels). " +
      "Output only valid JSON: {\"elements\": [{\"name\": string, \"type\": string, \"bounds\": {\"x\": number, \"y\": number, \"w\": number, \"h\": number}}]}",
      2048
    );
    console.log("Element Detection:", elementResult);

    // ── STAGE 4: Update screen as done ──
    await prisma.screen.update({
      where: { id: screenId },
      data: { processingStatus: "done" },
    });

    return NextResponse.json({ success: true, message: "Screen processed successfully" });
  } catch (error: any) {
    console.error("Processing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
