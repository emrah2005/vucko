-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL CHECK (category IN ('Скара', 'Чорби', 'Пијалоци')),
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number INTEGER NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('Достава', 'Подигање од локал')),
  address TEXT,
  delivery_instructions TEXT,
  note TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Готово при достава', 'Готово при подигање')),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','ACCEPTED','PREPARING','READY','COMPLETED','CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: restaurant_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  restaurant_name TEXT NOT NULL DEFAULT 'Ќебапчилница Вучко',
  phone TEXT DEFAULT '078-495-591',
  email TEXT DEFAULT 'ahmedidelil0@gmail.com',
  address TEXT DEFAULT 'Ростуше, Северна Македонија',
  instagram_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  delivery_available BOOLEAN NOT NULL DEFAULT true,
  delivery_area TEXT DEFAULT 'Ростуше и околина',
  online_ordering_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO restaurant_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- Create VIEW for backward compatibility with "settings" table name references in code
CREATE OR REPLACE VIEW settings AS SELECT * FROM restaurant_settings;

-- ============================================================
-- TABLE: opening_hours
-- ============================================================
CREATE TABLE IF NOT EXISTS opening_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 1 AND 7),
  day_name TEXT NOT NULL,
  open_time TEXT,
  close_time TEXT,
  closed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO opening_hours (day_of_week, day_name, open_time, close_time, closed) VALUES
(1, 'Понеделник', '08:00', '22:00', false),
(2, 'Вторник', '08:00', '22:00', false),
(3, 'Среда', '08:00', '22:00', false),
(4, 'Четврток', '08:00', '22:00', false),
(5, 'Петок', '08:00', '22:00', false),
(6, 'Сабота', '08:00', '22:00', false),
(7, 'Недела', NULL, NULL, true)
ON CONFLICT (day_of_week) DO NOTHING;

-- ============================================================
-- SEQUENCE for order numbers starting at 1000
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000 INCREMENT BY 1;

-- ============================================================
-- TRIGGER: auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_products ON products;
CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_orders ON orders;
CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_restaurant_settings ON restaurant_settings;
CREATE TRIGGER set_timestamp_restaurant_settings BEFORE UPDATE ON restaurant_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_opening_hours ON opening_hours;
CREATE TRIGGER set_timestamp_opening_hours BEFORE UPDATE ON opening_hours FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category_available ON products(category, available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
