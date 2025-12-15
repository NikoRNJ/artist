import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '@/shared/config/env.server';

export const runtime = 'nodejs';

type MarketingCopyBody = {
  serviceName?: string;
  artistName?: string;
};

const FALLBACK_COPY = 'Your appointment is coming up! We look forward to seeing you at Ink & Fade.';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as MarketingCopyBody;
  const serviceName = (body.serviceName ?? '').trim();
  const artistName = (body.artistName ?? '').trim();

  if (!serviceName || !artistName) {
    return NextResponse.json({ error: 'Missing serviceName or artistName' }, { status: 400 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ text: FALLBACK_COPY }, { status: 200 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, punchy marketing SMS/Email reminder for a ${serviceName} appointment with ${artistName}. Keep it professional but edgy for a tattoo/barber shop.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 100,
      },
    });

    return NextResponse.json({ text: response.text || FALLBACK_COPY }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ text: FALLBACK_COPY }, { status: 200 });
  }
}

