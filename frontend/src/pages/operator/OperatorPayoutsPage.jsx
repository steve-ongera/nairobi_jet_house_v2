// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR PAYOUTS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

function StatCard({ icon, label, value, color = '' }) {
  return (
    <div className={`stat-card${color ? ' ' + color : ''}`}>
      <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
    </div>
  )
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

export function OperatorPayoutsPage() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [detailModal, setDetailModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await operatorAPI.opBookings({ status: 'completed' })
      const data = response?.data?.results || response?.data || response || []
      setPayouts(data)
    } catch (err) {
      console.error('Failed to load payouts:', err)
      setPayouts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openDetail = (payout) => {
    setSelectedPayout(payout)
    setDetailModal(true)
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '—'
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

  const totalEarned = payouts.reduce((sum, p) => sum + (Number(p.operator_payout_usd) || 0), 0)
  const averagePayout = payouts.length > 0 ? totalEarned / payouts.length : 0

  const stats = {
    total: payouts.length,
    totalEarned: totalEarned,
    averagePayout: averagePayout,
    thisMonth: payouts.filter(p => {
      const date = new Date(p.updated_at)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).reduce((sum, p) => sum + (Number(p.operator_payout_usd) || 0), 0)
  }

  if (loading) {
    return (
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading payout history...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Payout History</h2>
          <p>Track your earnings from completed charters</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <StatCard 
          icon="bi-currency-dollar" 
          label="Total Earned" 
          value={formatCurrency(stats.totalEarned)} 
          color="gold"
        />
        <StatCard 
          icon="bi-calendar-month" 
          label="This Month" 
          value={formatCurrency(stats.thisMonth)} 
          color="navy"
        />
        <StatCard 
          icon="bi-calculator" 
          label="Average per Booking" 
          value={formatCurrency(stats.averagePayout)} 
        />
        <StatCard 
          icon="bi-list-ol" 
          label="Completed Bookings" 
          value={stats.total} 
        />
      </div>

      {/* Payout List */}
      {payouts.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-cash-stack" />
          <h3>No Payouts Yet</h3>
          <p>Completed bookings will appear here once your charters are finished and processed.</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Asset</th>
                  <th>Completed Date</th>
                  <th>Payout Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} onClick={() => openDetail(p)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span className="td-ref">{String(p.reference).slice(0, 8).toUpperCase()}…</span>
                    </td>
                    <td>
                      <div className="td-name">{p.asset_label || p.asset_type || '—'}</div>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {formatDate(p.updated_at)}
                    </td>
                    <td className="td-price" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                      {formatCurrency(p.operator_payout_usd)}
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline-navy btn-xs" 
                        onClick={(e) => { e.stopPropagation(); openDetail(p); }}
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {payouts.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center',
          borderTop: '1px solid var(--gray-100)'
        }}>
          Showing {payouts.length} completed booking{payouts.length !== 1 ? 's' : ''} · Total earned: {formatCurrency(stats.totalEarned)}
        </div>
      )}

      {/* Payout Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-cash-stack" /> Payout Details</>}>
        {selectedPayout && (
          <div>
            <div className="detail-row">
              <div className="detail-key">Booking Reference</div>
              <div className="detail-val" style={{ fontFamily: 'monospace' }}>{selectedPayout.reference}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Asset</div>
              <div className="detail-val">{selectedPayout.asset_label || selectedPayout.asset_type || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Payout Amount</div>
              <div className="detail-val td-price" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                {formatCurrency(selectedPayout.operator_payout_usd)}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-key">Completed Date</div>
              <div className="detail-val">{new Date(selectedPayout.updated_at).toLocaleString()}</div>
            </div>
            {selectedPayout.operator_reference && (
              <div className="detail-row">
                <div className="detail-key">Your Reference</div>
                <div className="detail-val">{selectedPayout.operator_reference}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Info Note */}
      <div className="alert alert-info" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
        <i className="bi bi-info-circle" />
        <div>
          <strong>Payment Terms:</strong> Payouts are processed within your agreed payment terms (typically 7 days after trip completion).
          For payout inquiries, contact{' '}
          <a href="mailto:ops@nairobijethouse.com" style={{ color: 'var(--gold)' }}>
            ops@nairobijethouse.com
          </a>
        </div>
      </div>
    </div>
  )
}

export default OperatorPayoutsPage