import { NextResponse } from 'next/server';
import type { OrderType, PaymentMethod } from '@/lib/types';
import { isValidPhone, formatCurrency } from '@/lib/utils';
import { calculateOrderItems } from '@/lib/products-catalog';
import { generateOrderNumber, isOrderingEnabled } from '@/lib/local-orders';

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

const GENERIC_ERROR = 'Не успеавме да ја испратиме нарачката. Ве молиме обидете се повторно.';

/** Trim + strip accidental quotes from Vercel env paste. */
function cleanEnv(name: string, fallback = ''): string {
  const raw = process.env[name] ?? fallback;
  return String(raw).trim().replace(/^["']|["']$/g, '');
}

function fail(code: string, detail?: string) {
  console.error(`[orders] ${code}${detail ? `: ${detail}` : ''}`);
  return NextResponse.json(
    { error: GENERIC_ERROR, code, detail: detail || undefined },
    { status: 500 },
  );
}

/** Health check — open in browser to see if Vercel has Resend env vars. */
export async function GET() {
  const key = cleanEnv('RESEND_API_KEY');
  const from = cleanEnv('RESEND_FROM_EMAIL');
  const to = cleanEnv('ORDER_RECEIVER_EMAIL', 'ahmedidelil0@gmail.com');
  return NextResponse.json({
    ok: true,
    env: {
      RESEND_API_KEY: Boolean(key),
      RESEND_FROM_EMAIL: Boolean(from),
      ORDER_RECEIVER_EMAIL: Boolean(to),
    },
    from_hint: from.includes('@') ? `***@${from.split('@')[1]}` : null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  });
}

function pad(n: number, width = 2) {
  return String(n).padStart(width, '0');
}

function buildDatePrefix(): string {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Skopje',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const y = parts.find((p) => p.type === 'year')?.value || pad(now.getFullYear(), 4);
    const m = parts.find((p) => p.type === 'month')?.value || pad(now.getMonth() + 1);
    const d = parts.find((p) => p.type === 'day')?.value || pad(now.getDate());
    return `${y}${m}${d}`;
  } catch {
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  }
}

function formatNow(): string {
  try {
    return new Date().toLocaleString('mk-MK', {
      timeZone: 'Europe/Skopje',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return new Date().toLocaleString('mk-MK');
  }
}

function buildOrderNumber(): string {
  const counter = generateOrderNumber();
  const suffix = String(counter).padStart(4, '0').slice(-4);
  return `V-${buildDatePrefix()}-${suffix}`;
}

function buildEmailHtml(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  orderType: OrderType;
  address?: string | null;
  deliveryInstructions?: string | null;
  note?: string | null;
  paymentMethod: PaymentMethod;
  items: { product_name: string; quantity: number; price: number; subtotal: number }[];
  total: number;
  createdAt: string;
}) {
  const {
    orderNumber,
    customerName,
    phone,
    orderType,
    address,
    deliveryInstructions,
    note,
    paymentMethod,
    items,
    total,
    createdAt,
  } = params;
  const phoneHref = phone.replace(/[\s\-()]/g, '');
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.6; color: #2b2b2b; max-width: 620px; margin: 0 auto;">
      <div style="border-bottom: 3px solid #7a1f1f; padding: 18px 0 14px 0;">
        <div style="font-size: 13px; letter-spacing: 0.2em; color: #7a1f1f; text-transform: uppercase; margin-bottom: 6px;">Ќебапчилница Вучко</div>
        <h1 style="margin: 0; font-size: 26px; color: #1f1f1f;">НОВА ОНЛАЈН НАРАЧКА</h1>
      </div>

      <div style="padding: 22px 0 6px 0;">
        <div style="font-size: 15px; color: #555; margin-bottom: 4px;">Нарачка #:</div>
        <div style="font-size: 22px; font-weight: 700; color: #7a1f1f; margin-bottom: 22px;">#${orderNumber}</div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
          <tr>
            <td style="padding: 6px 0; vertical-align: top; width: 35%; font-size: 14px; color: #6b6b6b;">Име и презиме:</td>
            <td style="padding: 6px 0; vertical-align: top; font-size: 15px; font-weight: 600; color: #1f1f1f;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; vertical-align: top; font-size: 14px; color: #6b6b6b;">Телефон:</td>
            <td style="padding: 6px 0; vertical-align: top; font-size: 15px; font-weight: 600; color: #1f1f1f;"><a href="tel:${phoneHref}" style="color: #7a1f1f; text-decoration: none;">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; vertical-align: top; font-size: 14px; color: #6b6b6b;">Начин на нарачка:</td>
            <td style="padding: 6px 0; vertical-align: top; font-size: 15px; font-weight: 600; color: #1f1f1f;">${orderType}</td>
          </tr>
          ${orderType === 'Достава' ? `
          <tr>
            <td style="padding: 6px 0; vertical-align: top; font-size: 14px; color: #6b6b6b;">Адреса:</td>
            <td style="padding: 6px 0; vertical-align: top; font-size: 15px; font-weight: 600; color: #1f1f1f;">${address || '-'}</td>
          </tr>
          ` : ''}
          ${orderType === 'Достава' && deliveryInstructions ? `
          <tr>
            <td style="padding: 6px 0; vertical-align: top; font-size: 14px; color: #6b6b6b;">Инструкции:</td>
            <td style="padding: 6px 0; vertical-align: top; font-size: 15px; color: #1f1f1f;">${deliveryInstructions}</td>
          </tr>
          ` : ''}
          ${note ? `
          <tr>
            <td style="padding: 6px 0; vertical-align: top; font-size: 14px; color: #6b6b6b;">Забелешка:</td>
            <td style="padding: 6px 0; vertical-align: top; font-size: 15px; color: #1f1f1f;">${note}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="border-top: 1px dashed #d4d0c5; border-bottom: 1px dashed #d4d0c5; padding: 18px 0; margin: 10px 0 22px 0;">
        <h2 style="margin: 0 0 14px 0; font-size: 17px; letter-spacing: 0.05em; color: #1f1f1f;">НАРАЧАНИ ПРОИЗВОДИ</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #faf7f0;">
              <th style="padding: 9px 10px; text-align: left; font-size: 13px; color: #555; border-bottom: 1px solid #e5e0d4;">Производ</th>
              <th style="padding: 9px 10px; text-align: right; font-size: 13px; color: #555; border-bottom: 1px solid #e5e0d4;">Кол.</th>
              <th style="padding: 9px 10px; text-align: right; font-size: 13px; color: #555; border-bottom: 1px solid #e5e0d4;">Цена</th>
              <th style="padding: 9px 10px; text-align: right; font-size: 13px; color: #555; border-bottom: 1px solid #e5e0d4;">Вкупно</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (i) => `
              <tr>
                <td style="padding: 9px 10px; border-bottom: 1px solid #f2ede3; font-size: 14px; color: #1f1f1f;">${i.product_name}</td>
                <td style="padding: 9px 10px; text-align: right; border-bottom: 1px solid #f2ede3; font-size: 14px; color: #1f1f1f;">${i.quantity}</td>
                <td style="padding: 9px 10px; text-align: right; border-bottom: 1px solid #f2ede3; font-size: 14px; color: #444;">${formatCurrency(i.price)}</td>
                <td style="padding: 9px 10px; text-align: right; border-bottom: 1px solid #f2ede3; font-size: 14px; font-weight: 600; color: #1f1f1f;">${formatCurrency(i.subtotal)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div style="padding: 6px 0 18px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Време на нарачка:</td>
            <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #1f1f1f;">${createdAt}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6b6b6b;">Плаќање:</td>
            <td style="padding: 6px 0; text-align: right; font-size: 14px; font-weight: 600; color: #1f1f1f;">${paymentMethod}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top: 14px; border-top: 2px solid #e5e0d4;"></td>
          </tr>
          <tr>
            <td style="padding: 4px 0 0 0; font-size: 18px; color: #1f1f1f; font-weight: 700;">ВКУПНО:</td>
            <td style="padding: 4px 0 0 0; text-align: right; font-size: 22px; color: #7a1f1f; font-weight: 700;">${formatCurrency(total)}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid #e5e0d4; color: #9a9589; font-size: 12px;">
        Ќебапчилница Вучко — Ростуше, Северна Македонија
      </div>
    </div>
  `;
}

function buildEmailText(params: {
  orderNumber: string;
  customerName: string;
  phone: string;
  orderType: OrderType;
  address?: string | null;
  deliveryInstructions?: string | null;
  note?: string | null;
  paymentMethod: PaymentMethod;
  items: { product_name: string; quantity: number; price: number; subtotal: number }[];
  total: number;
  createdAt: string;
}) {
  const {
    orderNumber,
    customerName,
    phone,
    orderType,
    address,
    deliveryInstructions,
    note,
    paymentMethod,
    items,
    total,
    createdAt,
  } = params;
  const lines: string[] = [];
  lines.push('НОВА ОНЛАЈН НАРАЧКА');
  lines.push('==================');
  lines.push('');
  lines.push(`Нарачка #: #${orderNumber}`);
  lines.push('');
  lines.push(`Име и презиме: ${customerName}`);
  lines.push(`Телефон: ${phone}`);
  lines.push(`Начин на нарачка: ${orderType}`);
  if (orderType === 'Достава') {
    lines.push(`Адреса: ${address || '-'}`);
    if (deliveryInstructions) lines.push(`Инструкции: ${deliveryInstructions}`);
  }
  if (note) lines.push(`Забелешка: ${note}`);
  lines.push('');
  lines.push('----------------------------');
  lines.push('');
  lines.push('НАРАЧАНИ ПРОИЗВОДИ');
  lines.push('');
  for (const i of items) {
    lines.push(`${i.product_name}`);
    lines.push(`  ${i.quantity} × ${formatCurrency(i.price)} = ${formatCurrency(i.subtotal)}`);
  }
  lines.push('');
  lines.push('----------------------------');
  lines.push('');
  lines.push(`ВКУПНО: ${formatCurrency(total)}`);
  lines.push('');
  lines.push(`Плаќање: ${paymentMethod}`);
  lines.push(`Време на нарачка: ${createdAt}`);
  lines.push('');
  lines.push('--');
  lines.push('Ќебапчилница Вучко — Ростуше, Северна Македонија');
  return lines.join('\n');
}

export async function POST(req: Request) {
  try {
    const json = (await req.json()) as Body;

    if (!json.customer_name || !json.phone || !json.order_type || !json.payment_method) {
      return NextResponse.json(
        { error: 'Сите задолжителни полиња се обврзни.' },
        { status: 400 }
      );
    }
    const customerName = json.customer_name.trim();
    if (customerName.length < 2) {
      return NextResponse.json(
        { error: 'Внесете го целосното име.' },
        { status: 400 }
      );
    }
    const phoneRaw = json.phone.trim();
    if (!isValidPhone(phoneRaw)) {
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

    if (!isOrderingEnabled()) {
      return NextResponse.json(
        { error: 'Онлајн нарачките моментално се затворени.' },
        { status: 400 }
      );
    }

    const normalizedItems = json.items.map((i) => ({
      product_id: String(i.product_id),
      quantity: Number(i.quantity),
    }));

    let calcResult;
    try {
      calcResult = calculateOrderItems(normalizedItems);
    } catch (err: any) {
      return NextResponse.json(
        { error: err?.message || 'Невалидни производи во кошничката.' },
        { status: 400 }
      );
    }

    const { items: orderItems, total } = calcResult;

    const orderNumber = buildOrderNumber();
    const createdAt = formatNow();

    const resendKey = cleanEnv('RESEND_API_KEY');
    const fromEmail = cleanEnv('RESEND_FROM_EMAIL');
    const toEmailsRaw = cleanEnv(
      'ORDER_RECEIVER_EMAIL',
      'ahmedidelil0@gmail.com',
    );
    const toEmails = toEmailsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!resendKey || !fromEmail || toEmails.length === 0) {
      const missing = [
        !resendKey && 'RESEND_API_KEY',
        !fromEmail && 'RESEND_FROM_EMAIL',
        toEmails.length === 0 && 'ORDER_RECEIVER_EMAIL',
      ].filter(Boolean);
      return fail(
        'RESEND_CONFIG',
        `Missing env: ${missing.join(', ')}. Set in Vercel → Settings → Environment Variables, then Redeploy.`,
      );
    }

    const addressField =
      json.order_type === 'Достава' ? (json.address || '').trim() || null : null;
    const deliveryInstructions =
      json.order_type === 'Достава'
        ? (json.delivery_instructions || '').trim() || null
        : null;
    const noteField = (json.note || '').trim() || null;

    const subject = `Нова нарачка — Ќебапчилница Вучко #${orderNumber}`;
    const html = buildEmailHtml({
      orderNumber,
      customerName,
      phone: phoneRaw,
      orderType: json.order_type,
      address: addressField,
      deliveryInstructions,
      note: noteField,
      paymentMethod: json.payment_method,
      items: orderItems,
      total,
      createdAt,
    });
    const text = buildEmailText({
      orderNumber,
      customerName,
      phone: phoneRaw,
      orderType: json.order_type,
      address: addressField,
      deliveryInstructions,
      note: noteField,
      paymentMethod: json.payment_method,
      items: orderItems,
      total,
      createdAt,
    });

    try {
      // Direct REST call — more reliable on Vercel than the SDK wrapper.
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmails,
          subject,
          html,
          text,
        }),
      });
      const resendBody = (await resendRes.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
        name?: string;
        error?: { message?: string };
      };
      if (!resendRes.ok) {
        const msg =
          resendBody?.message ||
          resendBody?.error?.message ||
          resendBody?.name ||
          `HTTP ${resendRes.status}`;
        return fail('RESEND_SEND', String(msg));
      }
    } catch (err: any) {
      return fail('RESEND_SEND', err?.message || String(err));
    }

    return NextResponse.json({
      order_number: orderNumber,
      total,
      order_type: json.order_type,
    });
  } catch (e: any) {
    return fail('UNHANDLED', e?.message || String(e));
  }
}
