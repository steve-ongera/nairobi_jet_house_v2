// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR PAYOUTS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

function StatCard({ icon, label, value, color = '' }) {
  const getColorStyle = () => {
    switch(color) {
      case 'gold': return { borderBottom: '2px solid var(--color-gold)' }
      case 'navy': return { borderBottom: '2px solid var(--color-navy)' }
      default: return {}
    }
  }

  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-light-gray)',
      borderRadius: '10px',
      padding: '1.25rem',
      position: 'relative',
      transition: 'all var(--transition-base)',
      ...getColorStyle()
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        background: 'rgba(15,45,94,0.08)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.75rem'
      }}>
        <i className={`bi ${icon}`} style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}></i>
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-navy)' }}>{value ?? '—'}</div>
    </div>
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

export default function OperatorPayoutsPage() {
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
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading payout history...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Payout History</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Track your earnings from completed charters</p>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-cash-stack" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Payouts Yet</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>Completed bookings will appear here once your charters are finished and processed.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Asset</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Completed Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Payout Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} onClick={() => openDetail(p)} style={{ borderBottom: '1px solid var(--color-light-gray)', cursor: 'pointer' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                      {String(p.reference).slice(0, 8).toUpperCase()}…
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{p.asset_label || p.asset_type || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--color-dark-gray)' }}>
                      {formatDate(p.updated_at)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#c9992e' }}>
                      {formatCurrency(p.operator_payout_usd)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDetail(p); }}
                        style={{
                          padding: '0.3rem 0.6rem',
                          background: 'transparent',
                          color: 'var(--color-navy)',
                          border: '1px solid var(--color-navy)',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="bi bi-eye"></i>
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
        <div style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)', textAlign: 'center' }}>
          Showing {payouts.length} completed booking{payouts.length !== 1 ? 's' : ''} · Total earned: {formatCurrency(stats.totalEarned)}
        </div>
      )}

      {/* Payout Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-cash-stack"></i> Payout Details</>}>
        {selectedPayout && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Booking Reference</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--color-dark-gray)' }}>{selectedPayout.reference}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Asset</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selectedPayout.asset_label || selectedPayout.asset_type || '—'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Payout Amount</div>
              <div style={{ fontWeight: 700, color: '#c9992e', fontSize: '1rem' }}>{formatCurrency(selectedPayout.operator_payout_usd)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Completed Date</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selectedPayout.updated_at).toLocaleString()}</div>
            </div>
            {selectedPayout.operator_reference && (
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Your Reference</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selectedPayout.operator_reference}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Info Note */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '0.75rem 1rem', 
        background: 'rgba(15,92,164,0.08)', 
        border: '1px solid rgba(15,92,164,0.22)', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.8rem',
        color: 'var(--color-info)'
      }}>
        <i className="bi bi-info-circle" style={{ fontSize: '1rem', color: 'var(--color-info)' }}></i>
        <div>
          <strong>Payment Terms:</strong> Payouts are processed within your agreed payment terms (typically 7 days after trip completion).
          For payout inquiries, contact{' '}
          <a href="mailto:nairobijethouse@gmail.com" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
            nairobijethouse@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}