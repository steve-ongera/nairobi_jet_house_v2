// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR BOOKINGS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

const STATUS_COLOR = {
  sent: '#f59e0b',
  accepted: '#22c55e',
  rejected: '#ef4444',
  in_service: '#0f2d5e',
  completed: '#64748b',
  disputed: '#ef4444'
}

const STATUS_LABEL = {
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  in_service: 'In Service',
  completed: 'Completed',
  disputed: 'Disputed'
}

function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  const label = STATUS_LABEL[status] || status?.replace(/_/g, ' ') || '—'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'capitalize'
    }}>
      {label}
    </span>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 20, 43, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-white)',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--color-light-gray)'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            color: 'var(--color-mid-gray)',
            padding: '0.25rem'
          }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Print a simple operator receipt/invoice for a confirmed booking ──────────
function printReceipt(bk, formatCurrency, formatDate) {
  const route = bk.route || {}
  const win = window.open('', '_blank', 'width=700,height=900')
  if (!win) return

  const html = `<!DOCTYPE html>
  <html><head><meta charset="UTF-8"><title>Receipt ${bk.booking_reference_short || bk.reference}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: Arial, Helvetica, sans-serif; }
    body { padding: 40px; color: #0a2540; }
    .header { text-align:center; border-bottom: 3px solid #c8a245; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; letter-spacing: 1px; }
    .header p { font-size: 11px; color: #6b7c93; margin-top: 4px; }
    .row { display:flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8edf2; font-size: 13px; }
    .label { color: #6b7c93; font-weight: 600; }
    .value { color: #0a2540; font-weight: 600; text-align: right; }
    .total { margin-top: 16px; padding: 14px; background: #0a2540; color: #fff; border-radius: 8px; display:flex; justify-content: space-between; font-size: 15px; font-weight: 700; }
    .footer { margin-top: 30px; text-align:center; font-size: 10px; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style></head>
  <body>
    <div class="header">
      <h1>NAIROBIJETHOUSE — OPERATOR RECEIPT</h1>
      <p>Booking Reference: ${bk.booking_reference_short || '—'} &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="row"><span class="label">Client</span><span class="value">${bk.guest_name_masked || '—'}</span></div>
    <div class="row"><span class="label">Client Email</span><span class="value">${bk.guest_email_masked || '—'}</span></div>
    <div class="row"><span class="label">Route</span><span class="value">${route.origin_code || '—'} → ${route.destination_code || '—'}</span></div>
    <div class="row"><span class="label">Departure</span><span class="value">${formatDate(bk.departure_date)}</span></div>
    ${bk.return_date ? `<div class="row"><span class="label">Return</span><span class="value">${formatDate(bk.return_date)}</span></div>` : ''}
    <div class="row"><span class="label">Passengers</span><span class="value">${bk.passenger_count ?? '—'}</span></div>
    <div class="row"><span class="label">Aircraft</span><span class="value">${bk.asset_label || '—'}</span></div>
    <div class="row"><span class="label">Status</span><span class="value">${STATUS_LABEL[bk.status] || bk.status}</span></div>
    <div class="total"><span>Your Payout</span><span>${formatCurrency(bk.operator_payout_usd)}</span></div>
    <div class="footer">This receipt is generated for the operator's records. NairobiJetHouse — Private Aviation, Nairobi, Kenya.</div>
    <script>window.onload = () => window.print();</script>
  </body></html>`

  win.document.write(html)
  win.document.close()
}

