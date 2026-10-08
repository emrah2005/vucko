'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle2, ArrowRight, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function SuccessContent() {
  const sp = useSearchParams();
  const orderNumber = sp.get('order_number') || '—';
  const total = Number(sp.get('total') || 0);
  const type = sp.get('type') || '';

  return (
    <div className="max-w-xl mx-auto px-5 py-24 md:py-32 text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4">
        Нарачката е успешно примена!
      </h1>
      <p className="text-charcoal-light leading-relaxed mb-10">
        Ви благодариме за нарачката. Вучко ќе ве контактира доколку е потребна
        дополнителна потврда.
      </p>

      <div className="bg-white rounded-xl border border-border p-6 md:p-8 text-left space-y-4 mb-10">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-red-accent/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-red-accent" />
            </div>
            <span className="font-medium text-charcoal">Број на нарачка</span>
          </div>
          <span className="text-xl font-bold text-red-accent">
            #{orderNumber}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-charcoal-muted text-sm">Вкупно</span>
          <span className="font-semibold text-charcoal">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-charcoal-muted text-sm">Тип на нарачка</span>
          <span className="font-medium text-charcoal">{type}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-red-accent hover:bg-red-hover text-white px-7 py-3 rounded-md text-sm font-medium transition-colors"
        >
          Назад кон почетна
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 border border-charcoal hover:bg-charcoal hover:text-white text-charcoal px-7 py-3 rounded-md text-sm font-medium transition-colors"
        >
          Види го менито
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-5 py-32 text-center animate-pulse">
          <div className="w-20 h-20 rounded-full bg-cream-dark mx-auto mb-8" />
          <div className="h-8 bg-cream-dark rounded-md mb-4" />
          <div className="h-4 bg-cream-dark rounded-md" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
