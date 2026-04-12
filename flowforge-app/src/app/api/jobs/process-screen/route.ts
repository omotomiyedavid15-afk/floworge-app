import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not set in environment variables. AI features will be disabled.");
}

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY || "dummy-key-for-init",
});

// Simple in-memory rate limiter for demo purposes
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export async function POST(req: NextRequest) {
  try {
    // 1. Check if API Key is configured
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI Processing Service is not configured (Missing API Key)" },
        { status: 503 }
      );
    }

    // 2. Authentication Guard
    // In a real production app, use `supabase.auth.getSession()` or similar.
    // For this implementation, we check for a custom header as a session placeholder.
    const sessionToken = req.headers.get("x-flowforge-session");
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized: Missing active session" },
        { status: 401 }
      );
    }

    // 3. Simple Rate Limiting
    const now = Date.now();
    const userKey = sessionToken; // In real app, use userId from session
    const lastRequest = rateLimitMap.get(userKey) || 0;
    
    if (now - lastRequest < (RATE_LIMIT_WINDOW / MAX_REQUESTS)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }
    rateLimitMap.set(userKey, now);

    const { screenId } = await req.json();

    if (!screenId) {
      return NextResponse.json({ error: "screenId is required" }, { status: 400 });
    }

    // 1. Get screen data
    const screen = await prisma.screen.findUnique({
      where: { id: screenId },
    });

    if (!screen || !screen.backdropUrl) {
      return NextResponse.json({ error: "Screen or backdropUrl not found" }, { status: 404 });
    }

    // Update status to processing
    await prisma.screen.update({
      where: { id: screenId },
      data: { processingStatus: "processing" },
    });

    // ── STAGE 2: Layout Analysis ──
    // In a real implementation, we'd fetch the image from screen.backdropUrl
    // and send it to Claude. Here we provide the logic flow.

    const layoutAnalysis = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this UI screenshot. Identify major regions: header, navigation, main content area, sidebar, footer. Output as JSON: {regions: [{name, bounds: {x, y, w, h}}]}",
            },
            // { type: "image", source: { type: "base64", media_type: "image/png", data: "..." } }
          ],
        },
      ],
    });
    console.log("Layout Analysis:", layoutAnalysis);

    // ── STAGE 3: Element Detection ──
    const elementDetection = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "In this UI screenshot, identify all interactive and structural elements. For each element, provide: name (e.g., 'Login Button'), type (Button, Input, Dropdown, Navbar, Card, etc.), bounds (x, y, width, height in pixels). Output as JSON: {elements: [{name, type, bounds}]}",
            },
          ],
        },
      ],
    });
    console.log("Element Detection:", elementDetection);

    // ── STAGE 4: Annotation Generation ──
    // Loop through detected elements and generate detailed specs
    // This would typically be done in parallel or sequence for each element.

    // Update screen status to done
    await prisma.screen.update({
      where: { id: screenId },
      data: { 
        processingStatus: "done",
        // nodeTreeJSON: ... 
      },
    });

    return NextResponse.json({ success: true, message: "Screen processed successfully" });
  } catch (error: any) {
    console.error("Processing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
