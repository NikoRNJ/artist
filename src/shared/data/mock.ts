import { Artist, Review, Service } from '@/shared/types';

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Executive Fade', duration: 45, price: 45, deposit: 15, description: 'Premium cut with hot towel treatment and straight razor finish.' },
  { id: 's2', name: 'Beard Sculpting', duration: 30, price: 25, deposit: 10, description: 'Shaping and trimming with organic beard oil application.' },
  { id: 's3', name: 'Traditional Tattoo (Small)', duration: 120, price: 150, deposit: 50, description: 'Up to 3x3 inches, black and grey or full color.' },
  { id: 's4', name: 'Realism Sleeve Session', duration: 360, price: 800, deposit: 200, description: 'Full day session focusing on hyper-realistic textures.' },
];

export const MOCK_ARTIST: Artist = {
  id: 'a1',
  name: 'Marcus "Ink" Sterling',
  title: 'Master Artist & Barber',
  bio: 'Specializing in hyper-realism tattoos and precision geometric fades for over 12 years. Winner of the 2023 Vanguard Arts Award.',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
  rating: 4.9,
  reviewCount: 128,
  styles: ['Realism', 'Fine Line', 'Skin Fade', 'Old School'],
  location: 'Downtown Arts District, LA',
  portfolio: [
    { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600', description: 'Lion realism back piece', tags: ['Realism', 'Black & Grey'] },
    { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', description: 'Geometric sleeve', tags: ['Geometric', 'Dotwork'] },
    { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600', description: 'Classic low fade', tags: ['Fade', 'Traditional'] },
    { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1621605815841-aa88014397e1?auto=format&fit=crop&q=80&w=600', description: 'Traditional dagger', tags: ['American Traditional'] },
  ],
  services: MOCK_SERVICES,
};

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', author: 'James W.', rating: 5, content: 'Best realism work in the city. The attention to detail is insane.', date: '2 days ago', verified: true },
  { id: 'r2', author: 'Sarah K.', rating: 5, content: 'Marcus is a professional. Booking was seamless and the deposit system is fair.', date: '1 week ago', verified: true },
  { id: 'r3', author: 'Michael R.', rating: 4, content: 'Great cut, but hard to find parking near the studio.', date: '2 weeks ago', verified: true },
];
