'use client';

import Link from 'next/link';

const CATEGORIES = [
  { value: null, label: 'Сите' },
  { value: 'Скара', label: 'Скара' },
  { value: 'Чорби', label: 'Чорби' },
  { value: 'Пијалоци', label: 'Пијалоци' },
];

export default function CategoryFilter({
  selected,
  basePath = '/menu',
}: {
  selected: string | null;
  basePath?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const isActive =
          (selected === null && c.value === null) || selected === c.value;
        const href = c.value ? `${basePath}?category=${encodeURIComponent(c.value)}` : basePath;

        return (
          <Link
            key={c.label}
            href={href}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${
              isActive
                ? 'bg-charcoal text-white border-charcoal'
                : 'bg-white text-charcoal-light border-border hover:border-red-accent/40 hover:text-red-accent'
            }`}
          >
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}
