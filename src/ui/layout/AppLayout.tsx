'use client';

import React from 'react';
import Sidebar from '@/ui/layout/Sidebar';
import TopBar from '@/ui/layout/TopBar';
import { ViewMode } from '@/shared/types';

interface AppLayoutProps {
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ view, onChangeView, children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-amber-500/30">
      <Sidebar view={view} onChangeView={onChangeView} />
      <main className="pl-20 md:pl-64 transition-all min-h-screen">
        <TopBar view={view} />
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
