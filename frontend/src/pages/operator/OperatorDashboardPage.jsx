// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR DASHBOARD PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { operatorAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

function StatCard({ icon, label, value, color = '', to, sub = '' }) {
  return (
    <div className={`stat-card${color ? ' ' + color : ''}`}>
      <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {sub && <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>{sub}</div>}
      {to && (
        <Link to={to} className="stat-link">
          View <i className="bi bi-chevron-right" />
        </Link>
      )}
    </div>
  )
}

function ActionCard({ title, subtitle, buttonText, buttonLink, buttonColor = 'navy' }) {
  return (
    <div className="action-card">
      <div className="action-card-content">
        <h4 className="action-card-title">{title}</h4>
        <p className="action-card-subtitle">{subtitle}</p>
      </div>
      <Link to={buttonLink} className={`btn btn-${buttonColor} btn-sm`}>
        {buttonText} <i className="bi bi-arrow-right" />
      </Link>
    </div>
  )
}

export function OperatorDashboardPage() {
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
          <h2>Operator Dashboard</h2>
          <p>Welcome back, {user?.first_name || user?.company || user?.username || 'Operator'}</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={loadData}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
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
      <div className="quick-actions" style={{ marginBottom: '2rem' }}>
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
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <div className="settings-card-header">
            <h4><i className="bi bi-file-text" /> Open RFQs — Action Required</h4>
            <Link to="/operator/rfq" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="settings-card-body" style={{ padding: 0 }}>
            {bids.slice(0, 5).map(bid => (
              <div key={bid.id} className="detail-item" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div className="td-name">Booking #{String(bid.booking).slice(0, 8).toUpperCase()}</div>
                  <div className="td-email">
                    Status: {bid.status} · Valid until: {formatDate(bid.valid_until)}
                  </div>
                </div>
                <Link to="/operator/rfq" className="btn btn-navy btn-sm">
                  Respond <i className="bi bi-send" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Bookings Section */}
      {bookings.length > 0 && (
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <div className="settings-card-header">
            <h4><i className="bi bi-calendar-check" /> Dispatched Bookings — Awaiting Confirmation</h4>
            <Link to="/operator/bookings" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="settings-card-body" style={{ padding: 0 }}>
            {bookings.slice(0, 5).map(bk => (
              <div key={bk.id} className="detail-item" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div className="td-name">Booking {String(bk.reference).slice(0, 8).toUpperCase()}</div>
                  <div className="td-email">
                    Payout: {formatCurrency(bk.operator_payout_usd)} · {bk.departure_date ? formatDate(bk.departure_date) : ''}
                  </div>
                </div>
                <Link to="/operator/bookings" className="btn btn-navy btn-sm">
                  Review <i className="bi bi-eye" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bids.length === 0 && bookings.length === 0 && (
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <i className="bi bi-check-circle" style={{ color: 'var(--green)', fontSize: '3rem' }} />
          <h3>All Caught Up! ✅</h3>
          <p>No pending actions at the moment. Your dashboard is clean.</p>
        </div>
      )}

      {/* Helpful Tip */}
      <div className="alert alert-info" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
        <i className="bi bi-lightbulb" />
        <div>
          <strong>Operator Tip:</strong> Keep your aircraft availability up to date to receive more RFQ requests. 
          Responding quickly to RFQs increases your chances of winning bookings.
        </div>
      </div>
    </div>
  )
}

export default OperatorDashboardPage