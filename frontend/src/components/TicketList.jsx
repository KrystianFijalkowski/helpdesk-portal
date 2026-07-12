import { PRIORITY, STATUS, CATEGORY, formatDate } from '../labels'

function SlaBadge({ ticket }) {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return null
  if (ticket.sla_breached) {
    return (
      <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">
        SLA przekroczone
      </span>
    )
  }
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      SLA do {formatDate(ticket.sla_deadline)}
    </span>
  )
}

export default function TicketList({ tickets, onSelect }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        Brak zgłoszeń w tym widoku 🎉
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tickets.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`group flex items-center gap-4 rounded-2xl border border-slate-200 border-l-4 ${PRIORITY[t.priority].accent} bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md`}
        >
          <span className="text-2xl" title={CATEGORY[t.category].label}>
            {CATEGORY[t.category].icon}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-800 group-hover:text-brand-600">
              #{t.id} · {t.title}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {CATEGORY[t.category].label} · zgłoszono {formatDate(t.created_at)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <SlaBadge ticket={t} />
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY[t.priority].badge}`}>
              {PRIORITY[t.priority].label}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[t.status].badge}`}>
              {STATUS[t.status].label}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
