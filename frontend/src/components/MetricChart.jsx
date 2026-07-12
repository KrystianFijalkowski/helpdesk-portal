import { useRef, useState } from 'react'

// Paleta zweryfikowana walidatorem dataviz (CVD ΔE 76,6; kontrast ≥ 3:1)
const SERIES = [
  { key: 'cpu_percent', label: 'CPU', color: '#4f46e5' },
  { key: 'ram_percent', label: 'RAM', color: '#0d9488' },
]

const W = 800
const H = 240
const PAD = { top: 12, right: 52, bottom: 26, left: 38 }

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
}

export default function MetricChart({ samples }) {
  const svgRef = useRef(null)
  const [hover, setHover] = useState(null) // indeks najechanej próbki

  if (samples.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Zbieranie danych… (wykres pojawi się po kilku próbkach)
      </div>
    )
  }

  const t0 = new Date(samples[0].created_at).getTime()
  const t1 = new Date(samples[samples.length - 1].created_at).getTime()
  const x = (iso) =>
    PAD.left + ((new Date(iso).getTime() - t0) / Math.max(t1 - t0, 1)) * (W - PAD.left - PAD.right)
  const y = (pct) => PAD.top + (1 - pct / 100) * (H - PAD.top - PAD.bottom)

  const line = (key) => samples.map((s) => `${x(s.created_at)},${y(s[key])}`).join(' ')

  // 4 etykiety czasu równomiernie rozłożone
  const ticks = [0, 1, 2, 3].map((i) => samples[Math.floor((i * (samples.length - 1)) / 3)])

  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    let bestDist = Infinity
    samples.forEach((s, i) => {
      const d = Math.abs(x(s.created_at) - px)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setHover(best)
  }

  const h = hover !== null ? samples[hover] : null

  return (
    <div className="relative">
      {/* legenda — tekst w kolorze tekstu, tożsamość niesie kropka */}
      <div className="mb-2 flex gap-5 text-xs font-semibold text-slate-600">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* siatka pozioma — dyskretna, co 25% */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text x={PAD.left - 6} y={y(v) + 3.5} textAnchor="end" fontSize="10" fill="#94a3b8">
              {v}%
            </text>
          </g>
        ))}

        {/* etykiety czasu */}
        {ticks.map((s, i) => (
          <text
            key={i}
            x={x(s.created_at)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
          >
            {timeLabel(s.created_at)}
          </text>
        ))}

        {/* linie serii — cienkie, 2px */}
        {SERIES.map((s) => (
          <polyline
            key={s.key}
            points={line(s.key)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ))}

        {/* bezpośrednie etykiety na końcach linii */}
        {SERIES.map((s) => (
          <text
            key={s.key}
            x={W - PAD.right + 6}
            y={y(samples[samples.length - 1][s.key]) + 3.5}
            fontSize="11"
            fontWeight="700"
            fill={s.color}
          >
            {s.label}
          </text>
        ))}

        {/* warstwa hover: celownik + punkty */}
        {h && (
          <g>
            <line
              x1={x(h.created_at)}
              x2={x(h.created_at)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            {SERIES.map((s) => (
              <circle
                key={s.key}
                cx={x(h.created_at)}
                cy={y(h[s.key])}
                r="4"
                fill={s.color}
                stroke="#ffffff"
                strokeWidth="2"
              />
            ))}
          </g>
        )}
      </svg>

      {/* tooltip */}
      {h && (
        <div
          className="pointer-events-none absolute top-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${(x(h.created_at) / W) * 100}%`,
            transform: x(h.created_at) > W / 2 ? 'translateX(-110%)' : 'translateX(10%)',
          }}
        >
          <p className="font-bold text-slate-700">{timeLabel(h.created_at)}</p>
          {SERIES.map((s) => (
            <p key={s.key} className="mt-0.5 flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}: <span className="font-bold">{h[s.key].toFixed(1)}%</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
