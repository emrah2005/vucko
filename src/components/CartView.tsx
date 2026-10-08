'use client';

import Image from 'next/image';
import { Plus, Minus, X } from 'lucide-react';
import { useCart } from '@/lib/providers/CartProvider';
import { formatCurrency } from '@/lib/utils';

type Props = {
  compact?: boolean;
};

export default function CartView({ compact = false }: Props) {
  const { items, subtotal, total, increaseQuantity, decreaseQuantity, removeItem, itemCount } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16 border border-border rounded-lg bg-white/50">
        <div className="text-charcoal-muted mb-3 text-sm">Вашата кошничка е празна.</div>
        <a
          href="/menu"
          className="inline-block text-red-accent hover:text-red-hover text-sm font-medium"
        >
          Погледни го менито →
        </a>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? '' : ''}`}>
      <ul className="divide-y divide-border bg-white rounded-lg border border-border">
        {items.map((item) => (
          <li key={item.product_id} className="p-4 flex items-start gap-4">
            <div className="w-16 h-16 rounded-md bg-cream-dark flex-shrink-0 overflow-hidden relative">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-charcoal-muted text-xs">
                  Слика
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium text-charcoal truncate">{item.name}</div>
                  <div className="text-xs text-charcoal-muted mt-0.5">
                    {formatCurrency(item.price)} × {item.quantity}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-charcoal-muted hover:text-red-accent transition-colors p-1"
                  aria-label="Отстрани"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center border border-border rounded-md bg-white">
                  <button
                    onClick={() => decreaseQuantity(item.product_id)}
                    className="p-2 hover:bg-cream-dark text-charcoal-light transition-colors"
                    aria-label="Намали"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.product_id)}
                    className="p-2 hover:bg-cream-dark text-charcoal-light transition-colors"
                    aria-label="Зголеми"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-sm font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="bg-white rounded-lg border border-border p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-charcoal-muted">Продукти ({itemCount})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="border-t border-border pt-3 mt-3 flex items-center justify-between">
          <span className="font-medium">Вкупно</span>
          <span className="text-lg font-semibold text-charcoal">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
