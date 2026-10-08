'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  MapPin,
  Store,
  Phone,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/lib/providers/CartProvider';
import { useApp } from '@/lib/providers/AppProvider';
import { formatCurrency, isValidPhone } from '@/lib/utils';
import CartView from '@/components/CartView';
import type { OrderType, PaymentMethod } from '@/lib/types';

type FormState = {
  customer_name: string;
  phone: string;
  order_type: OrderType;
  address: string;
  delivery_instructions: string;
  note: string;
  payment_method: PaymentMethod;
};

const initialState: FormState = {
  customer_name: '',
  phone: '',
  order_type: 'Подигање од локал',
  address: '',
  delivery_instructions: '',
  note: '',
  payment_method: 'Готово при подигање',
};

export default function OrderPage() {
  const { items, total, clearCart, itemCount } = useCart();
  const { isOrderingOpen, loading: appLoading } = useApp();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.customer_name.trim()) {
      next.customer_name = 'Внесете го вашето име и презиме.';
    } else if (form.customer_name.trim().length < 2) {
      next.customer_name = 'Ве молиме внесете го целосното име.';
    }

    if (!form.phone.trim()) {
      next.phone = 'Внесете телефонски број.';
    } else if (!isValidPhone(form.phone.trim())) {
      next.phone = 'Внесете валиден телефонски број.';
    }

    if (form.order_type === 'Достава') {
      if (!form.address.trim()) {
        next.address = 'Внесете адреса за достава.';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    if (items.length === 0) {
      setGlobalError('Вашата кошничка е празна.');
      return;
    }
    if (!isOrderingOpen) {
      setGlobalError('Онлајн нарачките моментално се затворени.');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Грешка при креирање нарачка.');
      }

      clearCart();
      router.push(
        `/order/success?order_number=${data.order_number}&total=${data.total}&type=${encodeURIComponent(
          data.order_type
        )}`
      );
    } catch (err: any) {
      setGlobalError(
        err?.message ||
          'Настана грешка при креирање на нарачката. Обидете се повторно.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onOrderTypeChange = (type: OrderType) => {
    setForm((f) => ({
      ...f,
      order_type: type,
      payment_method:
        type === 'Достава' ? 'Готово при достава' : 'Готово при подигање',
    }));
  };

  return (
    <div className="max-w-content mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-36">
      <div className="mb-12">
        <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-red-accent mb-5">
          <span className="w-8 h-px bg-red-accent/40" />
          НАРАЧАЈ ОНЛАЈН
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-charcoal mb-5">
          Потврди ја <span className="text-red-accent">твојата нарачка</span>
        </h1>
        <p className="text-charcoal-light leading-relaxed max-w-2xl">
          Избери производи, внеси ги податоците и испрати ја нарачката.
          Ќе ти се јавиме за дополнителна потврда доколку е потребно.
        </p>
      </div>

      {appLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-white rounded-xl border border-border" />
          <div className="h-64 bg-white rounded-xl border border-border" />
        </div>
      ) : !isOrderingOpen ? (
        <div className="border border-red-accent/30 bg-red-50/60 rounded-xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-charcoal mb-2">
            Онлајн нарачките се затворени
          </h2>
          <p className="text-charcoal-light text-sm mb-6">
            Моментално не примаме онлајн нарачки. Дојдете во гости во нашата
            локална或将 се јавите на телефон.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-red-accent hover:bg-red-hover text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Контакт
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Cart */}
          <div className="lg:col-span-5 lg:order-2">
            <div className="lg:sticky lg:top-28">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-red-accent" />
                <h2 className="text-xl font-bold text-charcoal">
                  Твојата кошничка
                  {itemCount > 0 && (
                    <span className="text-sm text-charcoal-muted font-normal ml-2">
                      ({itemCount} производи)
                    </span>
                  )}
                </h2>
              </div>
              <CartView />

              {items.length > 0 && (
                <div className="mt-6 bg-white border border-dashed border-border rounded-lg p-5">
                  <div className="flex items-start gap-3 text-xs text-charcoal-muted">
                    <CheckCircle2 className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Цената на производите е пресметана од серверот за време на
                      потврда. Не прима се плаќање со картичка за време на оваа
                      нарачка.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 lg:order-1">
            {globalError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start gap-3 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {globalError}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-8">
              {/* Info */}
              <div className="bg-white rounded-xl border border-border p-6 md:p-8">
                <h3 className="text-lg font-bold mb-5 text-charcoal">
                  Податоци за клиентот
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      <User className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Име и презиме <span className="text-red-accent">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={(e) =>
                        setForm({ ...form, customer_name: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-md border bg-white text-charcoal placeholder-charcoal-muted/60 focus:border-red-accent transition-colors ${
                        errors.customer_name
                          ? 'border-red-400'
                          : 'border-border'
                      }`}
                      placeholder="Јован Јовановски"
                    />
                    {errors.customer_name && (
                      <p className="mt-1.5 text-xs text-red-accent">
                        {errors.customer_name}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      <Phone className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Телефонски број{' '}
                      <span className="text-red-accent">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-md border bg-white text-charcoal placeholder-charcoal-muted/60 focus:border-red-accent transition-colors ${
                        errors.phone ? 'border-red-400' : 'border-border'
                      }`}
                      placeholder="07X-XXX-XXX"
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-red-accent">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order type */}
              <div className="bg-white rounded-xl border border-border p-6 md:p-8">
                <h3 className="text-lg font-bold mb-5 text-charcoal">
                  Начин на добивање
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(
                    [
                      {
                        type: 'Подигање од локал' as const,
                        icon: Store,
                        desc: 'Дојди и преземи во нашата локација во Ростуше.',
                      },
                      {
                        type: 'Достава' as const,
                        icon: MapPin,
                        desc: 'Достава до адресата (дозволено подалеку од Ростуше).',
                      },
                    ] as const
                  ).map((opt) => {
                    const Icon = opt.icon;
                    const active = form.order_type === opt.type;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => onOrderTypeChange(opt.type)}
                        className={`text-left p-5 rounded-xl border-2 transition-all ${
                          active
                            ? 'border-red-accent bg-red-50/40'
                            : 'border-border hover:border-red-accent/40 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-md flex items-center justify-center ${
                              active
                                ? 'bg-red-accent text-white'
                                : 'bg-cream text-charcoal-muted'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-charcoal">
                              {opt.type}
                            </div>
                            <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {form.order_type === 'Достава' && (
                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Адреса{' '}
                        <span className="text-red-accent">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                        className={`w-full px-4 py-3 rounded-md border bg-white text-charcoal placeholder-charcoal-muted/60 focus:border-red-accent transition-colors ${
                          errors.address ? 'border-red-400' : 'border-border'
                        }`}
                        placeholder="Ул. „Кале“ бр. 12, Ростуше"
                      />
                      {errors.address && (
                        <p className="mt-1.5 text-xs text-red-accent">
                          {errors.address}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Дополнителни инструкции (спрат, интерфон...)
                      </label>
                      <input
                        type="text"
                        value={form.delivery_instructions}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            delivery_instructions: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-md border border-border bg-white text-charcoal placeholder-charcoal-muted/60 focus:border-red-accent transition-colors"
                        placeholder="II спрат, интерфон 5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="bg-white rounded-xl border border-border p-6 md:p-8">
                <h3 className="text-lg font-bold mb-5 text-charcoal">
                  Забелешка (опционално)
                </h3>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border border-border bg-white text-charcoal placeholder-charcoal-muted/60 focus:border-red-accent transition-colors resize-none"
                  placeholder="Без лук, екстра сос, сл."
                />
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl border border-border p-6 md:p-8">
                <h3 className="text-lg font-bold mb-5 text-charcoal">
                  Плаќање
                </h3>
                <div
                  className={`p-4 rounded-lg border-2 ${
                    form.order_type === 'Достава'
                      ? 'border-red-accent bg-red-50/40'
                      : 'border-red-accent bg-red-50/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-red-accent text-white flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-charcoal">
                        {form.payment_method}
                      </div>
                      <p className="text-xs text-charcoal-muted mt-1">
                        Плаќање со готово пари при добивање на нарачката.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="sticky bottom-0 left-0 right-0 -mx-5 px-5 md:-mx-8 md:px-8 py-4 bg-gradient-to-t from-cream via-cream to-cream/80 pointer-events-none">
                <div className="pointer-events-auto max-w-content mx-auto flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white border border-border shadow-lg">
                  <div className="flex-1">
                    <div className="text-xs text-charcoal-muted">
                      Вкупно за плаќање
                    </div>
                    <div className="text-2xl font-bold text-charcoal">
                      {formatCurrency(total)}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-accent hover:bg-red-hover disabled:opacity-60 text-white font-medium px-8 py-4 rounded-md transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Се испраќа...
                      </>
                    ) : (
                      <>
                        Потврди нарачка — {formatCurrency(total)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
