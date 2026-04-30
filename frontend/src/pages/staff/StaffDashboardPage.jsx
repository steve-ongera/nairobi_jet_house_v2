// ═══════════════════════════════════════════════════════════════════════════════
// STAFF DASHBOARD PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
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

export function StaffDashboardPage() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const response = await adminAPI.overview()
        const data = response?.data || response
        setOverview(data)
        
        // Mock recent activity - replace with actual API call when available
        setRecentActivity([
          { id: 1, type: 'booking', message: 'New booking request from John Doe', time: '5 minutes ago' },
          { id: 2, type: 'inquiry', message: 'Inquiry from Sarah Smith about yacht charter', time: '1 hour ago' },
          { id: 3, type: 'booking', message: 'Flight NJH-123 confirmed', time: '3 hours ago' },
        ])
      } catch (err) {
        console.error('Failed to load staff dashboard:', err)
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

  const quickActions = [
    { 
      to: '/staff/bookings', 
      icon: 'bi-airplane', 
      title: 'Manage Bookings', 
      desc: 'View and process flight bookings',
      color: 'var(--navy)'
    },
    { 
      to: '/staff/inquiries', 
      icon: 'bi-envelope-open', 
      title: 'View Inquiries', 
      desc: 'Respond to customer inquiries',
      color: 'var(--navy)'
    },
    { 
      to: '/staff/email', 
      icon: 'bi-send', 
      title: 'Send Email', 
      desc: 'Compose and send customer emails',
      color: 'var(--navy)'
    },
    { 
      to: '/staff/operators', 
      icon: 'bi-building', 
      title: 'Manage Operators', 
      desc: 'Review operator listings and requests',
      color: 'var(--navy)'
    },
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
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-title">
          Welcome back, {user?.first_name || user?.username || 'Staff'}!
        </div>
        <div className="welcome-subtitle">
          Here's what's happening on the platform today
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard 
          icon="bi-currency-dollar" 
          label="Total Revenue" 
          value={formatCurrency(overview?.total_platform_revenue)} 
          color="gold"
        />
        <StatCard 
          icon="bi-percent" 
          label="Total Commissions" 
          value={formatCurrency(overview?.total_commissions)} 
        />
        <StatCard 
          icon="bi-people" 
          label="Active Members" 
          value={overview?.total_members ?? '—'} 
          color="navy"
        />
        <StatCard 
          icon="bi-exclamation-triangle" 
          label="Open Disputes" 
          value={overview?.open_disputes ?? '—'} 
          color={overview?.open_disputes > 0 ? 'red' : ''}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map(action => (
          <Link key={action.to} to={action.to} className="quick-action-card">
            <div className="quick-action-icon">
              <i className={`bi ${action.icon}`} />
            </div>
            <div className="quick-action-content">
              <div className="quick-action-title">{action.title}</div>
              <div className="quick-action-desc">{action.desc}</div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: 'var(--gray-300)', fontSize: '0.9rem' }} />
          </Link>
        ))}
      </div>

      {/* Recent Activity Section (Optional) */}
      {recentActivity.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div className="dash-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
            <div className="dash-header-left">
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Recent Activity</h3>
            </div>
            <Link to="/staff/activity" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-card">
            <div className="settings-card-body" style={{ padding: 0 }}>
              {recentActivity.map(activity => (
                <div key={activity.id} className="detail-item" style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="quick-action-icon" style={{ width: '32px', height: '32px' }}>
                      <i className={`bi ${activity.type === 'booking' ? 'bi-airplane' : 'bi-envelope'}`} style={{ fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--navy)' }}>{activity.message}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{activity.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Helpful Tips */}
      <div className="alert alert-info" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
        <i className="bi bi-lightbulb" />
        <div>
          <strong>Staff Tip:</strong> Need to process a refund or adjust a booking? Contact the admin team for assistance.
        </div>
      </div>
    </div>
  )
}

export default StaffDashboardPage