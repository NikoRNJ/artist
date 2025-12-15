'use client';

import React, { useState } from 'react';
import { Check, ChevronRight, CreditCard, X } from 'lucide-react';
import type { Service } from '@/shared/types';
import { createBooking } from '@/services/bookings/api';

interface BookingModalProps {
  artistId: string;
  service: Service;
  onClose: () => void;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toTomorrowIso(timeLabel: string): string {
  const match = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (!match) {
    return tomorrow.toISOString();
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  tomorrow.setHours(hour, minute, 0, 0);
  return tomorrow.toISOString();
}

const BookingModal: React.FC<BookingModalProps> = ({ artistId, service, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const timeSlots = ['10:00 AM', '11:30 AM', '1:00 PM', '3:30 PM', '5:00 PM'];

  const handleConfirm = async () => {
    if (!selectedTime) return;

    setSubmitting(true);
    try {
      if (isUuid(artistId)) {
        const result = await createBooking({
          artistId,
          serviceId: service.id,
          clientName: 'Guest User',
          startTime: toTomorrowIso(selectedTime),
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
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Booking Details</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Service</p>
                <p className="font-bold text-amber-500">{service.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Cost</p>
                <p className="font-bold text-2xl">${service.price}</p>
                <p className="text-[10px] text-gray-400 mt-1">Includes ${service.deposit} non-refundable deposit</p>
              </div>
              <div className="pt-6 space-y-3">
                <div className={`flex items-center gap-2 text-sm ${step >= 1 ? 'text-amber-500' : 'text-gray-500'}`}>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-500'}`}
                  >
                    1
                  </div>
                  Choose Time
                </div>
                <div className={`flex items-center gap-2 text-sm ${step >= 2 ? 'text-amber-500' : 'text-gray-500'}`}>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-500'}`}
                  >
                    2
                  </div>
                  Secure Deposit
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-8">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-display mb-6">Pick an available slot</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-3 block">Available Tomorrow</label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${selectedTime === time ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    disabled={!selectedTime}
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                  >
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-display mb-2">No-Show Protection</h2>
                <p className="text-sm text-gray-400 mb-8">
                  A ${service.deposit} deposit is required to confirm your slot. This amount will be deducted from your final total.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={20} className="text-amber-500" />
                        <span className="text-sm font-medium">Payment Method</span>
                      </div>
                      <span className="text-xs text-amber-500">Stripe Secure</span>
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
                    I agree to the 24-hour cancellation policy. Deposits are non-refundable for no-shows.
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {submitting ? 'Confirming...' : `Pay $${service.deposit} & Confirm`}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                  <Check size={40} className="text-black" />
                </div>
                <h2 className="text-3xl font-display mb-2 text-white">Booking Confirmed!</h2>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                  You're all set for your {service.name} tomorrow at {selectedTime}.
                </p>
                {bookingId && <p className="text-xs text-gray-500 mb-8">Booking ID: {bookingId}</p>}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">Add to Calendar</button>
                  <button onClick={onClose} className="py-3 text-amber-500 hover:text-amber-400 transition-colors font-bold">
                    Done
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
