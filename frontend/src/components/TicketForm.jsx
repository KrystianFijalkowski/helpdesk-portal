import { useState } from 'react'
import { createTicket } from '../api'
import { PRIORITY, CATEGORY } from '../labels'

const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function TicketForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'hardware',
    priority: 'medium',
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
      const ticket = await createTicket(form)
      onCreated(ticket)
    } catch (err) {
      setError('Nie udało się utworzyć zgłoszenia. ' + err.message)
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h2 className="text-xl font-extrabold text-slate-800">Nowe zgłoszenie</h2>
      <p className="mt-1 text-sm text-slate-500">
        Opisz problem — dział IT zajmie się nim zgodnie z priorytetem.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Tytuł</span>
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="np. Nie działa drukarka na 2 piętrze"
            minLength={3}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Opis problemu</span>
          <textarea
            className={inputCls}
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Co się dzieje? Od kiedy? Co już próbowałeś?"
            minLength={5}
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Kategoria</span>
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {Object.entries(CATEGORY).map(([value, c]) => (
                <option key={value} value={value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Priorytet</span>
            <select
              className={inputCls}
              value={form.priority}
              onChange={(e) => set('priority', e.target.value)}
            >
              {Object.entries(PRIORITY).map(([value, p]) => (
                <option key={value} value={value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
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
          {saving ? 'Wysyłanie…' : 'Utwórz zgłoszenie'}
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
