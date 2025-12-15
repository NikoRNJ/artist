'use client';

import React, { useState } from 'react';
import AppLayout from '@/ui/layout/AppLayout';
import ArtistDashboard from '@/features/artist/ArtistDashboard';
import ClientView from '@/features/client/ClientView';
import { MOCK_ARTIST, MOCK_REVIEWS } from '@/shared/data/mock';
import type { Artist, Review } from '@/shared/types';
import { ViewMode } from '@/shared/types';

interface AppShellProps {
  initialArtist?: Artist;
  initialReviews?: Review[];
}

const AppShell: React.FC<AppShellProps> = ({ initialArtist = MOCK_ARTIST, initialReviews = MOCK_REVIEWS }) => {
  const [view, setView] = useState<ViewMode>(ViewMode.CLIENT);

  return (
    <AppLayout view={view} onChangeView={setView}>
      {view === ViewMode.CLIENT ? (
        <ClientView artist={initialArtist} reviews={initialReviews} />
      ) : (
        <ArtistDashboard artist={initialArtist} />
      )}
    </AppLayout>
  );
};

export default AppShell;
