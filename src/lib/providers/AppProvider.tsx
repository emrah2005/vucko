'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Settings, OpeningHours } from '@/lib/types';
import { FALLBACK_SETTINGS, FALLBACK_OPENING_HOURS } from '@/lib/seed-data';

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

  const refresh = useCallback(async () => {
    try {
      setSettings(FALLBACK_SETTINGS);
      setOpeningHours(FALLBACK_OPENING_HOURS);
    } finally {
      setLoading(false);
    }
  }, []);

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
