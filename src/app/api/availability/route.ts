import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/services/supabase/server';

export const runtime = 'nodejs';

// =============================================================================
// Types
// =============================================================================

interface WorkingHoursConfig {
  start: string; // "HH:mm" format
  end: string;   // "HH:mm" format
  enabled: boolean;
}

interface WorkingHours {
  [dayOfWeek: string]: WorkingHoursConfig; // "0" (Sunday) to "6" (Saturday)
}

interface ArtistSettings {
  artist_id: string;
  working_hours: WorkingHours;
  slot_interval: number;
  buffer_minutes: number;
  timezone: string;
  min_advance_hours: number;
  max_advance_days: number;
}

interface ExistingBooking {
  start_time: string;
  end_time: string;
  status: string;
  duration_snapshot: number | null;
}

interface AvailableSlot {
  start: string;  // ISO 8601 UTC
  end: string;    // ISO 8601 UTC
  local: string;  // "HH:mm" in artist's timezone (for display)
}

interface AvailabilityResponse {
  slots: AvailableSlot[];
  workingHours: { start: string; end: string } | null;
  timezone: string;
  date: string;
}

// =============================================================================
// Validation Utilities
// =============================================================================

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDate(dateStr: string): Date | null {
  if (!isIsoDate(dateStr)) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

// =============================================================================
// Time & Timezone Utilities
// =============================================================================

/**
 * Create a UTC timestamp from a date and time in a specific timezone
 * Note: This is a simplified implementation. In production, use date-fns-tz
 */
function createDateTimeInTimezone(
  year: number,
  month: number,  // 1-12
  day: number,
  hours: number,
  minutes: number,
  _timezone: string
): Date {
  // For simplicity, we're creating the date in local time and treating it as UTC
  // In production, you should use date-fns-tz for proper timezone handling
  // This version assumes the server is configured for the artist's timezone
  // or you implement proper IANA timezone conversion

  return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
}

/**
 * Format a UTC date to HH:mm for display (simplified)
 */
function formatTimeLocal(date: Date): string {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get day of week from a date (0 = Sunday, 6 = Saturday)
 */
function getDayOfWeek(date: Date): number {
  return date.getUTCDay();
}

// =============================================================================
// Availability Calculation Engine
// =============================================================================

function rangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1.getTime() < end2.getTime() && end1.getTime() > start2.getTime();
}

function generateAvailableSlots(
  date: Date,
  serviceDuration: number,
  settings: ArtistSettings,
  existingBookings: ExistingBooking[]
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];

  const dayOfWeek = getDayOfWeek(date).toString();
  const dayConfig = settings.working_hours[dayOfWeek];

  // Check if artist works on this day
  if (!dayConfig || !dayConfig.enabled) {
    return [];
  }

  const workStart = parseTime(dayConfig.start);
  const workEnd = parseTime(dayConfig.end);

  if (!workStart || !workEnd) {
    return [];
  }

  // Create working hours boundaries
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const workingStartTime = createDateTimeInTimezone(
    year, month, day,
    workStart.hours, workStart.minutes,
    settings.timezone
  );

  const workingEndTime = createDateTimeInTimezone(
    year, month, day,
    workEnd.hours, workEnd.minutes,
    settings.timezone
  );

  // Parse existing bookings into Date ranges (optimized single-pass)
  const bookedRanges = existingBookings.reduce<Array<{ start: Date; end: Date }>>((acc, b) => {
    if (b.status === 'CANCELLED') return acc;
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      acc.push({ start, end });
    }
    return acc;
  }, []);

  // Calculate minimum allowed booking time (advance hours requirement)
  const now = new Date();
  const minBookingTime = new Date(now.getTime() + settings.min_advance_hours * 60 * 60 * 1000);

  // Effective start time (considering advance booking requirement)
  let currentSlotStart = new Date(Math.max(
    workingStartTime.getTime(),
    minBookingTime.getTime()
  ));

  // Round up to next slot interval
  const intervalMs = settings.slot_interval * 60 * 1000;
  const startOfDayMs = workingStartTime.getTime();
  const msSinceStart = currentSlotStart.getTime() - startOfDayMs;
  if (msSinceStart % intervalMs !== 0) {
    const roundedMs = Math.ceil(msSinceStart / intervalMs) * intervalMs;
    currentSlotStart = new Date(startOfDayMs + roundedMs);
  }

  // Include buffer time in total duration
  const totalDuration = serviceDuration + settings.buffer_minutes;

  // Generate slots
  while (true) {
    const slotEnd = new Date(currentSlotStart.getTime() + totalDuration * 60 * 1000);

    // Check if slot fits within working hours
    if (slotEnd.getTime() > workingEndTime.getTime()) {
      break;
    }

    // Check for conflicts with existing bookings
    const hasConflict = bookedRanges.some(range =>
      rangesOverlap(currentSlotStart, slotEnd, range.start, range.end)
    );

    if (!hasConflict) {
      // Use service duration (without buffer) for the visible end time
      const visibleEnd = new Date(currentSlotStart.getTime() + serviceDuration * 60 * 1000);

      slots.push({
        start: currentSlotStart.toISOString(),
        end: visibleEnd.toISOString(),
        local: formatTimeLocal(currentSlotStart),
      });
    }

    // Move to next slot
    currentSlotStart = new Date(currentSlotStart.getTime() + intervalMs);
  }

  return slots;
}

