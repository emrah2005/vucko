import { NextResponse } from 'next/server';
import {
  getLocalSettings,
  setLocalSettings,
} from '@/lib/local-orders';
import { getAdminSession } from '@/app/api/admin/session/route';

export async function GET() {
  return NextResponse.json({ settings: getLocalSettings() });
}

export async function PATCH(req: Request) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Невалидна сесија.' }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { online_ordering_open?: boolean };
    const patch: { online_ordering_open?: boolean } = {};
    if (typeof body.online_ordering_open === 'boolean') {
      patch.online_ordering_open = body.online_ordering_open;
    }
    const next = setLocalSettings(patch);
    return NextResponse.json({ settings: next });
  } catch {
    return NextResponse.json(
      { error: 'Серверска грешка при зачувување.' },
      { status: 500 },
    );
  }
}
