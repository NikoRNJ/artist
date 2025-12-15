import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/services/supabase/server';

type CreateBookingBody = {
  artistId?: string;
  serviceId?: string;
  clientName?: string;
  startTime?: string;
  depositPaid?: boolean;
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateBookingBody;

  if (!body.artistId || !body.startTime) {
    return NextResponse.json({ error: 'Missing artistId or startTime' }, { status: 400 });
  }

  if (!isUuid(body.artistId)) {
    return NextResponse.json({ error: 'Invalid artistId' }, { status: 400 });
  }

  const parsedStartTime = Date.parse(body.startTime);
  if (Number.isNaN(parsedStartTime)) {
    return NextResponse.json({ error: 'Invalid startTime' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient() ?? createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 501 });
  }

  const serviceId = body.serviceId && isUuid(body.serviceId) ? body.serviceId : null;

  const insertResult = await supabase
    .from('bookings')
    .insert({
      artist_id: body.artistId,
      service_id: serviceId,
      client_name: body.clientName ?? 'Guest User',
      start_time: body.startTime,
      status: body.status ?? 'PENDING',
      deposit_paid: body.depositPaid ?? false,
    })
    .select('id')
    .single();

  if (insertResult.error) {
    return NextResponse.json({ error: insertResult.error.message }, { status: 500 });
  }

  return NextResponse.json({ id: insertResult.data.id }, { status: 200 });
}
