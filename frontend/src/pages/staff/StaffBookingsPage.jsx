// ═══════════════════════════════════════════════════════════════════════════════
// STAFF BOOKINGS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'in_flight', 'completed', 'cancelled']
const STATUS_COLOR = {
  inquiry: '#f59e0b',
  rfq_sent: '#0f2d5e',
  quoted: '#0f2d5e',
  confirmed: '#22c55e',
  in_flight: '#22c55e',
  completed: '#64748b',
  cancelled: '#ef4444'
}
const STATUS_LABEL = {
  inquiry: 'Inquiry',
  rfq_sent: 'RFQ Sent',
  quoted: 'Quoted',
  confirmed: 'Confirmed',
  in_flight: 'In Flight',
  completed: 'Completed',
  cancelled: 'Cancelled'
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
        maxWidth: '560px',
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

export default function StaffBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailModal, setDetailModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const response = await adminAPI.bookings(params)
      const data = response?.data || response
      setBookings(data.results || data || [])
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  const openDetail = (booking) => {
    setSelected(booking)
    setDetailModal(true)
  }

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

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'inquiry' || b.status === 'rfq_sent').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Flight Bookings</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>View and manage all flight booking requests</p>
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Bookings</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Pending</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.confirmed}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Confirmed</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#64748b' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }}></i>
            <input 
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s ease' }}
              placeholder="Guest name, email, reference..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
        </div>
        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Status</label>
          <select 
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            value={status} 
            onChange={e => setStatus(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s] || s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        {(search || status) && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>&nbsp;</label>
            <button 
              style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: 'var(--color-mid-gray)', fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => { setSearch(''); setStatus('') }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-mid-gray)'}
            >
              <i className="bi bi-x-lg"></i> Clear
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No bookings found.</p>
              {(search || status) && (
                <button 
                  style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => { setSearch(''); setStatus('') }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Guest</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Route</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Pax</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }} onClick={() => openDetail(b)}>
                      {String(b.reference || b.id).slice(0, 8)}…
                    </td>
                    <td style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => openDetail(b)}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.guest_name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{b.guest_email || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => openDetail(b)}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--color-navy)' }}>{b.origin_detail?.code || b.origin || '—'} → {b.destination_detail?.code || b.destination || '—'}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>{b.origin_detail?.city || ''} {b.destination_detail?.city ? `→ ${b.destination_detail.city}` : ''}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', whiteSpace: 'nowrap', color: 'var(--color-dark-gray)' }}>
                      {formatDate(b.departure_date)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{b.passenger_count || 1}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(b.quoted_price_usd)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Badge status={b.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openDetail(b)} 
                          title="View details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && bookings.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)', textAlign: 'center' }}>
          Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          {(search || status) && ' with current filters'}
        </div>
      )}

      {/* Booking Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-airplane"></i> Booking Details</>}>
        {selected && (
          <div>
            {/* Guest Section */}
            <div style={{ marginBottom: '1rem', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-person" style={{ marginRight: '0.5rem' }}></i> Guest Information
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Name</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{selected.guest_name || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Email</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{selected.guest_email || '—'}</span>
                </div>
                {selected.guest_phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Phone</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{selected.guest_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Flight Section */}
            <div style={{ marginBottom: '1rem', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-airplane" style={{ marginRight: '0.5rem' }}></i> Flight Details
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Reference</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{selected.reference}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Route</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{selected.origin_detail?.code || selected.origin} → {selected.destination_detail?.code || selected.destination}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Date</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{formatDate(selected.departure_date)}</span>
                </div>
                {selected.departure_time && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Time</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{selected.departure_time}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Passengers</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{selected.passenger_count || 1}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Trip Type</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{selected.trip_type || 'one_way'}</span>
                </div>
                {selected.return_date && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Return Date</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{formatDate(selected.return_date)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div style={{ marginBottom: '1rem', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-currency-dollar" style={{ marginRight: '0.5rem' }}></i> Pricing
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Quoted Price</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(selected.quoted_price_usd)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Status</span>
                  <span><Badge status={selected.status} /></span>
                </div>
              </div>
            </div>

            {/* Extras Section */}
            {(selected.catering_requested || selected.ground_transport_requested || selected.special_requests) && (
              <div style={{ marginBottom: '1rem', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                  <i className="bi bi-gift" style={{ marginRight: '0.5rem' }}></i> Special Requests
                </div>
                <div style={{ padding: '1rem' }}>
                  {selected.catering_requested && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Catering</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>Requested</span>
                    </div>
                  )}
                  {selected.ground_transport_requested && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Ground Transport</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>Requested</span>
                    </div>
                  )}
                  {selected.special_requests && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Special Requests</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)', textAlign: 'right', maxWidth: '250px' }}>{selected.special_requests}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div style={{ border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-clock" style={{ marginRight: '0.5rem' }}></i> Timeline
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Created</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{new Date(selected.created_at).toLocaleString()}</span>
                </div>
                {selected.updated_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>Last Updated</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{new Date(selected.updated_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}