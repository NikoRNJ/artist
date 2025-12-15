export enum ViewMode {
  CLIENT = 'CLIENT',
  ARTIST = 'ARTIST',
}

export interface Artist {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  styles: string[];
  portfolio: PortfolioItem[];
  services: Service[];
  location: string;
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  deposit: number;
  description: string;
}

export interface Appointment {
  id: string;
  artistId: string;
  clientName: string;
  serviceId: string;
  startTime: Date;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  depositPaid: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  verified: boolean;
}
