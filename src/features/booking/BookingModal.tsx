'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, CreditCard, X } from 'lucide-react';
import type { Service } from '@/shared/types';
import { createBooking, getArtistAvailability, type OccupiedSlot } from '@/services/bookings/api';

interface BookingModalProps {
  artistId: string;
  service: Service;
  onClose: () => void;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseTimeLabel(timeLabel: string): { hour: number; minute: number } | null {
  const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1] ?? 0);
  const minute = Number(match[2] ?? 0);
  const meridiem = (match[3] ?? '').toUpperCase();

  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  return { hour, minute };
}

function toDateTime(dateInputValue: string, timeLabel: string): Date | null {
  const [year, month, day] = dateInputValue.split('-').map((part) => Number(part));
  if (!year || !month || !day) return null;

  const parsedTime = parseTimeLabel(timeLabel);
  if (!parsedTime) return null;

  const date = new Date(year, month - 1, day, parsedTime.hour, parsedTime.minute, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toDateTimeIso(dateInputValue: string, timeLabel: string): string {
  const date = toDateTime(dateInputValue, timeLabel);
  return date ? date.toISOString() : new Date().toISOString();
}

function overlaps(slotStart: Date, slotEnd: Date, existingStart: Date, existingEnd: Date): boolean {
  return slotStart < existingEnd && slotEnd > existingStart;
}

const BookingModal: React.FC<BookingModalProps> = ({ artistId, service, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const timeSlots = ['10:00 AM', '11:30 AM', '1:00 PM', '3:30 PM', '5:00 PM'];
  const todayDate = useMemo(() => toDateInputValue(new Date()), []);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      if (isUuid(artistId)) {
        const result = await createBooking({
          artistId,
          serviceId: service.id,
          clientName: 'Usuario invitado',
          startTime: toDateTimeIso(selectedDate, selectedTime),
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

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      if (!isUuid(artistId)) {
        setOccupiedSlots([]);
        setLoadingAvailability(false);
        return;
      }

      setLoadingAvailability(true);
      try {
        const slots = await getArtistAvailability(artistId, selectedDate);
        if (!cancelled) setOccupiedSlots(slots);
      } finally {
        if (!cancelled) setLoadingAvailability(false);
      }
    }

    void loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [artistId, selectedDate]);

  const isTimeSlotOccupied = (timeLabel: string): boolean => {
    const slotStart = toDateTime(selectedDate, timeLabel);
    if (!slotStart) return false;

    const slotEnd = new Date(slotStart.getTime() + service.duration * 60 * 1000);
    return occupiedSlots.some((range) => {
      const existingStart = new Date(range.start);
      const existingEnd = new Date(range.end);
      if (Number.isNaN(existingStart.getTime()) || Number.isNaN(existingEnd.getTime())) return false;
      return overlaps(slotStart, slotEnd, existingStart, existingEnd);
    });
  };

  useEffect(() => {
    if (!selectedTime) return;
    if (!selectedDate) return;

    if (isTimeSlotOccupied(selectedTime)) {
      setSelectedTime(null);
    }
  }, [occupiedSlots, selectedDate, selectedTime, service.duration]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#111] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 z-10"
        >
          <X size={20} />
        </button>

        <div className="flex h-full flex-col md:flex-row">
          <div className="w-full md:w-72 bg-white/5 p-8 border-b md:border-b-0 md:border-r border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Detalles de la reserva</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Servicio</p>
                <p className="font-bold text-amber-500">{service.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Importe total</p>
                <p className="font-bold text-2xl">${service.price}</p>
                <p className="text-[10px] text-gray-400 mt-1">Incluye un depósito no reembolsable de ${service.deposit}</p>
              </div>
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

          <div className="flex-1 p-8">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-display mb-6">Elige fecha y hora</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-3 block">Fecha</label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={todayDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="w-full h-12 bg-white/5 rounded-xl border border-white/10 px-4 text-sm text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-400 block">Horarios disponibles</label>
                      {loadingAvailability && <span className="text-xs text-gray-500">Cargando...</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => {
                        const disabled = loadingAvailability || isTimeSlotOccupied(time);
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return;
                              setSelectedTime(time);
                            }}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                              disabled
                                ? 'bg-white/5 border-white/5 text-gray-600 line-through cursor-not-allowed opacity-50'
                                : isSelected
                                  ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20'
                                  : 'bg-white/5 border-white/5 hover:border-white/20'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    disabled={!selectedDate || !selectedTime || loadingAvailability}
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                  >
                    Continuar al pago <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

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
                    className="w-full py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting ? 'Confirmando...' : `Pagar $${service.deposit} y confirmar`}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                  <Check size={40} className="text-black" />
                </div>
                <h2 className="text-3xl font-display mb-2 text-white">¡Reserva confirmada!</h2>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                  Listo: tu {service.name} es el {selectedDate} a las {selectedTime}.
                </p>
                {bookingId && <p className="text-xs text-gray-500 mb-8">ID de reserva: {bookingId}</p>}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">Añadir al calendario</button>
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

export default BookingModal;
