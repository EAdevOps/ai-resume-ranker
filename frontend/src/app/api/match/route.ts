import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobPosting, resumeText } = body;

    if (!jobPosting || !resumeText) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const backendResponse = await fetch('http://localhost:8000/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobPosting, resumeText }),
    });

    if (!backendResponse.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
