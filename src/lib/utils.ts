export function formatCurrency(n: number): string {
  return `${Math.round(n)} ден`;
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('mk-MK', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: 'Нова',
    ACCEPTED: 'Прифатена',
    PREPARING: 'Се подготвува',
    READY: 'Подготвена',
    COMPLETED: 'Завршена',
    CANCELLED: 'Откажана',
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    NEW: 'bg-red-50 text-red-accent border-red-200',
    ACCEPTED: 'bg-blue-50 text-blue-800 border-blue-200',
    PREPARING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    READY: 'bg-green-50 text-green-800 border-green-200',
    COMPLETED: 'bg-gray-50 text-charcoal-muted border-gray-200',
    CANCELLED: 'bg-gray-50 text-charcoal-muted border-gray-300',
  };
  return map[status] || 'bg-gray-50 text-charcoal-muted border-gray-200';
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^[0-9+]{7,}$/.test(cleaned);
}
