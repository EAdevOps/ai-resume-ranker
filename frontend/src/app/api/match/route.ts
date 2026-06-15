import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // extend timeout to 60s

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobPosting, resumeText, mode } = body; // ← add mode

    if (!jobPosting || !resumeText) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const backendResponse = await fetch("http://127.0.0.1:8000/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobPosting, resumeText, mode }), // ← forward mode
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "Backend error" },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (_e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
