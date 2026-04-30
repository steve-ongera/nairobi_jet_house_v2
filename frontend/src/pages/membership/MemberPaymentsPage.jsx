// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER PAYMENTS PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { bookingAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export function MemberPaymentsPage() {
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
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading payment history...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Payments</h2>
          <p>View your payment history and invoices</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card gold">
          <div className="stat-card-icon"><i className="bi bi-currency-dollar" /></div>
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">{formatCurrency(totalSpent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-receipt" /></div>
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{payments.length}</div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-credit-card" />
          <h3>No Payment History</h3>
          <p>Your payment history will appear here after your first booking.</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td><span className="td-ref">{String(p.reference).slice(0, 8).toUpperCase()}</span></td>
                    <td>{formatDate(p.created_at)}</td>
                    <td>{p.origin} → {p.destination}</td>
                    <td className="td-price">{formatCurrency(p.amount_paid || p.quoted_price_usd)}</td>
                    <td><span className="badge badge-green">Paid</span></td>
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

export default MemberPaymentsPage