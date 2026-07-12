import { useEffect, useState } from 'react'
import { fetchReportsSummary } from '../api'
import { CATEGORY, STATUS, PRIORITY } from '../labels'
import { StatCard } from '../components/ui'

// Jedna seria danych = jeden kolor (brand); wartości etykietowane na końcach słupków
const BAR_COLOR = '#4f46e5'

function BarRow({ label, icon, value, max }) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 shrink-0 truncate text-sm text-slate-600">
        {icon} {label}
      </span>
      <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
        <div
          className="flex h-full items-center justify-end rounded-md pr-2 text-xs font-bold text-white"
          style={{ width: `${width}%`, background: BAR_COLOR }}
        >
          {value > 0 && value}
        </div>
      </div>
    </div>
  )
}

function DayBars({ data }) {
  const entries = Object.entries(data)
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return (
    <div className="flex h-36 items-end gap-2">
      {entries.map(([day, count]) => (
        <div key={day} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-bold text-slate-600">{count > 0 ? count : ''}</span>
          <div
            className="w-full rounded-t-md"
            style={{
              height: `${(count / max) * 100}px`,
              minHeight: count > 0 ? '4px' : '1px',
              background: count > 0 ? BAR_COLOR : '#e2e8f0',
            }}
          />
          <span className="text-[10px] text-slate-400">
            {new Date(day).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetchReportsSummary().then(setSummary)
  }, [])

  if (!summary) {
    return <p className="text-slate-500">Wczytywanie…</p>
  }

  const catMax = Math.max(...Object.values(summary.by_category), 1)

  return (
    <>
      <h1 className="text-2xl font-extrabold text-slate-800">Raporty</h1>
      <p className="mt-1 text-sm text-slate-500">Statystyki pracy działu IT</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Wszystkie zgłoszenia" value={summary.total} tone="text-slate-700" />
        <StatCard label="Otwarte" value={summary.open} tone="text-brand-600" />
        <StatCard
          label="Śr. czas rozwiązania"
          value={summary.avg_resolution_hours !== null ? `${summary.avg_resolution_hours} h` : '—'}
          tone="text-emerald-600"
        />
        <StatCard
          label="Naruszenia SLA"
          value={summary.sla_breached}
          tone={summary.sla_breached ? 'text-rose-600' : 'text-emerald-600'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-slate-800">Zgłoszenia wg kategorii</h2>
          <div className="mt-4 flex flex-col gap-3">
            {Object.entries(CATEGORY).map(([key, c]) =>
              summary.by_category[key] ? (
                <BarRow
                  key={key}
                  label={c.label}
                  icon={c.icon}
                  value={summary.by_category[key]}
                  max={catMax}
                />
              ) : null,
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-slate-800">Nowe zgłoszenia — ostatnie 7 dni</h2>
          <div className="mt-4">
            <DayBars data={summary.last_7_days} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-slate-800">Wg statusu</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(STATUS).map(([key, s]) => (
              <span
                key={key}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${s.badge}`}
              >
                {s.label}: {summary.by_status[key] || 0}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-slate-800">Wg priorytetu</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(PRIORITY).map(([key, p]) => (
              <span
                key={key}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${p.badge}`}
              >
                {p.label}: {summary.by_priority[key] || 0}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
