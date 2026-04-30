// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN RFQ PAGE (Request for Quote)
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

export function AdminRFQPage() {
  const [rfqs, setRfqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false)
  const [quoteForm, setQuoteForm] = useState({ price_usd: '', message: '', valid_until: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const data = await adminAPI.getRFQs(params)
      setRfqs(data.results || data)
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  const openQuote = (rfq) => {
    setSelected(rfq)
    setQuoteForm({
      price_usd: '',
      message: `Thank you for your inquiry regarding ${rfq.asset_type} ${rfq.asset_name || ''}. We are pleased to provide the following quote.`,
      valid_until: ''
    })
    setModal(true)
  }

  const submitQuote = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.submitRFQQuote(selected.id, quoteForm)
      await load()
      setModal(false)
    } catch (err) {
      console.error('Failed to submit quote:', err)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await adminAPI.updateRFQStatus(id, { status: newStatus })
      await load()
    } catch (err) {
      console.error('Failed to update RFQ status:', err)
    }
  }

  const STATUS_COLOR = {
    draft: 'gray',
    pending: 'amber',
    quoted: 'navy',
    accepted: 'green',
    declined: 'red',
    expired: 'gray',
    converted: 'green'
  }

  const ASSET_TYPES = {
    flight: 'bi-airplane',
    yacht: 'bi-water',
    helicopter: 'bi-helicopter',
    aircraft_sale: 'bi-shop',
    lease: 'bi-file-earmark'
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Request for Quote (RFQ)</h2>
          <p>Manage all customer RFQ submissions and quotes</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <i className="bi bi-search" />
          <input 
            className="form-control search-input" 
            placeholder="Search customer, reference, asset…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="form-control" style={{ width: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'quoted', 'accepted', 'declined', 'expired', 'converted'].map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
          ) : rfqs.length === 0 ? (
            <div className="table-empty"><i className="bi bi-file-text" />No RFQ submissions found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Asset</th>
                  <th>Dates</th>
                  <th>Passengers</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map(rfq => (
                  <tr key={rfq.id}>
                    <td className="td-ref">{rfq.reference?.slice(0, 8)}…</td>
                    <td>
                      <div className="td-name">{rfq.customer_name}</div>
                      <div className="td-email">{rfq.customer_email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className={`bi ${ASSET_TYPES[rfq.asset_type] || 'bi-question-circle'}`} style={{ color: 'var(--gold)' }} />
                        <span>{rfq.asset_name || rfq.asset_type}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {rfq.start_date && `${formatDate(rfq.start_date)} → ${formatDate(rfq.end_date)}`}
                    </td>
                    <td>{rfq.passenger_count || rfq.guest_count || '—'}</td>
                    <td>{rfq.budget_range || rfq.budget_usd ? `$${rfq.budget_usd?.toLocaleString()}` : '—'}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[rfq.status] || 'gray'}`}>{rfq.status?.toUpperCase()}</span></td>
                    <td style={{ fontSize: '0.78rem' }}>{formatDate(rfq.created_at)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-xs" onClick={() => openQuote(rfq)}>
                          <i className="bi bi-currency-dollar" />
                        </button>
                        {rfq.status === 'pending' && (
                          <button className="btn btn-amber btn-xs" onClick={() => updateStatus(rfq.id, 'quoted')}>
                            Mark Quoted
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quote Modal */}
      {modal && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">
                <i className="bi bi-file-text" /> Send Quote — {selected.reference}
              </div>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              {/* RFQ Details */}
              <div style={{ background: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <strong>Customer:</strong> {selected.customer_name}<br />
                    <strong>Email:</strong> {selected.customer_email}<br />
                    <strong>Phone:</strong> {selected.customer_phone || '—'}
                  </div>
                  <div>
                    <strong>Asset:</strong> {selected.asset_name || selected.asset_type}<br />
                    <strong>Dates:</strong> {formatDate(selected.start_date)} → {formatDate(selected.end_date)}<br />
                    <strong>Passengers:</strong> {selected.passenger_count || selected.guest_count || '—'}
                  </div>
                </div>
                {selected.special_requests && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <strong>Special Requests:</strong>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>{selected.special_requests}</p>
                  </div>
                )}
              </div>

              <form onSubmit={submitQuote}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Quote Price (USD) <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01" 
                    value={quoteForm.price_usd} 
                    onChange={e => setQuoteForm(f => ({ ...f, price_usd: e.target.value }))} 
                    required 
                    placeholder="Enter final price for the customer"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Valid Until</label>
                  <input 
                    className="form-control" 
                    type="date" 
                    value={quoteForm.valid_until} 
                    onChange={e => setQuoteForm(f => ({ ...f, valid_until: e.target.value }))} 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Quote Message</label>
                  <textarea 
                    className="form-control" 
                    style={{ minHeight: 120 }} 
                    value={quoteForm.message} 
                    onChange={e => setQuoteForm(f => ({ ...f, message: e.target.value }))} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>
                    {saving ? <><span className="spinner" /> Sending Quote…</> : <><i className="bi bi-send" /> Send Quote</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRFQPage