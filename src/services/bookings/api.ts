type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type CreateBookingInput = {
  artistId: string;
  serviceId?: string;
  clientName?: string;
  startTime: string;
  depositPaid?: boolean;
  status?: BookingStatus;
};

export type OccupiedSlot = { start: string; end: string };

export async function createBooking(input: CreateBookingInput): Promise<{ id: string } | null> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) return null;
  return { id: data.id };
}

export async function getArtistAvailability(artistId: string, date: string): Promise<OccupiedSlot[]> {
  const params = new URLSearchParams({ artistId, date });
  const response = await fetch(`/api/availability?${params.toString()}`);

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) return [];

  return data.filter((item): item is OccupiedSlot => {
    if (!item || typeof item !== 'object') return false;
    const slot = item as Partial<OccupiedSlot>;
    return typeof slot.start === 'string' && typeof slot.end === 'string';
  });
}
