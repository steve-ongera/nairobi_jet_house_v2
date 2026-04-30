// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN YACHT CHARTERS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'active', 'completed', 'cancelled']
const STATUS_COLOR = {
  inquiry: 'amber',
  rfq_sent: 'navy',
  quoted: 'navy',
  confirmed: 'green',
  active: 'green',
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

export function AdminYachtChartersPage() {
  const [charters, setCharters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false) // 'price' | 'detail'
  const [detailModal, setDetailModal] = useState(false)
  const [priceForm, setPriceForm] = useState({ 
    quoted_price_usd: '', 
    operator_cost_usd: '', 
    status: 'quoted', 
    send_email: true, 
    email_message: '' 
  })
  const [saving, setSaving] = useState(false)
  const [priceErr, setPriceErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const response = await adminAPI.charters(params)
      const data = response?.data || response
      setCharters(data.results || data || [])
    } catch (err) {
      console.error('Failed to load charters:', err)
      setCharters([])
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  const openPrice = (c) => {
    setSelected(c)
    setPriceForm({
      quoted_price_usd: c.quoted_price_usd || '',
      operator_cost_usd: c.operator_cost_usd || '',
      status: c.status || 'quoted',
      send_email: true,
      email_message: ''
    })
    setPriceErr('')
    setModal(true)
  }

  const openDetail = (c) => {
    setSelected(c)
    setDetailModal(true)
  }

  const submitPrice = async (e) => {
    e.preventDefault()
    setSaving(true)
    setPriceErr('')
    try {
      await adminAPI.setCharterPrice(selected.id, priceForm)
      await load()
      setModal(false)
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.detail || data?.message || 'Failed to update price'
      setPriceErr(msg)
    } finally {
      setSaving(false)
    }
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

  const calculateDuration = (start, end) => {
    if (!start || !end) return null
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays === 1 ? '1 day' : `${diffDays} days`
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Yacht Charters</h2>
          <p>Manage all yacht charter requests and bookings</p>
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
              placeholder="Guest name, email, reference…" 
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
              <p>Loading charters...</p>
            </div>
          ) : charters.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-water" />
              <p>No charters found.</p>
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
                  <th>Charter Period</th>
                  <th>Yacht / Port</th>
                  <th>Guests</th>
                  <th>Cabins</th>
                  <th>Quoted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {charters.map(c => {
                  const duration = calculateDuration(c.charter_start, c.charter_end)
                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="td-ref">{String(c.reference || c.id).slice(0, 8)}…</span>
                      </td>
                      <td>
                        <div className="guest-info-compact">
                          <div className="guest-avatar">
                            {c.guest_name?.[0]?.toUpperCase() || 'G'}
                          </div>
                          <div>
                            <div className="td-name">{c.guest_name || '—'}</div>
                            <div className="td-email">{c.guest_email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>
                        <div>
                          {formatDate(c.charter_start)} → {formatDate(c.charter_end)}
                        </div>
                        {duration && (
                          <div className="charter-duration" style={{ marginTop: '0.25rem' }}>
                            <i className="bi bi-calendar-week" /> {duration}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--navy)' }}>
                          {c.yacht_name || '—'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                          <i className="bi bi-geo-alt" style={{ fontSize: '0.6rem' }} /> {c.departure_port || '—'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{c.guest_count || '—'}</td>
                      <td style={{ textAlign: 'center' }}>{c.cabin_count || '—'}</td>
                      <td className="td-price">{formatCurrency(c.quoted_price_usd)}</td>
                      <td><Badge s={c.status} /></td>
                      <td>
                        <div className="td-actions">
                          <button 
                            className="btn btn-navy btn-xs" 
                            onClick={() => openPrice(c)} 
                            title="Set price"
                          >
                            <i className="bi bi-currency-dollar" />
                          </button>
                          <button 
                            className="btn btn-outline-navy btn-xs" 
                            onClick={() => openDetail(c)} 
                            title="View details"
                          >
                            <i className="bi bi-eye" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && charters.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center'
        }}>
          Showing {charters.length} charter{charters.length !== 1 ? 's' : ''}
          {(search || status) && ' with current filters'}
        </div>
      )}

      {/* Price Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={<><i className="bi bi-currency-dollar" /> Set Price — {selected?.guest_name}</>}>
        <form onSubmit={submitPrice}>
          {priceErr && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-triangle" />
              <span>{priceErr}</span>
            </div>
          )}
          
          {/* Charter info summary */}
          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            <i className="bi bi-info-circle" />
            <div>
              <strong>{selected?.yacht_name || 'Yacht Charter'}</strong><br />
              {formatDate(selected?.charter_start)} → {formatDate(selected?.charter_end)}<br />
              <strong>Port:</strong> {selected?.departure_port || '—'} &nbsp;|&nbsp;
              <strong>Guests:</strong> {selected?.guest_count || '—'} &nbsp;|&nbsp;
              <strong>Cabins:</strong> {selected?.cabin_count || '—'}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Client Price (USD) <span className="req">*</span></label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01" 
                value={priceForm.quoted_price_usd} 
                onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd: e.target.value }))} 
                placeholder="e.g., 50000.00"
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
                placeholder="e.g., 40000.00"
              />
              <span className="form-hint">Internal cost for reporting</span>
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
              placeholder="Optional: Add a personal message to the client..."
            />
            <span className="form-hint">This will be included in the quote email</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0 1.25rem' }}>
            <input 
              type="checkbox" 
              id="send_email_charter" 
              checked={priceForm.send_email} 
              onChange={e => setPriceForm(f => ({ ...f, send_email: e.target.checked }))} 
            />
            <label htmlFor="send_email_charter" style={{ fontSize: '0.84rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
              Send quote email to client
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
              ) : (
                <><i className="bi bi-check-lg" /> Save Quote</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-water" /> Charter Details</>}>
        {selected && (
          <div>
            {/* Yacht Info Section */}
            <div className="yacht-detail-card" style={{ marginBottom: '1rem' }}>
              <div className="yacht-detail-header">
                <h3>{selected.yacht_name || 'Yacht Charter'}</h3>
                <p>Charter booking reference: {selected.reference || selected.id}</p>
              </div>
              <div className="yacht-specs">
                <div className="yacht-spec">
                  <i className="bi bi-calendar-event" />
                  <div>
                    <div className="yacht-spec-label">Charter Period</div>
                    <div className="yacht-spec-value">
                      {formatDate(selected.charter_start)} → {formatDate(selected.charter_end)}
                    </div>
                  </div>
                </div>
                <div className="yacht-spec">
                  <i className="bi bi-people" />
                  <div>
                    <div className="yacht-spec-label">Guests</div>
                    <div className="yacht-spec-value">{selected.guest_count || '—'}</div>
                  </div>
                </div>
                <div className="yacht-spec">
                  <i className="bi bi-door-closed" />
                  <div>
                    <div className="yacht-spec-label">Cabins</div>
                    <div className="yacht-spec-value">{selected.cabin_count || '—'}</div>
                  </div>
                </div>
                <div className="yacht-spec">
                  <i className="bi bi-geo-alt" />
                  <div>
                    <div className="yacht-spec-label">Departure Port</div>
                    <div className="yacht-spec-value">{selected.departure_port || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Info Section */}
            <div className="detail-row">
              <div className="detail-key">Guest Name</div>
              <div className="detail-val">{selected.guest_name || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Email</div>
              <div className="detail-val">{selected.guest_email || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Phone</div>
              <div className="detail-val">{selected.guest_phone || '—'}</div>
            </div>
            
            {/* Pricing Section */}
            <div className="detail-row">
              <div className="detail-key">Quoted Price</div>
              <div className="detail-val">{formatCurrency(selected.quoted_price_usd)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Operator Cost</div>
              <div className="detail-val">{formatCurrency(selected.operator_cost_usd)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Commission</div>
              <div className="detail-val">{selected.commission_pct ? `${selected.commission_pct}%` : '—'}</div>
            </div>
            
            {/* Status */}
            <div className="detail-row">
              <div className="detail-key">Status</div>
              <div className="detail-val"><Badge s={selected.status} /></div>
            </div>

            {/* Special Requests */}
            {selected.special_requests && (
              <div className="detail-row">
                <div className="detail-key">Special Requests</div>
                <div className="detail-val">{selected.special_requests}</div>
              </div>
            )}

            {/* Timestamps */}
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
        )}
      </Modal>
    </div>
  )
}

export default AdminYachtChartersPage