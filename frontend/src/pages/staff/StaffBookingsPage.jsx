// ═══════════════════════════════════════════════════════════════════════════════
// STAFF BOOKINGS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'in_flight', 'completed', 'cancelled']
const STATUS_COLOR = {
  inquiry: 'amber',
  rfq_sent: 'navy',
  quoted: 'navy',
  confirmed: 'green',
  in_flight: 'green',
  completed: 'gray',
  cancelled: 'red'
}

function Badge({ s }) {
  const displayText = s?.replace(/_/g, ' ')
  const colorClass = STATUS_COLOR[s] || 'gray'
  return <span className={`badge badge-${colorClass}`}>{displayText}</span>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function StaffBookingsPage() {
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

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Flight Bookings</h2>
          <p>View and manage all flight booking requests</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="operator-stats">
        <div className="operator-stat-card">
          <div className="operator-stat-number">{stats.total}</div>
          <div className="operator-stat-label">Total Bookings</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--amber)' }}>{stats.pending}</div>
          <div className="operator-stat-label">Pending</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--green)' }}>{stats.confirmed}</div>
          <div className="operator-stat-label">Confirmed</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--gray-500)' }}>{stats.completed}</div>
          <div className="operator-stat-label">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input 
              className="form-control search-input" 
              placeholder="Guest name, email, reference..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        {(search || status) && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => { setSearch(''); setStatus('') }}
            >
              <i className="bi bi-x-lg" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-airplane" />
              <p>No bookings found.</p>
              {(search || status) && (
                <button className="btn btn-outline-navy btn-sm" onClick={() => { setSearch(''); setStatus('') }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Guest</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Pax</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ cursor: 'pointer' }} onClick={() => openDetail(b)}>
                      <span className="td-ref">{String(b.reference || b.id).slice(0, 8)}…</span>
                    </td>
                    <td style={{ cursor: 'pointer' }} onClick={() => openDetail(b)}>
                      <div className="td-name">{b.guest_name || '—'}</div>
                      <div className="td-email">{b.guest_email || '—'}</div>
                    </td>
                    <td style={{ cursor: 'pointer' }} onClick={() => openDetail(b)}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy)' }}>
                        {b.origin_detail?.code || b.origin || '—'} → {b.destination_detail?.code || b.destination || '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                        {b.origin_detail?.city || ''} {b.destination_detail?.city ? `→ ${b.destination_detail.city}` : ''}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDate(b.departure_date)}
                    </td>
                    <td style={{ textAlign: 'center' }}>{b.passenger_count || 1}</td>
                    <td className="td-price">{formatCurrency(b.quoted_price_usd)}</td>
                    <td><Badge s={b.status} /></td>
                    <td>
                      <div className="td-actions">
                        <button 
                          className="btn btn-outline-navy btn-xs" 
                          onClick={() => openDetail(b)} 
                          title="View details"
                        >
                          <i className="bi bi-eye" />
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
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center',
          borderTop: '1px solid var(--gray-100)'
        }}>
          Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          {(search || status) && ' with current filters'}
        </div>
      )}

      {/* Booking Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-airplane" /> Booking Details</>}>
        {selected && (
          <div>
            {/* Guest Section */}
            <div className="settings-card" style={{ marginBottom: '1rem' }}>
              <div className="settings-card-header">
                <h4><i className="bi bi-person" /> Guest Information</h4>
              </div>
              <div className="settings-card-body">
                <div className="detail-item">
                  <span className="detail-item-label">Name</span>
                  <span className="detail-item-value">{selected.guest_name || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Email</span>
                  <span className="detail-item-value">{selected.guest_email || '—'}</span>
                </div>
                {selected.guest_phone && (
                  <div className="detail-item">
                    <span className="detail-item-label">Phone</span>
                    <span className="detail-item-value">{selected.guest_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Flight Section */}
            <div className="settings-card" style={{ marginBottom: '1rem' }}>
              <div className="settings-card-header">
                <h4><i className="bi bi-airplane" /> Flight Details</h4>
              </div>
              <div className="settings-card-body">
                <div className="detail-item">
                  <span className="detail-item-label">Reference</span>
                  <span className="detail-item-value" style={{ fontFamily: 'monospace' }}>{selected.reference}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Route</span>
                  <span className="detail-item-value">
                    {selected.origin_detail?.code || selected.origin} → {selected.destination_detail?.code || selected.destination}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Date</span>
                  <span className="detail-item-value">{formatDate(selected.departure_date)}</span>
                </div>
                {selected.departure_time && (
                  <div className="detail-item">
                    <span className="detail-item-label">Time</span>
                    <span className="detail-item-value">{selected.departure_time}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-item-label">Passengers</span>
                  <span className="detail-item-value">{selected.passenger_count || 1}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Trip Type</span>
                  <span className="detail-item-value">{selected.trip_type || 'one_way'}</span>
                </div>
                {selected.return_date && (
                  <div className="detail-item">
                    <span className="detail-item-label">Return Date</span>
                    <span className="detail-item-value">{formatDate(selected.return_date)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="settings-card" style={{ marginBottom: '1rem' }}>
              <div className="settings-card-header">
                <h4><i className="bi bi-currency-dollar" /> Pricing</h4>
              </div>
              <div className="settings-card-body">
                <div className="detail-item">
                  <span className="detail-item-label">Quoted Price</span>
                  <span className="detail-item-value td-price">{formatCurrency(selected.quoted_price_usd)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Status</span>
                  <span className="detail-item-value"><Badge s={selected.status} /></span>
                </div>
              </div>
            </div>

            {/* Extras Section */}
            {(selected.catering_requested || selected.ground_transport_requested || selected.special_requests) && (
              <div className="settings-card" style={{ marginBottom: '1rem' }}>
                <div className="settings-card-header">
                  <h4><i className="bi bi-gift" /> Special Requests</h4>
                </div>
                <div className="settings-card-body">
                  {selected.catering_requested && (
                    <div className="detail-item">
                      <span className="detail-item-label">Catering</span>
                      <span className="detail-item-value">Requested</span>
                    </div>
                  )}
                  {selected.ground_transport_requested && (
                    <div className="detail-item">
                      <span className="detail-item-label">Ground Transport</span>
                      <span className="detail-item-value">Requested</span>
                    </div>
                  )}
                  {selected.special_requests && (
                    <div className="detail-item">
                      <span className="detail-item-label">Special Requests</span>
                      <span className="detail-item-value">{selected.special_requests}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="settings-card">
              <div className="settings-card-header">
                <h4><i className="bi bi-clock" /> Timeline</h4>
              </div>
              <div className="settings-card-body">
                <div className="detail-item">
                  <span className="detail-item-label">Created</span>
                  <span className="detail-item-value">{new Date(selected.created_at).toLocaleString()}</span>
                </div>
                {selected.updated_at && (
                  <div className="detail-item">
                    <span className="detail-item-label">Last Updated</span>
                    <span className="detail-item-value">{new Date(selected.updated_at).toLocaleString()}</span>
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

export default StaffBookingsPage