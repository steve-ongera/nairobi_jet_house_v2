// ═══════════════════════════════════════════════════════════════════════════════
// STAFF DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { useAuth } from '../../App'

export function StaffDashboardPage() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.overview()
      .then(setOverview)
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="spinner-ring" />
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Staff Dashboard</h2>
          <p>Welcome, {user?.first_name || user?.username} — here's what needs attention today</p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-currency-dollar" /></div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{fmt(overview?.total_platform_revenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-percent" /></div>
          <div className="stat-label">Commissions</div>
          <div className="stat-value">{fmt(overview?.total_commissions)}</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-card-icon"><i className="bi bi-people" /></div>
          <div className="stat-label">Active Members</div>
          <div className="stat-value">{overview?.total_members ?? '—'}</div>
        </div>
        <div className={`stat-card ${overview?.open_disputes > 0 ? 'red' : ''}`}>
          <div className="stat-card-icon"><i className="bi bi-exclamation-triangle" /></div>
          <div className="stat-label">Open Disputes</div>
          <div className="stat-value">{overview?.open_disputes ?? '—'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <a 
          href="/staff/bookings" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'var(--white)', 
            border: '1px solid var(--gray-100)', 
            borderRadius: 'var(--radius)', 
            padding: '1rem 1.25rem', 
            textDecoration: 'none', 
            color: 'var(--navy)', 
            fontWeight: 500, 
            fontSize: '0.875rem', 
            boxShadow: 'var(--shadow-xs)', 
            transition: 'var(--transition)' 
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-xs)'}
        >
          <i className="bi bi-airplane" style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
          View Bookings
        </a>
        <a 
          href="/staff/inquiries" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'var(--white)', 
            border: '1px solid var(--gray-100)', 
            borderRadius: 'var(--radius)', 
            padding: '1rem 1.25rem', 
            textDecoration: 'none', 
            color: 'var(--navy)', 
            fontWeight: 500, 
            fontSize: '0.875rem', 
            boxShadow: 'var(--shadow-xs)', 
            transition: 'var(--transition)' 
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-xs)'}
        >
          <i className="bi bi-envelope-open" style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
          View Inquiries
        </a>
        <a 
          href="/staff/email" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            background: 'var(--white)', 
            border: '1px solid var(--gray-100)', 
            borderRadius: 'var(--radius)', 
            padding: '1rem 1.25rem', 
            textDecoration: 'none', 
            color: 'var(--navy)', 
            fontWeight: 500, 
            fontSize: '0.875rem', 
            boxShadow: 'var(--shadow-xs)', 
            transition: 'var(--transition)' 
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-xs)'}
        >
          <i className="bi bi-send" style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
          Send Email
        </a>
      </div>
    </div>
  )
}

export default StaffDashboardPage