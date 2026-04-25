// ═══════════════════════════════════════════════════════════════════════════════
// AdminPayoutsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api'

function PayoutsPage() {
  const [payouts,  setPayouts]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('')
  const [ref,      setRef]      = useState('')
  const [saving,   setSaving]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.status = filter
      if (ref)    params.search = ref
      const data = await adminApi.getPayouts(params)
      setPayouts(data.results || data)
    } finally { setLoading(false) }
  }, [filter, ref])

  useEffect(() => { load() }, [load])

  const markPaid = async (id) => {
    const bankRef = prompt('Bank reference / transaction ID:')
    if (!bankRef) return
    setSaving(id)
    try { await adminApi.markPaid(id, { bank_reference: bankRef }); load() }
    finally { setSaving(null) }
  }

  const markProcessing = async (id) => {
    setSaving(id)
    try { await adminApi.markProcessing(id); load() }
    finally { setSaving(null) }
  }

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—'
  const STATUS_COLOR = { pending:'amber', processing:'navy', paid:'green', failed:'red', disputed:'red' }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Operator Payouts</h2>
          <p>Track and release payments to charter operators</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search operator, ref…" value={ref} onChange={e => setRef(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending','processing','paid','failed','disputed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
          : payouts.length === 0 ? <div className="table-empty"><i className="bi bi-cash-stack" />No payouts found.</div>
          : (
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Operator</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id}>
                    <td><span className="td-ref">{String(p.reference).slice(0,8)}…</span></td>
                    <td className="td-name">{p.operator_name}</td>
                    <td className="td-price">{fmt(p.amount_usd)} <span style={{ fontSize:'0.73rem', color:'var(--gray-400)', fontWeight:400 }}>{p.currency}</span></td>
                    <td style={{ fontSize:'0.82rem' }}>{p.payment_method || '—'}</td>
                    <td style={{ fontSize:'0.82rem', whiteSpace:'nowrap' }}>{p.due_date || '—'}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[p.status]||'gray'}`}>{p.status}</span></td>
                    <td>
                      <div className="td-actions">
                        {p.status === 'pending'    && <button className="btn btn-outline-navy btn-xs" onClick={() => markProcessing(p.id)} disabled={saving===p.id}>Processing</button>}
                        {p.status === 'processing' && <button className="btn btn-green btn-xs" onClick={() => markPaid(p.id)} disabled={saving===p.id}><i className="bi bi-check-lg" /> Mark Paid</button>}
                        {p.status === 'paid'       && <span style={{ fontSize:'0.72rem', color:'var(--green)' }}><i className="bi bi-check-circle-fill" /> Paid</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export { PayoutsPage as AdminPayoutsPage }
export default PayoutsPage