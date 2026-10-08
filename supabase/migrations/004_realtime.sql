-- ============================================================
-- REALTIME CONFIGURATION
-- ============================================================

-- Enable realtime on the public schema for the orders, order_items, products, restaurant_settings tables
BEGIN;

-- Remove tables from realtime publication if they already exist
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.orders;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.order_items;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.products;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.restaurant_settings;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.opening_hours;

-- Add tables to realtime publication with full row data
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders WITH (publish = 'insert,update,delete');
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items WITH (publish = 'insert,update,delete');
ALTER PUBLICATION supabase_realtime ADD TABLE public.products WITH (publish = 'insert,update,delete');
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_settings WITH (publish = 'update');
ALTER PUBLICATION supabase_realtime ADD TABLE public.opening_hours WITH (publish = 'update');

COMMIT;

-- ============================================================
-- Create helper function for next order number (used by RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION next_order_number()
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT nextval('order_number_seq') INTO next_num;
  RETURN next_num;
EXCEPTION WHEN OTHERS THEN
  SELECT COALESCE(MAX(order_number), 999) + 1 INTO next_num FROM orders;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public so anon users can get next order number via RPC
GRANT EXECUTE ON FUNCTION next_order_number() TO anon, authenticated;
