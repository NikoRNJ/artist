export async function generateMarketingCopy(serviceName: string, artistName: string): Promise<string> {
  const response = await fetch('/api/ai/marketing-copy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceName, artistName }),
  });

  if (!response.ok) {
    throw new Error(`La solicitud a la IA falló (${response.status})`);
  }

  const data = (await response.json()) as { text?: string };
  return data.text ?? '¡Tu cita se acerca! Te esperamos en Ink & Fade.';
}
