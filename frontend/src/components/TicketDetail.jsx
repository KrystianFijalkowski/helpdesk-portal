import { useEffect, useState } from 'react'
import { fetchTicket, updateTicket, addComment } from '../api'
import { PRIORITY, STATUS, CATEGORY, formatDate } from '../labels'

const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function TicketDetail({ ticketId, onBack, onChanged }) {
  const [ticket, setTicket] = useState(null)
  const [comment, setComment] = useState('')
  const [author, setAuthor] = useState('Krystian (IT)')

  async function reload() {
    setTicket(await fetchTicket(ticketId))
  }

  useEffect(() => {
    reload()
  }, [ticketId])

  if (!ticket) {
    return <p className="text-slate-500">Wczytywanie…</p>
  }

  async function changeStatus(status) {
    await updateTicket(ticket.id, { status })
    await reload()
    onChanged()
  }

  async function submitComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    await addComment(ticket.id, { author, content: comment })
    setComment('')
    await reload()
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={onBack}
        className="mb-4 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        ← Wróć do listy
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-400">Zgłoszenie #{ticket.id}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-800">{ticket.title}</h2>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${STATUS[ticket.status].badge}`}>
            {STATUS[ticket.status].label}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-slate-600">{ticket.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-surface p-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="font-semibold text-slate-400">Kategoria</dt>
            <dd className="mt-1 font-bold text-slate-700">
              {CATEGORY[ticket.category].icon} {CATEGORY[ticket.category].label}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-400">Priorytet</dt>
            <dd className="mt-1 font-bold text-slate-700">{PRIORITY[ticket.priority].label}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-400">Zgłoszono</dt>
            <dd className="mt-1 font-bold text-slate-700">{formatDate(ticket.created_at)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-400">Termin SLA</dt>
            <dd className={`mt-1 font-bold ${ticket.sla_breached ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatDate(ticket.sla_deadline)}
              {ticket.sla_breached && ' ⚠️'}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(STATUS).map(([value, s]) => (
            <button
              key={value}
              onClick={() => changeStatus(value)}
              disabled={ticket.status === value}
              className={
                ticket.status === value
                  ? 'rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white'
                  : 'rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-500 hover:text-brand-600'
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="font-extrabold text-slate-800">
          Komentarze <span className="text-slate-400">({ticket.comments.length})</span>
        </h3>

        <div className="mt-4 flex flex-col gap-3">
          {ticket.comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-surface p-4">
              <p className="text-sm">
                <span className="font-bold text-slate-700">{c.author}</span>
                <span className="ml-2 text-xs text-slate-400">{formatDate(c.created_at)}</span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{c.content}</p>
            </div>
          ))}
          {ticket.comments.length === 0 && (
            <p className="text-sm text-slate-400">Brak komentarzy — napisz pierwszy.</p>
          )}
        </div>

        <form onSubmit={submitComment} className="mt-5 flex flex-col gap-3">
          <input
            className={inputCls}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Autor"
            required
          />
          <textarea
            className={inputCls}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Dodaj komentarz…"
            required
          />
          <button
            type="submit"
            className="self-start rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            Dodaj komentarz
          </button>
        </form>
      </div>
    </div>
  )
}
