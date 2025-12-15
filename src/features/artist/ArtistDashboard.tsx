'use client';

import React, { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Bell, Calendar, DollarSign, MessageCircle, MoreVertical, Send, Sparkles, Users } from 'lucide-react';
import type { Artist } from '@/shared/types';
import { generateMarketingCopy } from '@/services/ai/marketing';

const weeklyData = [
  { name: 'Mon', revenue: 400, bookings: 4 },
  { name: 'Tue', revenue: 300, bookings: 3 },
  { name: 'Wed', revenue: 200, bookings: 2 },
  { name: 'Thu', revenue: 600, bookings: 6 },
  { name: 'Fri', revenue: 800, bookings: 8 },
  { name: 'Sat', revenue: 1100, bookings: 11 },
  { name: 'Sun', revenue: 700, bookings: 7 },
];

interface ArtistDashboardProps {
  artist: Artist;
}

const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ artist }) => {
  const [marketingDraft, setMarketingDraft] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateCopy = async () => {
    const serviceName = artist.services[0]?.name ?? 'service';

    setLoadingAI(true);
    try {
      const copy = await generateMarketingCopy(serviceName, artist.name);
      setMarketingDraft(copy);
    } catch (error) {
      console.error(error);
      setMarketingDraft('Your appointment is coming up! We look forward to seeing you at Ink & Fade.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Artist Console</h1>
          <p className="text-gray-500">Overview of your shop activity</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-[#0a0a0a]" />
          </button>
          <button className="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all">
            Update Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-500" />} label="New Clients" value="24" trend="+12% from last week" />
        <StatCard icon={<Calendar className="text-amber-500" />} label="Bookings" value="48" trend="+5% from last week" />
        <StatCard icon={<DollarSign className="text-green-500" />} label="Total Revenue" value="$4,250" trend="+18% from last week" />
        <StatCard icon={<MessageCircle className="text-purple-500" />} label="Pending Reviews" value="12" trend="All verified" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#111] border border-white/5 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold">Weekly Performance</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
                <option>Last 7 Days</option>
                <option>Last Month</option>
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
              <h3 className="font-bold">Recent Appointments</h3>
              <button className="text-xs text-amber-500 hover:underline">View Calendar</button>
            </div>
            <div className="divide-y divide-white/5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-bold text-gray-500">JS</div>
                    <div>
                      <p className="font-bold">John Smith</p>
                      <p className="text-xs text-gray-500">Skin Fade - Tomorrow, 11:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold tracking-widest rounded-full">
                      Confirmed
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
                <h3 className="font-bold">AI Marketing Studio</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">Boost your retention with AI-generated reminders and promo blasts.</p>

              <div className="space-y-4">
                <button
                  onClick={handleGenerateCopy}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                >
                  {loadingAI ? 'Brewing Magic...' : 'Generate Recall Script'}
                </button>

                {marketingDraft && (
                  <div className="p-4 bg-white/5 border border-amber-500/30 rounded-xl relative group">
                    <p className="text-sm italic text-gray-300">"{marketingDraft}"</p>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                        <Send size={12} /> Send Blast
                      </button>
                      <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10" title="Copy">
                        <MoreVertical size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
            <h3 className="font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Show Rate</span>
                <span className="text-green-500 font-bold">94%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[94%]" />
              </div>
              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-gray-500">Avg. Basket</span>
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
