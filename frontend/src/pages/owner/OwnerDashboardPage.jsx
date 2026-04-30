// ═══════════════════════════════════════════════════════════════════════════════
// OWNER DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { dashboardApi } from '../../services/api'
import { useAuth } from '../../App'

export function OwnerDashboardPage() {
  const { user } = useAuth()
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.owner()
      .then(setDash)
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner-ring" />
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Owner Dashboard</h2>
          <p>Fleet performance overview for {user?.first_name || user?.company || user?.username}</p>
        </div>
        <a href="/owner/aircraft" className="btn btn-navy btn-sm">
          <i className="bi bi-airplane" /> Manage Fleet
        </a>
      </div>

      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-currency-dollar" /></div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{fmt(dash?.total_revenue_usd)}</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-card-icon"><i className="bi bi-calendar-month" /></div>
          <div className="stat-label">This Month</div>
          <div className="stat-value">{fmt(dash?.monthly_revenue_usd)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-hourglass-split" /></div>
          <div className="stat-label">Total Flight Hours</div>
          <div className="stat-value">{dash?.total_flight_hours ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-airplane" /></div>
          <div className="stat-label">Aircraft Listed</div>
          <div className="stat-value">{dash?.aircraft_count ?? '—'}</div>
        </div>
      </div>

      {dash?.maintenance_alerts?.length > 0 && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <span className="eyebrow">⚠ Maintenance Alerts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {dash.maintenance_alerts.map(m => (
              <div key={m.id} style={{ background: 'var(--amber-light)', border: '1px solid #DFBD7A', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--amber)', marginBottom: '0.2rem' }}>{m.aircraft_name} — {m.maintenance_type}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--amber)' }}>Scheduled: {m.scheduled_date}</div>
                </div>
                <a href="/owner/maintenance" className="btn btn-ghost btn-xs">View</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerDashboardPage