import AppShell from '@/features/shell/AppShell';
import { getFeaturedArtistPageData } from '@/services/repositories/artistRepository';

export default async function Page() {
  const { artist, reviews } = await getFeaturedArtistPageData();
  return <AppShell initialArtist={artist} initialReviews={reviews} />;
}
