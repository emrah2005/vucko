'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError || !data.user) {
        setError('Невалиден имејл или лозинка.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Настана грешка при најава. Обидете се повторно.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-10">
          <span className="text-3xl font-bold tracking-tight text-charcoal">
            ВУЧКО
          </span>
        </Link>

        <div className="bg-white rounded-2xl border border-border p-8 md:p-10">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-red-accent/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-accent" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">
              Админ најава
            </h1>
            <p className="text-sm text-charcoal-muted">
              Најавете се за пристап до админ панелот.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start gap-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Имејл адреса
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-border bg-white text-charcoal placeholder-charcoal-muted/60 focus:border-red-accent transition-colors"
                placeholder="admin@vucko.mk"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Лозинка
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-border bg-white text-charcoal placeholder-charcoal-muted/60 focus:border-red-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-red-accent hover:bg-red-hover disabled:opacity-60 text-white font-medium py-3 rounded-md transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Се најава...
                </>
              ) : (
                'Најави се'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-xs text-charcoal-muted text-center leading-relaxed">
            <p>
              Направи го првиот админ корисник преку Supabase Auth или
              конзолата.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
