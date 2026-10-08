'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import { useApp } from '@/lib/providers/AppProvider';

export default function Footer() {
  const { settings, openingHours } = useApp();
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 7 : today;
  const todayHours = openingHours.find((h) => h.day_of_week === todayIndex);

  return (
    <footer className="mt-24 bg-charcoal text-cream">
      <div className="max-w-content mx-auto px-5 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="md:col-span-1">
            <div className="text-2xl md:text-3xl font-bold tracking-tight mb-4">ВУЧКО</div>
            <p className="text-sm leading-relaxed text-cream-dark/80 max-w-xs">
              Традиционална ќебапчилница во Ростуше. Секојдневно подготвувани свежи,
              домашни балкански вкусови и гостопримство.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest mb-5 text-cream-dark/60">Навигација</h4>
            <nav className="flex flex-col gap-3 text-sm">
              <Link href="/" className="hover:text-white transition-colors text-cream-dark/80">
                Почетна
              </Link>
              <Link href="/menu" className="hover:text-white transition-colors text-cream-dark/80">
                Мени
              </Link>
              <Link href="/order" className="hover:text-white transition-colors text-cream-dark/80">
                Нарачај
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors text-cream-dark/80">
                Контакт
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest mb-5 text-cream-dark/60">Контакт</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={`tel:${(settings?.phone || '078-495-591').replace(/\s|-/g, '')}`}
                className="flex items-start gap-3 text-cream-dark/80 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{settings?.phone || '078-495-591'}</span>
              </a>
              <a
                href={`mailto:${settings?.email || 'ahmedidelil0@gmail.com'}`}
                className="flex items-start gap-3 text-cream-dark/80 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{settings?.email || 'ahmedidelil0@gmail.com'}</span>
              </a>
              <div className="flex items-start gap-3 text-cream-dark/80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{settings?.address || 'Ростуше, Северна Македонија'}</span>
              </div>
              {todayHours && (
                <div className="text-cream-dark/80">
                  {todayHours.closed
                    ? `Денес: Затворено`
                    : `Денес: ${todayHours.open_time} – ${todayHours.close_time}`}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest mb-5 text-cream-dark/60">Следете нè</h4>
            <div className="flex items-center gap-3">
              <a
                href={settings?.instagram_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-cream-dark/30 flex items-center justify-center hover:bg-cream-dark/10 hover:border-cream-dark/60 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings?.facebook_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-cream-dark/30 flex items-center justify-center hover:bg-cream-dark/10 hover:border-cream-dark/60 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-cream-dark/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream-dark/50">
          <p>© {new Date().getFullYear()} Ќебапчилница Вучко. Сите права задржани.</p>
          <p>Ростуше, Северна Македонија</p>
        </div>
      </div>
    </footer>
  );
}
