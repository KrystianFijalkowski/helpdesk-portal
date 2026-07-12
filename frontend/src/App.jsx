import { useEffect, useState } from 'react'
import { fetchTickets } from './api'
import Sidebar from './components/Sidebar'
import TicketList from './components/TicketList'
import TicketForm from './components/TicketForm'
import TicketDetail from './components/TicketDetail'
import { STATUS } from './labels'

function StatCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${tone}`}>{value}</p>
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
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

export default function App() {
  // Widok: 'list' | 'new' | { detail: id }
  const [view, setView] = useState('list')
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('')

  async function reload() {
    setTickets(await fetchTickets(filter || undefined))
  }

  useEffect(() => {
    reload()
  }, [filter])

  const open = tickets.filter((t) => t.status === 'new').length
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length
  const breached = tickets.filter((t) => t.sla_breached).length

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 px-10 py-8">
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800">Zgłoszenia</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Wszystkie zgłoszenia pracowników w jednym miejscu
                </p>
              </div>
              <button
                onClick={() => setView('new')}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
              >
                + Nowe zgłoszenie
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <StatCard label="Nowe" value={open} tone="text-brand-600" />
              <StatCard label="W trakcie" value={inProgress} tone="text-amber-600" />
              <StatCard
                label="Naruszenia SLA"
                value={breached}
                tone={breached ? 'text-rose-600' : 'text-emerald-600'}
              />
            </div>

            <div className="mt-6 flex items-center gap-2">
              <FilterChip active={filter === ''} onClick={() => setFilter('')}>
                Wszystkie
              </FilterChip>
              {Object.entries(STATUS).map(([value, s]) => (
                <FilterChip key={value} active={filter === value} onClick={() => setFilter(value)}>
                  {s.label}
                </FilterChip>
              ))}
            </div>

            <div className="mt-4">
              <TicketList tickets={tickets} onSelect={(id) => setView({ detail: id })} />
            </div>
          </>
        )}

        {view === 'new' && (
          <TicketForm
            onCreated={(t) => {
              reload()
              setView({ detail: t.id })
            }}
            onCancel={() => setView('list')}
          />
        )}

        {typeof view === 'object' && (
          <TicketDetail ticketId={view.detail} onBack={() => setView('list')} onChanged={reload} />
        )}
      </main>
    </div>
  )
}
