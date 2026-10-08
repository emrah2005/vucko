import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import type { Product, ProductCategory } from '@/lib/types';
import { FALLBACK_PRODUCTS } from '@/lib/seed-data';

export const revalidate = 30;

export const metadata = {
  title: 'Мени — Ќебапчилница Вучко',
  description:
    'Нашето мени: традиционална македонска скара, ќебапи, плескавица, стек, тавче гравче, чорби и свежи пијалоци.',
};

type Params = {
  searchParams?: { category?: string };
};

const CATEGORIES: ProductCategory[] = ['Скара', 'Чорби', 'Пијалоци'];

export default async function MenuPage({ searchParams }: Params) {
  const selectedCategory = (searchParams?.category as ProductCategory) || null;
  const supabase = createClient();

  let products: Product[] = FALLBACK_PRODUCTS;
  try {
    let query = supabase.from('products').select('*');
    if (selectedCategory && CATEGORIES.includes(selectedCategory)) {
      query = query.eq('category', selectedCategory);
    }
    const { data, error } = await query
      .order('category', { ascending: true })
      .order('price', { ascending: true });
    if (!error && data && data.length > 0) {
      products = data as Product[];
    }
  } catch {
    // fallback to FALLBACK_PRODUCTS when Supabase is unreachable
  }

  return (
    <div className="max-w-content mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-24">
      <div className="max-w-3xl mb-12 md:mb-16">
        <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-red-accent mb-5">
          <span className="w-8 h-px bg-red-accent/40" />
          НАШЕТО МЕНИ
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-charcoal mb-5">
          Одаде од нашата{' '}
          <span className="text-red-accent">кујна</span>
        </h1>
        <p className="text-charcoal-light leading-relaxed">
          Од класичните ќебапи, преку сочни сендвичи, до автентичен тавче гравче и
          освежувачки пијалоци. Сè е подготвено свежо, секој ден.
        </p>
      </div>

      <CategoryFilter selected={selectedCategory} />

      <div className="mt-10 space-y-16">
        {(selectedCategory ? [selectedCategory] : CATEGORIES).map((cat) => {
          const items = products.filter((p) => p.category === cat);
          return (
            <section key={cat} id={cat.toLowerCase()}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-charcoal">
                  {cat}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-charcoal-muted">
                  {items.length} производи
                </span>
              </div>
              {items.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {items.map((p: Product) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-lg py-16 text-center text-charcoal-muted text-sm">
                  Нема производи во оваа категорија.
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
