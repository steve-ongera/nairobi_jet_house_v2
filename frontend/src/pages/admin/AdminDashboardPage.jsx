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

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 36 }) {
  if (!data || data.length < 2) return null
  const w = 260, h = height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 6) - 3
    return `${x},${y}`
  })
  const area = `M${pts[0]} ` + pts.slice(1).map(p => `L${p}`).join(' ') + ` L${w},${h} L0,${h} Z`
  const line = `M${pts[0]} ` + pts.slice(1).map(p => `L${p}`).join(' ')
  const gradId = `sg-${color.replace(/[^a-z0-9]/gi, '')}`
  const [lx, ly] = pts[pts.length - 1].split(',')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const [hovered, setHovered] = useState(null)
  if (!data.length) return null

  const maxVal = Math.max(...data.map(d => d.gross_usd))
  const W = 520, H = 180, PL = 10, PR = 10, PT = 16, PB = 28
  const barW = Math.floor((W - PL - PR) / data.length) - 6

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
      {data.map((d, i) => {
        const barH = ((d.gross_usd / maxVal) * (H - PT - PB)) || 2
        const commH = (d.commission_usd / maxVal) * (H - PT - PB)
        const x = PL + i * ((W - PL - PR) / data.length) + 3
        const y = H - PB - barH
        const isHov = hovered === i
        return (
          <g key={d.month} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {/* Gross bar */}
            <rect x={x} width={barW} y={y} height={barH} rx={3}
              fill="var(--navy)" opacity={isHov ? 0.7 : 0.4}
              style={{ transition: 'opacity 0.15s' }} />
            {/* Commission overlay */}
            <rect x={x} width={barW} y={H - PB - commH} height={commH} rx={3}
              fill="var(--gold)" opacity={isHov ? 1 : 0.85}
              style={{ transition: 'opacity 0.15s' }} />
            {/* Month label */}
            <text x={x + barW / 2} y={H - 8} textAnchor="middle"
              fontSize="9" fill="currentColor" opacity="0.45" fontFamily="inherit">
              {d.month.slice(5)}
            </text>
            {/* Hover tooltip */}
            {isHov && (
              <g>
                <rect x={x - 8} y={y - 42} width={barW + 16} height={36} rx={4}
                  fill="var(--card-bg, #fff)" stroke="var(--gold)" strokeWidth="0.5"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }} />
                <text x={x + barW / 2} y={y - 25} textAnchor="middle"
                  fontSize="9.5" fill="var(--gold)" fontFamily="inherit" fontWeight="700">
                  {fmt(d.gross_usd)}
                </text>
                <text x={x + barW / 2} y={y - 13} textAnchor="middle"
                  fontSize="8" fill="currentColor" opacity="0.5" fontFamily="inherit">
                  Comm: {fmt(d.commission_usd)}
                </text>
              </g>
            )}
          </g>
        )
      })}
      <line x1={PL} y1={PT} x2={PL} y2={H - PB}
        stroke="currentColor" strokeWidth="1" opacity="0.1" />
    </svg>
  )
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const R = 70, r = 44, cx = 90, cy = 90
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 180 180" style={{ width: 150, height: 150, flexShrink: 0 }}>
        {slices.map((s) => (
          <path key={s.label} d={s.path}
            fill={s.color}
            stroke="var(--card-bg, #fff)" strokeWidth={hovered === s.i ? 2 : 1.5}
            transform={hovered === s.i
              ? `translate(${(s.lx - cx) * 0.06},${(s.ly - cy) * 0.06})` : ''}
            style={{ transition: 'transform 0.15s, opacity 0.15s', cursor: 'pointer',
              opacity: hovered != null && hovered !== s.i ? 0.5 : 1 }}
            onMouseEnter={() => setHovered(s.i)}
            onMouseLeave={() => setHovered(null)} />
        ))}
        {/* Centre hole — transparent so page bg shows through */}
        <circle cx={cx} cy={cy} r={r} fill="var(--card-bg, #fff)" />
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="10"
          fill="currentColor" opacity="0.45" fontFamily="inherit">
          {hov ? hov.label : 'Total'}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="13" fontWeight="700"
          fill={hov ? hov.color : 'var(--gold)'} fontFamily="inherit">
          {hov ? `${Math.round(hov.value / total * 100)}%` : fmt(total)}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {data.map((d, i) => (
          <div key={d.label}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
              opacity: hovered != null && hovered !== i ? 0.4 : 1, transition: 'opacity 0.15s' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{d.label}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, marginLeft: 'auto', paddingLeft: '0.75rem' }}>
              {fmt(d.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = 'var(--gold)', trend }) {
  return (
    <div className="stat-card" style={{ borderTop: `2px solid ${accent}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="stat-label">{label}</span>
        <i className={`bi ${icon}`} style={{ color: accent, fontSize: '1rem', opacity: 0.8 }} />
      </div>
      <div className="stat-value" style={{ marginTop: '0.2rem' }}>{value ?? '—'}</div>
      {sub && <div className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>{sub}</div>}
      {trend && (
        <div style={{ marginTop: '0.5rem' }}>
          <Sparkline data={trend} color={accent} height={32} />
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
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
      <div className="spinner-ring" />
    </div>
  )

  const last6 = revenue.slice(-6)
  const revTrend  = last6.map(r => r.gross_usd)
  const commTrend = last6.map(r => r.commission_usd)
  const bkgTrend  = last6.map(r => r.confirmed_count)

  const donutData = [
    { label: 'Net Revenue',    value: last6.reduce((s, r) => s + r.net_usd, 0),        color: 'var(--navy)' },
    { label: 'Commissions',    value: last6.reduce((s, r) => s + r.commission_usd, 0), color: 'var(--gold)' },
    { label: 'Pending Payout', value: data?.pending_payouts_usd || 0,                  color: '#22c55e' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Dashboard</h2>
          <p>Platform overview — NairobiJetHouse V2</p>
        </div>
        <div className="admin-actions-right">
          <Link to="/admin/bookings" className="btn btn-outline-navy btn-sm">
            <i className="bi bi-airplane" /> Bookings
          </Link>
          <Link to="/admin/operators" className="btn btn-navy btn-sm">
            <i className="bi bi-building" /> Operators
          </Link>
        </div>
      </div>

      {/* ── 4 Stat Cards ──────────────────────────────────────────────────── */}
      <div className="stat-grid" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          icon="bi-currency-dollar"
          label="Total Revenue"
          value={fmt(data?.total_platform_revenue)}
          sub="all time"
          accent="var(--gold)"
          trend={revTrend}
        />
        <StatCard
          icon="bi-percent"
          label="Commissions (6mo)"
          value={fmt(last6.reduce((s, r) => s + r.commission_usd, 0))}
          sub="last 6 months"
          accent="var(--navy)"
          trend={commTrend}
        />
        <StatCard
          icon="bi-people"
          label="Active Members"
          value={data?.total_members}
          sub={`${data?.total_operators ?? '—'} operators`}
          accent="#22c55e"
          trend={bkgTrend}
        />
        <StatCard
          icon="bi-clock-history"
          label="Pending Actions"
          value={(data?.pending_approvals ?? 0) + (data?.open_disputes ?? 0)}
          sub={`${data?.pending_approvals ?? 0} approvals · ${data?.open_disputes ?? 0} disputes`}
          accent="var(--red, #ef4444)"
        />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>

        {/* Bar Chart */}
        <div className="table-card">
          <div className="table-card-header">
            <div className="table-card-title">
              <i className="bi bi-bar-chart-fill" /> Monthly Revenue
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.68rem' }} className="text-muted">
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8,
                  background: 'var(--navy)', borderRadius: 1, marginRight: 4 }} />
                Gross
              </span>
              <span>
                <span style={{ display: 'inline-block', width: 8, height: 8,
                  background: 'var(--gold)', borderRadius: 1, marginRight: 4 }} />
                Commission
              </span>
            </div>
          </div>
          <div style={{ padding: '0 0.5rem 0.75rem' }}>
            <BarChart data={last6} />
          </div>
        </div>

        {/* Donut Chart */}
        <div className="table-card">
          <div className="table-card-header">
            <div className="table-card-title">
              <i className="bi bi-pie-chart-fill" /> Revenue Breakdown
            </div>
          </div>
          <div style={{ padding: '0.5rem 1rem 1rem' }}>
            <DonutChart data={donutData} />
          </div>
        </div>

      </div>

      {/* ── Revenue Table ──────────────────────────────────────────────────── */}
      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <div className="table-card-header">
          <div className="table-card-title"><i className="bi bi-table" /> Monthly Breakdown</div>
          <Link to="/admin/bookings" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Bookings</th>
                <th style={{ textAlign: 'right' }}>Gross Revenue</th>
                <th style={{ textAlign: 'right' }}>Commission</th>
                <th style={{ textAlign: 'right' }}>Net</th>
              </tr>
            </thead>
            <tbody>
              {last6.slice().reverse().map((r) => (
                <tr key={r.month}>
                  <td className="td-name">{r.month}</td>
                  <td style={{ textAlign: 'right' }}>{r.confirmed_count}</td>
                  <td className="td-price" style={{ textAlign: 'right' }}>{fmt(r.gross_usd)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--gold)', fontWeight: 600 }}>
                    {fmt(r.commission_usd)}
                  </td>
                  <td className="td-price" style={{ textAlign: 'right' }}>{fmt(r.net_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}