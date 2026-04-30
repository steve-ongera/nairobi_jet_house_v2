// ═══════════════════════════════════════════════════════════════════════════════
// OWNER DASHBOARD PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function StatCard({ icon, label, value, color = '', sub = '' }) {
  return (
    <div className={`stat-card${color ? ' ' + color : ''}`}>
      <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {sub && <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

export function OwnerDashboardPage() {
  const { user } = useAuth()
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const response = await dashboardAPI.owner()
        const data = response?.data || response
        setDash(data)
      } catch (err) {
        console.error('Failed to load owner dashboard:', err)
        setDash(null)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const quickActions = [
    { to: '/owner/aircraft', icon: 'bi-airplane', label: 'Manage Fleet', desc: 'Add, edit, or remove aircraft' },
    { to: '/owner/maintenance', icon: 'bi-tools', label: 'Maintenance', desc: 'Schedule and track maintenance' },
    { to: '/owner/bookings', icon: 'bi-calendar-check', label: 'Bookings', desc: 'View upcoming bookings' },
    { to: '/owner/reports', icon: 'bi-graph-up', label: 'Reports', desc: 'View performance reports' },
  ]

  if (loading) {
    return (
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Owner Dashboard</h2>
          <p>Welcome back, {user?.first_name || user?.company || user?.username || 'Owner'}</p>
        </div>
        <div className="admin-actions-right">
          <Link to="/owner/aircraft" className="btn btn-navy btn-sm">
            <i className="bi bi-airplane" /> Manage Fleet
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard 
          icon="bi-currency-dollar" 
          label="Total Revenue" 
          value={formatCurrency(dash?.total_revenue_usd)} 
          color="gold"
        />
        <StatCard 
          icon="bi-calendar-month" 
          label="This Month" 
          value={formatCurrency(dash?.monthly_revenue_usd)} 
          color="navy"
        />
        <StatCard 
          icon="bi-hourglass-split" 
          label="Total Flight Hours" 
          value={dash?.total_flight_hours || '—'} 
        />
        <StatCard 
          icon="bi-airplane" 
          label="Aircraft Listed" 
          value={dash?.aircraft_count || '—'} 
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" style={{ marginBottom: '2rem' }}>
        {quickActions.map(action => (
          <Link key={action.to} to={action.to} className="quick-action-card">
            <div className="quick-action-icon">
              <i className={`bi ${action.icon}`} />
            </div>
            <div className="quick-action-content">
              <div className="quick-action-title">{action.label}</div>
              <div className="quick-action-desc">{action.desc}</div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: 'var(--gray-300)', fontSize: '0.9rem' }} />
          </Link>
        ))}
      </div>

      {/* Maintenance Alerts */}
      {dash?.maintenance_alerts && dash.maintenance_alerts.length > 0 && (
        <div>
          <div className="dash-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
            <div className="dash-header-left">
              <h3 style={{ fontSize: '1rem', margin: 0 }}>
                <i className="bi bi-exclamation-triangle" style={{ color: 'var(--amber)', marginRight: '0.5rem' }} />
                Maintenance Alerts
              </h3>
            </div>
            <Link to="/owner/maintenance" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dash.maintenance_alerts.slice(0, 5).map(m => (
              <div key={m.id} className="alert alert-amber" style={{ marginBottom: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{m.aircraft_name}</div>
                  <div style={{ fontSize: '0.75rem' }}>
                    {m.maintenance_type} · Due: {formatDate(m.scheduled_date)}
                  </div>
                </div>
                <Link to={`/owner/maintenance/${m.id}`} className="btn btn-outline-amber btn-xs">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings (Optional) */}
      {dash?.recent_bookings && dash.recent_bookings.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div className="dash-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
            <div className="dash-header-left">
              <h3 style={{ fontSize: '1rem', margin: 0 }}>
                <i className="bi bi-calendar-check" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
                Recent Bookings
              </h3>
            </div>
            <Link to="/owner/bookings" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          
          <div className="table-card">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Aircraft</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.recent_bookings.slice(0, 5).map(b => (
                    <tr key={b.id}>
                      <td><span className="td-ref">{String(b.reference).slice(0, 8)}…</span></td>
                      <td>{b.aircraft_name}</td>
                      <td>
                        <div className="td-name">{b.client_name}</div>
                        <div className="td-email">{b.client_email}</div>
                      </td>
                      <td>{formatDate(b.departure_date)}</td>
                      <td className="td-price">{formatCurrency(b.amount_usd)}</td>
                      <td>
                        <span className={`badge badge-${b.status === 'confirmed' ? 'green' : b.status === 'completed' ? 'gray' : 'amber'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Tip */}
      <div className="alert alert-info" style={{ marginTop: '2rem', fontSize: '0.8rem' }}>
        <i className="bi bi-lightbulb" />
        <div>
          <strong>Owner Tip:</strong> Keep your fleet information up to date to attract more bookings. Regular maintenance records improve client confidence.
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboardPage