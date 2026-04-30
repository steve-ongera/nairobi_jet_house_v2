import { useState, useEffect, useCallback } from 'react'
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

function Modal({ open, onClose, title, children, size = 'lg' }) {
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

export default function AdminFlightBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // 'price' | 'rfq' | 'detail'

  // Price form
  const [priceForm, setPriceForm] = useState({ 
    quoted_price_usd: '', 
    operator_cost_usd: '', 
    commission_pct: '15', 
    status: 'quoted', 
    send_email: true, 
    email_message: '' 
  })
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceErr, setPriceErr] = useState('')

  // RFQ form
  const [rfqIds, setRfqIds] = useState('')
  const [rfqLoading, setRfqLoading] = useState(false)
  const [rfqErr, setRfqErr] = useState('')

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

  useEffect(() => { load() }, [load])

  const openPrice = (b) => {
    setSelected(b)
    setPriceForm({ 
      quoted_price_usd: b.quoted_price_usd || '', 
      operator_cost_usd: b.operator_cost_usd || '', 
      commission_pct: b.commission_pct || '15', 
      status: b.status, 
      send_email: true, 
      email_message: '' 
    })
    setPriceErr('')
    setModal('price')
  }

  const submitPrice = async (e) => {
    e.preventDefault()
    setPriceLoading(true)
    setPriceErr('')
    try {
      await adminAPI.setPrice(selected.id, priceForm)
      await load()
      setModal(null)
    } catch (err) { 
      const data = err?.response?.data
      const msg = data?.detail || data?.message || JSON.stringify(data) || 'Failed to update price'
      setPriceErr(msg)
    } finally { 
      setPriceLoading(false) 
    }
  }

  const openRFQ = (b) => {
    setSelected(b)
    setRfqIds('')
    setRfqErr('')
    setModal('rfq')
  }

  const submitRFQ = async (e) => {
    e.preventDefault()
    setRfqLoading(true)
    setRfqErr('')
    try {
      const ids = rfqIds.split(',').map(s => parseInt(s.trim())).filter(Boolean)
      if (ids.length === 0) {
        setRfqErr('Please enter at least one valid operator ID')
        return
      }
      await adminAPI.sendRFQ(selected.id, { operator_ids: ids })
      await load()
      setModal(null)
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.detail || data?.message || 'Failed to send RFQ'
      setRfqErr(msg)
    } finally { 
      setRfqLoading(false) 
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Flight Bookings</h2>
          <p>Manage all flight booking requests and RFQs</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
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
              placeholder="Name, email, reference…" 
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

      {/* Table */}
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
                  <th>Quoted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <span className="td-ref">{String(b.reference || b.id).slice(0, 8)}…</span>
                    </td>
                    <td>
                      <div className="td-name">{b.guest_name || '—'}</div>
                      <div className="td-email">{b.guest_email || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>
                        {b.origin_detail?.code || b.origin || '—'} → {b.destination_detail?.code || b.destination || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        {b.origin_detail?.city || ''} {b.destination_detail?.city ? `→ ${b.destination_detail.city}` : ''}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.83rem' }}>
                      {b.departure_date || '—'}
                    </td>
                    <td>{b.passenger_count || 1}</td>
                    <td className="td-price">{formatCurrency(b.quoted_price_usd)}</td>
                    <td><Badge s={b.status} /></td>
                    <td>
                      <div className="td-actions">
                        <button 
                          className="btn btn-navy btn-xs" 
                          onClick={() => openPrice(b)} 
                          title="Set price"
                        >
                          <i className="bi bi-currency-dollar" />
                        </button>
                        <button 
                          className="btn btn-outline-navy btn-xs" 
                          onClick={() => openRFQ(b)} 
                          title="Send RFQ"
                        >
                          <i className="bi bi-send" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-xs" 
                          onClick={() => { setSelected(b); setModal('detail') }} 
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

      {/* Stats Summary (optional) */}
      {!loading && bookings.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center'
        }}>
          Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          {(search || status) && ' with current filters'}
        </div>
      )}

      {/* Price Modal */}
      <Modal open={modal === 'price'} onClose={() => setModal(null)} title={<><i className="bi bi-currency-dollar" /> Set Price — {selected?.guest_name}</>}>
        <form onSubmit={submitPrice}>
          {priceErr && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-triangle" />
              <span>{priceErr}</span>
            </div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Client Price (USD) <span className="req">*</span></label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01" 
                value={priceForm.quoted_price_usd} 
                onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd: e.target.value }))} 
                placeholder="25000.00" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operator Cost (USD)</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01" 
                value={priceForm.operator_cost_usd} 
                onChange={e => setPriceForm(f => ({ ...f, operator_cost_usd: e.target.value }))} 
                placeholder="20000.00" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Commission %</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01" 
                value={priceForm.commission_pct} 
                onChange={e => setPriceForm(f => ({ ...f, commission_pct: e.target.value }))} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select 
                className="form-control" 
                value={priceForm.status} 
                onChange={e => setPriceForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Email Message to Client</label>
            <textarea 
              className="form-control" 
              rows={3}
              value={priceForm.email_message} 
              onChange={e => setPriceForm(f => ({ ...f, email_message: e.target.value }))} 
              placeholder="Leave blank for auto-generated message…"
            />
            <span className="form-hint">This will be included in the quote email to the client</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0 1.25rem' }}>
            <input 
              type="checkbox" 
              id="send_email" 
              checked={priceForm.send_email} 
              onChange={e => setPriceForm(f => ({ ...f, send_email: e.target.checked }))} 
            />
            <label htmlFor="send_email" style={{ fontSize: '0.84rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
              Send quote email to client
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={priceLoading}>
              {priceLoading ? (
                <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
              ) : (
                <><i className="bi bi-check-lg" /> Save Quote</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* RFQ Modal */}
      <Modal open={modal === 'rfq'} onClose={() => setModal(null)} title={<><i className="bi bi-send" /> Send RFQ — {selected?.guest_name}</>}>
        <form onSubmit={submitRFQ}>
          {rfqErr && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-triangle" />
              <span>{rfqErr}</span>
            </div>
          )}
          <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            Enter operator IDs (comma-separated) to dispatch this RFQ. Operators will receive an email with the route and passenger details and can submit bids via the operator portal.
          </p>
          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            <i className="bi bi-info-circle" />
            <div>
              <strong>Route:</strong> {selected?.origin_detail?.code || selected?.origin} → {selected?.destination_detail?.code || selected?.destination}<br/>
              <strong>Date:</strong> {selected?.departure_date} &nbsp;|&nbsp;
              <strong>Pax:</strong> {selected?.passenger_count || 1}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Operator IDs <span className="req">*</span></label>
            <input 
              className="form-control" 
              value={rfqIds} 
              onChange={e => setRfqIds(e.target.value)} 
              placeholder="e.g. 1, 3, 7" 
              required 
            />
            <span className="form-hint">Comma-separated operator IDs from the Operators page.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={rfqLoading}>
              {rfqLoading ? (
                <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
              ) : (
                <><i className="bi bi-send" /> Send RFQ</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title={<><i className="bi bi-airplane" /> Booking Details</>} size="lg">
        {selected && (
          <div>
            <div className="detail-row">
              <div className="detail-key">Reference</div>
              <div className="detail-val">{selected.reference || selected.id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Guest</div>
              <div className="detail-val">{selected.guest_name || '—'} — {selected.guest_email || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Phone</div>
              <div className="detail-val">{selected.guest_phone || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Route</div>
              <div className="detail-val">
                {selected.origin_detail?.code || selected.origin} → {selected.destination_detail?.code || selected.destination}
                {selected.origin_detail?.city && <div style={{ fontSize: '0.7rem' }}>{selected.origin_detail.city} → {selected.destination_detail?.city}</div>}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Date & Time</div>
              <div className="detail-val">
                {selected.departure_date || '—'}
                {selected.departure_time && ` at ${selected.departure_time}`}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Passengers</div>
              <div className="detail-val">{selected.passenger_count || 1}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Trip Type</div>
              <div className="detail-val">{selected.trip_type || 'one_way'} {selected.return_date ? `(Return: ${selected.return_date})` : ''}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Status</div>
              <div className="detail-val"><Badge s={selected.status} /></div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Pricing</div>
              <div className="detail-val">
                Quoted: {formatCurrency(selected.quoted_price_usd)}<br/>
                Operator Cost: {formatCurrency(selected.operator_cost_usd)}<br/>
                Commission: {formatCurrency(selected.commission_usd)} ({selected.commission_pct}%)
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Extras</div>
              <div className="detail-val">
                Catering: {selected.catering_requested ? 'Yes' : 'No'}<br/>
                Ground Transport: {selected.ground_transport_requested ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Special Requests</div>
              <div className="detail-val">{selected.special_requests || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Submitted</div>
              <div className="detail-val">{new Date(selected.created_at).toLocaleString()}</div>
            </div>
            {selected.assigned_operator && (
              <div className="detail-row">
                <div className="detail-key">Assigned Operator</div>
                <div className="detail-val">{selected.assigned_operator}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}