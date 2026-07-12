import { useEffect, useState } from 'react'
import { fetchKbArticles, createKbArticle } from '../api'
import { CATEGORY, formatDay } from '../labels'
import { inputCls } from '../components/ui'

function ArticleForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({ title: '', category: 'hardware', content: '' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const article = await createKbArticle(form)
    onCreated(article)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h2 className="text-xl font-extrabold text-slate-800">Nowy artykuł</h2>
      <p className="mt-1 text-sm text-slate-500">
        Opisz rozwiązanie krok po kroku — tak, żeby pracownik poradził sobie sam.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Tytuł</span>
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="np. Jak podłączyć drukarkę sieciową"
            minLength={3}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Kategoria</span>
          <select
            className={inputCls}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {Object.entries(CATEGORY).map(([value, c]) => (
              <option key={value} value={value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Treść (kroki rozwiązania)
          </span>
          <textarea
            className={inputCls}
            rows={8}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder={'1. Pierwszy krok…\n2. Drugi krok…'}
            minLength={10}
            required
          />
        </label>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Zapisywanie…' : 'Opublikuj artykuł'}
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

export default function KbPage() {
  const [articles, setArticles] = useState([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list') // 'list' | 'new' | { article }

  async function reload() {
    setArticles(await fetchKbArticles(search))
  }

  useEffect(() => {
    // małe opóźnienie, żeby nie odpytywać API po każdej literze
    const id = setTimeout(reload, 300)
    return () => clearTimeout(id)
  }, [search])

  if (view === 'new') {
    return (
      <ArticleForm
        onCreated={(a) => {
          reload()
          setView({ article: a })
        }}
        onCancel={() => setView('list')}
      />
    )
  }

  if (typeof view === 'object') {
    const a = view.article
    return (
      <div className="max-w-3xl">
        <button
          onClick={() => setView('list')}
          className="mb-4 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          ← Wróć do listy
        </button>
        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-slate-400">
            {CATEGORY[a.category].icon} {CATEGORY[a.category].label} ·{' '}
            {formatDay(a.created_at)}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">{a.title}</h1>
          <div className="mt-6 whitespace-pre-wrap leading-relaxed text-slate-700">
            {a.content}
          </div>
        </article>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Baza wiedzy</h1>
          <p className="mt-1 text-sm text-slate-500">
            Instrukcje samodzielnego rozwiązywania typowych problemów
          </p>
        </div>
        <button
          onClick={() => setView('new')}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          + Nowy artykuł
        </button>
      </div>

      <input
        className={`${inputCls} mt-6 max-w-md`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Szukaj problemu, np. drukarka, hasło, VPN…"
      />

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {articles.map((a) => (
          <button
            key={a.id}
            onClick={() => setView({ article: a })}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-xs font-semibold text-slate-400">
              {CATEGORY[a.category].icon} {CATEGORY[a.category].label}
            </p>
            <p className="mt-1 font-bold text-slate-800 group-hover:text-brand-600">{a.title}</p>
            <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{a.content}</p>
          </button>
        ))}
        {articles.length === 0 && (
          <p className="text-slate-400">Brak artykułów pasujących do wyszukiwania.</p>
        )}
      </div>
    </>
  )
}
