'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Settings,
  LogOut,
  Bell,
  Menu as MenuIcon,
  X,
  PackageOpen,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/types';
import { formatDateTime, formatCurrency, getStatusLabel } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
};

const NAV = [
  { href: '/admin', label: 'Табла', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Нарачки', icon: ClipboardList, badge: 'new' },
  { href: '/admin/products', label: 'Производи', icon: Package },
  { href: '/admin/settings', label: 'Поставки', icon: Settings },
];

export default function AdminLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState<Order | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);

      // Realtime for new orders
      try {
        const ordersCh = supabase
          .channel('orders-admin-dashboard')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'orders',
              filter: 'status=eq.NEW',
            },
            (payload) => {
              const order = payload.new as Order;
              setNewOrders((prev) => [order, ...prev].slice(0, 5));
              setToast(order);
              setTimeout(() => setToast(null), 5000);
              try {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(`Нова нарачка #${order.order_number}`, {
                    body: `${formatCurrency(order.total)} · ${order.order_type}`,
                  });
                }
                if (typeof Audio !== 'undefined') {
                  try {
                    const ctx = new (window.AudioContext ||
                      (window as any).webkitAudioContext)();
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.frequency.value = 880;
                    g.gain.setValueAtTime(0.05, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(
                      0.001,
                      ctx.currentTime + 0.5
                    );
                    o.start();
                    o.stop(ctx.currentTime + 0.5);
                  } catch {
                    /* noop */
                  }
                }
              } catch {
                /* noop */
              }
            }
          )
          .subscribe();

        // Initial new orders
        const { data: initial } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'NEW')
          .order('created_at', { ascending: false })
          .limit(5);
        setNewOrders(initial || []);

        return () => {
          supabase.removeChannel(ordersCh);
        };
      } catch {
        /* noop */
      }
    })();
  }, [router, supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-border border-t-red-accent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const newCount = newOrders.length;

  return (
    <div className="min-h-screen bg-cream-dark text-charcoal flex">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] max-w-sm bg-charcoal text-cream p-5 rounded-xl shadow-2xl border border-border animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-accent/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4.5 h-4.5 text-red-accent" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-cream/60 mb-1">
                Нова нарачка
              </div>
              <div className="font-semibold">#{toast.order_number}</div>
              <div className="text-xs text-cream/70 mt-1">
                {toast.customer_name} · {formatCurrency(toast.total)}
              </div>
              <div className="text-xs text-cream/60 mt-1">
                {formatDateTime(toast.created_at)}
              </div>
              <Link
                href="/admin/orders"
                onClick={() => setToast(null)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-accent hover:text-red-hover"
              >
                Преглед →
              </Link>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-cream/60 hover:text-cream"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-border transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 h-20 flex items-center justify-between border-b border-border">
            <Link
              href="/admin"
              className="text-xl font-bold tracking-tight text-charcoal hover:text-red-accent transition-colors"
            >
              ВУЧКО · АДМИН
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-charcoal-muted hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-red-accent/10 text-red-accent'
                      : 'text-charcoal-light hover:bg-cream hover:text-charcoal'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge === 'new' && newCount > 0 && (
                    <span className="bg-red-accent text-white text-[10px] font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {newCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-1">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-charcoal-light hover:bg-cream hover:text-charcoal transition-colors"
            >
              <PackageOpen className="w-4.5 h-4.5" />
              Види ја страницата
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-accent hover:bg-red-accent/10 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
              Одјави се
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 lg:h-20 bg-white border-b border-border px-5 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-charcoal-muted hover:bg-cream hover:text-charcoal transition-colors"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">
              {NAV.find(
                (n) =>
                  (n.exact && pathname === n.href) ||
                  (!n.exact && pathname.startsWith(n.href))
              )?.label || 'Админ'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="relative p-2 rounded-md text-charcoal-muted hover:bg-cream hover:text-charcoal transition-colors"
            >
              <Bell className="w-5 h-5" />
              {newCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-accent text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {newCount}
                </span>
              )}
            </Link>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-red-accent/10 text-red-accent text-xs font-semibold flex items-center justify-center">
                {(user.email || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-charcoal-light truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
