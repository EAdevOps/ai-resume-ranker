import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const { jobPosting, resumeText } = await request.json();

  if (!jobPosting || !resumeText) {
    return NextResponse.json({ error: 'Missing inputs' }, { status: 400 });
  }

  const prompt = `Compare the following job posting and resume, and give a match percentage from 1 to 100 based on skills, experience, and qualifications match.

Job Posting:
${jobPosting}

Resume:
${resumeText}

Respond with only the percentage number (e.g., 75).`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const ratingText = response.choices[0].message.content?.trim() || '0';
    const rating = parseInt(ratingText, 10) || 1;
    const clampedRating = Math.min(Math.max(rating, 1), 100);

    return NextResponse.json({ rating: clampedRating });
  } catch (error) {
    console.error('OpenAI error:', error);
    return NextResponse.json({ error: 'Failed to calculate match' }, { status: 500 });
  }
}