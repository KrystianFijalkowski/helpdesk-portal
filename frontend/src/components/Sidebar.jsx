const navItems = [
  { key: 'tickets', label: 'Zgłoszenia', icon: '🎫' },
  { key: 'assets', label: 'Zasoby IT', icon: '💻' },
  { key: 'monitoring', label: 'Monitoring', icon: '📡' },
  { key: 'reports', label: 'Raporty', icon: '📊' },
  { key: 'kb', label: 'Baza wiedzy', icon: '📚' },
]

export default function Sidebar({ section, onNavigate }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-ink-900 text-slate-300">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-extrabold text-white">
          IT
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">Helpdesk Portal</p>
          <p className="text-xs text-slate-400">wewnętrzny system IT</p>
        </div>
      </div>

      <nav className="mt-2 flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            disabled={item.soon}
            onClick={() => onNavigate(item.key)}
            className={
              section === item.key
                ? 'flex items-center gap-3 rounded-xl bg-ink-800 px-3 py-2.5 text-sm font-semibold text-white'
                : 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-ink-800/50 hover:text-slate-200 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-slate-400'
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.soon && (
              <span className="ml-auto rounded-full bg-ink-800 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                wkrótce
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto px-5 py-5 text-xs text-slate-500">
        <p className="font-semibold text-slate-400">Krystian Fijałkowski</p>
        <p>Technik IT · 1. linia wsparcia</p>
      </div>
    </aside>
  )
}
