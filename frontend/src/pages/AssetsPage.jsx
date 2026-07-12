import { useEffect, useState } from 'react'
import { fetchAssets } from '../api'
import AssetForm from '../components/AssetForm'
import AssetDetail from '../components/AssetDetail'
import { ASSET_TYPE, ASSET_STATUS, formatDay } from '../labels'
import { StatCard, FilterChip } from '../components/ui'

function WarrantyBadge({ asset }) {
  const days = asset.warranty_days_left
  if (days === null) return <span className="text-slate-400">—</span>
  if (days < 0) {
    return (
      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
        wygasła
      </span>
    )
  }
  if (days <= 30) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
        {days} dni
      </span>
    )
  }
  return <span className="text-sm text-slate-600">{formatDay(asset.warranty_until)}</span>
}

export default function AssetsPage() {
  // Widok: 'list' | 'new' | { detail: id }
  const [view, setView] = useState('list')
  const [assets, setAssets] = useState([])
  const [filter, setFilter] = useState('')

  async function reload() {
    setAssets(await fetchAssets(filter || undefined))
  }

  useEffect(() => {
    reload()
  }, [filter])

  const inUse = assets.filter((a) => a.status === 'in_use').length
  const inRepair = assets.filter((a) => a.status === 'repair').length
  const warrantyAlerts = assets.filter(
    (a) => a.warranty_days_left !== null && a.warranty_days_left <= 30 && a.status !== 'retired',
  ).length

  if (view === 'new') {
    return (
      <AssetForm
        onCreated={() => {
          reload()
          setView('list')
        }}
        onCancel={() => setView('list')}
      />
    )
  }

  if (typeof view === 'object') {
    return <AssetDetail assetId={view.detail} onBack={() => setView('list')} onChanged={reload} />
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Zasoby IT</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ewidencja sprzętu i licencji — kto ma co i do kiedy działa gwarancja
          </p>
        </div>
        <button
          onClick={() => setView('new')}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          + Dodaj zasób
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="W użyciu" value={inUse} tone="text-emerald-600" />
        <StatCard label="W serwisie" value={inRepair} tone="text-amber-600" />
        <StatCard
          label="Gwarancja kończy się ≤ 30 dni"
          value={warrantyAlerts}
          tone={warrantyAlerts ? 'text-rose-600' : 'text-emerald-600'}
        />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <FilterChip active={filter === ''} onClick={() => setFilter('')}>
          Wszystkie
        </FilterChip>
        {Object.entries(ASSET_STATUS).map(([value, s]) => (
          <FilterChip key={value} active={filter === value} onClick={() => setFilter(value)}>
            {s.label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3.5">Zasób</th>
              <th className="px-5 py-3.5">Nr seryjny</th>
              <th className="px-5 py-3.5">Przypisany do</th>
              <th className="px-5 py-3.5">Gwarancja</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr
                key={a.id}
                onClick={() => setView({ detail: a.id })}
                className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-brand-50/50"
              >
                <td className="px-5 py-3.5">
                  <span className="mr-2">{ASSET_TYPE[a.asset_type].icon}</span>
                  <span className="font-bold text-slate-800">{a.name}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    {ASSET_TYPE[a.asset_type].label}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{a.serial_number}</td>
                <td className="px-5 py-3.5 text-slate-700">
                  {a.assigned_to || <span className="text-slate-400">nieprzypisany</span>}
                </td>
                <td className="px-5 py-3.5">
                  <WarrantyBadge asset={a} />
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ASSET_STATUS[a.status].badge}`}
                  >
                    {ASSET_STATUS[a.status].label}
                  </span>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  Brak zasobów w tym widoku
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
