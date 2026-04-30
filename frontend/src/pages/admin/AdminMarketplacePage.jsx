// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MARKETPLACE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['pending', 'confirmed', 'in_flight', 'completed', 'cancelled', 'disputed']
const STATUS_COLOR = {
  pending: 'pending',
  confirmed: 'green',
  in_flight: 'green',
  completed: 'gray',
  cancelled: 'red',
  disputed: 'disputed'
}

function Badge({ s }) {
  const displayText = s?.replace(/_/g, ' ')
  const colorClass = STATUS_COLOR[s] || 'gray'
  return <span className={`badge badge-${colorClass}`}>{displayText}</span>
}

function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal-${size}`}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function AdminMarketplacePage() {
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
      
      // Calculate stats
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
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Marketplace Bookings</h2>
          <p>Member bookings from listed aircraft fleet</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="revenue-summary">
        <div className="revenue-summary-item">
          <div className="revenue-summary-label">Total Revenue</div>
          <div className="revenue-summary-value">{formatCurrency(stats.total_revenue)}</div>
        </div>
        <div className="revenue-summary-item">
          <div className="revenue-summary-label">Total Commission Earned</div>
          <div className="revenue-summary-value" style={{ color: 'var(--gold-light)' }}>
            {formatCurrency(stats.total_commission)}
          </div>
        </div>
        <div className="revenue-summary-item">
          <div className="revenue-summary-label">Pending Bookings</div>
          <div className="revenue-summary-value">{stats.pending_count}</div>
        </div>
        <div className="revenue-summary-item">
          <div className="revenue-summary-label">Completed Bookings</div>
          <div className="revenue-summary-value">{stats.completed_count}</div>
        </div>
      </div>

      {/* Quick Stats Tabs */}
      <div className="marketplace-tabs">
        <button 
          className={`marketplace-tab ${!status ? 'active' : ''}`}
          onClick={() => setStatus('')}
        >
          <i className="bi bi-grid-3x3" /> All ({bookings.length})
        </button>
        <button 
          className={`marketplace-tab ${status === 'pending' ? 'active' : ''}`}
          onClick={() => setStatus('pending')}
        >
          <i className="bi bi-clock-history" /> Pending ({getStatusCount('pending')})
        </button>
        <button 
          className={`marketplace-tab ${status === 'confirmed' ? 'active' : ''}`}
          onClick={() => setStatus('confirmed')}
        >
          <i className="bi bi-check-circle" /> Confirmed ({getStatusCount('confirmed')})
        </button>
        <button 
          className={`marketplace-tab ${status === 'in_flight' ? 'active' : ''}`}
          onClick={() => setStatus('in_flight')}
        >
          <i className="bi bi-airplane" /> In Flight ({getStatusCount('in_flight')})
        </button>
        <button 
          className={`marketplace-tab ${status === 'completed' ? 'active' : ''}`}
          onClick={() => setStatus('completed')}
        >
          <i className="bi bi-check-lg" /> Completed ({getStatusCount('completed')})
        </button>
        <button 
          className={`marketplace-tab ${status === 'cancelled' ? 'active' : ''}`}
          onClick={() => setStatus('cancelled')}
        >
          <i className="bi bi-x-circle" /> Cancelled ({getStatusCount('cancelled')})
        </button>
        <button 
          className={`marketplace-tab ${status === 'disputed' ? 'active' : ''}`}
          onClick={() => setStatus('disputed')}
        >
          <i className="bi bi-exclamation-triangle" /> Disputed ({getStatusCount('disputed')})
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input 
              className="form-control search-input" 
              placeholder="Client name, email, aircraft, route…" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        {(search || status) && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => { setSearch(''); setStatus('') }}
            >
              <i className="bi bi-x-lg" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p>Loading marketplace bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-shop" />
              <p>No marketplace bookings found.</p>
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
                  <th>Client</th>
                  <th>Aircraft</th>
                  <th>Route</th>
                  <th>Date & Time</th>
                  <th>Passengers</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="td-name">{b.client_name || '—'}</div>
                      <div className="td-email">{b.client_email || '—'}</div>
                      {b.client_phone && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '0.15rem' }}>
                          {b.client_phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="aircraft-info">
                        <div className="aircraft-thumb">
                          <i className="bi bi-airplane-fill" />
                        </div>
                        <div className="aircraft-details">
                          <div className="aircraft-manufacturer">{b.aircraft_manufacturer || 'Aircraft'}</div>
                          <div className="aircraft-model-name">{b.aircraft_name || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="route-visual">
                        <span className="route-point">{b.origin || '—'}</span>
                        <i className="bi bi-arrow-right route-arrow" />
                        <span className="route-point">{b.destination || '—'}</span>
                      </div>
                      {(b.origin_city || b.destination_city) && (
                        <div className="airport-codes">
                          {b.origin_city} → {b.destination_city}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDate(b.departure_datetime)}
                    </td>
                    <td style={{ textAlign: 'center' }}>{b.passenger_count || 1}</td>
                    <td className="td-price">{formatCurrency(b.gross_amount_usd)}</td>
                    <td>
                      <div className="commission-breakdown">
                        <span className="commission-amount">{formatCurrency(b.commission_usd)}</span>
                        {b.commission_percent && (
                          <span className="commission-percent">({b.commission_percent}%)</span>
                        )}
                      </div>
                    </td>
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
                        <button 
                          className="btn btn-navy btn-xs" 
                          onClick={() => openUpdateStatus(b)} 
                          title="Update status"
                        >
                          <i className="bi bi-pencil" />
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

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-shop" /> Booking Details</>} size="lg">
        {selected && (
          <div>
            {/* Client Section */}
            <div className="marketplace-card" style={{ marginBottom: '1rem' }}>
              <div className="marketplace-header">
                <h3><i className="bi bi-person" /> Client Information</h3>
              </div>
              <div style={{ padding: '1rem' }}>
                <div className="detail-row">
                  <div className="detail-key">Name</div>
                  <div className="detail-val">{selected.client_name || '—'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Email</div>
                  <div className="detail-val">{selected.client_email || '—'}</div>
                </div>
                {selected.client_phone && (
                  <div className="detail-row">
                    <div className="detail-key">Phone</div>
                    <div className="detail-val">{selected.client_phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Flight Section */}
            <div className="marketplace-card" style={{ marginBottom: '1rem' }}>
              <div className="marketplace-header">
                <h3><i className="bi bi-airplane" /> Flight Details</h3>
              </div>
              <div style={{ padding: '1rem' }}>
                <div className="detail-row">
                  <div className="detail-key">Aircraft</div>
                  <div className="detail-val">{selected.aircraft_name || '—'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Route</div>
                  <div className="detail-val">
                    {selected.origin} → {selected.destination}
                    {selected.origin_city && <div style={{ fontSize: '0.7rem' }}>{selected.origin_city} → {selected.destination_city}</div>}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Departure</div>
                  <div className="detail-val">{formatDate(selected.departure_datetime)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Passengers</div>
                  <div className="detail-val">{selected.passenger_count || 1}</div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="marketplace-card" style={{ marginBottom: '1rem' }}>
              <div className="marketplace-header">
                <h3><i className="bi bi-currency-dollar" /> Payment Details</h3>
              </div>
              <div style={{ padding: '1rem' }}>
                <div className="detail-row">
                  <div className="detail-key">Gross Amount</div>
                  <div className="detail-val">{formatCurrency(selected.gross_amount_usd)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Commission</div>
                  <div className="detail-val">
                    {formatCurrency(selected.commission_usd)} 
                    {selected.commission_percent && ` (${selected.commission_percent}%)`}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Net to Operator</div>
                  <div className="detail-val">
                    {formatCurrency((selected.gross_amount_usd || 0) - (selected.commission_usd || 0))}
                  </div>
                </div>
                {selected.payment_status && (
                  <div className="detail-row">
                    <div className="detail-key">Payment Status</div>
                    <div className="detail-val">
                      <span className={`badge badge-${selected.payment_status === 'paid' ? 'green' : 'amber'}`}>
                        {selected.payment_status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="marketplace-card">
              <div className="marketplace-header">
                <h3><i className="bi bi-info-circle" /> Status Information</h3>
              </div>
              <div style={{ padding: '1rem' }}>
                <div className="detail-row">
                  <div className="detail-key">Current Status</div>
                  <div className="detail-val"><Badge s={selected.status} /></div>
                </div>
                <div className="detail-row">
                  <div className="detail-key">Created</div>
                  <div className="detail-val">{new Date(selected.created_at).toLocaleString()}</div>
                </div>
                {selected.updated_at && (
                  <div className="detail-row">
                    <div className="detail-key">Last Updated</div>
                    <div className="detail-val">{new Date(selected.updated_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal open={updateModal} onClose={() => setUpdateModal(false)} title={<><i className="bi bi-pencil" /> Update Booking Status</>}>
        {selected && (
          <form onSubmit={updateStatus}>
            {updateErr && (
              <div className="alert alert-error">
                <i className="bi bi-exclamation-triangle" />
                <span>{updateErr}</span>
              </div>
            )}
            
            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <i className="bi bi-info-circle" />
              <div>
                <strong>{selected.client_name}</strong><br />
                {selected.aircraft_name} · {selected.origin} → {selected.destination}<br />
                {formatDate(selected.departure_datetime)}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Status <span className="req">*</span></label>
              <select 
                className="form-control" 
                value={statusForm.status} 
                onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                required
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Internal Notes (Optional)</label>
              <textarea 
                className="form-control" 
                rows={3}
                value={statusForm.notes} 
                onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))} 
                placeholder="Add any internal notes about this status change..."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setUpdateModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-navy" disabled={updating}>
                {updating ? (
                  <><span className="spinner" style={{ borderTopColor: 'white' }} /> Updating…</>
                ) : (
                  <><i className="bi bi-check-lg" /> Update Status</>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default AdminMarketplacePage