// ═══════════════════════════════════════════════════════════════════════════════
// OWNER REVENUE PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { marketplaceAPI } from '../../services/api'

function StatCard({ icon, label, value, color = '', sub = '' }) {
  const getColorStyle = () => {
    switch(color) {
      case 'gold': return { borderBottom: '2px solid var(--color-gold)' }
      case 'green': return { borderBottom: '2px solid #22c55e' }
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
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

export default function OwnerRevenuePage() {
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
    pending: '#f59e0b',
    confirmed: '#22c55e',
    in_flight: '#22c55e',
    completed: '#64748b',
    cancelled: '#ef4444'
  }

  const STATUS_LABEL = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_flight: 'In Flight',
    completed: 'Completed',
    cancelled: 'Cancelled'
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading revenue data...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Revenue</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Earnings and commission breakdown from your fleet</p>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Completed Bookings</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>{stats.completed}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Pending Bookings</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Average Net per Booking</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>{formatCurrency(stats.averageNet)}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Commission Rate</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>
            {totalGross > 0 ? `${Math.round((totalCommission / totalGross) * 100)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Status Filter</label>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
          >
            <option value="all">All Bookings</option>
            <option value="completed">Completed</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Sort By</label>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {(filter !== 'all' || sortBy !== 'date_desc') && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>&nbsp;</label>
            <button 
              onClick={() => { setFilter('all'); setSortBy('date_desc') }}
              style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: 'var(--color-mid-gray)', fontSize: '0.8rem', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-mid-gray)'}
            >
              <i className="bi bi-x-lg"></i> Reset
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-bar-chart" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Bookings Yet</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>When your aircraft gets booked, earnings will appear here.</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <i className="bi bi-filter" style={{ fontSize: '2rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '0.5rem' }}></i>
          <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No bookings match the selected filter.</p>
          <button onClick={() => setFilter('all')} style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer' }}>Clear filter</button>
        </div>
      ) : (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Client</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Aircraft</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Route</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Gross</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Commission</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Your Net</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.map(b => {
                  const statusColor = STATUS_COLOR[b.status] || '#64748b'
                  const statusLabel = STATUS_LABEL[b.status] || b.status?.replace(/_/g, ' ') || '—'
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.client_name || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{b.client_email || '—'}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-navy)' }}>{b.aircraft_name || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--color-dark-gray)' }}>{b.origin || '—'} → {b.destination || '—'}</div>
                        {b.origin_city && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>{b.origin_city} → {b.destination_city}</div>
                        )}
                       </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', whiteSpace: 'nowrap', color: 'var(--color-dark-gray)' }}>{formatDate(b.departure_datetime)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(b.gross_amount_usd)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--color-mid-gray)', fontSize: '0.8rem' }}>-{formatCurrency(b.commission_usd)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>{formatCurrency(b.net_owner_usd)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.2rem 0.6rem',
                          background: `${statusColor}15`,
                          color: statusColor,
                          border: `1px solid ${statusColor}30`,
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {!loading && filteredBookings.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)', textAlign: 'center' }}>
          Showing {filteredBookings.length} of {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          {filter !== 'all' && ` · Filtered by: ${filter}`}
        </div>
      )}
    </div>
  )
}