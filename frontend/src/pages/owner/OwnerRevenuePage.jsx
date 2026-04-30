// ═══════════════════════════════════════════════════════════════════════════════
// OWNER REVENUE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { marketplaceApi } from '../../services/api'

function PageHeader({ title, sub, action }) {
  return (
    <div className="dash-header">
      <div className="dash-header-left"><h2>{title}</h2><p>{sub}</p></div>
      {action}
    </div>
  )
}

export function OwnerRevenuePage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    marketplaceApi.getBookings()
      .then(d => setBookings(d.results || d))
      .finally(() => setLoading(false))
  }, [])

  const totalGross = bookings.reduce((s, b) => s + Number(b.gross_amount_usd || 0), 0)
  const totalNet = bookings.reduce((s, b) => s + Number(b.net_owner_usd || 0), 0)
  const totalCommission = bookings.reduce((s, b) => s + Number(b.commission_usd || 0), 0)
  
  const fmt = (n) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

  const STATUS_COLOR = {
    pending: 'amber',
    confirmed: 'green',
    in_flight: 'green',
    completed: 'gray',
    cancelled: 'red'
  }

  return (
    <div>
      <PageHeader title="Revenue" sub="Earnings and commission breakdown from your fleet" />

      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-currency-dollar" /></div>
          <div className="stat-label">Gross Revenue</div>
          <div className="stat-value">{fmt(totalGross)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon"><i className="bi bi-wallet2" /></div>
          <div className="stat-label">Your Net</div>
          <div className="stat-value">{fmt(totalNet)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-percent" /></div>
          <div className="stat-label">Platform Commission</div>
          <div className="stat-value">{fmt(totalCommission)}</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-card-icon"><i className="bi bi-list-ol" /></div>
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{bookings.length}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner-ring" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="table-empty">
          <i className="bi bi-bar-chart" />No bookings to display.
        </div>
      ) : (
        <div className="table-card">
          <div className="table-scroll">
             <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Aircraft</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Your Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="td-name">{b.client_name || '—'}</td>
                    <td style={{ fontSize: '0.83rem' }}>{b.aircraft_name}</td>
                    <td style={{ fontSize: '0.83rem' }}>{b.origin} → {b.destination}</td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {new Date(b.departure_datetime).toLocaleDateString()}
                    </td>
                    <td className="td-price">{fmt(b.gross_amount_usd)}</td>
                    <td style={{ color: 'var(--gray-400)', fontSize: '0.83rem' }}>
                      -{fmt(b.commission_usd)}
                    </td>
                    <td className="td-price" style={{ color: 'var(--green)' }}>
                      {fmt(b.net_owner_usd)}
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_COLOR[b.status] || 'gray'}`}>
                        {b.status}
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