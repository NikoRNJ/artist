type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type CreateBookingInput = {
  artistId: string;
  serviceId?: string;
  clientName?: string;
  startTime: string;
  depositPaid?: boolean;
  status?: BookingStatus;
};

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

