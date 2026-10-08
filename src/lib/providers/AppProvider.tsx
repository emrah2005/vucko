'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Settings, OpeningHours } from '@/lib/types';

type AppContextType = {
  settings: Settings | null;
  openingHours: OpeningHours[];
  isOrderingOpen: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    try {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'main')
        .single();
      setSettings(settingsData);

      const { data: hoursData } = await supabase
        .from('opening_hours')
        .select('*')
        .order('day_of_week', { ascending: true });
      setOpeningHours(hoursData || []);
    } catch {
      // fallback defaults
      setSettings({
        id: 'main',
        restaurant_name: 'Ќебапчилница Вучко',
        phone: '078-495-591',
        email: 'ahmedidelil0@gmail.com',
        address: 'Ростуше, Северна Македонија',
        instagram_url: '',
        facebook_url: '',
        delivery_available: true,
        delivery_area: 'Ростуше и околина',
        online_ordering_open: true,
        created_at: '',
        updated_at: '',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isOrderingOpen = settings?.online_ordering_open ?? true;

  return (
    <AppContext.Provider value={{ settings, openingHours, isOrderingOpen, loading, refresh }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
