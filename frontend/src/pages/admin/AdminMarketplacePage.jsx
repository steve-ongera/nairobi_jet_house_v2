// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MARKETPLACE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['pending', 'confirmed', 'in_flight', 'completed', 'cancelled', 'disputed']
const STATUS_COLOR = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  in_flight: '#22c55e',
  completed: '#64748b',
  cancelled: '#ef4444',
  disputed: '#ef4444'
}
const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_flight: 'In Flight',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed'
}

function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  const label = STATUS_LABEL[status] || status?.replace(/_/g, ' ')
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

function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  
  const width = size === 'lg' ? '720px' : size === 'md' ? '520px' : '380px'
  
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
        maxWidth: width,
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

export default function AdminMarketplacePage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [updateModal, setUpdateModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateErr, setUpdateErr] = useState('')
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_commission: 0,
    pending_count: 0,
    completed_count: 0
  })
  
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: ''
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const response = await adminAPI.marketplace(params)
      const data = response?.data || response
      const bookingsData = data.results || data || []
      setBookings(bookingsData)
      
      const totals = bookingsData.reduce((acc, b) => {
        acc.total_revenue += Number(b.gross_amount_usd) || 0
        acc.total_commission += Number(b.commission_usd) || 0
        if (b.status === 'pending') acc.pending_count++
        if (b.status === 'completed') acc.completed_count++
        return acc
      }, { total_revenue: 0, total_commission: 0, pending_count: 0, completed_count: 0 })
      
      setStats(totals)
    } catch (err) {
      console.error('Failed to load marketplace bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  const openDetail = (b) => {
    setSelected(b)
    setDetailModal(true)
  }

  const openUpdateStatus = (b) => {
    setSelected(b)
    setStatusForm({
      status: b.status,
      notes: ''
    })
    setUpdateErr('')
    setUpdateModal(true)
  }

  const updateStatus = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setUpdateErr('')
    try {
      await adminAPI.updateMktStatus(selected.id, statusForm)
      await load()
      setUpdateModal(false)
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.detail || data?.message || 'Failed to update status'
      setUpdateErr(msg)
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (value) => {
    if (!value || value === 0) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusCount = (statusType) => {
    return bookings.filter(b => b.status === statusType).length
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Marketplace Bookings</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Member bookings from listed aircraft fleet</p>
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

      {/* Revenue Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Total Revenue</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{formatCurrency(stats.total_revenue)}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Total Commission Earned</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-gold)' }}>{formatCurrency(stats.total_commission)}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Pending Bookings</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending_count}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Completed Bookings</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.completed_count}</div>
        </div>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-light-gray)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setStatus('')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.8rem',
            background: !status ? 'var(--color-navy)' : 'transparent',
            color: !status ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="bi bi-grid-3x3"></i> All ({bookings.length})
        </button>
        <button 
          onClick={() => setStatus('pending')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.8rem',
            background: status === 'pending' ? 'var(--color-navy)' : 'transparent',
            color: status === 'pending' ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-clock-history"></i> Pending ({getStatusCount('pending')})
        </button>
        <button 
          onClick={() => setStatus('confirmed')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.8rem',
            background: status === 'confirmed' ? 'var(--color-navy)' : 'transparent',
            color: status === 'confirmed' ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-check-circle"></i> Confirmed ({getStatusCount('confirmed')})
        </button>
        <button 
          onClick={() => setStatus('in_flight')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.8rem',
            background: status === 'in_flight' ? 'var(--color-navy)' : 'transparent',
            color: status === 'in_flight' ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-airplane"></i> In Flight ({getStatusCount('in_flight')})
        </button>
        <button 
          onClick={() => setStatus('completed')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.8rem',
            background: status === 'completed' ? 'var(--color-navy)' : 'transparent',
            color: status === 'completed' ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-check-lg"></i> Completed ({getStatusCount('completed')})
        </button>
        <button 
          onClick={() => setStatus('cancelled')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.8rem',
            background: status === 'cancelled' ? 'var(--color-navy)' : 'transparent',
            color: status === 'cancelled' ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-x-circle"></i> Cancelled ({getStatusCount('cancelled')})
        </button>
        <button 
          onClick={() => setStatus('disputed')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.8rem',
            background: status === 'disputed' ? 'var(--color-navy)' : 'transparent',
            color: status === 'disputed' ? 'var(--color-white)' : 'var(--color-mid-gray)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <i className="bi bi-exclamation-triangle"></i> Disputed ({getStatusCount('disputed')})
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }}></i>
            <input 
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s ease' }}
              placeholder="Client name, email, aircraft, route…" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
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
              <i className="bi bi-x-lg"></i> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--color-mid-gray)' }}>Loading marketplace bookings...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-shop" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No marketplace bookings found.</p>
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
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Client</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Aircraft</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Route</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Date & Time</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Pax</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Gross</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Commission</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.client_name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{b.client_email || '—'}</div>
                      {b.client_phone && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>{b.client_phone}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.aircraft_name || '—'}</div>
                      {b.aircraft_manufacturer && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>{b.aircraft_manufacturer}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.origin || '—'} → {b.destination || '—'}</div>
                      {(b.origin_city || b.destination_city) && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>{b.origin_city || ''} → {b.destination_city || ''}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', whiteSpace: 'nowrap', color: 'var(--color-dark-gray)' }}>
                      {formatDate(b.departure_datetime)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{b.passenger_count || 1}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(b.gross_amount_usd)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{formatCurrency(b.commission_usd)}</div>
                      {b.commission_percent && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>({b.commission_percent}%)</div>
                      )}
                    </td>
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
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openUpdateStatus(b)} 
                          title="Update status"
                        >
                          <i className="bi bi-pencil"></i>
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

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-shop"></i> Booking Details</>} size="lg">
        {selected && (
          <div>
            {/* Client Section */}
            <div style={{ marginBottom: '1rem', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-person" style={{ marginRight: '0.5rem' }}></i> Client Information
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Name</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selected.client_name || '—'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Email</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selected.client_email || '—'}</div>
                </div>
                {selected.client_phone && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Phone</div>
                    <div style={{ color: 'var(--color-dark-gray)' }}>{selected.client_phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Flight Section */}
            <div style={{ marginBottom: '1rem', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-airplane" style={{ marginRight: '0.5rem' }}></i> Flight Details
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Aircraft</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selected.aircraft_name || '—'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Route</div>
                  <div>
                    <div style={{ color: 'var(--color-dark-gray)' }}>{selected.origin} → {selected.destination}</div>
                    {selected.origin_city && <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{selected.origin_city} → {selected.destination_city}</div>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Departure</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{formatDate(selected.departure_datetime)}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Passengers</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selected.passenger_count || 1}</div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div style={{ marginBottom: '1rem', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-currency-dollar" style={{ marginRight: '0.5rem' }}></i> Payment Details
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Gross Amount</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(selected.gross_amount_usd)}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Commission</div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{formatCurrency(selected.commission_usd)}</span>
                    {selected.commission_percent && <span style={{ fontSize: '0.7rem', marginLeft: '0.3rem' }}>({selected.commission_percent}%)</span>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Net to Operator</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency((selected.gross_amount_usd || 0) - (selected.commission_usd || 0))}</div>
                </div>
                {selected.payment_status && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Payment Status</div>
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.15rem 0.5rem',
                        background: selected.payment_status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: selected.payment_status === 'paid' ? '#22c55e' : '#f59e0b',
                        border: `1px solid ${selected.payment_status === 'paid' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        {selected.payment_status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div style={{ border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)', fontWeight: 600, color: 'var(--color-navy)' }}>
                <i className="bi bi-info-circle" style={{ marginRight: '0.5rem' }}></i> Status Information
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Current Status</div>
                  <div><Badge status={selected.status} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-light-gray)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Created</div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selected.created_at).toLocaleString()}</div>
                </div>
                {selected.updated_at && (
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Last Updated</div>
                    <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selected.updated_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal open={updateModal} onClose={() => setUpdateModal(false)} title={<><i className="bi bi-pencil"></i> Update Booking Status</>}>
        {selected && (
          <form onSubmit={updateStatus}>
            {updateErr && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle"></i>
                <span>{updateErr}</span>
              </div>
            )}
            
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(15,92,164,0.08)', border: '1px solid rgba(15,92,164,0.22)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{selected.client_name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>{selected.aircraft_name} · {selected.origin} → {selected.destination}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{formatDate(selected.departure_datetime)}</div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Status <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <select 
                value={statusForm.status} 
                onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s] || s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Internal Notes (Optional)</label>
              <textarea 
                rows={3}
                value={statusForm.notes} 
                onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))} 
                placeholder="Add any internal notes about this status change..."
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setUpdateModal(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={updating} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {updating ? (
                  <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Updating…</>
                ) : (
                  <><i className="bi bi-check-lg"></i> Update Status</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}