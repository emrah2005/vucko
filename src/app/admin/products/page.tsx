'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Package,
  Search,
  Check,
  Ban,
  Upload,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Product, ProductCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const CATEGORIES: ProductCategory[] = ['Скара', 'Чорби', 'Пијалоци'];

type FormState = {
  id: string | null;
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  image_url: string;
  available: boolean;
  featured: boolean;
};

const emptyForm: FormState = {
  id: null,
  name: '',
  description: '',
  price: '',
  category: 'Скара',
  image_url: '',
  available: true,
  featured: false,
};

export default function AdminProductsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<ProductCategory | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('created_at', { ascending: false });
      setProducts((data as Product[]) || []);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = products.filter((p) => {
    const matchCat = catFilter === 'ALL' || p.category === catFilter;
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openNew = () => {
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      category: p.category,
      image_url: p.image_url || '',
      available: p.available,
      featured: p.featured,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Внесете име на производ.';
    if (!form.price || Number(form.price) < 0) next.price = 'Внесете валидна цена.';
    if (!CATEGORIES.includes(form.category)) next.category = 'Изберете категорија.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        category: form.category,
        image_url: form.image_url.trim() || null,
        available: form.available,
        featured: form.featured,
      };

      if (form.id) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Грешка при зачувување.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (p: Product) => {
    if (!confirm(`Дали сте сигурни дека сакате да го избришете „${p.name}“?`)) return;
    try {
      await supabase.from('products').delete().eq('id', p.id);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Грешка при бришење.');
    }
  };

  const toggleAvailable = async (p: Product) => {
    try {
      await supabase
        .from('products')
        .update({ available: !p.available })
        .eq('id', p.id);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Грешка при промена.');
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      // Use Supabase storage if bucket exists, otherwise data URL fallback
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasProductsBucket = buckets?.some((b) => b.name === 'products');
      if (hasProductsBucket) {
        const ext = file.name.split('.').pop();
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { data, error } = await supabase.storage
          .from('products')
          .upload(name, file, { upsert: true });
        if (error) throw error;
        const { data: publicData } = supabase.storage
          .from('products')
          .getPublicUrl(name);
        setForm((f) => ({ ...f, image_url: publicData.publicUrl }));
      } else {
        // Fallback to data URL (small files only)
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setForm((f) => ({ ...f, image_url: reader.result as string }));
          setUploading(false);
        };
        return;
      }
    } catch (e: any) {
      alert(e?.message || 'Грешка при прикачување.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal">Производи</h2>
          <p className="text-charcoal-muted text-sm mt-1">
            Вкупно {products.length} производи
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-red-accent hover:bg-red-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Додај производ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Барај по име..."
            className="pl-9 pr-4 py-2.5 w-full rounded-lg border border-border bg-white text-sm focus:border-red-accent"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
        >
          <option value="ALL">Сите категории</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-red-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-16 text-center">
          <Package className="w-10 h-10 text-charcoal-muted/50 mx-auto mb-3" />
          <p className="text-sm text-charcoal-muted">
            Нема производи за овој пребарувач.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/70 border-b border-border">
                <tr className="text-left text-xs uppercase tracking-wider text-charcoal-muted">
                  <th className="px-6 py-4 font-medium">Производ</th>
                  <th className="px-6 py-4 font-medium">Категорија</th>
                  <th className="px-6 py-4 font-medium">Цена</th>
                  <th className="px-6 py-4 font-medium">Достапност</th>
                  <th className="px-6 py-4 text-right font-medium">Акции</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-cream-dark overflow-hidden relative flex-shrink-0">
                          {p.image_url ? (
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-charcoal-muted">
                              /
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          {p.description && (
                            <div className="text-xs text-charcoal-muted truncate max-w-xs mt-0.5">
                              {p.description}
                            </div>
                          )}
                          {p.featured && (
                            <span className="mt-1 inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                              истакнат
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded-full border border-border bg-cream/70">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-charcoal">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailable(p)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                          p.available
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-charcoal-muted border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p.available ? (
                          <>
                            <Check className="w-3 h-3" /> Достапен
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3" /> Недостапен
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-md hover:bg-cream text-charcoal-muted hover:text-charcoal transition-colors"
                          aria-label="Уреди"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          className="p-2 rounded-md hover:bg-red-50 text-charcoal-muted hover:text-red-accent transition-colors"
                          aria-label="Избриши"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/50">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="text-lg font-bold">
                {form.id ? 'Уреди производ' : 'Додај нов производ'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-md hover:bg-cream text-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Име <span className="text-red-accent">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white text-sm focus:border-red-accent ${
                    errors.name ? 'border-red-400' : 'border-border'
                  }`}
                  placeholder="Порција 10 ќебапи"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-accent">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Опис</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent resize-none"
                  placeholder="Краток опис на производот..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Цена (ден) <span className="text-red-accent">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white text-sm focus:border-red-accent ${
                      errors.price ? 'border-red-400' : 'border-border'
                    }`}
                    placeholder="250"
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-accent">{errors.price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Категорија <span className="text-red-accent">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as ProductCategory })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white text-sm focus:border-red-accent ${
                      errors.category ? 'border-red-400' : 'border-border'
                    }`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Слика URL / прикачи
                </label>
                <div className="flex gap-3 items-start">
                  <div className="w-20 h-20 rounded-lg bg-cream-dark overflow-hidden flex-shrink-0 relative border border-border">
                    {form.image_url ? (
                      <Image
                        src={form.image_url}
                        alt="Preview"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-charcoal-muted">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      value={form.image_url}
                      onChange={(e) =>
                        setForm({ ...form, image_url: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:border-red-accent"
                      placeholder="https://..."
                    />
                    <label className="inline-flex items-center gap-2 text-xs text-charcoal-muted cursor-pointer">
                      {uploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {uploading ? 'Се прикажува...' : 'Прикачи слика'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadImage(f);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <label className="flex-1 flex items-center justify-between p-3.5 rounded-lg border border-border hover:border-red-accent/40 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">Достапен</div>
                    <div className="text-xs text-charcoal-muted">
                      Клиентите можат да додаваат.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) =>
                      setForm({ ...form, available: e.target.checked })
                    }
                    className="w-4 h-4 text-red-accent"
                  />
                </label>
                <label className="flex-1 flex items-center justify-between p-3.5 rounded-lg border border-border hover:border-red-accent/40 cursor-pointer">
                  <div>
                    <div className="text-sm font-medium">Истакнат</div>
                    <div className="text-xs text-charcoal-muted">
                      Прикажи на почетната страна.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="w-4 h-4 text-red-accent"
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-border bg-cream/50">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-cream"
              >
                Откажи
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-red-accent hover:bg-red-hover disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {form.id ? 'Зачувај' : 'Креирај'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
