// ═══════════════════════════════════════════════════════════════════════════════
// STAFF DASHBOARD PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function StatCard({ icon, label, value, color = '', sub = '' }) {
  const getColorStyle = () => {
    switch(color) {
      case 'gold': return { borderBottom: '2px solid var(--color-gold)' }
      case 'navy': return { borderBottom: '2px solid var(--color-navy)' }
      case 'red': return { borderBottom: '2px solid #ef4444' }
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

export default function StaffDashboardPage() {
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
      color: 'var(--color-navy)'
    },
    { 
      to: '/staff/inquiries', 
      icon: 'bi-envelope-open', 
      title: 'View Inquiries', 
      desc: 'Respond to customer inquiries',
      color: 'var(--color-navy)'
    },
    { 
      to: '/staff/email', 
      icon: 'bi-send', 
      title: 'Send Email', 
      desc: 'Compose and send customer emails',
      color: 'var(--color-navy)'
    },
    { 
      to: '/staff/operators', 
      icon: 'bi-building', 
      title: 'Manage Operators', 
      desc: 'Review operator listings and requests',
      color: 'var(--color-navy)'
    },
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
      {/* Welcome Section */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
          Welcome back, {user?.first_name || user?.username || 'Staff'}!
        </h2>
        <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>
          Here's what's happening on the platform today
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
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
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.2rem' }}>{action.title}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{action.desc}</div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: 'var(--color-light-gray)', fontSize: '0.9rem' }}></i>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      {recentActivity.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0 }}>Recent Activity</h3>
            <Link to="/staff/activity" style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--color-navy)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
            <div>
              {recentActivity.map(activity => (
                <div key={activity.id} style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'rgba(15,45,94,0.08)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className={`bi ${activity.type === 'booking' ? 'bi-airplane' : 'bi-envelope'}`} style={{ fontSize: '0.8rem', color: 'var(--color-gold)' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-navy)' }}>{activity.message}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>{activity.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Helpful Tips */}
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
          <strong>Staff Tip:</strong> Need to process a refund or adjust a booking? Contact the admin team for assistance.
        </div>
      </div>
    </div>
  )
}