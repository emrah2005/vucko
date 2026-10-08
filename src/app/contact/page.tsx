import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from 'lucide-react';
import { FALLBACK_SETTINGS, FALLBACK_OPENING_HOURS } from '@/lib/seed-data';

export const revalidate = 30;

export const metadata = {
  title: 'Контакт — Ќебапчилница Вучко',
  description:
    'Контактирајте ја Ќебапчилницата Вучко во Ростуше. Телефон, адреса, работно време и социјални мрежи.',
};

export default async function ContactPage() {
  const settings = FALLBACK_SETTINGS;
  const hours = FALLBACK_OPENING_HOURS;

  return (
    <div className="max-w-content mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-24">
      <div className="max-w-3xl mb-14">
        <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-red-accent mb-5">
          <span className="w-8 h-px bg-red-accent/40" />
          КОНТАКТ
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-charcoal mb-5">
          Наоѓаме се во <span className="text-red-accent">Ростуше</span>
        </h1>
        <p className="text-charcoal-light leading-relaxed">
          Дојдете во гости, контактирани нè за нарачки или прашања.
          Ние сме тука за вас секој ден, со отворено срце и топла скара.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-border p-7 md:p-9">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-charcoal">
              Информации за контакт
            </h2>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-md bg-cream border border-border flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-red-accent" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-1">
                    Локација
                  </div>
                  <div className="text-charcoal font-semibold mb-0.5">
                    Ќебапчилница Вучко
                  </div>
                  <div className="text-charcoal-light">
                    {settings?.address || 'Ростуше, Северна Македонија'}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-md bg-cream border border-border flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-red-accent" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-1">
                    Телефон
                  </div>
                  <a
                    href={`tel:${(settings?.phone || '078-495-591').replace(/\s|-/g, '')}`}
                    className="text-charcoal font-medium hover:text-red-accent transition-colors"
                  >
                    {settings?.phone || '078-495-591'}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-md bg-cream border border-border flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-red-accent" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-1">
                    Имејл
                  </div>
                  <a
                    href={`mailto:${settings?.email || 'ahmedidelil0@gmail.com'}`}
                    className="text-charcoal font-medium hover:text-red-accent transition-colors"
                  >
                    {settings?.email || 'ahmedidelil0@gmail.com'}
                  </a>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-widest text-charcoal-muted mb-4">
                Работно време
              </h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal">Понеделник — Сабота</span>
                  <span className="font-medium text-charcoal">08:00 — 15:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal">Недела</span>
                  <span className="font-medium text-red-accent">Затворено</span>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-xs text-charcoal-muted pt-3 border-t border-border/60">
                {hours.map((h) => (
                  <div key={h.id} className="flex justify-between">
                    <span>{h.day_name}</span>
                    <span className={h.closed ? 'text-red-accent' : 'text-charcoal-light'}>
                      {h.closed
                        ? 'Затворено'
                        : `${h.open_time} — ${h.close_time}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-widest text-charcoal-muted mb-4">
                Следете нè
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={settings?.instagram_url || '#'}
                  className="w-11 h-11 rounded-md bg-cream border border-border flex items-center justify-center hover:bg-charcoal hover:text-white hover:border-charcoal transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={settings?.facebook_url || '#'}
                  className="w-11 h-11 rounded-md bg-cream border border-border flex items-center justify-center hover:bg-charcoal hover:text-white hover:border-charcoal transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d186.4430185599047!2d20.599217559911764!3d41.61060228303799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13516cbbd797e05f%3A0xb61258ca44b2d1af!2sKebabcici%20Volcko!5e0!3m2!1sen!2smk!4v1791454253369!5m2!1sen!2smk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Ќебапчилница Вучко — Ростуше"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
