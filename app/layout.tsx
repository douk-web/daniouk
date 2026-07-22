import type { Metadata } from 'next';
import { Quicksand, Aboreto, Playfair_Display } from 'next/font/google';
import './globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-quicksand',
});

const aboreto = Aboreto({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-aboreto',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Dani Ouk — Aerospace Engineering',
  description:
    'Portfolio of Dani Ouk, an aerospace engineering student working on avionics, propulsion, and flight systems.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.variable} ${aboreto.variable} ${playfair.variable} bg-black text-white antialiased`}
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {children}
      </body>
    </html>
  );
}
