'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/providers/CartProvider';
import { useApp } from '@/lib/providers/AppProvider';

const navLinks = [
  { href: '/', label: 'Почетна' },
  { href: '/menu', label: 'Мени' },
  { href: '/order', label: 'Нарачај' },
  { href: '/contact', label: 'Контакт' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { isOrderingOpen } = useApp();

  if (pathname.startsWith('/admin')) return null;
  if (pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-border">
      <div className="max-w-content mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-charcoal group-hover:text-red-accent transition-colors">
              ВУЧКО
            </span>
            <span className="hidden sm:inline-block text-[10px] md:text-xs uppercase tracking-widest text-charcoal-muted">
              Ќебапчилница
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors ${
                  pathname === link.href
                    ? 'text-red-accent'
                    : 'text-charcoal-light hover:text-red-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/order"
              className="hidden sm:flex items-center gap-2 bg-red-accent hover:bg-red-hover text-white text-sm px-4 py-2 rounded-md transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Кошничка</span>
              {itemCount > 0 && (
                <span className="bg-white text-red-accent text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-charcoal hover:text-red-accent transition-colors"
              aria-label="Мени"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-6 pt-2 border-t border-border">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`px-2 py-3 rounded-md transition-colors ${
                    pathname === link.href
                      ? 'bg-cream-dark text-red-accent font-medium'
                      : 'text-charcoal-light hover:bg-cream-dark'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/order"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between mt-3 bg-red-accent hover:bg-red-hover text-white px-4 py-3 rounded-md transition-colors"
              >
                <span>Кошничка</span>
                {itemCount > 0 && (
                  <span className="bg-white text-red-accent text-xs font-semibold px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        )}

        {!isOrderingOpen && !open && (
          <div className="pb-3">
            <div className="bg-charcoal text-cream text-xs md:text-sm py-2 px-4 rounded-md text-center">
              Онлајн нарачките моментално се затворени.
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