// =============================================================================
// API Handler
// =============================================================================

export async function GET(request: Request) {
  const url = new URL(request.url);
  const artistId = (url.searchParams.get('artistId') ?? '').trim();
  const dateStr = (url.searchParams.get('date') ?? '').trim();
  const serviceDurationStr = url.searchParams.get('duration') ?? '';

  // Validate required parameters
  if (!artistId || !dateStr) {
    return NextResponse.json(
      { error: 'Missing required parameters: artistId and date (YYYY-MM-DD)' },
      { status: 400 }
    );
  }

  if (!isUuid(artistId)) {
    return NextResponse.json(
      { error: 'Invalid artistId format' },
      { status: 400 }
    );
  }

  const date = parseDate(dateStr);
  if (!date) {
    return NextResponse.json(
      { error: 'Invalid date format. Expected YYYY-MM-DD' },
      { status: 400 }
    );
  }

  // Parse service duration (default to 60 minutes if not provided)
  const serviceDuration = parseInt(serviceDurationStr, 10) || 60;
  if (serviceDuration < 15 || serviceDuration > 480) {
    return NextResponse.json(
      { error: 'Invalid duration. Must be between 15 and 480 minutes' },
      { status: 400 }
    );
  }

  // Initialize Supabase client
  const supabase = createSupabaseServiceClient() ?? createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database connection not configured' },
      { status: 501 }
    );
  }

  // Fetch artist settings
  const { data: settingsData, error: settingsError } = await supabase
    .from('artist_settings')
    .select('*')
    .eq('artist_id', artistId)
    .single();

  // Use default settings if none exist
  const settings: ArtistSettings = settingsData ?? {
    artist_id: artistId,
    working_hours: {
      '0': { start: '00:00', end: '00:00', enabled: false },
      '1': { start: '09:00', end: '18:00', enabled: true },
      '2': { start: '09:00', end: '18:00', enabled: true },
      '3': { start: '09:00', end: '18:00', enabled: true },
      '4': { start: '09:00', end: '18:00', enabled: true },
      '5': { start: '09:00', end: '18:00', enabled: true },
      '6': { start: '10:00', end: '15:00', enabled: true },
    },
    slot_interval: 30,
    buffer_minutes: 0,
    timezone: 'America/Santiago',
    min_advance_hours: 2,
    max_advance_days: 60,
  };

  if (settingsError && settingsError.code !== 'PGRST116') {
    console.error('Error fetching artist settings:', settingsError);
  }

  // Check if date is within allowed booking range
  const now = new Date();
  const maxBookingDate = new Date(now.getTime() + settings.max_advance_days * 24 * 60 * 60 * 1000);

  if (date.getTime() > maxBookingDate.getTime()) {
    return NextResponse.json({
      slots: [],
      workingHours: null,
      timezone: settings.timezone,
      date: dateStr,
      message: `Bookings can only be made up to ${settings.max_advance_days} days in advance`,
    } as AvailabilityResponse & { message: string }, {
      status: 200,
      headers: { 'cache-control': 'no-store' },
    });
  }

  // Calculate day bounds for fetching bookings
  const dayOfWeek = getDayOfWeek(date).toString();
  const dayConfig = settings.working_hours[dayOfWeek];

  // If artist doesn't work this day, return empty
  if (!dayConfig || !dayConfig.enabled) {
    return NextResponse.json({
      slots: [],
      workingHours: null,
      timezone: settings.timezone,
      date: dateStr,
    } as AvailabilityResponse, {
      status: 200,
      headers: { 'cache-control': 'no-store' },
    });
  }

  // Fetch existing bookings for this date
  const dayStart = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
  const dayEnd = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));

  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select('start_time, end_time, status, duration_snapshot')
    .eq('artist_id', artistId)
    .neq('status', 'CANCELLED')
    .gte('start_time', dayStart.toISOString())
    .lte('start_time', dayEnd.toISOString());

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }

  const existingBookings: ExistingBooking[] = (bookingsData ?? []).map(b => ({
    start_time: b.start_time,
    end_time: b.end_time,
    status: b.status,
    duration_snapshot: b.duration_snapshot,
  }));

  // Generate available slots
  const slots = generateAvailableSlots(date, serviceDuration, settings, existingBookings);

  const response: AvailabilityResponse = {
    slots,
    workingHours: {
      start: dayConfig.start,
      end: dayConfig.end,
    },
    timezone: settings.timezone,
    date: dateStr,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { 'cache-control': 'no-store' },
  });
}

// =============================================================================
// Legacy Endpoint Support (for backwards compatibility)
// Returns occupied slots in the old format
// =============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artistId, date } = body as { artistId?: string; date?: string };

    if (!artistId || !date) {
      return NextResponse.json(
        { error: 'Missing artistId or date' },
        { status: 400 }
      );
    }

    // Redirect to GET endpoint for backwards compatibility
    const url = new URL(request.url);
    url.searchParams.set('artistId', artistId);
    url.searchParams.set('date', date);

    return GET(new Request(url.toString()));
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
