import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS } from '@/lib/products-catalog';
import { FALLBACK_SETTINGS, FALLBACK_OPENING_HOURS } from '@/lib/seed-data';
import { ArrowRight, MapPin, Phone, Clock, Instagram, Facebook, Flame } from 'lucide-react';

export const revalidate = 30;

export default async function HomePage() {
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 3);
  const settings = FALLBACK_SETTINGS;
  const hours = FALLBACK_OPENING_HOURS;

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="max-w-content mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-16 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-red-accent mb-6">
                <span className="w-8 h-px bg-red-accent/40" />
                РОСТУШЕ · ВКУСОТ НА СКАРАТА
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-charcoal mb-6">
                Традиционален вкус{' '}
                <span className="text-red-accent">во срцето на Ростуше</span>
              </h1>

              <p className="text-base md:text-lg text-charcoal-light leading-relaxed mb-8 max-w-lg">
                Секојдневно подготвени свежи, домашни балкански вкусови и
                гостопримство што ќе посакате да го споделите.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/order"
                  className="inline-flex items-center justify-center gap-2 bg-red-accent hover:bg-red-hover text-white px-7 py-3.5 rounded-md text-sm font-medium transition-colors"
                >
                  Нарачај онлајн
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center gap-2 border border-charcoal hover:bg-charcoal hover:text-white text-charcoal px-7 py-3.5 rounded-md text-sm font-medium transition-colors"
                >
                  Погледни го менито
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 pt-8 border-t border-border max-w-md">
                <div>
                <div className="text-xs uppercase tracking-widest text-charcoal-muted">
                  Основано
                </div>
                <div className="text-lg font-semibold text-charcoal">Многу години</div>
              </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-charcoal-muted">
                    Свежи производи
                  </div>
                  <div className="text-lg font-semibold text-charcoal">Секој ден</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative aspect-[4/5] md:aspect-[5/6] rounded-2xl overflow-hidden bg-cream-dark">
                <Image
                  src="/images/1.jpeg"
                  alt="Скара - традиционална готвење"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="hidden md:block absolute -bottom-6 -left-6 bg-white p-5 rounded-xl border border-border shadow-sm max-w-[220px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-accent/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-red-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Аутентично</div>
                    <div className="text-xs text-charcoal-muted">Традиционална скара</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MENU */}
      <section className="relative py-20 md:py-28 bg-white">
        <div className="max-w-content mx-auto px-5 md:px-8">
          <div className="max-w-2xl mb-14 md:mb-18">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-red-accent mb-4">
              <span className="w-8 h-px bg-red-accent/40" />
              ОД НАШАТА КУЈНА
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-charcoal mb-4">
              Омилени вкусови
            </h2>
            <p className="text-charcoal-light leading-relaxed">
              Одибрани производи од нашето мени, ги подготвуваме секој ден со
              најквалитетни свежи состојки и љубов.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {(featured?.length ? featured : []).map((p) => (
              <ProductCard key={p.id} product={p} variant="featured" />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-red-accent hover:text-red-hover font-medium text-sm"
            >
              Види го целото мени
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-content mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-cream-dark relative">
                  <Image
                    src="/images/2.jpeg"
                    alt="Домаќинство готвење"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-cream-dark relative">
                    <Image
                      src="/images/3.jpg"
                      alt="Свежи состојки"
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-cream-dark relative">
                    <Image
                      src="/images/4.jpg"
                      alt="Атмосфера"
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-red-accent mb-6">
                <span className="w-8 h-px bg-red-accent/40" />
                ЗА НАС
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-charcoal mb-6">
                Топла скара.{' '}
                <span className="text-brown">Искрен вкус.</span>
              </h2>
              <div className="space-y-4 text-charcoal-light leading-relaxed">
                <p>
                  Вучко е традиционална локална ќебапчилница во срцето на Ростуше.
                  Повеќе од просто јадење — ние имаме прикажуваме историја,
                  гостопримство и вкус на старите рецепти предадени од генерација на генерација.
                </p>
                <p>
                  Нашето приоритет е секојдневно да нудиме најсвежа скара подготвена со
                  грижа. Од класичните ќебапи, преку сочните плескавици, до
                  автентичното тавче гравче — секој парче е внимателно подготвено
                  за вас.
                </p>
                <p className="font-medium text-charcoal">
                  Дојдете и откријте ја топлината на нашата скара.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-border">
                <div>
                  <div className="text-3xl font-bold text-red-accent mb-1">100%</div>
                  <div className="text-xs text-charcoal-muted">Свежи состојки</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-accent mb-1">Дома</div>
                  <div className="text-xs text-charcoal-muted">Рецепти</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-accent mb-1">24/7</div>
                  <div className="text-xs text-charcoal-muted">Љубов</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT / LOCATION */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-content mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-red-accent mb-6">
                <span className="w-8 h-px bg-red-accent/40" />
                ПРОНАЊДЕТЕ НÈ
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-8">
                Кај нас е топло и пријатно
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
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
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-md bg-cream border border-border flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-red-accent" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-1">
                      Контакт
                    </div>
                    <a
                      href={`tel:${(settings?.phone || '078-495-591').replace(/\s|-/g, '')}`}
                      className="text-charcoal font-medium hover:text-red-accent transition-colors"
                    >
                      {settings?.phone || '078-495-591'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-md bg-cream border border-border flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-red-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-2">
                      Работно време
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal font-medium">Понеделник — Сабота</span>
                        <span className="text-charcoal">08:00 — 15:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal font-medium">Недела</span>
                        <span className="text-red-accent font-medium">Затворено</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
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

            <div className="lg:col-span-7">
              <div className="aspect-[4/3] lg:aspect-[16/10] rounded-2xl overflow-hidden border border-border relative">
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
      </section>
    </>
  );
}
