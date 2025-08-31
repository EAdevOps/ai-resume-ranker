// src/app/api/match/route.ts
import { NextRequest, NextResponse } from "next/server";

// very tiny stopword list; expand as needed
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "on",
  "with",
  "by",
  "at",
  "from",
  "as",
  "is",
  "are",
  "be",
  "this",
  "that",
  "it",
  "you",
  "your",
]);

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.#]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function keywords(text: string): string[] {
  const toks = tokenize(text);
  const uniq = new Set<string>();
  for (const t of toks) if (!STOPWORDS.has(t) && t.length > 2) uniq.add(t);
  return Array.from(uniq);
}

export async function POST(req: NextRequest) {
  try {
    const { jobPosting, resumeText } = await req.json();

    if (!jobPosting || !resumeText) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const jobKeys = keywords(jobPosting);
    const resKeys = new Set(keywords(resumeText));

    // overlap score
    const matched = jobKeys.filter((k) => resKeys.has(k));
    const baseRatio = jobKeys.length ? matched.length / jobKeys.length : 0;

    // light heuristics
    const hasYears = /\b\d+\+?\s*(years|yrs)\b/i.test(resumeText);
    const hasProjects = /\b(project|projects|portfolio|github)\b/i.test(
      resumeText
    );
    const hasMetrics = /\b%|\b\d{2,}\b/.test(resumeText); // crude

    let bonus = 0;
    if (hasYears) bonus += 0.05;
    if (hasProjects) bonus += 0.05;
    if (hasMetrics) bonus += 0.05;

    let score = Math.min(1, baseRatio + bonus);
    // normalize to a friendlier band so early mocks don't look too harsh
    const rating = Math.round((0.5 + 0.5 * score) * 100); // 50–100%

    const missing = jobKeys.filter((k) => !resKeys.has(k)).slice(0, 20);

    return NextResponse.json({
      rating,
      matched: matched.slice(0, 20),
      missing,
      totals: { jobKeys: jobKeys.length, matched: matched.length },
    });
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
