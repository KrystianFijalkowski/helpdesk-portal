import { useEffect, useState } from 'react'
import { fetchMonitoringStatus, fetchMonitoringHistory } from '../api'
import MetricChart from '../components/MetricChart'
import { FilterChip } from '../components/ui'

const REFRESH_MS = 30000 // odświeżanie co 30 s — tyle co interwał pollera

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d} dni ${h} godz.`
  if (h > 0) return `${h} godz. ${m} min`
  return `${m} min`
}

function usageTone(pct) {
  if (pct >= 85) return 'text-rose-600'
  if (pct >= 60) return 'text-amber-600'
  return 'text-emerald-600'
}

function GaugeTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${usageTone(value)}`}>{value.toFixed(1)}%</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            value >= 85 ? 'bg-rose-500' : value >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function MonitoringPage() {
  const [status, setStatus] = useState(null)
  const [history, setHistory] = useState([])
  const [hours, setHours] = useState(3)

  async function reload() {
    setStatus(await fetchMonitoringStatus())
    setHistory(await fetchMonitoringHistory(hours))
  }

  useEffect(() => {
    reload()
    // auto-odświeżanie; sprzątamy interval przy zmianie zakresu/wyjściu
    const id = setInterval(reload, REFRESH_MS)
    return () => clearInterval(id)
  }, [hours])

  if (!status) {
    return <p className="text-slate-500">Wczytywanie…</p>
  }

  const s = status.sample

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Monitoring</h1>
          <p className="mt-1 text-sm text-slate-500">
            Metryki na żywo z prawdziwego serwera VPS (Oracle Cloud, Frankfurt)
          </p>
        </div>
        <div
          className={
            status.online
              ? 'flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700'
              : 'flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700'
          }
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${status.online ? 'animate-pulse bg-emerald-500' : 'bg-rose-500'}`}
          />
          {status.online ? 'ONLINE' : 'OFFLINE'}
          {status.hostname && <span className="font-mono font-semibold">· {status.hostname}</span>}
        </div>
      </div>

      {s ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <GaugeTile label="Procesor (CPU)" value={s.cpu_percent} />
            <GaugeTile label="Pamięć (RAM)" value={s.ram_percent} />
            <GaugeTile label="Dysk" value={s.disk_percent} />
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Uptime</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-700">
                {formatUptime(s.uptime_seconds)}
              </p>
              <p className="mt-3 text-xs text-slate-400">bez restartu</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800">Obciążenie w czasie</h2>
              <div className="flex gap-2">
                {[1, 3, 12, 24].map((v) => (
                  <FilterChip key={v} active={hours === v} onClick={() => setHours(v)}>
                    {v} h
                  </FilterChip>
                ))}
              </div>
            </div>
            <MetricChart samples={history} />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Brak danych — poller jeszcze nie zebrał pierwszej próbki.
        </div>
      )}
    </>
  )
}
