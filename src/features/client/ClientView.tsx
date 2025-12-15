'use client';

import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle, Clock, ExternalLink, MapPin, MessageSquare, Star } from 'lucide-react';
import BookingModal from '@/features/booking/BookingModal';
import type { Artist, Review, Service } from '@/shared/types';

interface ClientViewProps {
  artist: Artist;
  reviews: Review[];
}

const ClientView: React.FC<ClientViewProps> = ({ artist, reviews }) => {
  const [showBooking, setShowBooking] = useState(false);
  const defaultService = useMemo<Service | null>(() => artist.services[0] ?? null, [artist.services]);
  const [selectedService, setSelectedService] = useState<Service | null>(defaultService);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] z-10" />
        <div className="h-64 rounded-3xl overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=1200"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt="Banner del estudio"
          />
        </div>

        <div className="relative z-20 -mt-20 flex flex-col md:flex-row items-end gap-6 px-8">
          <img
            src={artist.avatar}
            className="w-40 h-40 rounded-2xl border-4 border-[#0a0a0a] shadow-2xl object-cover"
            alt={artist.name}
          />
          <div className="flex-1 pb-2">
            <h1 className="text-4xl font-display text-white mb-2">{artist.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-400">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star size={18} fill="currentColor" /> {artist.rating} ({artist.reviewCount})
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={18} /> {artist.location}
              </span>
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle size={18} /> Profesional verificado
              </span>
            </div>
          </div>
          <div className="flex gap-3 pb-2">
            <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <MessageSquare size={20} />
            </button>
            <button
              onClick={() => setShowBooking(true)}
              className="px-8 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              Reservar ahora
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Sobre el artista</h3>
            <p className="text-gray-400 leading-relaxed text-lg italic">"{artist.bio}"</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {artist.styles.map((style) => (
                <span
                  key={style}
                  className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium hover:border-amber-500/50 transition-colors cursor-default"
                >
                  {style}
                </span>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Portafolio</h3>
              <button className="text-amber-500 text-sm flex items-center gap-1 hover:underline">
                Ver todo en Instagram <ExternalLink size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {artist.portfolio.map((item) => (
                <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square">
                  <img
                    src={item.imageUrl}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={item.description}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <p className="text-sm font-medium mb-2">{item.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-6">Reseñas verificadas</h3>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{review.author}</span>
                      {review.verified && <CheckCircle size={14} className="text-green-500" />}
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex gap-1 mb-3 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="text-gray-400 italic">"{review.content}"</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 p-6 bg-[#111] border border-white/5 rounded-3xl">
            <h3 className="text-xl font-bold mb-6">Menú de servicios</h3>
            <div className="space-y-4">
              {artist.services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setShowBooking(true);
                  }}
                  className="p-4 rounded-2xl border border-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold group-hover:text-amber-500">{service.name}</h4>
                    <span className="font-bold text-amber-500">${service.price}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {service.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle size={12} /> ${service.deposit} de depósito
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{service.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Próxima disponibilidad</span>
                <span className="text-green-500 font-medium">Mañana, 10:00 AM</span>
              </div>
              <button
                onClick={() => {
                  if (defaultService) {
                    setSelectedService(defaultService);
                    setShowBooking(true);
                  }
                }}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <CalendarIcon size={18} /> Reservar un turno
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBooking && selectedService && (
        <BookingModal artistId={artist.id} service={selectedService} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
};

export default ClientView;
