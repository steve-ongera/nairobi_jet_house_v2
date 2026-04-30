// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR BOOKINGS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

function Badge({ s, type = 'status' }) {
  const STATUS_COLOR = {
    sent: 'amber',
    accepted: 'green',
    rejected: 'red',
    in_service: 'navy',
    completed: 'gray',
    disputed: 'red'
  }
  const colorClass = STATUS_COLOR[s] || 'gray'
  const displayText = s?.replace(/_/g, ' ') || '—'
  return <span className={`badge badge-${colorClass}`}>{displayText}</span>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function OperatorBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await operatorAPI.opBookings()
      const data = response?.data?.results || response?.data || response || []
      setBookings(data)
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAccept = async (id) => {
    const operatorRef = prompt('Enter your internal booking reference (optional):')
    setProcessing(id)
    setMessage({ text: '', type: '' })
    try {
      await operatorAPI.acceptBooking(id, { operator_reference: operatorRef || '' })
      setMessage({ text: 'Booking accepted successfully!', type: 'success' })
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to accept booking.', type: 'error' })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (required):')
    if (!reason) return
    
    setProcessing(id)
    setMessage({ text: '', type: '' })
    try {
      await operatorAPI.rejectBooking(id, { rejection_reason: reason })
      setMessage({ text: 'Booking rejected.', type: 'success' })
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to reject booking.', type: 'error' })
    } finally {
      setProcessing(null)
    }
  }

  const openDetail = (booking) => {
    setSelectedBooking(booking)
    setDetailModal(true)
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '—'
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

  const pendingBookings = bookings.filter(b => b.status === 'sent')
  const acceptedBookings = bookings.filter(b => b.status === 'accepted')
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const otherBookings = bookings.filter(b => b.status !== 'sent' && b.status !== 'accepted' && b.status !== 'completed')

  const stats = {
    total: bookings.length,
    pending: pendingBookings.length,
    accepted: acceptedBookings.length,
    completed: completedBookings.length,
    totalEarnings: bookings.reduce((sum, b) => sum + (Number(b.operator_payout_usd) || 0), 0)
  }

  if (loading) {
    return (
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading bookings...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Operator Bookings</h2>
          <p>Manage and track your charter bookings</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="operator-stats">
        <div className="operator-stat-card">
          <div className="operator-stat-number">{stats.total}</div>
          <div className="operator-stat-label">Total Bookings</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--amber)' }}>{stats.pending}</div>
          <div className="operator-stat-label">Pending Action</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--green)' }}>{stats.accepted}</div>
          <div className="operator-stat-label">Accepted</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--gray-500)' }}>{stats.completed}</div>
          <div className="operator-stat-label">Completed</div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="payout-summary" style={{ marginBottom: '1.5rem' }}>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Total Earnings</div>
          <div className="payout-summary-value" style={{ color: 'var(--gold)' }}>
            {formatCurrency(stats.totalEarnings)}
          </div>
        </div>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Pending Payouts</div>
          <div className="payout-summary-value">
            {formatCurrency(bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.operator_payout_usd) || 0), 0))}
          </div>
        </div>
      </div>

      {/* Pending Confirmations Section */}
      {pendingBookings.length > 0 && (
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <div className="settings-card-header">
            <h4><i className="bi bi-bell" /> Awaiting Your Confirmation ({pendingBookings.length})</h4>
          </div>
          <div className="settings-card-body" style={{ padding: 0 }}>
            {pendingBookings.map(bk => (
              <div key={bk.id} className="booking-pending-card">
                <div className="booking-pending-header">
                  <div>
                    <div className="booking-reference">
                      Booking {String(bk.reference).slice(0, 8).toUpperCase()}
                    </div>
                    <div className="booking-details">
                      {bk.asset_label || bk.asset_type} · Payout: {formatCurrency(bk.operator_payout_usd)}
                    </div>
                    <div className="booking-date">
                      Created: {formatDate(bk.created_at)}
                    </div>
                  </div>
                  <Badge s={bk.status} />
                </div>
                <div className="booking-actions">
                  <button
                    onClick={() => handleAccept(bk.id)}
                    disabled={processing === bk.id}
                    className="btn btn-green btn-sm"
                  >
                    <i className="bi bi-check-lg" /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(bk.id)}
                    disabled={processing === bk.id}
                    className="btn btn-outline-red btn-sm"
                  >
                    <i className="bi bi-x-lg" /> Reject
                  </button>
                  <button
                    onClick={() => openDetail(bk)}
                    className="btn btn-outline-navy btn-sm"
                  >
                    <i className="bi bi-eye" /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Bookings Section */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h4><i className="bi bi-list-ul" /> All Bookings</h4>
        </div>
        <div className="settings-card-body" style={{ padding: 0 }}>
          {bookings.length === 0 ? (
            <div className="table-empty" style={{ padding: '2rem' }}>
              <i className="bi bi-calendar-x" />
              <p>No bookings assigned to you yet.</p>
            </div>
          ) : (
            bookings.map(bk => (
              <div key={bk.id} className="booking-item" onClick={() => openDetail(bk)}>
                <div className="booking-item-left">
                  <div className="booking-reference">
                    Booking {String(bk.reference).slice(0, 8).toUpperCase()}
                  </div>
                  <div className="booking-details">
                    {bk.asset_label || bk.asset_type} · {formatCurrency(bk.operator_payout_usd)} · {formatDate(bk.created_at)}
                  </div>
                  {bk.operator_reference && (
                    <div className="booking-ref-note">
                      Your Ref: {bk.operator_reference}
                    </div>
                  )}
                </div>
                <div className="booking-item-right">
                  <Badge s={bk.status} />
                  <i className="bi bi-chevron-right" style={{ color: 'var(--gray-300)' }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-calendar-check" /> Booking Details</>}>
        {selectedBooking && (
          <div>
            <div className="detail-row">
              <div className="detail-key">Reference</div>
              <div className="detail-val" style={{ fontFamily: 'monospace' }}>{selectedBooking.reference}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Asset Type</div>
              <div className="detail-val">{selectedBooking.asset_label || selectedBooking.asset_type || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Payout Amount</div>
              <div className="detail-val td-price">{formatCurrency(selectedBooking.operator_payout_usd)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Status</div>
              <div className="detail-val"><Badge s={selectedBooking.status} /></div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Created</div>
              <div className="detail-val">{new Date(selectedBooking.created_at).toLocaleString()}</div>
            </div>
            {selectedBooking.departure_date && (
              <div className="detail-row">
                <div className="detail-key">Departure Date</div>
                <div className="detail-val">{formatDate(selectedBooking.departure_date)}</div>
              </div>
            )}
            {selectedBooking.operator_reference && (
              <div className="detail-row">
                <div className="detail-key">Your Reference</div>
                <div className="detail-val">{selectedBooking.operator_reference}</div>
              </div>
            )}
            {selectedBooking.rejection_reason && (
              <div className="detail-row">
                <div className="detail-key">Rejection Reason</div>
                <div className="detail-val" style={{ color: 'var(--red)' }}>{selectedBooking.rejection_reason}</div>
              </div>
            )}
            {selectedBooking.status === 'sent' && (
              <div className="detail-row" style={{ marginTop: '1rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
                <div className="detail-key">Quick Actions</div>
                <div className="detail-val">
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-green btn-sm"
                      onClick={() => {
                        handleAccept(selectedBooking.id)
                        setDetailModal(false)
                      }}
                    >
                      <i className="bi bi-check-lg" /> Accept
                    </button>
                    <button 
                      className="btn btn-outline-red btn-sm"
                      onClick={() => {
                        handleReject(selectedBooking.id)
                        setDetailModal(false)
                      }}
                    >
                      <i className="bi bi-x-lg" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OperatorBookingsPage