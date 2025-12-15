import { Artist, Review, Service } from '@/shared/types';

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Degradado ejecutivo', duration: 45, price: 45, deposit: 15, description: 'Corte premium con toalla caliente y acabado a navaja.' },
  { id: 's2', name: 'Perfilado de barba', duration: 30, price: 25, deposit: 10, description: 'Perfilado y recorte con aplicación de aceite de barba orgánico.' },
  { id: 's3', name: 'Tatuaje tradicional (pequeño)', duration: 120, price: 150, deposit: 50, description: 'Hasta 3x3 pulgadas, negro y gris o a todo color.' },
  { id: 's4', name: 'Sesión de manga realista', duration: 360, price: 800, deposit: 200, description: 'Sesión de día completo enfocada en texturas hiperrealistas.' },
];

export const MOCK_ARTIST: Artist = {
  id: 'a1',
  name: 'Marcus "Ink" Sterling',
  title: 'Barbero y artista maestro',
  bio: 'Especializado en tatuajes hiperrealistas y degradados geométricos de precisión desde hace más de 12 años. Ganador del Premio Vanguard Arts 2023.',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
  rating: 4.9,
  reviewCount: 128,
  styles: ['Realismo', 'Línea fina', 'Degradado', 'Old school'],
  location: 'Distrito de las Artes (Downtown), LA',
  portfolio: [
    { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600', description: 'Espalda hiperrealista de león', tags: ['Realismo', 'Negro y gris'] },
    { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', description: 'Manga geométrica', tags: ['Geométrico', 'Dotwork'] },
    { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600', description: 'Degradado bajo clásico', tags: ['Degradado', 'Tradicional'] },
    { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1621605815841-aa88014397e1?auto=format&fit=crop&q=80&w=600', description: 'Daga tradicional', tags: ['Tradicional americano'] },
  ],
  services: MOCK_SERVICES,
};

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', author: 'James W.', rating: 5, content: 'El mejor trabajo de realismo de la ciudad. La atención al detalle es increíble.', date: 'hace 2 días', verified: true },
  { id: 'r2', author: 'Sarah K.', rating: 5, content: 'Marcus es un profesional. La reserva fue sencilla y el sistema de depósito es justo.', date: 'hace 1 semana', verified: true },
  { id: 'r3', author: 'Michael R.', rating: 4, content: 'Gran corte, pero es difícil encontrar aparcamiento cerca del estudio.', date: 'hace 2 semanas', verified: true },
];
