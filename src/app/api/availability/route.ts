import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/services/supabase/server';

export const runtime = 'nodejs';

type OccupiedSlot = { start: string; end: string };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getUtcDayBounds(date: string): { start: Date; end: Date } | null {
  if (!isIsoDate(date)) return null;
  const [year, month, day] = date.split('-').map((part) => Number(part));
  if (!year || !month || !day) return null;

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  return { start, end };
}

type BookingAvailabilityRow = {
  start_time: string;
  status: string;
  service: { duration: number } | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const artistId = (url.searchParams.get('artistId') ?? '').trim();
  const date = (url.searchParams.get('date') ?? '').trim();

  if (!artistId || !date) {
    return NextResponse.json({ error: 'Falta artistId o date (YYYY-MM-DD)' }, { status: 400 });
  }

  if (!isUuid(artistId)) {
    return NextResponse.json({ error: 'artistId inválido' }, { status: 400 });
  }

  const bounds = getUtcDayBounds(date);
  if (!bounds) {
    return NextResponse.json({ error: 'date inválida (YYYY-MM-DD)' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient() ?? createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado' }, { status: 501 });
  }

  const bookingsResult = await supabase
    .from('bookings')
    .select('start_time, status, service:services!bookings_service_id_fkey(duration)')
    .eq('artist_id', artistId)
    .neq('status', 'CANCELLED')
    .gte('start_time', bounds.start.toISOString())
    .lte('start_time', bounds.end.toISOString())
    .returns<BookingAvailabilityRow[]>();

  if (bookingsResult.error) {
    return NextResponse.json({ error: bookingsResult.error.message }, { status: 500 });
  }

  const occupied: OccupiedSlot[] = (bookingsResult.data ?? []).flatMap((row) => {
    const start = new Date(row.start_time);
    if (Number.isNaN(start.getTime())) return [];

    const durationMinutes = typeof row.service?.duration === 'number' ? row.service.duration : 0;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    return [{ start: start.toISOString(), end: end.toISOString() }];
  });

  return NextResponse.json(occupied, {
    status: 200,
    headers: { 'cache-control': 'no-store' },
  });
}

