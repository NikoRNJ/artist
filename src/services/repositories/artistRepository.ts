import 'server-only';

import { MOCK_ARTIST, MOCK_REVIEWS, MOCK_SERVICES } from '@/shared/data/mock';
import type { Artist, PortfolioItem, Review, Service } from '@/shared/types';
import { createSupabaseServerClient } from '@/services/supabase/server';

type ArtistRow = {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  rating: number;
  review_count: number;
  styles: string[];
  location: string;
};

type ServiceRow = {
  id: string;
  artist_id: string;
  name: string;
  duration: number;
  price: number;
  deposit: number;
  description: string;
};

type PortfolioRow = {
  id: string;
  artist_id: string;
  image_url: string;
  description: string;
  tags: string[];
};

type ReviewRow = {
  id: string;
  artist_id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  verified: boolean;
};

function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    duration: row.duration,
    price: row.price,
    deposit: row.deposit,
    description: row.description,
  };
}

function mapPortfolioItem(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    description: row.description,
    tags: row.tags ?? [],
  };
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    author: row.author,
    rating: row.rating,
    content: row.content,
    date: row.date,
    verified: row.verified,
  };
}

function mapArtist(row: ArtistRow, services: Service[], portfolio: PortfolioItem[]): Artist {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    bio: row.bio,
    avatar: row.avatar,
    rating: row.rating,
    reviewCount: row.review_count,
    styles: row.styles ?? [],
    location: row.location,
    portfolio,
    services,
  };
}

export async function getFeaturedArtistPageData(): Promise<{ artist: Artist; reviews: Review[] }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { artist: MOCK_ARTIST, reviews: MOCK_REVIEWS };
  }

  const artistResult = await supabase.from('artists').select('*').limit(1).maybeSingle<ArtistRow>();
  if (artistResult.error || !artistResult.data) {
    return { artist: MOCK_ARTIST, reviews: MOCK_REVIEWS };
  }

  const artist = artistResult.data;

  const [servicesResult, portfolioResult, reviewsResult] = await Promise.all([
    supabase.from('services').select('*').eq('artist_id', artist.id).returns<ServiceRow[]>(),
    supabase.from('portfolio_items').select('*').eq('artist_id', artist.id).returns<PortfolioRow[]>(),
    supabase.from('reviews').select('*').eq('artist_id', artist.id).returns<ReviewRow[]>(),
  ]);

  const services = servicesResult.data?.map(mapService) ?? MOCK_SERVICES;
  const portfolio = portfolioResult.data?.map(mapPortfolioItem) ?? MOCK_ARTIST.portfolio;
  const reviews = reviewsResult.data?.map(mapReview) ?? MOCK_REVIEWS;

  return {
    artist: mapArtist(artist, services, portfolio),
    reviews,
  };
}
