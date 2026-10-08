export type ProductCategory = 'Скара' | 'Чорби' | 'Пијалоци';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'Достава' | 'Подигање од локал';
export type PaymentMethod = 'Готово при достава' | 'Готово при подигање';

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  order_type: OrderType;
  address: string | null;
  delivery_instructions: string | null;
  note: string | null;
  payment_method: PaymentMethod;
  subtotal: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
};

export type CartItem = {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
};

export type Settings = {
  id: string;
  restaurant_name: string;
  phone: string;
  email: string;
  address: string;
  instagram_url: string;
  facebook_url: string;
  delivery_available: boolean;
  delivery_area: string;
  online_ordering_open: boolean;
  created_at: string;
  updated_at: string;
};

export type OpeningHours = {
  id: string;
  day_of_week: number;
  day_name: string;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
  updated_at: string;
};

export type AdminStats = {
  newOrders: number;
  todayOrders: number;
  todayCompleted: number;
  todayRevenue: number;
  totalOrders: number;
};
