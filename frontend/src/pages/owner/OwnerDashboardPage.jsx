// ═══════════════════════════════════════════════════════════════════════════════
// OWNER DASHBOARD PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function StatCard({ icon, label, value, color = '', sub = '' }) {
  const getColorStyle = () => {
    switch(color) {
      case 'gold': return { borderBottom: '2px solid var(--color-gold)' }
      case 'navy': return { borderBottom: '2px solid var(--color-navy)' }
      default: return {}
    }
  }

  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-light-gray)',
      borderRadius: '10px',
      padding: '1.25rem',
      position: 'relative',
      transition: 'all var(--transition-base)',
      ...getColorStyle()
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        background: 'rgba(15,45,94,0.08)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.75rem'
      }}>
        <i className={`bi ${icon}`} style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}></i>
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-navy)' }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

export default function OwnerDashboardPage() {
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
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading dashboard...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Owner Dashboard</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Welcome back, {user?.first_name || user?.company || user?.username || 'Owner'}</p>
        </div>
        <Link to="/owner/aircraft" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          background: 'var(--color-navy)',
          color: 'var(--color-white)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy-mid)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-navy)' }}>
          <i className="bi bi-airplane"></i> Manage Fleet
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {quickActions.map(action => (
          <Link 
            key={action.to} 
            to={action.to} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.25rem',
              background: 'var(--color-white)',
              border: '1px solid var(--color-light-gray)',
              borderRadius: '10px',
              textDecoration: 'none',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(15,45,94,0.08)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <i className={`bi ${action.icon}`} style={{ fontSize: '1.2rem', color: 'var(--color-gold)' }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.2rem' }}>{action.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{action.desc}</div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: 'var(--color-light-gray)', fontSize: '0.9rem' }}></i>
          </Link>
        ))}
      </div>

      {/* Maintenance Alerts */}
      {dash?.maintenance_alerts && dash.maintenance_alerts.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-exclamation-triangle" style={{ color: '#f59e0b' }}></i> Maintenance Alerts
            </h3>
            <Link to="/owner/maintenance" style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--color-navy)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dash.maintenance_alerts.slice(0, 5).map(m => (
              <div key={m.id} style={{
                padding: '0.75rem 1rem',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.2rem' }}>{m.aircraft_name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                    {m.maintenance_type} · Due: {formatDate(m.scheduled_date)}
                  </div>
                </div>
                <Link to={`/owner/maintenance/${m.id}`} style={{
                  padding: '0.3rem 0.7rem',
                  background: 'transparent',
                  color: '#f59e0b',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  textDecoration: 'none'
                }}>
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      {dash?.recent_bookings && dash.recent_bookings.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-calendar-check" style={{ color: 'var(--color-gold)' }}></i> Recent Bookings
            </h3>
            <Link to="/owner/bookings" style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--color-navy)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Reference</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Aircraft</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Client</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.recent_bookings.slice(0, 5).map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{String(b.reference).slice(0, 8)}…</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-dark-gray)' }}>{b.aircraft_name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.client_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{b.client_email}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{formatDate(b.departure_date)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(b.amount_usd)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.15rem 0.5rem',
                          background: b.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : b.status === 'completed' ? 'rgba(100,116,139,0.1)' : 'rgba(245,158,11,0.1)',
                          color: b.status === 'confirmed' ? '#22c55e' : b.status === 'completed' ? 'var(--color-mid-gray)' : '#f59e0b',
                          border: `1px solid ${b.status === 'confirmed' ? 'rgba(34,197,94,0.3)' : b.status === 'completed' ? 'rgba(100,116,139,0.2)' : 'rgba(245,158,11,0.3)'}`,
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 600
                        }}>
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
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '0.75rem 1rem', 
        background: 'rgba(15,92,164,0.08)', 
        border: '1px solid rgba(15,92,164,0.22)', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.8rem',
        color: 'var(--color-info)'
      }}>
        <i className="bi bi-lightbulb" style={{ fontSize: '1rem', color: 'var(--color-info)' }}></i>
        <div>
          <strong>Owner Tip:</strong> Keep your fleet information up to date to attract more bookings. Regular maintenance records improve client confidence.
        </div>
      </div>
    </div>
  )
}