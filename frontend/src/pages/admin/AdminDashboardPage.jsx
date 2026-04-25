import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../services/api'

function StatCard({ icon, label, value, sub, color = '' }) {
  return (
    <div className={`stat-card${color ? ' ' + color : ''}`}>
      <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [data,    setData]    = useState(null)
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.overview(), adminApi.revenue()])
      .then(([ov, rev]) => { setData(ov); setRevenue(rev) })
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner-ring" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Dashboard</h2>
          <p>Platform overview — NairobiJetHouse V2</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Link to="/admin/bookings" className="btn btn-outline-navy btn-sm">
            <i className="bi bi-airplane" /> Bookings
          </Link>
          <Link to="/admin/operators" className="btn btn-navy btn-sm">
            <i className="bi bi-building" /> Operators
          </Link>
        </div>
      </div>

      {/* V1 Stats */}
      <div style={{ marginBottom: '0.5rem' }}>
        <span className="eyebrow">Platform Revenue</span>
      </div>
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard icon="bi-currency-dollar" label="Total Revenue"     value={fmt(data?.total_platform_revenue)} color="gold" />
        <StatCard icon="bi-percent"          label="Total Commissions" value={fmt(data?.total_commissions)} />
        <StatCard icon="bi-people"           label="Active Members"    value={data?.total_members} />
        <StatCard icon="bi-airplane"         label="Listed Aircraft"   value={data?.total_aircraft} />
        <StatCard icon="bi-clock-history"    label="Pending Approvals" value={data?.pending_approvals} color="red" />
        <StatCard icon="bi-chat-left-text"   label="Open Disputes"     value={data?.open_disputes} color="red" />
      </div>

      {/* V2 Operator Stats */}
      <div style={{ marginBottom: '0.5rem' }}>
        <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Operator Network
          <span style={{ fontSize: '0.5rem', fontWeight: 700, background: 'var(--gold)', color: 'var(--navy)', padding: '1px 5px', borderRadius: 3 }}>V2</span>
        </span>
      </div>
      <div className="stat-grid" style={{ marginBottom: '2.5rem' }}>
        <StatCard icon="bi-building"       label="Active Operators"       value={data?.total_operators} color="navy" />
        <StatCard icon="bi-airplane-fill"  label="Pending Aircraft"       value={data?.pending_operator_aircraft} color={data?.pending_operator_aircraft > 0 ? 'red' : ''} sub="awaiting approval" />
        <StatCard icon="bi-file-earmark-text" label="Open RFQ Bids"      value={data?.open_rfq_bids} sub="awaiting admin review" />
        <StatCard icon="bi-cash-stack"     label="Pending Payouts"        value={fmt(data?.pending_payouts_usd)} color={data?.pending_payouts_usd > 0 ? 'green' : ''} sub="to operators" />
      </div>

      {/* Revenue chart (simple table) */}
      {revenue.length > 0 && (
        <div className="table-card" style={{ marginBottom: '2rem' }}>
          <div className="table-card-header">
            <div className="table-card-title"><i className="bi bi-bar-chart" /> Monthly Revenue</div>
            <Link to="/admin/bookings" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                  <th>Gross Revenue</th>
                  <th>Commission</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {revenue.slice(-6).reverse().map(r => (
                  <tr key={r.month}>
                    <td className="td-name">{r.month}</td>
                    <td>{r.confirmed_count}</td>
                    <td className="td-price">{fmt(r.gross_usd)}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{fmt(r.commission_usd)}</td>
                    <td className="td-price">{fmt(r.net_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem' }}>
        {[
          { label: 'Review RFQ Bids',         icon: 'bi-file-earmark-text', to: '/admin/bookings',  color: 'var(--gold)' },
          { label: 'Approve Aircraft',         icon: 'bi-airplane',          to: '/admin/operators', color: 'var(--navy)' },
          { label: 'Process Payouts',          icon: 'bi-cash-stack',        to: '/admin/payouts',   color: 'var(--green)' },
          { label: 'View Inquiries',           icon: 'bi-envelope-open',     to: '/admin/inquiries', color: 'var(--navy)' },
          { label: 'Send Email',               icon: 'bi-send',              to: '/admin/email-logs',color: 'var(--gold)' },
          { label: 'Commission Settings',      icon: 'bi-sliders',           to: '/admin/settings',  color: 'var(--navy)' },
        ].map(({ label, icon, to, color }) => (
          <Link key={label} to={to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', textDecoration: 'none', color: 'var(--navy)', fontWeight: 500, fontSize: '0.875rem', transition: 'var(--transition)', boxShadow: 'var(--shadow-xs)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-xs)'}
          >
            <i className={`bi ${icon}`} style={{ color, fontSize: '1.1rem' }} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}