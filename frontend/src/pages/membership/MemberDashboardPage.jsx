// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER DASHBOARD PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { membershipAPI, bookingAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function StatCard({ icon, label, value, color = '' }) {
  const getColorStyle = () => {
    switch(color) {
      case 'navy': return { borderBottom: '2px solid var(--color-navy)' }
      case 'gold': return { borderBottom: '2px solid var(--color-gold)' }
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
    </div>
  )
}

export default function MemberDashboardPage() {
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Member Dashboard</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Welcome back, {user?.first_name || user?.username || 'Member'}!</p>
        </div>
      </div>

      {/* Membership Banner */}
      <div style={{
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light) 100%)',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <i className="bi bi-star-fill" style={{ color: 'var(--color-gold)', fontSize: '1rem' }}></i>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-gold-light)' }}>{membership?.tier || 'Standard'} Member</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {membership?.tier === 'Gold' && (
              <>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ Priority Support</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ 10% Off All Flights</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ Lounge Access</span>
              </>
            )}
            {membership?.tier === 'Platinum' && (
              <>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ 24/7 Dedicated Concierge</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ 15% Off All Flights</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ Complimentary Upgrades</span>
              </>
            )}
            {(!membership?.tier || membership?.tier === 'Standard') && (
              <>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ Best Rates Guaranteed</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ Flexible Booking</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>✓ 24/7 Support</span>
              </>
            )}
          </div>
        </div>
        <Link to="/member/upgrade" style={{
          padding: '0.4rem 1rem',
          background: 'var(--color-gold)',
          color: 'var(--color-navy-dark)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 600,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          Upgrade Membership
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon="bi-airplane" label="Total Flights" value={recentBookings.length} color="navy" />
        <StatCard icon="bi-star" label="Member Since" value={membership?.joined_date?.slice(0, 4) || '2024'} />
        <StatCard icon="bi-gem" label="Points Balance" value={membership?.points || 0} color="gold" />
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

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-clock-history" style={{ color: 'var(--color-gold)' }}></i> Recent Bookings
            </h4>
            <Link to="/member/bookings" style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--color-navy)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div>
            {recentBookings.slice(0, 5).map(booking => {
              const statusColor = booking.status === 'confirmed' ? '#22c55e' : '#f59e0b'
              const statusLabel = booking.status === 'confirmed' ? 'Confirmed' : booking.status || 'Pending'
              return (
                <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                      Booking {String(booking.reference).slice(0, 8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                      {booking.origin} → {booking.destination} · {formatDate(booking.departure_date)}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.2rem 0.6rem',
                      background: `${statusColor}15`,
                      color: statusColor,
                      border: `1px solid ${statusColor}30`,
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              )
            })}
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
          <strong>Member Tip:</strong> Save your favorite routes to book faster. Gold and Platinum members enjoy exclusive benefits and priority booking.
        </div>
      </div>
    </div>
  )
}