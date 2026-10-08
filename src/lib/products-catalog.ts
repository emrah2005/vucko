import type { Product, ProductCategory } from '@/lib/types';

function img(prompt: string) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=square_hd`;
}

export const PRODUCTS: Product[] = [
  {
    id: 'kebapi-5',
    name: 'Порција од 5 ќебапи',
    description:
      'Пет сочни барањски ќебапи, подготвени по традиционална рецепта со свеж бел лук и зачини.',
    category: 'Скара',
    price: 150,
    image_url: img(
      'grilled balkan cevapi kebabs portion of 5 on white plate with onion and kajmak, dark moody macedonian restaurant food photography, realistic'
    ),
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
    image_url: img(
      'large portion of ten grilled balkan cevapi kebabs on a traditional clay plate with flatbread, kaymak, raw onion and red pepper, dark professional balkan restaurant food photo, realistic'
    ),
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
    image_url: img(
      'macedonian tavche gravche baked beans in clay pot served with 5 grilled cevapi kebabs on side, traditional macedonian restaurant food photography, dark moody, realistic'
    ),
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
    image_url: img(
      'traditional macedonian tavche gravche baked white beans in rustic clay terracotta dish, garnished with parsley and paprika, dark food photography, realistic'
    ),
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
    image_url: img(
      'grilled balkan pljeskavica burger sandwich in a fresh soft bun with lettuce tomato onion and kajmak, macedonian street food photography, realistic'
    ),
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
    image_url: img(
      'grilled pork steak sandwich in artisan bread roll with lettuce and sauce, balkan grill, dark restaurant food photography, realistic premium'
    ),
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
    image_url: img(
      'traditional macedonian chicken soup chorba in white ceramic bowl with noodles carrot and parsley, homemade broth, dark moody food photography, realistic'
    ),
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
    image_url: img(
      'cold coca cola glass bottle with condensation drops on dark stone table, ice cubes, beverage photography, realistic'
    ),
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
    image_url: img(
      'cold fanta orange soda glass bottle with condensation on dark rustic stone surface, ice cubes, realistic beverage photography'
    ),
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
    image_url: img(
      'cold schweppes tonic bottle with condensation on dark stone table, lemon slice, realistic beverage photography'
    ),
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
    image_url: img(
      'cold fanta tropical exotic soda bottle with condensation surrounded by mango pineapple orange, dark surface, realistic beverage photography'
    ),
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
    image_url: img(
      'traditional glass bottle of macedonian turkish gazoz soda lemonade with condensation on dark table, lemon and mint leaves, realistic beverage photography'
    ),
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
    image_url: img(
      'clear still mineral water plastic bottle with condensation drops on dark stone table, realistic pure beverage photography'
    ),
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
    image_url: img(
      'cold sparkling mineral water glass bottle with bubbles condensation on dark surface, realistic beverage photography'
    ),
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
