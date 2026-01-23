'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Check, ChevronRight, CreditCard, X, Clock, Calendar, Loader2, AlertCircle } from 'lucide-react';
import type { Service } from '@/shared/types';
import { createBooking } from '@/services/bookings/api';

interface BookingModalProps {
  artistId: string;
  service: Service;
  onClose: () => void;
}

interface AvailableSlot {
  start: string;  // ISO 8601 UTC
  end: string;    // ISO 8601 UTC
  local: string;  // "HH:mm" in artist's timezone
}

interface AvailabilityResponse {
  slots: AvailableSlot[];
  workingHours: { start: string; end: string } | null;
  timezone: string;
  date: string;
  message?: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format UTC ISO string to local display time (e.g., "10:30 AM")
 */
function formatSlotTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '--:--';

  return date.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for display
 */
function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// =============================================================================
// Custom Hook for Availability Fetching
// =============================================================================

function useAvailability(artistId: string, date: string, duration: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [workingHours, setWorkingHours] = useState<{ start: string; end: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!isUuid(artistId) || !date) {
      setSlots([]);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const params = new URLSearchParams({
        artistId,
        date,
        duration: duration.toString(),
      });

      const response = await fetch(`/api/availability?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al obtener disponibilidad');
      }

      const data = (await response.json()) as AvailabilityResponse;

      setSlots(data.slots || []);
      setWorkingHours(data.workingHours);
      if (data.message) {
        setMessage(data.message);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('No se pudo cargar la disponibilidad');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [artistId, date, duration]);

  useEffect(() => {
    void fetchAvailability();
  }, [fetchAvailability]);

  return { loading, error, slots, workingHours, message, refetch: fetchAvailability };
}

// =============================================================================
// BookingModal Component
// =============================================================================

const BookingModal: React.FC<BookingModalProps> = ({ artistId, service, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Calculate min and max dates
  const todayDate = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 60);
    return toDateInputValue(max);
  }, []);

  // Fetch availability using the new API
  const { loading, error, slots, workingHours, message } = useAvailability(
    artistId,
    selectedDate,
    service.duration
  );

  // Reset selected slot when date changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  // Handle booking confirmation
  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      if (isUuid(artistId)) {
        const result = await createBooking({
          artistId,
          serviceId: service.id,
          clientName: 'Usuario invitado',
          startTime: selectedSlot.start,
          depositPaid: true,
          status: 'CONFIRMED',
        });
        if (result?.id) setBookingId(result.id);
      }
    } finally {
      setSubmitting(false);
      setStep(3);
    }
  };

  // Group slots by time period (optimized single-pass)
  const groupedSlots = useMemo(() => {
    return slots.reduce<{ morning: AvailableSlot[]; afternoon: AvailableSlot[]; evening: AvailableSlot[] }>(
      (acc, slot) => {
        const date = new Date(slot.start);
        const hours = date.getUTCHours();

        if (hours < 12) {
          acc.morning.push(slot);
        } else if (hours < 17) {
          acc.afternoon.push(slot);
        } else {
          acc.evening.push(slot);
        }

        return acc;
      },
      { morning: [], afternoon: [], evening: [] }
    );
  }, [slots]);

  const hasSlots = slots.length > 0;
  const isClosedDay = !workingHours && !loading && !error;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#111] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 z-10"
        >
          <X size={20} />
        </button>

        <div className="flex h-full flex-col md:flex-row overflow-hidden">
          {/* Left Panel - Booking Summary */}
          <div className="w-full md:w-72 bg-white/5 p-8 border-b md:border-b-0 md:border-r border-white/10 flex-shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Detalles de la reserva</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Servicio</p>
                <p className="font-bold text-amber-500">{service.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Duración</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  {service.duration} minutos
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Importe total</p>
                <p className="font-bold text-2xl">${service.price}</p>
                <p className="text-[10px] text-gray-400 mt-1">Incluye un depósito no reembolsable de ${service.deposit}</p>
              </div>

              {/* Selected date/time summary */}
              {selectedSlot && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-500 mb-2">Tu cita</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-amber-500" />
                    <span className="capitalize">{formatDateDisplay(selectedDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Clock size={14} className="text-amber-500" />
                    <span>{formatSlotTime(selectedSlot.start)}</span>
                  </div>
                </div>
              )}

              {/* Progress Steps */}
              <div className="pt-6 space-y-3">
                <div className={`flex items-center gap-2 text-sm ${step >= 1 ? 'text-amber-500' : 'text-gray-500'}`}>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-500'}`}
                  >
                    1
                  </div>
                  Elegir hora
                </div>
                <div className={`flex items-center gap-2 text-sm ${step >= 2 ? 'text-amber-500' : 'text-gray-500'}`}>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-500'}`}
                  >
                    2
                  </div>
                  Pagar depósito
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {/* Step 1: Date & Time Selection */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-display mb-6">Elige fecha y hora</h2>
                <div className="space-y-6">
                  {/* Date Picker */}
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-3 block">Fecha</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={todayDate}
                      max={maxDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="w-full h-12 bg-white/5 rounded-xl border border-white/10 px-4 text-sm text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-400 block">Horarios disponibles</label>
                      {loading && (
                        <span className="flex items-center gap-2 text-xs text-gray-500">
                          <Loader2 size={12} className="animate-spin" />
                          Cargando...
                        </span>
                      )}
                    </div>

                    {/* Error State */}
                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}

                    {/* Message (e.g., too far in advance) */}
                    {message && !error && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-400">
                        <AlertCircle size={20} />
                        <span className="text-sm">{message}</span>
                      </div>
                    )}

                    {/* Closed Day State */}
                    {isClosedDay && !message && (
                      <div className="p-8 bg-white/5 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">El artista no atiende este día</p>
                        <p className="text-xs text-gray-600 mt-2">Por favor selecciona otra fecha</p>
                      </div>
                    )}

                    {/* No Slots Available */}
                    {!loading && !error && !isClosedDay && !hasSlots && !message && (
                      <div className="p-8 bg-white/5 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">No hay horarios disponibles</p>
                        <p className="text-xs text-gray-600 mt-2">Todos los turnos están ocupados para esta fecha</p>
                      </div>
                    )}

                    {/* Available Slots Grid */}
                    {!loading && !error && hasSlots && (
                      <div className="space-y-6">
                        {/* Morning Slots */}
                        {groupedSlots.morning.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mañana</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {groupedSlots.morning.map((slot) => (
                                <SlotButton
                                  key={slot.start}
                                  slot={slot}
                                  isSelected={selectedSlot?.start === slot.start}
                                  onClick={() => setSelectedSlot(slot)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Afternoon Slots */}
                        {groupedSlots.afternoon.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tarde</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {groupedSlots.afternoon.map((slot) => (
                                <SlotButton
                                  key={slot.start}
                                  slot={slot}
                                  isSelected={selectedSlot?.start === slot.start}
                                  onClick={() => setSelectedSlot(slot)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evening Slots */}
                        {groupedSlots.evening.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Noche</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {groupedSlots.evening.map((slot) => (
                                <SlotButton
                                  key={slot.start}
                                  slot={slot}
                                  isSelected={selectedSlot?.start === slot.start}
                                  onClick={() => setSelectedSlot(slot)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Continue Button */}
                  <button
                    disabled={!selectedDate || !selectedSlot || loading}
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                  >
                    Continuar al pago <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-display mb-2">Protección ante inasistencias</h2>
                <p className="text-sm text-gray-400 mb-8">
                  Se requiere un depósito de ${service.deposit} para confirmar tu turno. Este monto se descontará del total final.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={20} className="text-amber-500" />
                        <span className="text-sm font-medium">Método de pago</span>
                      </div>
                      <span className="text-xs text-amber-500">Seguro con Stripe</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-12 bg-white/5 rounded-lg border border-white/5 px-4 flex items-center text-sm text-gray-500">
                        **** **** **** 4242
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-12 bg-white/5 rounded-lg border border-white/5 px-4 flex items-center text-sm text-gray-500">MM/YY</div>
                        <div className="h-12 bg-white/5 rounded-lg border border-white/5 px-4 flex items-center text-sm text-gray-500">CVC</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 text-[10px] text-gray-500 italic">
                    <div className="w-4 h-4 rounded-full border border-gray-600 mt-0.5 flex-shrink-0" />
                    Acepto la política de cancelación de 24 horas. Los depósitos no son reembolsables en caso de inasistencia.
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      `Pagar $${service.deposit} y confirmar`
                    )}
                  </button>

                  {/* Back Button */}
                  <button
                    onClick={() => setStep(1)}
                    disabled={submitting}
                    className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    ← Volver a seleccionar horario
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                  <Check size={40} className="text-black" />
                </div>
                <h2 className="text-3xl font-display mb-2 text-white">¡Reserva confirmada!</h2>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                  Listo: tu {service.name} es el{' '}
                  <span className="capitalize">{formatDateDisplay(selectedDate)}</span> a las{' '}
                  {selectedSlot ? formatSlotTime(selectedSlot.start) : '--:--'}.
                </p>
                {bookingId && <p className="text-xs text-gray-500 mb-8">ID de reserva: {bookingId}</p>}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">
                    Añadir al calendario
                  </button>
                  <button onClick={onClose} className="py-3 text-amber-500 hover:text-amber-400 transition-colors font-bold">
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Slot Button Component
// =============================================================================

interface SlotButtonProps {
  slot: AvailableSlot;
  isSelected: boolean;
  onClick: () => void;
}

const SlotButton: React.FC<SlotButtonProps> = ({ slot, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border text-sm font-medium transition-all ${isSelected
          ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20'
          : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
        }`}
    >
      {formatSlotTime(slot.start)}
    </button>
  );
};

export default BookingModal;
