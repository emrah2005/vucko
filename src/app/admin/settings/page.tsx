'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Loader2,
  Check,
  AlertCircle,
  Store,
  Settings as SettingsIcon,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
  Mail,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Settings, OpeningHours } from '@/lib/types';

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState<Settings | null>(null);
  const [hours, setHours] = useState<OpeningHours[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: s } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'main')
        .single();
      setSettings(s);
      const { data: h } = await supabase
        .from('opening_hours')
        .select('*')
        .order('day_of_week', { ascending: true });
      setHours(h || []);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    try {
      const { error: e } = await supabase
        .from('settings')
        .update({
          restaurant_name: settings.restaurant_name,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          instagram_url: settings.instagram_url,
          facebook_url: settings.facebook_url,
          delivery_available: settings.delivery_available,
          delivery_area: settings.delivery_area,
          online_ordering_open: settings.online_ordering_open,
        })
        .eq('id', 'main');
      if (e) throw e;
    } catch (e: any) {
      setError(e?.message || 'Грешка при зачувување.');
      setSaving(false);
      return;
    }

    try {
      // Save hours
      for (const h of hours) {
        const { error: e } = await supabase
          .from('opening_hours')
          .update({
            open_time: h.closed ? null : h.open_time || null,
            close_time: h.closed ? null : h.close_time || null,
            closed: h.closed,
          })
          .eq('id', h.id);
        if (e) throw e;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e?.message || 'Грешка при зачувување.');
    } finally {
      setSaving(false);
    }
  };

  const toggleOrdering = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      online_ordering_open: !settings.online_ordering_open,
    });
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-red-accent" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal">Поставки</h2>
          <p className="text-charcoal-muted text-sm mt-1">
            Управувај со информации, работно време и достапност за онлајн нарачки.
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-red-accent hover:bg-red-hover disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Се зачувува...' : 'Зачувај промени'}
        </button>
      </div>

      {(saved || error) && (
        <div
          className={`rounded-lg p-4 flex items-start gap-3 text-sm ${
            saved
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {saved ? (
            <Check className="w-4 h-4 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5" />
          )}
          {saved ? 'Промените се успешно зачувани!' : error}
        </div>
      )}

      {/* Online ordering toggle */}
      <div
        className={`rounded-xl border p-6 md:p-8 ${
          settings.online_ordering_open
            ? 'bg-white border-green-300'
            : 'bg-red-50/40 border-red-accent/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                settings.online_ordering_open
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-accent/15 text-red-accent'
              }`}
            >
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-charcoal-muted mb-1">
                Онлајн нарачки
              </div>
              <div className="text-xl font-bold text-charcoal flex items-center gap-3">
                {settings.online_ordering_open ? (
                  <>
                    ОТВОРЕНО
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                      <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                      активни
                    </span>
                  </>
                ) : (
                  <>
                    ЗАТВОРЕНО
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-accent/15 text-red-accent border border-red-accent/30">
                      <span className="w-2 h-2 rounded-full bg-red-accent" />
                      паузирани
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-charcoal-muted mt-2 max-w-lg">
                {settings.online_ordering_open
                  ? 'Клиентите можат да поднесуваат нарачки преку сајтот.'
                  : 'Јавниот сајт ќе прикажува дека нарачките се затворени и ќе ги спречува потпишувањата.'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleOrdering}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-colors border ${
              settings.online_ordering_open
                ? 'bg-white hover:bg-red-50 text-red-accent border-red-accent/30'
                : 'bg-red-accent hover:bg-red-hover text-white border-transparent'
            }`}
          >
            {settings.online_ordering_open ? 'Затвори ги нарачките' : 'Отвори ги нарачките'}
          </button>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white rounded-xl border border-border p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center">
            <SettingsIcon className="w-4.5 h-4.5 text-red-accent" />
          </div>
          <h3 className="text-lg font-bold">Информации за објектот</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Store className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Име на ресторанот
            </label>
            <input
              value={settings.restaurant_name}
              onChange={(e) =>
                setSettings({ ...settings, restaurant_name: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Phone className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Телефон за контакт
            </label>
            <input
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
              placeholder="07X-XXX-XXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Имејл за контакт
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
              placeholder="you@example.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              <MapPin className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Адреса / локација
            </label>
            <input
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
              placeholder="Ростуше, Северна Македонија"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Instagram className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Instagram URL
            </label>
            <input
              value={settings.instagram_url}
              onChange={(e) =>
                setSettings({ ...settings, instagram_url: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              <Facebook className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              Facebook URL
            </label>
            <input
              value={settings.facebook_url}
              onChange={(e) =>
                setSettings({ ...settings, facebook_url: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
              placeholder="https://facebook.com/..."
            />
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-white rounded-xl border border-border p-6 md:p-8 space-y-5">
        <h3 className="text-lg font-bold">Доставување</h3>
        <label className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-red-accent/40 cursor-pointer">
          <div>
            <div className="font-medium">Достава е дозволета</div>
            <div className="text-xs text-charcoal-muted mt-0.5">
              Овозможи ја опцијата за достава при нарачка.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.delivery_available}
            onChange={(e) =>
              setSettings({ ...settings, delivery_available: e.target.checked })
            }
            className="w-4 h-4 text-red-accent"
          />
        </label>
        {settings.delivery_available && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Подрачје на достава / забелешка
            </label>
            <input
              value={settings.delivery_area}
              onChange={(e) =>
                setSettings({ ...settings, delivery_area: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
              placeholder="Ростуше и околина"
            />
          </div>
        )}
      </div>

      {/* Opening Hours */}
      <div className="bg-white rounded-xl border border-border p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center">
            <Clock className="w-4.5 h-4.5 text-red-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Работно време</h3>
            <p className="text-sm text-charcoal-muted">
              За секој ден од неделата постави време или означи „Затворено“.
            </p>
          </div>
        </div>

        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
          {hours.map((h, idx) => (
            <div
              key={h.id}
              className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-cream/30'
              }`}
            >
              <div className="w-full sm:w-36 font-medium text-charcoal">
                {h.day_name}
              </div>
              <div className="flex-1 flex items-center gap-3 flex-wrap">
                {h.closed ? (
                  <span className="text-red-accent font-medium text-sm">
                    Затворено
                  </span>
                ) : (
                  <>
                    <input
                      type="time"
                      value={h.open_time || ''}
                      onChange={(e) => {
                        const next = [...hours];
                        next[idx] = { ...h, open_time: e.target.value };
                        setHours(next);
                      }}
                      className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
                    />
                    <span className="text-charcoal-muted">–</span>
                    <input
                      type="time"
                      value={h.close_time || ''}
                      onChange={(e) => {
                        const next = [...hours];
                        next[idx] = { ...h, close_time: e.target.value };
                        setHours(next);
                      }}
                      className="px-3 py-2 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
                    />
                  </>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-charcoal-muted sm:ml-4">
                <input
                  type="checkbox"
                  checked={h.closed}
                  onChange={(e) => {
                    const next = [...hours];
                    next[idx] = { ...h, closed: e.target.checked };
                    setHours(next);
                  }}
                  className="w-3.5 h-3.5 text-red-accent"
                />
                Затворено
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
