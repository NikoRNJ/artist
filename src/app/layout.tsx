import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ink & Fade | Reservas premium',
  description: 'Sistema de reservas y gestión para barberos y tatuadores.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-amber-500/30">{children}</body>
    </html>
  );
}
