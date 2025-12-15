import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '@/shared/config/env.server';

export const runtime = 'nodejs';

type MarketingCopyBody = {
  serviceName?: string;
  artistName?: string;
};

const FALLBACK_COPY = '¡Tu cita se acerca! Te esperamos en Ink & Fade.';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as MarketingCopyBody;
  const serviceName = (body.serviceName ?? '').trim();
  const artistName = (body.artistName ?? '').trim();

  if (!serviceName || !artistName) {
    return NextResponse.json({ error: 'Falta serviceName o artistName' }, { status: 400 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ text: FALLBACK_COPY }, { status: 200 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Genera un recordatorio breve y contundente (SMS/Email) para una cita de ${serviceName} con ${artistName}. Escríbelo en español. Mantén un tono profesional pero con carácter, propio de un estudio de barbería/tatuajes.`,
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
