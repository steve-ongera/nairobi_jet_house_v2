// ═══════════════════════════════════════════════════════════════════════════════
// OWNER REVENUE PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { marketplaceAPI } from '../../services/api'

function StatCard({ icon, label, value, color = '', sub = '' }) {
  return (
    <div className={`stat-card${color ? ' ' + color : ''}`}>
      <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {sub && <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

export function OwnerRevenuePage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await marketplaceAPI.myBookings()
      const data = response?.data || response
      setBookings(data.results || data || [])
    } catch (err) {
      console.error('Failed to load revenue data:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Calculate totals
  const totalGross = bookings.reduce((sum, b) => sum + Number(b.gross_amount_usd || 0), 0)
  const totalNet = bookings.reduce((sum, b) => sum + Number(b.net_owner_usd || 0), 0)
  const totalCommission = bookings.reduce((sum, b) => sum + Number(b.commission_usd || 0), 0)
  
  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true
    if (filter === 'completed') return b.status === 'completed'
    if (filter === 'confirmed') return b.status === 'confirmed'
    if (filter === 'pending') return b.status === 'pending'
    return true
  })

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.departure_datetime) - new Date(a.departure_datetime)
    if (sortBy === 'date_asc') return new Date(a.departure_datetime) - new Date(b.departure_datetime)
    if (sortBy === 'amount_desc') return (b.gross_amount_usd || 0) - (a.gross_amount_usd || 0)
    if (sortBy === 'amount_asc') return (a.gross_amount_usd || 0) - (b.gross_amount_usd || 0)
    return 0
  })

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

  const STATUS_COLOR = {
    pending: 'amber',
    confirmed: 'green',
    in_flight: 'green',
    completed: 'gray',
    cancelled: 'red'
  }

  const stats = {
    totalBookings: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    averageNet: bookings.length > 0 ? totalNet / bookings.length : 0
  }

  const sortOptions = [
    { value: 'date_desc', label: 'Latest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'amount_desc', label: 'Highest Amount' },
    { value: 'amount_asc', label: 'Lowest Amount' }
  ]

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Revenue</h2>
          <p>Earnings and commission breakdown from your fleet</p>
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
          label="Gross Revenue" 
          value={formatCurrency(totalGross)} 
          color="gold"
        />
        <StatCard 
          icon="bi-wallet2" 
          label="Your Net" 
          value={formatCurrency(totalNet)} 
          color="green"
          sub="After platform commission"
        />
        <StatCard 
          icon="bi-percent" 
          label="Platform Commission" 
          value={formatCurrency(totalCommission)} 
          color="navy"
          sub={`${totalGross > 0 ? Math.round((totalCommission / totalGross) * 100) : 0}% of gross`}
        />
        <StatCard 
          icon="bi-list-ol" 
          label="Total Bookings" 
          value={stats.totalBookings} 
        />
      </div>

      {/* Additional Stats Row */}
      <div className="payout-summary" style={{ marginBottom: '1.5rem' }}>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Completed Bookings</div>
          <div className="payout-summary-value" style={{ color: 'var(--green)' }}>{stats.completed}</div>
        </div>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Pending Bookings</div>
          <div className="payout-summary-value" style={{ color: 'var(--amber)' }}>{stats.pending}</div>
        </div>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Average Net per Booking</div>
          <div className="payout-summary-value">{formatCurrency(stats.averageNet)}</div>
        </div>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Commission Rate</div>
          <div className="payout-summary-value">
            {totalGross > 0 ? `${Math.round((totalCommission / totalGross) * 100)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Status Filter</label>
          <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Bookings</option>
            <option value="completed">Completed</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select className="form-control" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {(filter !== 'all' || sortBy !== 'date_desc') && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => { setFilter('all'); setSortBy('date_desc') }}
            >
              <i className="bi bi-x-lg" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="table-empty">
          <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
          <p>Loading revenue data...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bar-chart" />
          <h3>No Bookings Yet</h3>
          <p>When your aircraft gets booked, earnings will appear here.</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="table-empty">
          <i className="bi bi-filter" />
          <p>No bookings match the selected filter.</p>
          <button className="btn btn-outline-navy btn-sm" onClick={() => setFilter('all')}>
            Clear filter
          </button>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-scroll">
            <table className="table">
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
                {sortedBookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="td-name">{b.client_name || '—'}</div>
                      <div className="td-email">{b.client_email || '—'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--navy)' }}>
                      {b.aircraft_name || '—'}
                    </td>
                    <td style={{ fontSize: '0.83rem' }}>
                      <div>{b.origin || '—'} → {b.destination || '—'}</div>
                      {b.origin_city && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                          {b.origin_city} → {b.destination_city}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDate(b.departure_datetime)}
                    </td>
                    <td className="td-price">{formatCurrency(b.gross_amount_usd)}</td>
                    <td style={{ color: 'var(--gray-400)', fontSize: '0.83rem' }}>
                      -{formatCurrency(b.commission_usd)}
                    </td>
                    <td className="td-price" style={{ color: 'var(--green)', fontWeight: 700 }}>
                      {formatCurrency(b.net_owner_usd)}
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_COLOR[b.status] || 'gray'}`}>
                        {b.status?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {!loading && filteredBookings.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center',
          borderTop: '1px solid var(--gray-100)'
        }}>
          Showing {filteredBookings.length} of {bookings.length} booking{sortedBookings.length !== 1 ? 's' : ''}
          {filter !== 'all' && ` · Filtered by: ${filter}`}
        </div>
      )}
    </div>
  )
}

export default OwnerRevenuePage