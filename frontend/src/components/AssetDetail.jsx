import { useEffect, useState } from 'react'
import { fetchAssets, updateAsset } from '../api'
import { ASSET_TYPE, ASSET_STATUS, formatDay } from '../labels'
import { inputCls } from './ui'

export default function AssetDetail({ assetId, onBack, onChanged }) {
  const [asset, setAsset] = useState(null)
  const [assignedTo, setAssignedTo] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  async function reload() {
    // Pobieramy listę i wybieramy zasób (API ma też /api/assets/{id})
    const all = await fetchAssets()
    const found = all.find((a) => a.id === assetId)
    setAsset(found)
    setAssignedTo(found?.assigned_to || '')
    setNotes(found?.notes || '')
  }

  useEffect(() => {
    reload()
  }, [assetId])

  if (!asset) {
    return <p className="text-slate-500">Wczytywanie…</p>
  }

  async function changeStatus(status) {
    await updateAsset(asset.id, { status })
    await reload()
    onChanged()
  }

  async function save(e) {
    e.preventDefault()
    await updateAsset(asset.id, { assigned_to: assignedTo || null, notes })
    await reload()
    onChanged()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const days = asset.warranty_days_left

  return (
    <div className="max-w-3xl">
      <button
        onClick={onBack}
        className="mb-4 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        ← Wróć do ewidencji
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-400">
              Zasób #{asset.id} · {ASSET_TYPE[asset.asset_type].label}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-800">
              {ASSET_TYPE[asset.asset_type].icon} {asset.name}
            </h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${ASSET_STATUS[asset.status].badge}`}
          >
            {ASSET_STATUS[asset.status].label}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-surface p-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-slate-400">Nr seryjny</dt>
            <dd className="mt-1 font-mono font-bold text-slate-700">{asset.serial_number}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-400">Data zakupu</dt>
            <dd className="mt-1 font-bold text-slate-700">{formatDay(asset.purchase_date)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-400">Gwarancja do</dt>
            <dd
              className={`mt-1 font-bold ${
                days !== null && days < 0
                  ? 'text-rose-600'
                  : days !== null && days <= 30
                    ? 'text-amber-600'
                    : 'text-slate-700'
              }`}
            >
              {formatDay(asset.warranty_until)}
              {days !== null && days >= 0 && (
                <span className="ml-1 text-xs font-semibold text-slate-400">({days} dni)</span>
              )}
              {days !== null && days < 0 && ' ⚠️'}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(ASSET_STATUS).map(([value, s]) => (
            <button
              key={value}
              onClick={() => changeStatus(value)}
              disabled={asset.status === value}
              className={
                asset.status === value
                  ? 'rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white'
                  : 'rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-500 hover:text-brand-600'
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={save} className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Przypisany do
            </span>
            <input
              className={inputCls}
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="imię i nazwisko pracownika (puste = magazyn)"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Notatki</span>
            <textarea
              className={inputCls}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="self-start rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              Zapisz zmiany
            </button>
            {saved && <span className="text-sm font-semibold text-emerald-600">Zapisano ✓</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
