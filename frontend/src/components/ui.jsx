// Małe współdzielone komponenty UI

export function StatCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${tone}`}>{value}</p>
    </div>
  )
}

export function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-ink-900 px-4 py-1.5 text-xs font-bold text-white'
          : 'rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-500'
      }
    >
      {children}
    </button>
  )
}

export const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
