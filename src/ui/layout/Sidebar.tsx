'use client';

import React from 'react';
import { LayoutDashboard, Scissors, Search } from 'lucide-react';
import { ViewMode } from '@/shared/types';

interface SidebarProps {
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, onChangeView }) => {
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-[#111] border-r border-white/5 z-50 flex flex-col items-center py-8">
      <div className="mb-12 flex items-center gap-2 px-6">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
          <Scissors className="text-black" size={24} />
        </div>
        <span className="hidden md:block font-display text-2xl tracking-tight text-amber-500">Ink &amp; Fade</span>
      </div>

      <div className="flex-1 w-full space-y-2 px-4">
        <button
          onClick={() => onChangeView(ViewMode.CLIENT)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === ViewMode.CLIENT ? 'bg-amber-500 text-black font-semibold' : 'hover:bg-white/5 text-gray-400'}`}
        >
          <Search size={24} className="flex-shrink-0" />
          <span className="hidden md:block">Buscar artista</span>
        </button>
        <button
          onClick={() => onChangeView(ViewMode.ARTIST)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === ViewMode.ARTIST ? 'bg-amber-500 text-black font-semibold' : 'hover:bg-white/5 text-gray-400'}`}
        >
          <LayoutDashboard size={24} className="flex-shrink-0" />
          <span className="hidden md:block">Portal del artista</span>
        </button>
      </div>

      <div className="w-full px-4 mt-auto">
        <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex-shrink-0" />
          <div className="hidden md:block truncate">
            <p className="text-sm font-medium">Usuario invitado</p>
            <p className="text-xs text-gray-500">Inicia sesión para reservar</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
