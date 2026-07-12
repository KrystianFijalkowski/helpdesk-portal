// Tłumaczenia wartości z API na polskie etykiety + kolory badge'y (Tailwind)

export const PRIORITY = {
  low: { label: 'Niski', badge: 'bg-slate-100 text-slate-600', accent: 'border-l-slate-300' },
  medium: { label: 'Średni', badge: 'bg-sky-100 text-sky-700', accent: 'border-l-sky-400' },
  high: { label: 'Wysoki', badge: 'bg-amber-100 text-amber-700', accent: 'border-l-amber-400' },
  critical: { label: 'Krytyczny', badge: 'bg-rose-100 text-rose-700', accent: 'border-l-rose-500' },
}

export const STATUS = {
  new: { label: 'Nowe', badge: 'bg-brand-100 text-brand-700' },
  in_progress: { label: 'W trakcie', badge: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Rozwiązane', badge: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Zamknięte', badge: 'bg-slate-100 text-slate-500' },
}

export const CATEGORY = {
  hardware: { label: 'Sprzęt', icon: '🖥️' },
  software: { label: 'Oprogramowanie', icon: '💿' },
  network: { label: 'Sieć', icon: '🌐' },
  account: { label: 'Konto', icon: '🔑' },
  other: { label: 'Inne', icon: '📌' },
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
