'use client';

import React, { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Bell, Calendar, DollarSign, MessageCircle, MoreVertical, Send, Sparkles, Users } from 'lucide-react';
import type { Artist } from '@/shared/types';
import { generateMarketingCopy } from '@/services/ai/marketing';

const weeklyData = [
  { name: 'Lun', revenue: 400, bookings: 4 },
  { name: 'Mar', revenue: 300, bookings: 3 },
  { name: 'Mié', revenue: 200, bookings: 2 },
  { name: 'Jue', revenue: 600, bookings: 6 },
  { name: 'Vie', revenue: 800, bookings: 8 },
  { name: 'Sáb', revenue: 1100, bookings: 11 },
  { name: 'Dom', revenue: 700, bookings: 7 },
];

interface ArtistDashboardProps {
  artist: Artist;
}

const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ artist }) => {
  const [marketingDraft, setMarketingDraft] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateCopy = async () => {
    const serviceName = artist.services[0]?.name ?? 'servicio';

    setLoadingAI(true);
    try {
      const copy = await generateMarketingCopy(serviceName, artist.name);
      setMarketingDraft(copy);
    } catch (error) {
      console.error(error);
      setMarketingDraft('¡Tu cita se acerca! Te esperamos en Ink & Fade.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Panel del artista</h1>
          <p className="text-gray-500">Resumen de la actividad de tu estudio</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-[#0a0a0a]" />
          </button>
          <button className="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all">
            Actualizar perfil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-500" />} label="Nuevos clientes" value="24" trend="+12% vs. la semana pasada" />
        <StatCard icon={<Calendar className="text-amber-500" />} label="Reservas" value="48" trend="+5% vs. la semana pasada" />
        <StatCard icon={<DollarSign className="text-green-500" />} label="Ingresos totales" value="$4,250" trend="+18% vs. la semana pasada" />
        <StatCard icon={<MessageCircle className="text-purple-500" />} label="Reseñas pendientes" value="12" trend="Todas verificadas" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#111] border border-white/5 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold">Rendimiento semanal</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
                <option>Últimos 7 días</option>
                <option>Último mes</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold">Citas recientes</h3>
              <button className="text-xs text-amber-500 hover:underline">Ver calendario</button>
            </div>
            <div className="divide-y divide-white/5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-bold text-gray-500">JS</div>
                    <div>
                      <p className="font-bold">John Smith</p>
                      <p className="text-xs text-gray-500">Skin Fade - Mañana, 11:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold tracking-widest rounded-full">
                      Confirmado
                    </span>
                    <button className="text-gray-500 hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1 rounded-3xl">
            <div className="bg-[#111] rounded-[22px] p-6">
              <div className="flex items-center gap-2 mb-4 text-amber-500">
                <Sparkles size={20} />
                <h3 className="font-bold">Estudio de marketing con IA</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">Mejora tu retención con recordatorios y promociones generados por IA.</p>

              <div className="space-y-4">
                <button
                  onClick={handleGenerateCopy}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                >
                  {loadingAI ? 'Preparando magia...' : 'Generar mensaje de reactivación'}
                </button>

                {marketingDraft && (
                  <div className="p-4 bg-white/5 border border-amber-500/30 rounded-xl relative group">
                    <p className="text-sm italic text-gray-300">"{marketingDraft}"</p>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                        <Send size={12} /> Enviar campaña
                      </button>
                      <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10" title="Copiar">
                        <MoreVertical size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
            <h3 className="font-bold mb-4">Estadísticas rápidas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tasa de asistencia</span>
                <span className="text-green-500 font-bold">94%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[94%]" />
              </div>
              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-gray-500">Ticket promedio</span>
                <span className="text-amber-500 font-bold">$72.50</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[70%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; trend: string }> = ({ icon, label, value, trend }) => (
  <div className="p-6 bg-[#111] border border-white/5 rounded-3xl group hover:border-amber-500/30 transition-all duration-500">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-3xl font-display font-bold mb-1">{value}</span>
      <span className="text-xs text-gray-500 font-medium">{trend}</span>
    </div>
  </div>
);

export default ArtistDashboard;
