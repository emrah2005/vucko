import type { Product, ProductCategory } from '@/lib/types';

/** Local menu photos from /public/images/menu (matched by filename). */
const menuImg = (file: string) => `/images/menu/${file}`;

/**
 * Menu order follows image filenames (food first by natural pairing, then drinks A→Z).
 * Image map:
 *   5kebapi.jpg              → Порција од 5 ќебапи
 *   10kebapi.jpg             → Порција од 10 ќебапи
 *   tavcegrafce-5kebapi.jpeg → Тавче гравче со 5 ќебапи
 *   tavcegrafce.jpg          → Тавче гравче
 *   sendvicpleskavica.jpg    → Сендвич со плескавица
 *   senvicstek.png           → Сендвич со стек
 *   pileshkacorba.jpg        → Пилешка чорба
 *   coca-cola.jpg            → Кока Кола
 *   fanta.jpg                → Фанта
 *   fantatropical.jpg        → Фанта Тропикл
 *   gazoza.jpg               → Газоза
 *   schweppes.jpg            → Швепс
 *   voda.jpg                 → Обична вода
 *   kiselavoda.jpg           → Кисела вода
 */
export const PRODUCTS: Product[] = [
  {
    id: 'kebapi-5',
    name: 'Порција од 5 ќебапи',
    description:
      'Пет сочни барањски ќебапи, подготвени по традиционална рецепта со свеж бел лук и зачини.',
    category: 'Скара',
    price: 150,
    image_url: menuImg('5kebapi.jpg'),
    available: true,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kebapi-10',
    name: 'Порција од 10 ќебапи',
    description:
      'Десет сочни барањски ќебапи — голема порција за двајца, подготвени на скара.',
    category: 'Скара',
    price: 250,
    image_url: menuImg('10kebapi.jpg'),
    available: true,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tavce-gravce-kebapi',
    name: 'Тавче гравче со 5 ќебапи',
    description:
      'Автентичен македонски тавче гравче во глинена тава, сервиран со 5 сочни ќебапи на скара.',
    category: 'Скара',
    price: 260,
    image_url: menuImg('tavcegrafce-5kebapi.jpeg'),
    available: true,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tavce-gravche',
    name: 'Тавче гравче',
    description:
      'Автентичен македонски тавче гравче — боби во глинена тава, подготвен по домашна рецепта.',
    category: 'Скара',
    price: 150,
    image_url: menuImg('tavcegrafce.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sendvich-pleskavica',
    name: 'Сендвич со плескавица',
    description:
      'Свежа домашна торта со голема сочна плескавица од смешано месо, салата и соус.',
    category: 'Скара',
    price: 150,
    image_url: menuImg('sendvicpleskavica.jpg'),
    available: true,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sendvich-stek',
    name: 'Сендвич со стек',
    description:
      'Соковит свински стек подготвен на скара, сервиран во свеж сендвич со зеленчук и сос.',
    category: 'Скара',
    price: 170,
    image_url: menuImg('senvicstek.png'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pileshka-chorba',
    name: 'Пилешка чорба',
    description:
      'Домаќинска питка пилешка чорба со сочни парчиња пиле, моркови, селери и зачин од зеленчук.',
    category: 'Чорби',
    price: 150,
    image_url: menuImg('pileshkacorba.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'coca-cola',
    name: 'Кока Кола',
    description: 'Студена Кока Кола, 0.5 литар.',
    category: 'Пијалоци',
    price: 80,
    image_url: menuImg('coca-cola.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fanta',
    name: 'Фанта',
    description: 'Студена Фанта портокал, 0.5 литар.',
    category: 'Пијалоци',
    price: 80,
    image_url: menuImg('fanta.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fanta-tropik',
    name: 'Фанта Тропикл',
    description: 'Студена Фанта Тропикл со вкус на тропски овошје, 0.5 литар.',
    category: 'Пијалоци',
    price: 80,
    image_url: menuImg('fantatropical.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'gazoz',
    name: 'Газоза',
    description: 'Традиционална македонска Газоза — освежувачки газиран пијалок, 0.5 литар.',
    category: 'Пијалоци',
    price: 80,
    image_url: menuImg('gazoza.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kisela-voda',
    name: 'Кисела вода',
    description: 'Студена газирана минерална кисела вода, 0.5 литар.',
    category: 'Пијалоци',
    price: 60,
    image_url: menuImg('kiselavoda.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'schwepps',
    name: 'Швепс',
    description: 'Швепс, освежувачки пијалок, 0.5 литар.',
    category: 'Пијалоци',
    price: 80,
    image_url: menuImg('schweppes.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'obicna-voda',
    name: 'Обична вода',
    description: 'Студена обична негазирана вода, 0.5 литар.',
    category: 'Пијалоци',
    price: 50,
    image_url: menuImg('voda.jpg'),
    available: true,
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Скара', 'Чорби', 'Пијалоци'];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export type OrderItemCalc = { product_id: string; quantity: number };

export function calculateOrderItems(items: OrderItemCalc[]) {
  const result: {
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
    product_id: string;
  }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = getProductById(item.product_id);
    if (!product) {
      throw new Error(`Производот не е пронајден.`);
    }
    if (!product.available) {
      throw new Error(`Производот „${product.name}“ моментално не е достапен.`);
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty <= 0 || qty > 99) {
      throw new Error(`Невалидна количина за производот „${product.name}“.`);
    }
    const lineSubtotal = Number(product.price) * qty;
    subtotal += lineSubtotal;
    result.push({
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      price: Number(product.price),
      subtotal: lineSubtotal,
    });
  }

  return { items: result, subtotal, total: subtotal };
}
