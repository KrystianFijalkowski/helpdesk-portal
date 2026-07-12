import { useState } from 'react'
import { createAsset } from '../api'
import { ASSET_TYPE, ASSET_STATUS } from '../labels'
import { inputCls } from './ui'

export default function AssetForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    asset_type: 'laptop',
    serial_number: '',
    assigned_to: '',
    status: 'in_storage',
    purchase_date: '',
    warranty_until: '',
    notes: '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      // Puste pola opcjonalne wysyłamy jako null, nie jako pusty tekst
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        purchase_date: form.purchase_date || null,
        warranty_until: form.warranty_until || null,
      }
      const asset = await createAsset(payload)
      onCreated(asset)
    } catch (err) {
      setError('Nie udało się dodać zasobu. ' + err.message)
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h2 className="text-xl font-extrabold text-slate-800">Nowy zasób</h2>
      <p className="mt-1 text-sm text-slate-500">Dodaj sprzęt lub licencję do ewidencji IT.</p>

      <div className="mt-6 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nazwa</span>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="np. Dell Latitude 5540"
              minLength={2}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Typ</span>
            <select
              className={inputCls}
              value={form.asset_type}
              onChange={(e) => set('asset_type', e.target.value)}
            >
              {Object.entries(ASSET_TYPE).map(([value, t]) => (
                <option key={value} value={value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Nr seryjny</span>
            <input
              className={inputCls}
              value={form.serial_number}
              onChange={(e) => set('serial_number', e.target.value)}
              placeholder="np. SN-4823-PL"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Przypisany do <span className="font-normal text-slate-400">(opcjonalnie)</span>
            </span>
            <input
              className={inputCls}
              value={form.assigned_to}
              onChange={(e) => set('assigned_to', e.target.value)}
              placeholder="imię i nazwisko pracownika"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Data zakupu</span>
            <input
              type="date"
              className={inputCls}
              value={form.purchase_date}
              onChange={(e) => set('purchase_date', e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Gwarancja do
            </span>
            <input
              type="date"
              className={inputCls}
              value={form.warranty_until}
              onChange={(e) => set('warranty_until', e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Status</span>
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {Object.entries(ASSET_STATUS).map(([value, s]) => (
                <option key={value} value={value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Notatki <span className="font-normal text-slate-400">(opcjonalnie)</span>
          </span>
          <textarea
            className={inputCls}
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="np. przekazany z leasingu, drobna rysa na obudowie"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Zapisywanie…' : 'Dodaj zasób'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Anuluj
        </button>
      </div>
    </form>
  )
}
