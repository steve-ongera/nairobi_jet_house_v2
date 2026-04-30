// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER DASHBOARD PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { membershipAPI, bookingAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function StatCard({ icon, label, value, color = '' }) {
  return (
    <div className={`stat-card${color ? ' ' + color : ''}`}>
      <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
    </div>
  )
}

export function MemberDashboardPage() {
  const { user } = useAuth()
  const [membership, setMembership] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [membershipRes, bookingsRes] = await Promise.all([
          membershipAPI.my(),
          bookingAPI.byEmail(user?.email)
        ])
        setMembership(membershipRes?.data || membershipRes)
        setRecentBookings(bookingsRes?.data?.results || bookingsRes?.data || [])
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const quickActions = [
    { to: '/member/book', icon: 'bi-airplane', label: 'Book a Flight', desc: 'Search and book private charters' },
    { to: '/member/fleet', icon: 'bi-airplane-fill', label: 'Browse Fleet', desc: 'View available aircraft' },
    { to: '/member/routes', icon: 'bi-geo-alt', label: 'Saved Routes', desc: 'Manage your favorite routes' },
    { to: '/member/profile', icon: 'bi-person', label: 'My Profile', desc: 'Update personal information' },
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
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Member Dashboard</h2>
          <p>Welcome back, {user?.first_name || user?.username || 'Member'}!</p>
        </div>
      </div>

      {/* Membership Banner */}
      <div className="membership-banner">
        <div className="membership-banner-content">
          <div className="membership-tier">
            <i className="bi bi-star-fill" />
            {membership?.tier || 'Standard'} Member
          </div>
          <div className="membership-benefits">
            {membership?.tier === 'Gold' && (
              <>
                <span>✓ Priority Support</span>
                <span>✓ 10% Off All Flights</span>
                <span>✓ Lounge Access</span>
              </>
            )}
            {membership?.tier === 'Platinum' && (
              <>
                <span>✓ 24/7 Dedicated Concierge</span>
                <span>✓ 15% Off All Flights</span>
                <span>✓ Complimentary Upgrades</span>
              </>
            )}
            {membership?.tier === 'Standard' && (
              <>
                <span>✓ Best Rates Guaranteed</span>
                <span>✓ Flexible Booking</span>
                <span>✓ 24/7 Support</span>
              </>
            )}
          </div>
        </div>
        <Link to="/member/upgrade" className="btn btn-gold btn-sm">
          Upgrade Membership
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard icon="bi-airplane" label="Total Flights" value={recentBookings.length} color="navy" />
        <StatCard icon="bi-star" label="Member Since" value={membership?.joined_date?.slice(0, 4) || '2024'} />
        <StatCard icon="bi-gem" label="Points Balance" value={membership?.points || 0} color="gold" />
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
            <i className="bi bi-chevron-right" style={{ color: 'var(--gray-300)' }} />
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div className="settings-card">
          <div className="settings-card-header">
            <h4><i className="bi bi-clock-history" /> Recent Bookings</h4>
            <Link to="/member/bookings" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="settings-card-body" style={{ padding: 0 }}>
            {recentBookings.slice(0, 5).map(booking => (
              <div key={booking.id} className="booking-item">
                <div className="booking-item-left">
                  <div className="booking-reference">
                    Booking {String(booking.reference).slice(0, 8).toUpperCase()}
                  </div>
                  <div className="booking-details">
                    {booking.origin} → {booking.destination} · {formatDate(booking.departure_date)}
                  </div>
                </div>
                <div className="booking-item-right">
                  <span className={`badge badge-${booking.status === 'confirmed' ? 'green' : 'amber'}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Tip */}
      <div className="alert alert-info" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
        <i className="bi bi-lightbulb" />
        <div>
          <strong>Member Tip:</strong> Save your favorite routes to book faster. Gold and Platinum members enjoy exclusive benefits and priority booking.
        </div>
      </div>
    </div>
  )
}

export default MemberDashboardPage