import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const COOKIE_NAME = 'vucko_admin_session';
const TTL_SECONDS = 60 * 60 * 12; // 12 hours

type Session = {
  sub: 'admin';
  iat: number;
  exp: number;
  sid: string;
};

export function adminPasswordSet(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    'local-dev-secret-change-me'
  );
}

function sign(text: string): string {
  return crypto.createHmac('sha256', secret()).update(text).digest('hex');
}

export function encodeSession(session: Session): string {
  const json = Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url');
  return `${json}.${sign(json)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [jsonB64, sig] = token.split('.');
  if (!jsonB64 || !sig) return null;
  if (sign(jsonB64) !== sig) return null;
  try {
    const obj = JSON.parse(
      Buffer.from(jsonB64, 'base64url').toString('utf-8'),
    ) as Session;
    if (!obj || obj.sub !== 'admin') return null;
    if (typeof obj.exp !== 'number' || Date.now() > obj.exp * 1000) return null;
    return obj;
  } catch {
    return null;
  }
}

export function createAdminSession(): string {
  const now = Math.floor(Date.now() / 1000);
  const session: Session = {
    sub: 'admin',
    iat: now,
    exp: now + TTL_SECONDS,
    sid: crypto.randomBytes(16).toString('hex'),
  };
  return encodeSession(session);
}

export function getAdminSession(): Session | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    return decodeSession(token);
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession() !== null;
}

export async function POST(req: Request) {
  try {
    const { password } = (await req.json()) as { password?: string };
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return NextResponse.json(
        {
          error:
            'Админ најава не е конфигурирана. Постави ADMIN_PASSWORD во .env.',
        },
        { status: 400 },
      );
    }
    if (!password || password !== expected) {
      return NextResponse.json(
        { error: 'Погрешна лозинка.' },
        { status: 401 },
      );
    }
    const token = createAdminSession();
    const res = NextResponse.json({ ok: true });
    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TTL_SECONDS,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: 'Серверска грешка при најава.' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  (await cookies()).delete(COOKIE_NAME);
  return res;
}
