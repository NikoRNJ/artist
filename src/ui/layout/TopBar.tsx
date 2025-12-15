'use client';

import React from 'react';
import { ViewMode } from '@/shared/types';

interface TopBarProps {
  view: ViewMode;
}

const TopBar: React.FC<TopBarProps> = ({ view }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-8">
      <h2 className="text-lg font-medium text-gray-400">
        {view === ViewMode.CLIENT ? 'Browse Artists' : 'My Dashboard'}
      </h2>
      <div className="flex items-center gap-4">
        <button className="text-sm px-4 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-colors">
          Help
        </button>
      </div>
    </header>
  );
};

export default TopBar;
