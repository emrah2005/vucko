-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: products
-- ============================================================
CREATE POLICY "Products are readable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- RLS Policies: orders
-- ============================================================
CREATE POLICY "Orders are visible to authenticated users (admins)"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create an order"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- RLS Policies: order_items
-- ============================================================
CREATE POLICY "Order items are visible to authenticated users (admins)"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create order items along with order"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- RLS Policies: restaurant_settings
-- ============================================================
CREATE POLICY "Restaurant settings readable by everyone"
  ON restaurant_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update restaurant settings"
  ON restaurant_settings FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- RLS Policies: opening_hours
-- ============================================================
CREATE POLICY "Opening hours readable by everyone"
  ON opening_hours FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update opening hours"
  ON opening_hours FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert opening hours"
  ON opening_hours FOR INSERT
  TO authenticated
  WITH CHECK (true);
