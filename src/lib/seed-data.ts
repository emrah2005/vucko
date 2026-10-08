import type { Settings, OpeningHours } from './types';
import { PRODUCTS as FALLBACK_PRODUCTS } from './products-catalog';

export const FALLBACK_SETTINGS: Settings = {
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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DAY_NAMES = [
  'Понеделник',
  'Вторник',
  'Среда',
  'Четврток',
  'Петок',
  'Сабота',
  'Недела',
];

export const FALLBACK_OPENING_HOURS: OpeningHours[] = DAY_NAMES.map(
  (name, idx) => ({
    id: `oh-${idx + 1}`,
    day_of_week: (idx + 1) as OpeningHours['day_of_week'],
    day_name: name,
    open_time: idx === 6 ? null : '08:00',
    close_time: idx === 6 ? null : '15:00',
    closed: idx === 6,
    updated_at: new Date().toISOString(),
  }),
);

export { FALLBACK_PRODUCTS };
