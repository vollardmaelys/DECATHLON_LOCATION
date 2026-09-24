import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decathlon Tahiti Location | Louez l’aventure',
  description: 'Réservez votre matériel de sport à Tahiti : tennis, padel, surf et vélo électrique.',
  openGraph: {
    title: 'Decathlon Tahiti Location | Louez l’aventure',
    description: 'Réservez votre matériel de tennis, padel, surf ou vélo électrique et retirez-le à Punaauia.',
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
