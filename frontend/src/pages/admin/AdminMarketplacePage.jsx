// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MARKETPLACE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'

export function AdminMarketplacePage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getMarketplace()
      .then(d => setBookings(d.results || d))
      .finally(() => setLoading(false))
  }, [])

  const STATUS_COLOR = {
    pending: 'amber',
    confirmed: 'green',
    in_flight: 'green',
    completed: 'gray',
    cancelled: 'red',
    disputed: 'red'
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Marketplace Bookings</h2>
          <p>Member bookings from listed fleet</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
          ) : bookings.length === 0 ? (
            <div className="table-empty"><i className="bi bi-shop" />No marketplace bookings.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Aircraft</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="td-name">{b.client_name}</div>
                      <div className="td-email">{b.client_email}</div>
                    </td>
                    <td style={{ fontSize: '0.83rem' }}>{b.aircraft_name}</td>
                    <td style={{ fontSize: '0.83rem' }}>{b.origin} → {b.destination}</td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(b.departure_datetime).toLocaleDateString()}</td>
                    <td className="td-price">${Number(b.gross_amount_usd).toLocaleString()}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>${Number(b.commission_usd).toLocaleString()}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[b.status] || 'gray'}`}>{b.status}</span></td>
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