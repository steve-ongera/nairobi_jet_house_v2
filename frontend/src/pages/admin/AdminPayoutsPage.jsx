// ═══════════════════════════════════════════════════════════════════════════════
// AdminPayoutsPage.jsx - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_COLOR = { 
  pending: '#f59e0b', 
  processing: '#0f2d5e', 
  paid: '#22c55e', 
  failed: '#ef4444', 
  disputed: '#ef4444' 
}

const STATUS_LABEL = { 
  pending: 'Pending', 
  processing: 'Processing', 
  paid: 'Paid', 
  failed: 'Failed', 
  disputed: 'Disputed' 
}

function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  const label = STATUS_LABEL[status] || status
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

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  
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
        maxWidth: '520px',
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

export default function AdminPayoutsPage() {
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Operator Payouts</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Track and release payments to charter operators</p>
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Payouts</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Pending</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f2d5e' }}>{stats.processing}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Processing</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.paid}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Paid</div>
        </div>
      </div>

      {/* Amount Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Total Pending Amount</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(stats.pendingAmount)}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Total Processed</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>{formatCurrency(stats.totalAmount - stats.pendingAmount)}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Overall Total</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>{formatCurrency(stats.totalAmount)}</div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem 1rem', 
          background: message.type === 'success' ? 'rgba(26,127,90,0.08)' : 'rgba(192,57,43,0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(26,127,90,0.25)' : 'rgba(192,57,43,0.25)'}`,
          borderRadius: '6px',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }}></i>
            <input 
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s ease' }}
              placeholder="Operator name, reference..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
        </div>
        <div style={{ minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Status</label>
          <select 
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>
        {(search || filter) && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>&nbsp;</label>
            <button 
              style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: 'var(--color-mid-gray)', fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => { setSearch(''); setFilter('') }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-mid-gray)'}
            >
              <i className="bi bi-x-lg"></i> Clear
            </button>
          </div>
        )}
      </div>

      {/* Payouts Table */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--color-mid-gray)' }}>Loading payouts...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : payouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-cash-stack" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No payouts found.</p>
              {(search || filter) && (
                <button 
                  style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => { setSearch(''); setFilter('') }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Operator</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Due Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => openDetail(p)}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{String(p.reference || p.id).slice(0, 8)}…</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => openDetail(p)}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{p.operator_name || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>
                      {formatCurrency(p.amount_usd, p.currency)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-dark-gray)' }}>{p.payment_method || 'Bank Transfer'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--color-dark-gray)' }}>{formatDate(p.due_date)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Badge status={p.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {p.status === 'pending' && (
                          <button 
                            style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                            onClick={() => markProcessing(p.id)} 
                            disabled={saving === p.id}
                          >
                            <i className="bi bi-play-circle"></i> Process
                          </button>
                        )}
                        {p.status === 'processing' && (
                          <button 
                            style={{ padding: '0.3rem 0.6rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                            onClick={() => markPaid(p.id)} 
                            disabled={saving === p.id}
                          >
                            <i className="bi bi-check-lg"></i> Mark Paid
                          </button>
                        )}
                        {p.status === 'paid' && (
                          <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>
                            <i className="bi bi-check-circle-fill"></i> Completed
                          </span>
                        )}
                        {p.status === 'failed' && (
                          <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>
                            <i className="bi bi-x-circle-fill"></i> Failed
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
        <div style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)', textAlign: 'center' }}>
          Showing {payouts.length} payout{payouts.length !== 1 ? 's' : ''}
          {(search || filter) && ' with current filters'}
          {' · Total: '}{formatCurrency(stats.totalAmount)}
        </div>
      )}

      {/* Payout Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-cash-stack"></i> Payout Details</>}>
        {selectedPayout && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Reference</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--color-dark-gray)' }}>{selectedPayout.reference}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Operator</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedPayout.operator_name}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Amount</div>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(selectedPayout.amount_usd, selectedPayout.currency)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Payment Method</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedPayout.payment_method || 'Bank Transfer'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Due Date</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{formatDate(selectedPayout.due_date)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Status</div>
              <div><Badge status={selectedPayout.status} /></div>
            </div>
            
            {selectedPayout.bank_account_name && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Bank Account</div>
                <div>
                  <div style={{ color: 'var(--color-dark-gray)' }}>{selectedPayout.bank_account_name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{selectedPayout.bank_name} · {selectedPayout.bank_account_number}</div>
                </div>
              </div>
            )}
            
            {selectedPayout.bank_reference && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Bank Reference</div>
                <div style={{ fontFamily: 'monospace', color: 'var(--color-dark-gray)' }}>{selectedPayout.bank_reference}</div>
              </div>
            )}
            
            {selectedPayout.paid_at && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Paid At</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selectedPayout.paid_at).toLocaleString()}</div>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Created</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selectedPayout.created_at).toLocaleString()}</div>
            </div>

            {/* Quick Actions in Modal */}
            {(selectedPayout.status === 'pending' || selectedPayout.status === 'processing') && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Quick Actions</div>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {selectedPayout.status === 'pending' && (
                      <button 
                        style={{ padding: '0.3rem 0.7rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                        onClick={() => {
                          markProcessing(selectedPayout.id)
                          setDetailModal(false)
                        }}
                      >
                        <i className="bi bi-play-circle"></i> Start Processing
                      </button>
                    )}
                    {selectedPayout.status === 'processing' && (
                      <button 
                        style={{ padding: '0.3rem 0.7rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                        onClick={() => {
                          markPaid(selectedPayout.id)
                          setDetailModal(false)
                        }}
                      >
                        <i className="bi bi-check-lg"></i> Mark as Paid
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