'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ClipboardList,
  CheckCircle2,
  Coins,
  TrendingUp,
  ArrowRight,
  Package,
  Clock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/types';
import {
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusColor,
} from '@/lib/utils';

type Stats = {
  newOrders: number;
  todayOrders: number;
  todayCompleted: number;
  todayRevenue: number;
  totalOrders: number;
};

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    newOrders: 0,
    todayOrders: 0,
    todayCompleted: 0,
    todayRevenue: 0,
    totalOrders: 0,
  });
  const [recent, setRecent] = useState<Order[]>([]);

  const loadStats = async () => {
    try {
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).toISOString();

      const [{ count: allCount }, { count: newCount }, { data: todayOrders }, { count: totalCount }] =
        await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: false }).eq('status', 'NEW'),
          supabase.from('orders').select('*', { count: 'exact', head: false }).gte('created_at', todayStart),
          supabase
            .from('orders')
            .select('*')
            .gte('created_at', todayStart)
            .order('created_at', { ascending: false }),
          supabase.from('orders').select('*', { count: 'exact', head: false }),
        ]);

      const todayOrdersList = todayOrders || [];
      const todayCompleted = todayOrdersList.filter((o) => o.status === 'COMPLETED').length;
      const todayRevenue = todayOrdersList
        .filter((o) => ['COMPLETED', 'READY', 'PREPARING', 'ACCEPTED'].includes(o.status))
        .reduce((s: number, o: any) => s + Number(o.total), 0);

      // Need separate counts properly
      const { count: new2 } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'NEW');
      const { count: today2 } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart);

      setStats({
        newOrders: Number(new2 ?? allCount ?? 0),
        todayOrders: Number(today2 ?? newCount ?? 0),
        todayCompleted,
        todayRevenue,
        totalOrders: Number(totalCount ?? 0),
      });

      // Recent orders
      const { data: recentData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      setRecent((recentData as Order[]) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const ordersCh = supabase
      .channel('orders-admin-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => loadStats()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ordersCh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    {
      label: 'НАРАЧКИ (НОВИ)',
      value: stats.newOrders,
      icon: ClipboardList,
      accent: 'text-red-accent bg-red-accent/10',
      trend: 'last',
    },
    {
      label: 'ДЕНЕС НАРАЧКИ',
      value: stats.todayOrders,
      icon: ShoppingBag,
      accent: 'text-blue-700 bg-blue-50',
      trend: 'last',
    },
    {
      label: 'ЗАВРШЕНИ ДЕНЕС',
      value: stats.todayCompleted,
      icon: CheckCircle2,
      accent: 'text-green-700 bg-green-50',
      trend: 'last',
    },
    {
      label: 'ПРИЛЕТ ДЕНЕС',
      value: formatCurrency(stats.todayRevenue),
      icon: Coins,
      accent: 'text-amber-700 bg-amber-50',
      trend: 'last',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal">
            Добредојдовте назад
          </h2>
          <p className="text-charcoal-muted text-sm mt-1">
            Преглед на денешните активности во вашиот објект.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-cream px-3 py-1.5 rounded-full border border-border text-charcoal-muted">
            <TrendingUp className="w-3.5 h-3.5 text-green-700" />
            ВКУПНО НАРАЧКИ: <span className="font-semibold text-charcoal">{stats.totalOrders}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-white rounded-xl border border-border p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${c.accent}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
              </div>
              <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-1.5">
                {c.label}
              </div>
              {loading ? (
                <div className="h-9 bg-cream rounded-md animate-pulse" />
              ) : (
                <div className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight">
                  {c.value}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-accent" />
              Последни нарачки
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-red-accent hover:text-red-hover inline-flex items-center gap-1"
            >
              Сите нарачки <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-5 animate-pulse">
                  <div className="h-4 bg-cream rounded w-1/3 mb-3" />
                  <div className="h-3 bg-cream rounded w-1/2" />
                </div>
              ))
            ) : recent.length === 0 ? (
              <div className="p-16 text-center">
                <Package className="w-10 h-10 text-charcoal-muted/50 mx-auto mb-3" />
                <p className="text-sm text-charcoal-muted">
                  Сè уште нема нарачки. Ќе ве известиме кога ќе пристигне првата.
                </p>
              </div>
            ) : (
              recent.map((o) => (
                <Link
                  href={`/admin/orders?order=${o.id}`}
                  key={o.id}
                  className="p-5 hover:bg-cream/50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-cream flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 text-red-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">#{o.order_number}</span>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(
                            o.status
                          )}`}
                        >
                          {getStatusLabel(o.status)}
                        </span>
                      </div>
                      <div className="text-xs text-charcoal-muted mt-0.5 truncate">
                        {o.customer_name} · {formatDateTime(o.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-charcoal">
                      {formatCurrency(o.total)}
                    </div>
                    <div className="text-xs text-charcoal-muted">{o.order_type}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4">Брзи акции</h3>
            <div className="space-y-2">
              <Link
                href="/admin/orders?status=NEW"
                className="flex items-center justify-between p-3.5 rounded-lg hover:bg-cream transition-colors"
              >
                <span className="text-sm font-medium">Нови нарачки</span>
                <span className="bg-red-accent text-white text-xs font-semibold rounded-full px-2.5 py-0.5">
                  {stats.newOrders}
                </span>
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3.5 rounded-lg hover:bg-cream transition-colors"
              >
                <span className="text-sm font-medium">Уреди производи</span>
                <ArrowRight className="w-4 h-4 text-charcoal-muted" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3.5 rounded-lg hover:bg-cream transition-colors"
              >
                <span className="text-sm font-medium">Отвори/затвори нарачки</span>
                <ArrowRight className="w-4 h-4 text-charcoal-muted" />
              </Link>
            </div>
          </div>

          <div className="bg-charcoal text-cream rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3">Совет</h3>
            <p className="text-sm text-cream/80 leading-relaxed mb-4">
              Кога добиете нова нарачка веднаш изменете го статусот во
              „Прифатена“ за да знае клиентот дека е применета.
            </p>
            <Link
              href="/admin/orders?status=NEW"
              className="text-sm font-medium text-red-accent hover:text-red-hover inline-flex items-center gap-1"
            >
              Види нови нарачки →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
