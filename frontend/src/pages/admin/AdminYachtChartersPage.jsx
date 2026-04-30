// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN YACHT CHARTERS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

export function AdminYachtChartersPage() {
  const [charters, setCharters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false)
  const [priceForm, setPriceForm] = useState({ quoted_price_usd: '', operator_cost_usd: '', status: 'quoted', send_email: true, email_message: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const data = await adminAPI.getCharters(params)
      setCharters(data.results || data)
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
      status: c.status,
      send_email: true,
      email_message: ''
    })
    setModal(true)
  }

  const submitPrice = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminAPI.setCharterPrice(selected.id, priceForm)
      await load()
      setModal(false)
    } finally {
      setSaving(false)
    }
  }

  const STATUS_COLOR = {
    inquiry: 'amber',
    rfq_sent: 'navy',
    quoted: 'navy',
    confirmed: 'green',
    active: 'green',
    completed: 'gray',
    cancelled: 'red'
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Yacht Charters</h2>
          <p>Manage all yacht charter requests</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <i className="bi bi-search" />
          <input 
            className="form-control search-input" 
            placeholder="Search guest, ref…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="form-control" style={{ width: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
          ) : charters.length === 0 ? (
            <div className="table-empty"><i className="bi bi-water" />No charters found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Guest</th>
                  <th>Dates</th>
                  <th>Port</th>
                  <th>Guests</th>
                  <th>Quoted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {charters.map(c => (
                  <tr key={c.id}>
                    <td><span className="td-ref">{String(c.reference).slice(0, 8)}…</span></td>
                    <td>
                      <div className="td-name">{c.guest_name}</div>
                      <div className="td-email">{c.guest_email}</div>
                    </td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{c.charter_start} → {c.charter_end}</td>
                    <td style={{ fontSize: '0.82rem' }}>{c.departure_port}</td>
                    <td>{c.guest_count}</td>
                    <td className="td-price">{c.quoted_price_usd ? `$${Number(c.quoted_price_usd).toLocaleString()}` : '—'}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[c.status] || 'gray'}`}>{c.status?.replace(/_/g, ' ')}</span></td>
                    <td><button className="btn btn-navy btn-xs" onClick={() => openPrice(c)}><i className="bi bi-currency-dollar" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><i className="bi bi-currency-dollar" /> Set Price — {selected?.guest_name}</div>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={submitPrice}>
                <div className="form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Client Price (USD) <span className="req">*</span></label>
                    <input 
                      className="form-control" 
                      type="number" 
                      step="0.01" 
                      value={priceForm.quoted_price_usd} 
                      onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd: e.target.value }))} 
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
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Update Status</label>
                    <select 
                      className="form-control" 
                      value={priceForm.status} 
                      onChange={e => setPriceForm(f => ({ ...f, status: e.target.value }))}
                    >
                      {['inquiry', 'quoted', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>
                    {saving ? (
                      <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
                    ) : (
                      <><i className="bi bi-check-lg" /> Save</>
                    )}
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

export default  AdminYachtChartersPage;