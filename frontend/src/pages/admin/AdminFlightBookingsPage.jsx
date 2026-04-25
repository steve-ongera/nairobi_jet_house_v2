import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api'

const STATUS_OPTIONS = ['inquiry','rfq_sent','quoted','confirmed','in_flight','completed','cancelled']
const STATUS_COLOR   = { inquiry:'amber', rfq_sent:'navy', quoted:'navy', confirmed:'green', in_flight:'green', completed:'gray', cancelled:'red' }

function Badge({ s }) {
  return <span className={`badge badge-${STATUS_COLOR[s] || 'gray'}`}>{s?.replace(/_/g,' ')}</span>
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

export default function AdminFlightBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [selected, setSelected] = useState(null)
  const [modal,    setModal]    = useState(null) // 'price' | 'rfq' | 'detail'

  // Price form
  const [priceForm, setPriceForm] = useState({ quoted_price_usd: '', operator_cost_usd: '', commission_pct: '15', status: 'quoted', send_email: true, email_message: '' })
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceErr, setPriceErr] = useState('')

  // RFQ form
  const [rfqIds, setRfqIds] = useState('')
  const [rfqLoading, setRfqLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const data = await adminApi.getBookings(params)
      setBookings(data.results || data)
    } finally { setLoading(false) }
  }, [search, status])

  useEffect(() => { load() }, [load])

  const openPrice = (b) => {
    setSelected(b)
    setPriceForm({ quoted_price_usd: b.quoted_price_usd || '', operator_cost_usd: b.operator_cost_usd || '', commission_pct: b.commission_pct || '15', status: b.status, send_email: true, email_message: '' })
    setPriceErr('')
    setModal('price')
  }

  const submitPrice = async (e) => {
    e.preventDefault(); setPriceLoading(true); setPriceErr('')
    try {
      await adminApi.setPrice(selected.id, priceForm)
      await load(); setModal(null)
    } catch (err) { setPriceErr(err?.detail || JSON.stringify(err)) }
    finally { setPriceLoading(false) }
  }

  const submitRFQ = async (e) => {
    e.preventDefault(); setRfqLoading(true)
    try {
      const ids = rfqIds.split(',').map(s => parseInt(s.trim())).filter(Boolean)
      await adminApi.sendRFQ(selected.id, { operator_ids: ids })
      await load(); setModal(null)
    } finally { setRfqLoading(false) }
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Flight Bookings</h2>
          <p>Manage all flight booking requests and RFQs</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search name, email, ref…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
          ) : bookings.length === 0 ? (
            <div className="table-empty"><i className="bi bi-airplane" />No bookings found.</div>
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
                    <td><span className="td-ref">{String(b.reference).slice(0,8)}…</span></td>
                    <td>
                      <div className="td-name">{b.guest_name}</div>
                      <div className="td-email">{b.guest_email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>
                        {b.origin_detail?.code || '—'} → {b.destination_detail?.code || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        {b.origin_detail?.city} → {b.destination_detail?.city}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.83rem' }}>{b.departure_date}</td>
                    <td>{b.passenger_count}</td>
                    <td className="td-price">
                      {b.quoted_price_usd ? `$${Number(b.quoted_price_usd).toLocaleString()}` : <span style={{ color: 'var(--gray-300)' }}>—</span>}
                    </td>
                    <td><Badge s={b.status} /></td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-navy btn-xs" onClick={() => openPrice(b)} title="Set price"><i className="bi bi-currency-dollar" /></button>
                        <button className="btn btn-outline-navy btn-xs" onClick={() => { setSelected(b); setRfqIds(''); setModal('rfq') }} title="Send RFQ"><i className="bi bi-send" /></button>
                        <button className="btn btn-ghost btn-xs" onClick={() => { setSelected(b); setModal('detail') }} title="View detail"><i className="bi bi-eye" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Price Modal */}
      <Modal open={modal === 'price'} onClose={() => setModal(null)} title={<><i className="bi bi-currency-dollar" /> Set Price — {selected?.guest_name}</>}>
        <form onSubmit={submitPrice}>
          {priceErr && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" /><span>{priceErr}</span></div>}
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Client Price (USD) <span className="req">*</span></label>
              <input className="form-control" type="number" step="0.01" value={priceForm.quoted_price_usd} onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd: e.target.value }))} placeholder="25000.00" required />
            </div>
            <div className="form-group">
              <label className="form-label">Operator Cost (USD)</label>
              <input className="form-control" type="number" step="0.01" value={priceForm.operator_cost_usd} onChange={e => setPriceForm(f => ({ ...f, operator_cost_usd: e.target.value }))} placeholder="20000.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Commission %</label>
              <input className="form-control" type="number" step="0.01" value={priceForm.commission_pct} onChange={e => setPriceForm(f => ({ ...f, commission_pct: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={priceForm.status} onChange={e => setPriceForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Email Message to Client</label>
            <textarea className="form-control" style={{ minHeight: 80 }} value={priceForm.email_message} onChange={e => setPriceForm(f => ({ ...f, email_message: e.target.value }))} placeholder="Leave blank for auto-generated message…" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input type="checkbox" id="send_email" checked={priceForm.send_email} onChange={e => setPriceForm(f => ({ ...f, send_email: e.target.checked }))} />
            <label htmlFor="send_email" style={{ fontSize: '0.84rem', color: 'var(--gray-600)', cursor: 'pointer' }}>Send quote email to client</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={priceLoading}>
              {priceLoading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</> : <><i className="bi bi-check-lg" /> Save Quote</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* RFQ Modal */}
      <Modal open={modal === 'rfq'} onClose={() => setModal(null)} title={<><i className="bi bi-send" /> Send RFQ — {selected?.guest_name}</>}>
        <form onSubmit={submitRFQ}>
          <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            Enter operator IDs (comma-separated) to dispatch this RFQ. Operators will receive an email with the route and passenger details and can submit bids via the operator portal.
          </p>
          <div style={{ background: 'var(--blue-soft)', border: '1px solid #BED1EF', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--navy)' }}>
            <strong>Route:</strong> {selected?.origin_detail?.code} → {selected?.destination_detail?.code} &nbsp;|&nbsp;
            <strong>Date:</strong> {selected?.departure_date} &nbsp;|&nbsp;
            <strong>Pax:</strong> {selected?.passenger_count}
          </div>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Operator IDs <span className="req">*</span></label>
            <input className="form-control" value={rfqIds} onChange={e => setRfqIds(e.target.value)} placeholder="e.g. 1, 3, 7" required />
            <span className="form-hint">Comma-separated operator IDs from the Operators page.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={rfqLoading}>
              {rfqLoading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</> : <><i className="bi bi-send" /> Send RFQ</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title={<><i className="bi bi-airplane" /> Booking Detail</>}>
        {selected && (
          <div>
            {[
              ['Reference', selected.reference],
              ['Guest',     `${selected.guest_name} — ${selected.guest_email}`],
              ['Route',     `${selected.origin_detail?.code} → ${selected.destination_detail?.code}`],
              ['Date',      `${selected.departure_date}${selected.departure_time ? ' at ' + selected.departure_time : ''}`],
              ['Passengers',selected.passenger_count],
              ['Trip Type', selected.trip_type],
              ['Status',    selected.status_display || selected.status],
              ['Quoted',    selected.quoted_price_usd ? `$${Number(selected.quoted_price_usd).toLocaleString()}` : 'Not quoted'],
              ['Operator Cost', selected.operator_cost_usd ? `$${Number(selected.operator_cost_usd).toLocaleString()}` : '—'],
              ['Commission',   selected.commission_usd ? `$${Number(selected.commission_usd).toLocaleString()} (${selected.commission_pct}%)` : '—'],
              ['Catering', selected.catering_requested ? 'Yes' : 'No'],
              ['Ground Transport', selected.ground_transport_requested ? 'Yes' : 'No'],
              ['Special Requests', selected.special_requests || '—'],
              ['Submitted', new Date(selected.created_at).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className="detail-row">
                <div className="detail-key">{k}</div>
                <div className="detail-val" style={{ wordBreak: 'break-all' }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}