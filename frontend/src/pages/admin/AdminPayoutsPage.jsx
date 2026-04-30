// ═══════════════════════════════════════════════════════════════════════════════
// AdminPayoutsPage.jsx - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_COLOR = { 
  pending: 'amber', 
  processing: 'navy', 
  paid: 'green', 
  failed: 'red', 
  disputed: 'red' 
}

function Badge({ s }) {
  const colorClass = STATUS_COLOR[s] || 'gray'
  return <span className={`badge badge-${colorClass}`}>{s}</span>
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

export function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(null)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.status = filter
      if (search) params.search = search
      const response = await adminAPI.payouts(params)
      const data = response?.data || response
      setPayouts(data.results || data || [])
    } catch (err) {
      console.error('Failed to load payouts:', err)
      setPayouts([])
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    load()
  }, [load])

  const markProcessing = async (id) => {
    setSaving(id)
    try {
      await adminAPI.markProcessing(id)
      setMessage({ text: 'Payout marked as processing.', type: 'success' })
      load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to update payout status.', type: 'error' })
    } finally {
      setSaving(null)
    }
  }

  const markPaid = async (id) => {
    const bankRef = prompt('Enter bank reference / transaction ID:')
    if (!bankRef) return
    
    setSaving(id)
    try {
      await adminAPI.markPaid(id, { bank_reference: bankRef })
      setMessage({ text: 'Payout marked as paid.', type: 'success' })
      load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to mark payout as paid.', type: 'error' })
    } finally {
      setSaving(null)
    }
  }

  const openDetail = (payout) => {
    setSelectedPayout(payout)
    setDetailModal(true)
  }

  const formatCurrency = (value, currency = 'USD') => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const stats = {
    total: payouts.length,
    pending: payouts.filter(p => p.status === 'pending').length,
    processing: payouts.filter(p => p.status === 'processing').length,
    paid: payouts.filter(p => p.status === 'paid').length,
    totalAmount: payouts.reduce((sum, p) => sum + (p.amount_usd || 0), 0),
    pendingAmount: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount_usd || 0), 0)
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Operator Payouts</h2>
          <p>Track and release payments to charter operators</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="payout-stats">
        <div className="payout-stat-card">
          <div className="payout-stat-number">{stats.total}</div>
          <div className="payout-stat-label">Total Payouts</div>
        </div>
        <div className="payout-stat-card">
          <div className="payout-stat-number pending">{stats.pending}</div>
          <div className="payout-stat-label">Pending</div>
        </div>
        <div className="payout-stat-card">
          <div className="payout-stat-number processing">{stats.processing}</div>
          <div className="payout-stat-label">Processing</div>
        </div>
        <div className="payout-stat-card">
          <div className="payout-stat-number paid">{stats.paid}</div>
          <div className="payout-stat-label">Paid</div>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="payout-summary">
        <div className="payout-summary-item">
          <div className="payout-summary-label">Total Pending Amount</div>
          <div className="payout-summary-value" style={{ color: 'var(--amber)' }}>
            {formatCurrency(stats.pendingAmount)}
          </div>
        </div>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Total Processed</div>
          <div className="payout-summary-value" style={{ color: 'var(--green)' }}>
            {formatCurrency(stats.totalAmount - stats.pendingAmount)}
          </div>
        </div>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Overall Total</div>
          <div className="payout-summary-value">{formatCurrency(stats.totalAmount)}</div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input 
              className="form-control search-input" 
              placeholder="Operator name, reference..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>
        {(search || filter) && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => { setSearch(''); setFilter('') }}
            >
              <i className="bi bi-x-lg" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Payouts Table */}
      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p>Loading payouts...</p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-cash-stack" />
              <p>No payouts found.</p>
              {(search || filter) && (
                <button className="btn btn-outline-navy btn-sm" onClick={() => { setSearch(''); setFilter('') }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Operator</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id}>
                    <td style={{ cursor: 'pointer' }} onClick={() => openDetail(p)}>
                      <span className="td-ref">{String(p.reference || p.id).slice(0, 8)}…</span>
                    </td>
                    <td style={{ cursor: 'pointer' }} onClick={() => openDetail(p)}>
                      <div className="td-name">{p.operator_name || '—'}</div>
                    </td>
                    <td className="td-price">
                      {formatCurrency(p.amount_usd, p.currency)}
                    </td>
                    <td>{p.payment_method || 'Bank Transfer'}</td>
                    <td style={{ fontSize: '0.78rem' }}>{formatDate(p.due_date)}</td>
                    <td><Badge s={p.status} /></td>
                    <td>
                      <div className="td-actions">
                        {p.status === 'pending' && (
                          <button 
                            className="btn btn-outline-navy btn-xs" 
                            onClick={() => markProcessing(p.id)} 
                            disabled={saving === p.id}
                          >
                            <i className="bi bi-play-circle" /> Process
                          </button>
                        )}
                        {p.status === 'processing' && (
                          <button 
                            className="btn btn-green btn-xs" 
                            onClick={() => markPaid(p.id)} 
                            disabled={saving === p.id}
                          >
                            <i className="bi bi-check-lg" /> Mark Paid
                          </button>
                        )}
                        {p.status === 'paid' && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--green)' }}>
                            <i className="bi bi-check-circle-fill" /> Completed
                          </span>
                        )}
                        {p.status === 'failed' && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--red)' }}>
                            <i className="bi bi-x-circle-fill" /> Failed
                          </span>
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

      {/* Stats Summary */}
      {!loading && payouts.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center',
          borderTop: '1px solid var(--gray-100)'
        }}>
          Showing {payouts.length} payout{payouts.length !== 1 ? 's' : ''}
          {(search || filter) && ' with current filters'}
          {' · Total: '}{formatCurrency(stats.totalAmount)}
        </div>
      )}

      {/* Payout Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-cash-stack" /> Payout Details</>}>
        {selectedPayout && (
          <div>
            <div className="detail-row">
              <div className="detail-key">Reference</div>
              <div className="detail-val" style={{ fontFamily: 'monospace' }}>{selectedPayout.reference}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Operator</div>
              <div className="detail-val">{selectedPayout.operator_name}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Amount</div>
              <div className="detail-val td-price">
                {formatCurrency(selectedPayout.amount_usd, selectedPayout.currency)}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Payment Method</div>
              <div className="detail-val">{selectedPayout.payment_method || 'Bank Transfer'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Due Date</div>
              <div className="detail-val">{formatDate(selectedPayout.due_date)}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Status</div>
              <div className="detail-val"><Badge s={selectedPayout.status} /></div>
            </div>
            
            {selectedPayout.bank_account_name && (
              <div className="detail-row">
                <div className="detail-key">Bank Account</div>
                <div className="detail-val">
                  {selectedPayout.bank_account_name}<br />
                  <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                    {selectedPayout.bank_name} · {selectedPayout.bank_account_number}
                  </span>
                </div>
              </div>
            )}
            
            {selectedPayout.bank_reference && (
              <div className="detail-row">
                <div className="detail-key">Bank Reference</div>
                <div className="detail-val" style={{ fontFamily: 'monospace' }}>{selectedPayout.bank_reference}</div>
              </div>
            )}
            
            {selectedPayout.paid_at && (
              <div className="detail-row">
                <div className="detail-key">Paid At</div>
                <div className="detail-val">{new Date(selectedPayout.paid_at).toLocaleString()}</div>
              </div>
            )}
            
            <div className="detail-row">
              <div className="detail-key">Created</div>
              <div className="detail-val">{new Date(selectedPayout.created_at).toLocaleString()}</div>
            </div>

            {/* Quick Actions in Modal */}
            {(selectedPayout.status === 'pending' || selectedPayout.status === 'processing') && (
              <div className="detail-row" style={{ marginTop: '1rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
                <div className="detail-key">Quick Actions</div>
                <div className="detail-val">
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {selectedPayout.status === 'pending' && (
                      <button 
                        className="btn btn-outline-navy btn-sm" 
                        onClick={() => {
                          markProcessing(selectedPayout.id)
                          setDetailModal(false)
                        }}
                      >
                        <i className="bi bi-play-circle" /> Start Processing
                      </button>
                    )}
                    {selectedPayout.status === 'processing' && (
                      <button 
                        className="btn btn-green btn-sm" 
                        onClick={() => {
                          markPaid(selectedPayout.id)
                          setDetailModal(false)
                        }}
                      >
                        <i className="bi bi-check-lg" /> Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminPayoutsPage