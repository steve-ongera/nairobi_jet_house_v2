// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR DASHBOARD PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { operatorAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function StatCard({ icon, label, value, color = '', to, sub = '' }) {
  const getColorStyle = () => {
    switch(color) {
      case 'gold': return { borderBottom: '2px solid var(--color-gold)' }
      case 'navy': return { borderBottom: '2px solid var(--color-navy)' }
      case 'green': return { borderBottom: '2px solid #22c55e' }
      case 'amber': return { borderBottom: '2px solid #f59e0b' }
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
      {to && (
        <Link to={to} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginTop: '0.75rem',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--color-gold)',
          textDecoration: 'none'
        }}>
          View <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
        </Link>
      )}
    </div>
  )
}

function ActionCard({ title, subtitle, buttonText, buttonLink, buttonColor = 'navy' }) {
  const getButtonStyle = () => {
    switch(buttonColor) {
      case 'navy':
        return {
          background: 'var(--color-navy)',
          color: 'var(--color-white)',
          border: 'none'
        }
      case 'gold':
        return {
          background: 'var(--color-gold)',
          color: 'var(--color-navy-dark)',
          border: 'none'
        }
      case 'outline-navy':
        return {
          background: 'transparent',
          color: 'var(--color-navy)',
          border: '1.5px solid var(--color-navy)'
        }
      default:
        return {
          background: 'var(--color-navy)',
          color: 'var(--color-white)',
          border: 'none'
        }
    }
  }

  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-light-gray)',
      borderRadius: '10px',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
      transition: 'all var(--transition-base)'
    }}>
      <div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.2rem' }}>{title}</h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)', margin: 0 }}>{subtitle}</p>
      </div>
      <Link to={buttonLink} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.9rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'all var(--transition-fast)',
        ...getButtonStyle()
      }}>
        {buttonText} <i className="bi bi-arrow-right" style={{ fontSize: '0.7rem' }}></i>
      </Link>
    </div>
  )
}

export default function OperatorDashboardPage() {
  const { user } = useAuth()
  const [bids, setBids] = useState([])
  const [bookings, setBookings] = useState([])
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [bidsRes, bookingsRes, aircraftRes] = await Promise.all([
        operatorAPI.rfqBids({ status: 'submitted' }),
        operatorAPI.opBookings({ status: 'sent' }),
        operatorAPI.myAircraft(),
      ])
      
      const bidsData = bidsRes?.data?.results || bidsRes?.data || bidsRes || []
      const bookingsData = bookingsRes?.data?.results || bookingsRes?.data || bookingsRes || []
      const aircraftData = aircraftRes?.data?.results || aircraftRes?.data || aircraftRes || []
      
      setBids(bidsData)
      setBookings(bookingsData)
      setAircraft(aircraftData)
    } catch (err) {
      console.error('Failed to load operator dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const pendingAircraft = aircraft.filter(a => !a.is_approved).length
  const activeAircraft = aircraft.filter(a => a.status === 'available' || a.status === 'active').length
  const totalEarnings = bookings.reduce((sum, b) => sum + (Number(b.operator_payout_usd) || 0), 0)

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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Operator Dashboard</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Welcome back, {user?.first_name || user?.company || user?.username || 'Operator'}</p>
        </div>
        <button onClick={loadData} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          background: 'transparent',
          color: 'var(--color-navy)',
          border: '1.5px solid var(--color-navy)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.color = 'var(--color-white)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-navy)' }}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard 
          icon="bi-file-text" 
          label="Open RFQs" 
          value={bids.length} 
          color="gold"
          to="/operator/rfq"
          sub="Ready to bid"
        />
        <StatCard 
          icon="bi-calendar-check" 
          label="Pending Bookings" 
          value={bookings.length} 
          color="navy"
          to="/operator/bookings"
          sub="Awaiting confirmation"
        />
        <StatCard 
          icon="bi-airplane" 
          label="Active Aircraft" 
          value={activeAircraft} 
          color="green"
          to="/operator/aircraft"
          sub="Available for charter"
        />
        <StatCard 
          icon="bi-clock-history" 
          label="Pending Approval" 
          value={pendingAircraft} 
          color={pendingAircraft > 0 ? 'amber' : ''}
          to="/operator/aircraft"
          sub={pendingAircraft > 0 ? 'Awaiting NJH review' : 'All approved'}
        />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <ActionCard 
          title="Submit New Aircraft"
          subtitle="Add aircraft to your fleet for charter"
          buttonText="Add Aircraft"
          buttonLink="/operator/aircraft"
          buttonColor="navy"
        />
        <ActionCard 
          title="View RFQ Requests"
          subtitle="Review and bid on open requests"
          buttonText="View RFQs"
          buttonLink="/operator/rfq"
          buttonColor="gold"
        />
        <ActionCard 
          title="Manage Availability"
          subtitle="Update your fleet availability calendar"
          buttonText="Update"
          buttonLink="/operator/availability"
          buttonColor="outline-navy"
        />
        <ActionCard 
          title="Payout History"
          subtitle={`Total earned: ${formatCurrency(totalEarnings)}`}
          buttonText="View Payouts"
          buttonLink="/operator/payouts"
          buttonColor="outline-navy"
        />
      </div>

      {/* Open RFQs Section */}
      {bids.length > 0 && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-file-text" style={{ color: 'var(--color-gold)' }}></i> Open RFQs — Action Required
            </h4>
            <Link to="/operator/rfq" style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--color-navy)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div>
            {bids.slice(0, 5).map(bid => (
              <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--color-navy)', fontSize: '0.85rem' }}>Booking #{String(bid.booking).slice(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>Status: {bid.status} · Valid until: {formatDate(bid.valid_until)}</div>
                </div>
                <Link to="/operator/rfq" style={{
                  padding: '0.3rem 0.8rem',
                  background: 'var(--color-navy)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  Respond <i className="bi bi-send" style={{ fontSize: '0.7rem' }}></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Bookings Section */}
      {bookings.length > 0 && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-calendar-check" style={{ color: 'var(--color-gold)' }}></i> Dispatched Bookings — Awaiting Confirmation
            </h4>
            <Link to="/operator/bookings" style={{ padding: '0.25rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--color-navy)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              View All <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div>
            {bookings.slice(0, 5).map(bk => (
              <div key={bk.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--color-navy)', fontSize: '0.85rem' }}>Booking {String(bk.reference).slice(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>Payout: {formatCurrency(bk.operator_payout_usd)} · {bk.departure_date ? formatDate(bk.departure_date) : ''}</div>
                </div>
                <Link to="/operator/bookings" style={{
                  padding: '0.3rem 0.8rem',
                  background: 'var(--color-navy)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  Review <i className="bi bi-eye" style={{ fontSize: '0.7rem' }}></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bids.length === 0 && bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', marginTop: '2rem' }}>
          <i className="bi bi-check-circle" style={{ color: '#22c55e', fontSize: '3rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-navy)', marginTop: '1rem', marginBottom: '0.5rem' }}>All Caught Up! ✅</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>No pending actions at the moment. Your dashboard is clean.</p>
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
          <strong>Operator Tip:</strong> Keep your aircraft availability up to date to receive more RFQ requests. 
          Responding quickly to RFQs increases your chances of winning bookings.
        </div>
      </div>
    </div>
  )
}