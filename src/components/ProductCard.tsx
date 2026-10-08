'use client';

import Image from 'next/image';
import { Plus, Ban } from 'lucide-react';
import { useCart } from '@/lib/providers/CartProvider';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { useApp } from '@/lib/providers/AppProvider';

type Props = {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
};

export default function ProductCard({ product, variant = 'default' }: Props) {
  const { addItem } = useCart();
  const { isOrderingOpen } = useApp();
  const disabled = !product.available || !isOrderingOpen;

  const onAdd = () => {
    if (disabled) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
  };

  if (variant === 'featured') {
    return (
      <div className="group bg-white rounded-xl border border-border overflow-hidden hover:border-red-accent/40 transition-all duration-300">
        <div className="relative aspect-[4/3] bg-cream-dark overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-muted text-sm">
              /images/1.jpeg
            </div>
          )}
          {!product.available && (
            <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
              <div className="bg-white text-charcoal text-xs px-3 py-1.5 rounded-md font-medium">
                Не е достапно
              </div>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-semibold text-charcoal">{product.name}</h3>
            <span className="text-lg font-bold text-red-accent whitespace-nowrap">
              {formatCurrency(product.price)}
            </span>
          </div>
          {product.description && (
            <p className="text-sm text-charcoal-muted leading-relaxed mb-5 line-clamp-3">
              {product.description}
            </p>
          )}
          <button
            onClick={onAdd}
            disabled={disabled}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
              disabled
                ? 'bg-cream-dark text-charcoal-muted cursor-not-allowed'
                : 'bg-charcoal hover:bg-red-accent text-white'
            }`}
          >
            {!product.available ? (
              <>
                <Ban className="w-4 h-4" />
                Не е достапно
              </>
            ) : !isOrderingOpen ? (
              'Нарачките се затворени'
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Додај
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-border hover:border-red-accent/30 transition-colors">
        <div className="relative w-24 h-24 rounded-md bg-cream-dark flex-shrink-0 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-muted text-xs">
              Слика
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-charcoal text-base">{product.name}</h3>
            <span className="font-semibold text-red-accent whitespace-nowrap">
              {formatCurrency(product.price)}
            </span>
          </div>
          {product.description && (
            <p className="text-xs text-charcoal-muted mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="mt-auto pt-3">
            <button
              onClick={onAdd}
              disabled={disabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                disabled
                  ? 'bg-cream-dark text-charcoal-muted cursor-not-allowed'
                  : 'bg-red-accent hover:bg-red-hover text-white'
              }`}
            >
              {!product.available ? (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  Недостапно
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Додај
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - full card
  return (
    <div className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-sm transition-all duration-300">
      <div className="relative aspect-square bg-cream-dark overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal-muted text-sm">
            Слика
          </div>
        )}
        {!product.available && (
          <div className="absolute top-3 left-3 bg-charcoal/90 text-white text-xs px-2.5 py-1 rounded-md">
            Недостапно
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-base font-semibold text-charcoal">{product.name}</h3>
        </div>
        {product.description && (
          <p className="text-xs text-charcoal-muted leading-relaxed mb-4 min-h-[32px]">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-red-accent">{formatCurrency(product.price)}</span>
          <button
            onClick={onAdd}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
              disabled
                ? 'bg-cream-dark text-charcoal-muted cursor-not-allowed'
                : 'bg-charcoal hover:bg-red-accent text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            Додај
          </button>
        </div>
      </div>
    </div>
  );
}
