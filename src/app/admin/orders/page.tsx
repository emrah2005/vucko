'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Package,
  Phone,
  MapPin,
  Store,
  FileText,
  Clock,
  Loader2,
  AlertCircle,
  Check,
  X,
  Search,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderItem, OrderStatus } from '@/lib/types';
import {
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusColor,
} from '@/lib/utils';

const FILTERS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Сите' },
  { value: 'NEW', label: 'Нови' },
  { value: 'ACCEPTED', label: 'Прифатени' },
  { value: 'PREPARING', label: 'Се подготвуваат' },
  { value: 'READY', label: 'Подготвени' },
  { value: 'COMPLETED', label: 'Завршени' },
  { value: 'CANCELLED', label: 'Откажани' },
];

const NEXT_STATUS: Record<OrderStatus, { to: OrderStatus | null; label: string }> = {
  NEW: { to: 'ACCEPTED', label: 'Прифати' },
  ACCEPTED: { to: 'PREPARING', label: 'Започни со подготовка' },
  PREPARING: { to: 'READY', label: 'Означи како подготвена' },
  READY: { to: 'COMPLETED', label: 'Означи како завршена' },
  COMPLETED: { to: null, label: 'Завршена' },
  CANCELLED: { to: null, label: 'Откажана' },
};

function OrdersContent() {
  const sp = useSearchParams();
  const statusParam = sp.get('status') as OrderStatus | 'ALL';
  const orderId = sp.get('order');
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>(statusParam || 'ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(orderId);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(*)
        `
        )
        .order('created_at', { ascending: false })
        .limit(100);
      const { data, error: err } = await q;
      if (err) throw err;
      const merged = (data || []).map((o: any) => ({
        ...o,
        items: o.items || [],
      }));
      setOrders(merged);
    } catch (e: any) {
      setError(e?.message || 'Грешка при вчитување нарачки.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('orders-admin-all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => load()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let result = orders;
    if (filter !== 'ALL') result = result.filter((o) => o.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          String(o.order_number).includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          (o.address || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, filter, search]);

  const changeStatus = async (id: string, next: OrderStatus) => {
    setSavingId(id);
    try {
      await supabase.from('orders').update({ status: next }).eq('id', id);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: next } : o))
      );
    } catch (e: any) {
      alert(e?.message || 'Грешка при промена на статус.');
    } finally {
      setSavingId(null);
    }
  };

  const selected = selectedId
    ? orders.find((o) => o.id === selectedId) || null
    : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal">
            Управување со нарачки
          </h2>
          <p className="text-charcoal-muted text-sm mt-1">
            Вкупно {orders.length} нарачки · {filtered.length} во преглед
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Барај по број, име, телефон..."
            className="pl-9 pr-4 py-2.5 w-full md:w-80 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filter === f.value
                ? 'bg-charcoal text-white border-charcoal'
                : 'bg-white text-charcoal-light border-border hover:border-red-accent/40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-red-accent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-10 h-10 text-charcoal-muted/50 mx-auto mb-3" />
              <p className="text-sm text-charcoal-muted">
                Нема нарачки за овој филтер.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border max-h-[75vh] overflow-y-auto">
              {filtered.map((o) => {
                const isSelected = o.id === selected?.id;
                const isNew = o.status === 'NEW';
                return (
                  <li key={o.id}>
                    <button
                      onClick={() =>
                        setSelectedId(isSelected ? null : o.id)
                      }
                      className={`w-full text-left p-5 flex items-start gap-4 transition-colors ${
                        isSelected
                          ? 'bg-red-accent/5'
                          : 'hover:bg-cream/50'
                      } ${isNew ? 'bg-red-50/50' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center flex-shrink-0">
                        <Package
                          className={`w-5 h-5 ${
                            isNew ? 'text-red-accent' : 'text-charcoal-muted'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">#{o.order_number}</span>
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(
                              o.status
                            )}`}
                          >
                            {getStatusLabel(o.status)}
                          </span>
                          {isNew && (
                            <span className="animate-pulse text-[10px] uppercase tracking-wider bg-red-accent text-white px-2 py-0.5 rounded-full">
                              Нова
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-charcoal mt-1.5 truncate">
                          {o.customer_name}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-charcoal-muted flex items-center gap-1">
                            {o.order_type === 'Достава' ? (
                              <MapPin className="w-3.5 h-3.5" />
                            ) : (
                              <Store className="w-3.5 h-3.5" />
                            )}
                            {o.order_type}
                          </span>
                          <div className="text-sm font-semibold">
                            {formatCurrency(o.total)}
                          </div>
                        </div>
                        <div className="text-xs text-charcoal-muted mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(o.created_at)}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-6">
          {selected ? (
            <div className="bg-white rounded-xl border border-border overflow-hidden sticky top-24">
              <div className="p-6 border-b border-border flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-charcoal-muted">
                    Нарачка
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    #{selected.order_number}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`text-xs uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(
                        selected.status
                      )}`}
                    >
                      {getStatusLabel(selected.status)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-charcoal-muted">
                    {formatDateTime(selected.created_at)}
                  </div>
                  <div className="text-2xl font-bold text-red-accent mt-1">
                    {formatCurrency(selected.total)}
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="p-6 border-b border-border space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-2">
                    Клиент
                  </div>
                  <div className="font-medium text-charcoal">
                    {selected.customer_name}
                  </div>
                  <a
                    href={`tel:${selected.phone}`}
                    className="text-sm text-red-accent hover:text-red-hover flex items-center gap-1.5 mt-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {selected.phone}
                  </a>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-2">
                    Добивање
                  </div>
                  <div className="flex items-center gap-2 text-charcoal">
                    {selected.order_type === 'Достава' ? (
                      <MapPin className="w-4 h-4 text-red-accent" />
                    ) : (
                      <Store className="w-4 h-4 text-red-accent" />
                    )}
                    <span className="font-medium">{selected.order_type}</span>
                  </div>
                  {selected.order_type === 'Достава' && (
                    <>
                      <div className="text-sm text-charcoal-light mt-1.5">
                        {selected.address}
                      </div>
                      {selected.delivery_instructions && (
                        <div className="text-xs text-charcoal-muted mt-1 bg-cream p-2.5 rounded-md">
                          {selected.delivery_instructions}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {selected.note && (
                  <div>
                    <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-2">
                      Забелешка
                    </div>
                    <div className="flex items-start gap-2 text-sm text-charcoal bg-cream p-3 rounded-md">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-charcoal-muted" />
                      {selected.note}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-2">
                    Плаќање
                  </div>
                  <div className="font-medium text-charcoal">
                    {selected.payment_method}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-6 border-b border-border">
                <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-4">
                  Производи ({(selected.items || []).length})
                </div>
                <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {selected.items?.map((it) => (
                    <li
                      key={it.id}
                      className="px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-medium text-sm">{it.product_name}</div>
                        <div className="text-xs text-charcoal-muted mt-0.5">
                          {formatCurrency(it.price)} × {it.quantity}
                        </div>
                      </div>
                      <div className="font-semibold text-sm">
                        {formatCurrency(it.subtotal)}
                      </div>
                    </li>
                  ))}
                  <li className="px-4 py-3 bg-cream/50 flex items-center justify-between">
                    <span className="text-sm text-charcoal-muted">Меѓузбир</span>
                    <span className="font-medium text-sm">
                      {formatCurrency(selected.subtotal)}
                    </span>
                  </li>
                  <li className="px-4 py-4 flex items-center justify-between">
                    <span className="font-semibold">Вкупно</span>
                    <span className="text-xl font-bold text-red-accent">
                      {formatCurrency(selected.total)}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="p-6 space-y-3">
                {selected.status !== 'COMPLETED' &&
                  selected.status !== 'CANCELLED' && (
                    <>
                      {NEXT_STATUS[selected.status].to && (
                        <button
                          disabled={savingId === selected.id}
                          onClick={() =>
                            changeStatus(
                              selected.id,
                              NEXT_STATUS[selected.status].to as OrderStatus
                            )
                          }
                          className="w-full inline-flex items-center justify-center gap-2 bg-red-accent hover:bg-red-hover disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors"
                        >
                          {savingId === selected.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          {NEXT_STATUS[selected.status].label}
                        </button>
                      )}
                      <button
                        disabled={savingId === selected.id}
                        onClick={() => changeStatus(selected.id, 'CANCELLED')}
                        className="w-full inline-flex items-center justify-center gap-2 border border-red-accent/40 hover:bg-red-50 disabled:opacity-60 text-red-accent font-medium py-3 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Откажи ја нарачката
                      </button>
                    </>
                  )}
                {(selected.status === 'COMPLETED' ||
                  selected.status === 'CANCELLED') && (
                  <div className="bg-cream rounded-lg p-4 text-center text-sm text-charcoal-muted">
                    Оваа нарачка е{' '}
                    {getStatusLabel(selected.status).toLowerCase()}.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border p-10 text-center">
              <FileText className="w-10 h-10 text-charcoal-muted/50 mx-auto mb-3" />
              <p className="text-sm text-charcoal-muted">
              Изберете нарачка од листата за да ја видите детално.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-red-accent" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
