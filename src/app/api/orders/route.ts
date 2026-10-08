import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { OrderType, PaymentMethod, Product } from '@/lib/types';
import { isValidPhone } from '@/lib/utils';

type Item = { product_id: string; quantity: number };

type Body = {
  customer_name?: string;
  phone?: string;
  order_type?: OrderType;
  address?: string;
  delivery_instructions?: string;
  note?: string;
  payment_method?: PaymentMethod;
  items?: Item[];
};

const ORDER_TYPES: OrderType[] = ['Достава', 'Подигање од локал'];
const PAYMENT_METHODS: PaymentMethod[] = [
  'Готово при достава',
  'Готово при подигање',
];

export async function POST(req: Request) {
  try {
    const json = (await req.json()) as Body;
    const supabase = createClient();

    // 1. Validate input
    if (!json.customer_name || !json.phone || !json.order_type || !json.payment_method) {
      return NextResponse.json(
        { error: 'Сите задолжителни полиња се обврзни.' },
        { status: 400 }
      );
    }
    if (json.customer_name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Внесете го целосното име.' },
        { status: 400 }
      );
    }
    if (!isValidPhone(json.phone.trim())) {
      return NextResponse.json(
        { error: 'Внесете валиден телефонски број.' },
        { status: 400 }
      );
    }
    if (!ORDER_TYPES.includes(json.order_type)) {
      return NextResponse.json({ error: 'Невалиден тип на нарачка.' }, { status: 400 });
    }
    if (!PAYMENT_METHODS.includes(json.payment_method)) {
      return NextResponse.json(
        { error: 'Невалиден начин на плаќање.' },
        { status: 400 }
      );
    }
    if (json.order_type === 'Достава' && !json.address?.trim()) {
      return NextResponse.json(
        { error: 'Внесете адреса за достава.' },
        { status: 400 }
      );
    }
    if (!Array.isArray(json.items) || json.items.length === 0) {
      return NextResponse.json(
        { error: 'Кошничката е празна.' },
        { status: 400 }
      );
    }
    if (json.items.length > 100) {
      return NextResponse.json(
        { error: 'Премногу производи во кошничка.' },
        { status: 400 }
      );
    }

    // 1b. Check ordering is open
    const { data: settings } = await supabase
      .from('settings')
      .select('online_ordering_open')
      .eq('id', 'main')
      .single();
    if (settings && !settings.online_ordering_open) {
      return NextResponse.json(
        { error: 'Онлајн нарачките моментално се затворени.' },
        { status: 400 }
      );
    }

    // 2. Fetch current products/prices
    const productIds = json.items.map((i) => i.product_id).filter(Boolean);
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, name, price, available')
      .in('id', productIds);

    if (pErr) {
      console.error('Products fetch error', pErr);
      return NextResponse.json(
        { error: 'Грешка при валидација на производи.' },
        { status: 500 }
      );
    }

    const productMap = new Map<string, Product>();
    (products || []).forEach((p: any) => productMap.set(p.id, p));

    // 3. Verify availability and calculate totals from DB
    const orderItems: {
      product_id: string | null;
      product_name: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[] = [];
    let subtotal = 0;

    for (const item of json.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: 'Производот не е пронајден.' },
          { status: 400 }
        );
      }
      if (!product.available) {
        return NextResponse.json(
          {
            error: `Производот „${product.name}“ моментално не е достапен.`,
          },
          { status: 400 }
        );
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0 || qty > 99) {
        return NextResponse.json(
          {
            error: `Невалидна количина за производот „${product.name}“.`,
          },
          { status: 400 }
        );
      }
      const price = Number(product.price);
      const lineSubtotal = price * qty;
      subtotal += lineSubtotal;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        price,
        subtotal: lineSubtotal,
      });
    }

    const total = subtotal;

    // 4. Get next order number - try sequence, fallback to max+1, fallback to random
    let orderNumber = 0;
    try {
      const { data: seqData, error: seqErr }: any = await supabase.rpc('nextval', {
        regclass: 'order_number_seq',
      });
      if (!seqErr && seqData) {
        orderNumber = Number(seqData);
      }
    } catch {
      /* ignore - try alternative */
    }

    if (!orderNumber || orderNumber < 1000) {
      try {
        const { data: maxData } = await supabase
          .from('orders')
          .select('order_number')
          .order('order_number', { ascending: false })
          .limit(1);
        const maxNum = (maxData && maxData[0]?.order_number) || 1000;
        orderNumber = Math.max(maxNum + 1, 1001);
      } catch {
        orderNumber = 1000 + Math.floor(Math.random() * 9000) + Math.floor(Date.now() / 1000) % 1000;
      }
    }

    if (!Number.isFinite(orderNumber) || orderNumber < 1000) {
      orderNumber = 1000 + Math.floor(Math.random() * 9000);
    }

    // 5. Insert order + items in transaction-like manner. Supabase JS can't do TX; we use RPC or insert sequentially
    const orderPayload = {
      order_number: orderNumber,
      customer_name: json.customer_name.trim(),
      phone: json.phone.trim(),
      order_type: json.order_type,
      address:
        json.order_type === 'Достава' ? (json.address || '').trim() || null : null,
      delivery_instructions:
        json.order_type === 'Достава'
          ? (json.delivery_instructions || '').trim() || null
          : null,
      note: (json.note || '').trim() || null,
      payment_method: json.payment_method,
      subtotal,
      total,
      status: 'NEW' as const,
    };

    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select('id, order_number, total, order_type')
      .single();

    if (orderErr || !orderData) {
      console.error('Order insert error', orderErr);
      return NextResponse.json(
        { error: 'Неуспешно креирање на нарачка. Обидете се повторно.' },
        { status: 500 }
      );
    }

    const itemsPayload = orderItems.map((i) => ({
      ...i,
      order_id: orderData.id,
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(itemsPayload);

    if (itemsErr) {
      console.error('Order items insert error', itemsErr);
      return NextResponse.json(
        { error: 'Неуспешно зачувување на производите.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_number: orderData.order_number,
      total: orderData.total,
      order_type: orderData.order_type,
    });
  } catch (e) {
    console.error('Order create error', e);
    return NextResponse.json(
      { error: 'Настана серверска грешка. Обидете се повторно.' },
      { status: 500 }
    );
  }
}
