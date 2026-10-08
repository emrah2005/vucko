import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/providers/CartProvider';
import { AppProvider } from '@/lib/providers/AppProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ќебапчилница Вучко — Ростуше',
  description:
    'Ќебапчилница Вучко во Ростуше — традиционална скара, ќебапи, плескавица, стек, тавче гравче и свежи пијалоци.',
  keywords: ['ќебапи', 'скара', 'Ќебапчилница Вучко', 'Ростуше', 'плескавица', 'стек', 'тавче гравче'],
  openGraph: {
    type: 'website',
    locale: 'mk_MK',
    title: 'Ќебапчилница Вучко — Ростуше',
    description:
      'Традиционална македонска скара во Ростуше. Ќебапи, плескавица, стек, тавче гравче и пијалоци.',
    siteName: 'Ќебапчилница Вучко',
  },
  metadataBase: new URL('https://example.com'),
  robots: {
    index: true,
    follow: true,
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Ќебапчилница Вучко',
  image: '/images/1.jpeg',
  servesCuisine: ['Македонска', 'Балканска'],
  priceRange: 'ден',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ростуше',
    addressCountry: 'Северна Македонија',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mk">
      <body className="min-h-screen bg-cream text-charcoal antialiased flex flex-col">
        <AppProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AppProvider>
      </body>
    </html>
  );
}
