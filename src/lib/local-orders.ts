import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type StoredOrderItem = {
  order_id: string;
  product_id: string | number | null;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type OrderStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';

export type StoredOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  order_type: 'Достава' | 'Подигање од локал';
  address: string | null;
  delivery_instructions: string | null;
  note: string | null;
  payment_method: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  items: StoredOrderItem[];
};

const DATA_DIR =
  process.env.VUCKO_DATA_DIR ||
  join(process.cwd(), '.vucko-data');
const ORDERS_FILE = join(DATA_DIR, 'orders.json');
const COUNTER_FILE = join(DATA_DIR, 'counter.json');
const SETTINGS_FILE = join(DATA_DIR, 'settings.json');

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(path: string, fallback: T): T {
  try {
    if (!existsSync(path)) return fallback;
    const raw = readFileSync(path, 'utf-8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(path: string, value: T) {
  ensureDir();
  writeFileSync(path, JSON.stringify(value, null, 2), 'utf-8');
}

export function generateOrderNumber(): number {
  ensureDir();
  const counters = readJson<{ orderNumber: number }>(COUNTER_FILE, {
    orderNumber: 1000,
  });
  counters.orderNumber = Number(counters.orderNumber || 1000) + 1;
  if (counters.orderNumber < 1001) counters.orderNumber = 1001;
  writeJson(COUNTER_FILE, counters);
  return counters.orderNumber;
}

export function saveOrder(order: StoredOrder): StoredOrder {
  ensureDir();
  const all = readJson<StoredOrder[]>(ORDERS_FILE, []);
  const existing = all.findIndex((o) => o.id === order.id);
  if (existing >= 0) {
    all[existing] = { ...order, updated_at: new Date().toISOString() };
  } else {
    all.unshift(order);
  }
  writeJson(ORDERS_FILE, all);
  return order;
}

export function listOrders(): StoredOrder[] {
  const all = readJson<StoredOrder[]>(ORDERS_FILE, []);
  return [...all].sort((a, b) => b.order_number - a.order_number);
}

export function getOrder(id: string): StoredOrder | null {
  const all = readJson<StoredOrder[]>(ORDERS_FILE, []);
  return all.find((o) => o.id === id) || null;
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
): StoredOrder | null {
  const all = readJson<StoredOrder[]>(ORDERS_FILE, []);
  const idx = all.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  all[idx] = {
    ...all[idx],
    status,
    updated_at: new Date().toISOString(),
  };
  writeJson(ORDERS_FILE, all);
  return all[idx];
}

type LocalSettings = {
  online_ordering_open: boolean;
};

const DEFAULT_SETTINGS: LocalSettings = {
  online_ordering_open: true,
};

export function isOrderingEnabled(): boolean {
  const s = readJson<LocalSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
  return s.online_ordering_open !== false;
}

export function getLocalSettings(): LocalSettings {
  return readJson<LocalSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
}

export function setLocalSettings(patch: Partial<LocalSettings>): LocalSettings {
  const current = getLocalSettings();
  const next = { ...current, ...patch };
  writeJson(SETTINGS_FILE, next);
  return next;
}
