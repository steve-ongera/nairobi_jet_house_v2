import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'

// ── Tiny helpers ─────────────────────────────────────────────────────────────
const fmt = (n) =>
  n != null ? `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'

// ── Mock fallback data ────────────────────────────────────────────────────────
const MOCK_OVERVIEW = {
  total_platform_revenue: 1_420_800,
  total_commissions: 213_120,
  total_members: 348,
  total_aircraft: 74,
  pending_approvals: 5,
  open_disputes: 2,
  total_operators: 31,
  pending_operator_aircraft: 3,
  open_rfq_bids: 8,
  pending_payouts_usd: 84_500,
}

const MOCK_REVENUE = [
  { month: '2024-11', confirmed_count: 18, gross_usd: 192000, commission_usd: 28800, net_usd: 163200 },
  { month: '2024-12', confirmed_count: 24, gross_usd: 260000, commission_usd: 39000, net_usd: 221000 },
  { month: '2025-01', confirmed_count: 21, gross_usd: 225000, commission_usd: 33750, net_usd: 191250 },
  { month: '2025-02', confirmed_count: 19, gross_usd: 204000, commission_usd: 30600, net_usd: 173400 },
  { month: '2025-03', confirmed_count: 28, gross_usd: 298000, commission_usd: 44700, net_usd: 253300 },
  { month: '2025-04', confirmed_count: 32, gross_usd: 341800, commission_usd: 51270, net_usd: 290530 },
]

// ── Line Chart ────────────────────────────────────────────────────────────────
function LineChart({ data }) {
  const [hovered, setHovered] = useState(null)
  if (!data.length) return null

  const W = 520, H = 200, PL = 52, PR = 20, PT = 16, PB = 32
  const innerW = W - PL - PR
  const innerH = H - PT - PB

  const maxVal = Math.max(...data.map(d => d.gross_usd))
  const minVal = 0
  const range  = maxVal - minVal || 1

  const toX = (i) => PL + (i / (data.length - 1)) * innerW
  const toY = (v) => PT + innerH - ((v - minVal) / range) * innerH

  // Y-axis gridlines
  const ticks = 4
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (maxVal / ticks) * i)

  // Build SVG paths — smooth cubic bezier curves
  const grossPts  = data.map((d, i) => [toX(i), toY(d.gross_usd)])
  const commPts   = data.map((d, i) => [toX(i), toY(d.commission_usd)])
  const netPts    = data.map((d, i) => [toX(i), toY(d.net_usd)])

  // Catmull-Rom → cubic bezier: tension 0.4 gives a natural smooth curve
  const buildPath = (pts) => {
    if (pts.length < 2) return ''
    const tension = 0.4
    let d = `M${pts[0][0]},${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[i + 2] || p2
      const cp1x = p1[0] + (p2[0] - p0[0]) * tension
      const cp1y = p1[1] + (p2[1] - p0[1]) * tension
      const cp2x = p2[0] - (p3[0] - p1[0]) * tension
      const cp2y = p2[1] - (p3[1] - p1[1]) * tension
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
    }
    return d
  }

  const buildArea = (pts) =>
    buildPath(pts) + ` L${pts[pts.length - 1][0]},${PT + innerH} L${pts[0][0]},${PT + innerH} Z`

  const gradients = [
    { id: 'gGross', color: 'var(--color-navy)' },
    { id: 'gComm',  color: 'var(--color-gold)' },
    { id: 'gNet',   color: '#22c55e' },
  ]

  const series = [
    { label: 'Gross',      pts: grossPts, color: 'var(--color-navy)', gradId: 'gGross', values: data.map(d => d.gross_usd) },
    { label: 'Commission', pts: commPts,  color: 'var(--color-gold)', gradId: 'gComm',  values: data.map(d => d.commission_usd) },
    { label: 'Net',        pts: netPts,   color: '#22c55e',            gradId: 'gNet',   values: data.map(d => d.net_usd) },
  ]

  const hov = hovered != null ? data[hovered] : null

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        {gradients.map(g => (
          <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={g.color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={g.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* Y-axis gridlines + labels */}
      {yTicks.map((v, i) => {
        const y = toY(v)
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="currentColor" strokeWidth="1" opacity="0.06" strokeDasharray="3,3" />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="8.5" fill="currentColor" opacity="0.35" fontFamily="inherit">
              {v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
            </text>
          </g>
        )
      })}

      {/* Area fills (bottom to top so gross is behind) */}
      {series.slice().reverse().map(s => (
        <path key={s.gradId + '-area'} d={buildArea(s.pts)} fill={`url(#${s.gradId})`} />
      ))}

      {/* Lines */}
      {series.map(s => (
        <path key={s.label + '-line'} d={buildPath(s.pts)} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* Hover vertical line */}
      {hovered != null && (
        <line
          x1={toX(hovered)} y1={PT}
          x2={toX(hovered)} y2={PT + innerH}
          stroke="currentColor" strokeWidth="1" opacity="0.12" strokeDasharray="4,3"
        />
      )}

      {/* Dots + hover targets */}
      {data.map((d, i) => (
        <g key={d.month}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}>
          {/* invisible wide hit area */}
          <rect x={toX(i) - 16} y={PT} width={32} height={innerH} fill="transparent" style={{ cursor: 'crosshair' }} />

          {series.map(s => (
            <circle key={s.label}
              cx={toX(i)} cy={s.pts[i][1]} r={hovered === i ? 4 : 2.5}
              fill={s.color} stroke="var(--color-white)" strokeWidth="1.5"
              style={{ transition: 'r 0.12s' }}
            />
          ))}

          {/* X-axis label */}
          <text x={toX(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.4" fontFamily="inherit">
            {d.month.slice(5)}
          </text>

          {/* Tooltip */}
          {hovered === i && (
            <g>
              <rect
                x={Math.min(toX(i) - 54, W - PR - 112)} y={PT + 4}
                width={108} height={64} rx={5}
                fill="var(--color-white)" stroke="var(--color-light-gray)" strokeWidth="1"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))' }}
              />
              <text x={Math.min(toX(i) - 54, W - PR - 112) + 54} y={PT + 18} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor" opacity="0.5" fontFamily="inherit">
                {d.month}
              </text>
              {series.map((s, si) => (
                <text key={s.label}
                  x={Math.min(toX(i) - 54, W - PR - 112) + 54}
                  y={PT + 31 + si * 13}
                  textAnchor="middle" fontSize="9" fill={s.color} fontFamily="inherit" fontWeight="600">
                  {s.label}: {fmt(s.values[i])}
                </text>
              ))}
            </g>
          )}
        </g>
      ))}

      {/* Left axis line */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + innerH} stroke="currentColor" strokeWidth="1" opacity="0.1" />
    </svg>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const R = 80, r = 52, cx = 100, cy = 100
  const total = data.reduce((s, d) => s + d.value, 0)
  let angle = -Math.PI / 2

  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI
    const x1 = cx + R * Math.cos(angle)
    const y1 = cy + R * Math.sin(angle)
    angle += sweep
    const x2 = cx + R * Math.cos(angle)
    const y2 = cy + R * Math.sin(angle)
    const lx = cx + (R + r) / 2 * Math.cos(angle - sweep / 2)
    const ly = cy + (R + r) / 2 * Math.sin(angle - sweep / 2)
    const large = sweep > Math.PI ? 1 : 0
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`
    return { ...d, path, lx, ly, i }
  })

  const hov = hovered != null ? data[hovered] : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      {/* Fixed 200×200 so the donut has a clear, consistent size */}
      <svg viewBox="0 0 200 200" style={{ width: 200, height: 200, flexShrink: 0 }}>
        {slices.map((s) => (
          <path key={s.label} d={s.path} fill={s.color}
            stroke="var(--color-white)" strokeWidth={hovered === s.i ? 2.5 : 1.5}
            transform={hovered === s.i ? `translate(${(s.lx - cx) * 0.07},${(s.ly - cy) * 0.07})` : ''}
            style={{ transition: 'transform 0.15s, opacity 0.15s', cursor: 'pointer', opacity: hovered != null && hovered !== s.i ? 0.45 : 1 }}
            onMouseEnter={() => setHovered(s.i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {/* Donut hole */}
        <circle cx={cx} cy={cy} r={r} fill="var(--color-white)" />
        <text x={cx} y={cy - 9} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.4" fontFamily="inherit">
          {hov ? hov.label : 'Total'}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13.5" fontWeight="700"
          fill={hov ? hov.color : 'var(--color-gold)'} fontFamily="inherit">
          {hov ? `${Math.round(hov.value / total * 100)}%` : fmt(total)}
        </text>
        {hov && (
          <text x={cx} y={cy + 25} textAnchor="middle" fontSize="9.5"
            fill={hov.color} fontFamily="inherit" opacity="0.8">
            {fmt(hov.value)}
          </text>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.map((d, i) => (
          <div key={d.label}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', opacity: hovered != null && hovered !== i ? 0.35 : 1, transition: 'opacity 0.15s' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-mid-gray)', minWidth: 110 }}>{d.label}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-navy)', marginLeft: 'auto', paddingLeft: '0.5rem' }}>
              {fmt(d.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stat Card (no sparkline) ──────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = 'var(--color-gold)' }) {
  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-light-gray)',
      borderRadius: '8px',
      padding: '1.25rem 1.4rem',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-mid-gray)' }}>
          {label}
        </span>
        <span style={{ width: 32, height: 32, borderRadius: '8px', background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`bi ${icon}`} style={{ color: accent, fontSize: '1rem' }} />
        </span>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-navy)', lineHeight: 1.1 }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.3rem' }}>{sub}</div>}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [data, setData]       = useState(null)
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.overview(), adminAPI.revenue()])
      .then(([ov, rev]) => {
        setData(ov?.data || ov || MOCK_OVERVIEW)
        setRevenue(rev?.data || rev || MOCK_REVENUE)
      })
      .catch(() => {
        setData(MOCK_OVERVIEW)
        setRevenue(MOCK_REVENUE)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const last6 = revenue.slice(-6)

  const donutData = [
    { label: 'Net Revenue',    value: last6.reduce((s, r) => s + r.net_usd, 0),        color: 'var(--color-navy)' },
    { label: 'Commissions',    value: last6.reduce((s, r) => s + r.commission_usd, 0), color: 'var(--color-gold)' },
    { label: 'Pending Payout', value: data?.pending_payouts_usd || 0,                  color: '#22c55e' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Dashboard</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Platform overview — NairobiJetHouse V2</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/bookings"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'transparent', color: 'var(--color-navy)', border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.color = 'var(--color-white)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-navy)' }}>
            <i className="bi bi-airplane" /> Bookings
          </Link>
          <Link to="/admin/operators"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy-mid)'; e.currentTarget.style.borderColor = 'var(--color-navy-mid)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.borderColor = 'var(--color-navy)' }}>
            <i className="bi bi-building" /> Operators
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards — clean, no sparklines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard icon="bi-currency-dollar" label="Total Revenue"      value={fmt(data?.total_platform_revenue)}  sub="all time"                                         accent="var(--color-gold)" />
        <StatCard icon="bi-percent"          label="Commissions (6mo)" value={fmt(last6.reduce((s, r) => s + r.commission_usd, 0))} sub="last 6 months"                 accent="var(--color-navy)" />
        <StatCard icon="bi-people"           label="Active Members"    value={data?.total_members}                sub={`${data?.total_operators ?? '—'} operators`}      accent="#22c55e" />
        <StatCard icon="bi-clock-history"    label="Pending Actions"   value={(data?.pending_approvals ?? 0) + (data?.open_disputes ?? 0)} sub={`${data?.pending_approvals ?? 0} approvals · ${data?.open_disputes ?? 0} disputes`} accent="#ef4444" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>

        {/* Line Chart Card */}
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-light-gray)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-label)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy)' }}>
              <i className="bi bi-graph-up" style={{ color: 'var(--color-gold)' }} /> Monthly Revenue
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.68rem', color: 'var(--color-mid-gray)' }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--color-navy)', borderRadius: '50%', marginRight: 4 }} />Gross</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--color-gold)', borderRadius: '50%', marginRight: 4 }} />Commission</span>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, background: '#22c55e',            borderRadius: '50%', marginRight: 4 }} />Net</span>
            </div>
          </div>
          <div style={{ padding: '0.75rem 0.5rem 0.25rem' }}>
            <LineChart data={last6} />
          </div>
        </div>

        {/* Donut Chart Card — fixed 200px height so donut is clearly sized */}
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-light-gray)', fontFamily: 'var(--font-label)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy)' }}>
            <i className="bi bi-pie-chart-fill" style={{ color: 'var(--color-gold)' }} /> Revenue Breakdown
          </div>
          {/* min-height ensures card matches line chart height and donut is not squashed */}
          <div style={{ padding: '1.5rem 1.25rem', minHeight: 240, display: 'flex', alignItems: 'center' }}>
            <DonutChart data={donutData} />
          </div>
        </div>

      </div>

      {/* Revenue Table */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-light-gray)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-label)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy)' }}>
            <i className="bi bi-table" style={{ color: 'var(--color-gold)' }} /> Monthly Breakdown
          </div>
          <Link to="/admin/bookings" style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--color-navy)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
            View all <i className="bi bi-arrow-right" />
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left',  fontWeight: 600, color: 'var(--color-navy)' }}>Month</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Bookings</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Gross Revenue</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Commission</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Net</th>
              </tr>
            </thead>
            <tbody>
              {last6.slice().reverse().map((r) => (
                <tr key={r.month} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500,  color: 'var(--color-navy)' }}>{r.month}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--color-dark-gray)' }}>{r.confirmed_count}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{fmt(r.gross_usd)}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-gold)' }}>{fmt(r.commission_usd)}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{fmt(r.net_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}