export default function OperatorBookingsPage() {
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
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading bookings...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Operator Bookings</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage and track your charter bookings</p>
        </div>
        <button onClick={load} style={{
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

      {/* Message Alert */}
      {message.text && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem 1rem', 
          background: message.type === 'success' ? 'rgba(26,127,90,0.08)' : 'rgba(192,57,43,0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(26,127,90,0.25)' : 'rgba(192,57,43,0.25)'}`,
          borderRadius: '6px',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Bookings</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Pending Action</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.accepted}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Accepted</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#64748b' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Completed</div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Total Earnings</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c9992e' }}>{formatCurrency(stats.totalEarnings)}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Pending Payouts</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>
            {formatCurrency(bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.operator_payout_usd) || 0), 0))}
          </div>
        </div>
      </div>

      {/* Pending Confirmations Section */}
      {pendingBookings.length > 0 && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-bell" style={{ color: 'var(--color-gold)' }}></i> Awaiting Your Confirmation ({pendingBookings.length})
            </h4>
          </div>
          <div>
            {pendingBookings.map(bk => (
              <div key={bk.id} style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--color-light-gray)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                    Booking {bk.booking_reference_short || String(bk.reference).slice(0, 8).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
                    {bk.guest_name_masked ? `${bk.guest_name_masked} · ` : ''}{bk.asset_label || bk.asset_type} · Payout: {formatCurrency(bk.operator_payout_usd)}
                  </div>
                  {bk.route && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-mid-gray)' }}>
                      {bk.route.origin_code} → {bk.route.destination_code} · {formatDate(bk.departure_date)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Badge status={bk.status} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAccept(bk.id)}
                      disabled={processing === bk.id}
                      style={{
                        padding: '0.3rem 0.8rem',
                        background: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <i className="bi bi-check-lg"></i> Accept
                    </button>
                    <button
                      onClick={() => handleReject(bk.id)}
                      disabled={processing === bk.id}
                      style={{
                        padding: '0.3rem 0.8rem',
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <i className="bi bi-x-lg"></i> Reject
                    </button>
                    <button
                      onClick={() => openDetail(bk)}
                      style={{
                        padding: '0.3rem 0.8rem',
                        background: 'transparent',
                        color: 'var(--color-navy)',
                        border: '1px solid var(--color-navy)',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <i className="bi bi-eye"></i> Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Bookings Section (accepted / in_service / completed) — masked client details + receipt */}
      {(acceptedBookings.length > 0 || completedBookings.length > 0 || otherBookings.length > 0) && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-check-circle" style={{ color: '#22c55e' }}></i> Confirmed Bookings ({acceptedBookings.length + completedBookings.length + otherBookings.length})
            </h4>
          </div>
          <div>
            {[...acceptedBookings, ...otherBookings, ...completedBookings].map(bk => (
              <div key={bk.id} style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--color-light-gray)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem' }}>
                      Booking {bk.booking_reference_short || String(bk.reference).slice(0, 8).toUpperCase()}
                    </span>
                    <Badge status={bk.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
                    Client: {bk.guest_name_masked || '—'} · {bk.guest_email_masked || '—'}
                  </div>
                  {bk.route && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
                      {bk.route.origin_code} → {bk.route.destination_code} · {formatDate(bk.departure_date)}
                      {bk.return_date ? ` – ${formatDate(bk.return_date)}` : ''}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
                    Aircraft: {bk.asset_label || '—'} · Payout: <strong style={{ color: 'var(--color-navy)' }}>{formatCurrency(bk.operator_payout_usd)}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => printReceipt(bk, formatCurrency, formatDate)}
                    style={{
                      padding: '0.3rem 0.8rem',
                      background: '#0f2d5e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <i className="bi bi-printer"></i> Print Receipt
                  </button>
                  <button
                    onClick={() => openDetail(bk)}
                    style={{
                      padding: '0.3rem 0.8rem',
                      background: 'transparent',
                      color: 'var(--color-navy)',
                      border: '1px solid var(--color-navy)',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <i className="bi bi-eye"></i> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Bookings Section */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-list-ul" style={{ color: 'var(--color-gold)' }}></i> All Bookings
          </h4>
        </div>
        <div>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="bi bi-calendar-x" style={{ fontSize: '2rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '0.5rem' }}></i>
              <p style={{ color: 'var(--color-mid-gray)' }}>No bookings assigned to you yet.</p>
            </div>
          ) : (
            bookings.map(bk => (
              <div 
                key={bk.id} 
                onClick={() => openDetail(bk)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--color-light-gray)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-off-white)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                    Booking {bk.booking_reference_short || String(bk.reference).slice(0, 8).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
                    {bk.asset_label || bk.asset_type} · {formatCurrency(bk.operator_payout_usd)} · {formatDate(bk.created_at)}
                  </div>
                  {bk.operator_reference && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)', marginTop: '0.15rem' }}>
                      Your Ref: {bk.operator_reference}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Badge status={bk.status} />
                  <i className="bi bi-chevron-right" style={{ color: 'var(--color-light-gray)' }}></i>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-calendar-check"></i> Booking Details</>}>
        {selectedBooking && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Reference</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--color-dark-gray)' }}>{selectedBooking.booking_reference_short || selectedBooking.reference}</div>
            </div>
            {selectedBooking.guest_name_masked && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Client</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedBooking.guest_name_masked} · {selectedBooking.guest_email_masked}</div>
              </div>
            )}
            {selectedBooking.route && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Route</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedBooking.route.origin_code} → {selectedBooking.route.destination_code}</div>
              </div>
            )}
            {selectedBooking.departure_date && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Departure Date</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{formatDate(selectedBooking.departure_date)}</div>
              </div>
            )}
            {selectedBooking.return_date && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Return Date</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{formatDate(selectedBooking.return_date)}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Asset</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedBooking.asset_label || '—'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Payout Amount</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(selectedBooking.operator_payout_usd)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Status</div>
              <div><Badge status={selectedBooking.status} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Created</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selectedBooking.created_at).toLocaleString()}</div>
            </div>
            {selectedBooking.operator_reference && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Your Reference</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedBooking.operator_reference}</div>
              </div>
            )}
            {selectedBooking.rejection_reason && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Rejection Reason</div>
                <div style={{ color: '#ef4444' }}>{selectedBooking.rejection_reason}</div>
              </div>
            )}

            {selectedBooking.status === 'sent' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Quick Actions</div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      style={{
                        padding: '0.3rem 0.8rem',
                        background: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        handleAccept(selectedBooking.id)
                        setDetailModal(false)
                      }}
                    >
                      <i className="bi bi-check-lg"></i> Accept
                    </button>
                    <button 
                      style={{
                        padding: '0.3rem 0.8rem',
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        handleReject(selectedBooking.id)
                        setDetailModal(false)
                      }}
                    >
                      <i className="bi bi-x-lg"></i> Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-light-gray)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => printReceipt(selectedBooking, formatCurrency, formatDate)}
                  style={{
                    padding: '0.4rem 1rem',
                    background: '#0f2d5e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <i className="bi bi-printer"></i> Print Receipt
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}