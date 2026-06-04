// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER PAYMENTS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { bookingAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function MemberPaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true)
      try {
        const response = await bookingAPI.byEmail(user?.email)
        const bookings = response?.data?.results || response?.data || []
        setPayments(bookings.filter(b => b.payment_status === 'paid' || b.amount_paid))
      } catch (err) {
        console.error('Failed to load payments:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [user])

  const totalSpent = payments.reduce((sum, p) => sum + (Number(p.amount_paid) || Number(p.quoted_price_usd) || 0), 0)

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading payment history...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Payments</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>View your payment history and invoices</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-light-gray)',
          borderRadius: '10px',
          padding: '1.25rem',
          borderBottom: '2px solid var(--color-gold)'
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
            <i className="bi bi-currency-dollar" style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}></i>
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>
            Total Spent
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-navy)' }}>{formatCurrency(totalSpent)}</div>
        </div>
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-light-gray)',
          borderRadius: '10px',
          padding: '1.25rem'
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
            <i className="bi bi-receipt" style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}></i>
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>
            Total Transactions
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-navy)' }}>{payments.length}</div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-credit-card" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Payment History</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>Your payment history will appear here after your first booking.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{String(p.reference).slice(0, 8).toUpperCase()}…</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{formatDate(p.created_at)}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>{p.origin} → {p.destination}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(p.amount_paid || p.quoted_price_usd)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.2rem 0.6rem',
                        background: 'rgba(34,197,94,0.1)',
                        color: '#22c55e',
                        border: '1px solid rgba(34,197,94,0.3)',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}