// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN OPERATOR AIRCRAFT PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['pending', 'approved', 'active', 'maintenance', 'inactive', 'rejected']
const STATUS_COLOR = {
  pending: 'pending',
  approved: 'green',
  active: 'active',
  maintenance: 'maintenance',
  inactive: 'inactive',
  rejected: 'red'
}

function Badge({ s }) {
  const colorClass = STATUS_COLOR[s] || 'gray'
  const displayText = s?.toUpperCase() || '—'
  if (s === 'active') return <span className={`status-badge status-active`}>{displayText}</span>
  if (s === 'maintenance') return <span className={`status-badge status-maintenance`}>{displayText}</span>
  if (s === 'pending') return <span className={`status-badge status-pending`}>{displayText}</span>
  if (s === 'inactive') return <span className={`status-badge status-inactive`}>{displayText}</span>
  return <span className={`badge badge-${colorClass}`}>{displayText}</span>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function AdminOperatorAircraftPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const response = await adminAPI.opAircraft(params)
      const data = response?.data || response
      setAircraft(data.results || data || [])
    } catch (err) {
      console.error('Failed to load aircraft:', err)
      setAircraft([])
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'approved') {
        await adminAPI.approveAircraft(id)
      } else if (newStatus === 'rejected') {
        await adminAPI.rejectAircraft(id)
      } else {
        await adminAPI.updateAircraftStatus(id, { status: newStatus })
      }
      setMessage({ text: `Aircraft ${newStatus} successfully.`, type: 'success' })
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: `Failed to update aircraft status.`, type: 'error' })
      console.error('Failed to update aircraft status:', err)
    }
  }

  const viewDetails = (ac) => {
    setSelected(ac)
    setModal(true)
  }

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const stats = {
    total: aircraft.length,
    pending: aircraft.filter(a => a.status === 'pending' || !a.is_approved).length,
    active: aircraft.filter(a => a.status === 'active' && a.is_approved).length,
    maintenance: aircraft.filter(a => a.status === 'maintenance').length
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Operator Aircraft</h2>
          <p>Manage all aircraft listed by operators on the platform</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="users-stats">
        <div className="user-stat-card">
          <div className="user-stat-number">{stats.total}</div>
          <div className="user-stat-label">Total Aircraft</div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-number" style={{ color: 'var(--amber)' }}>{stats.pending}</div>
          <div className="user-stat-label">Pending Approval</div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-number" style={{ color: 'var(--green)' }}>{stats.active}</div>
          <div className="user-stat-label">Active</div>
        </div>
        <div className="user-stat-card">
          <div className="user-stat-number" style={{ color: 'var(--red)' }}>{stats.maintenance}</div>
          <div className="user-stat-label">Maintenance</div>
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
              placeholder="Aircraft name, operator, registration..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>
        {(search || status) && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => { setSearch(''); setStatus('') }}
            >
              <i className="bi bi-x-lg" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Aircraft Table */}
      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p>Loading aircraft...</p>
            </div>
          ) : aircraft.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-airplane" />
              <p>No aircraft found.</p>
              {(search || status) && (
                <button className="btn btn-outline-navy btn-sm" onClick={() => { setSearch(''); setStatus('') }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Aircraft</th>
                  <th>Operator</th>
                  <th>Registration</th>
                  <th>Category</th>
                  <th>Hourly Rate</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {aircraft.map(ac => (
                  <tr key={ac.id}>
                    <td style={{ cursor: 'pointer' }} onClick={() => viewDetails(ac)}>
                      <div className="td-name">{ac.name || '—'}</div>
                      <div className="td-email">{ac.model || '—'}</div>
                    </td>
                    <td>
                      <div className="td-name">{ac.operator_name || ac.operator?.company_name || '—'}</div>
                      <div className="td-email">{ac.operator_email || ac.operator?.email || '—'}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {ac.registration_number || '—'}
                    </td>
                    <td>
                      <span className="badge badge-gray">{ac.category_display || ac.category || '—'}</span>
                    </td>
                    <td className="td-price">{formatCurrency(ac.hourly_rate_usd)}/hr</td>
                    <td>{ac.total_flight_hours || ac.flight_hours || '—'} hrs</td>
                    <td><Badge s={ac.status} /></td>
                    <td>
                      <span className={`badge badge-${ac.is_approved ? 'green' : 'amber'}`}>
                        {ac.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button 
                          className="btn btn-ghost btn-xs" 
                                          onClick={() => viewDetails(ac)} 
                          title="View details"
                        >
                          <i className="bi bi-eye" />
                        </button>
                        {!ac.is_approved && (
                          <>
                            <button 
                              className="btn btn-green btn-xs" 
                              onClick={() => updateStatus(ac.id, 'approved')}
                              title="Approve"
                            >
                              <i className="bi bi-check-lg" />
                            </button>
                            <button 
                              className="btn btn-outline-red btn-xs" 
                              onClick={() => updateStatus(ac.id, 'rejected')}
                              title="Reject"
                            >
                              <i className="bi bi-x-lg" />
                            </button>
                          </>
                        )}
                        {ac.is_approved && ac.status === 'active' && (
                          <button 
                            className="btn btn-amber btn-xs" 
                            onClick={() => updateStatus(ac.id, 'maintenance')}
                            title="Set Maintenance"
                          >
                            <i className="bi bi-tools" />
                          </button>
                        )}
                        {ac.is_approved && ac.status === 'maintenance' && (
                          <button 
                            className="btn btn-green btn-xs" 
                            onClick={() => updateStatus(ac.id, 'active')}
                            title="Set Active"
                          >
                            <i className="bi bi-play-circle" />
                          </button>
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
      {!loading && aircraft.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center',
          borderTop: '1px solid var(--gray-100)'
        }}>
          Showing {aircraft.length} aircraft
          {(search || status) && ' with current filters'}
        </div>
      )}

      {/* Aircraft Details Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={<><i className="bi bi-info-circle" /> {selected?.name || 'Aircraft Details'}</>}>
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div className="aircraft-detail-group">
                  <label>Model</label>
                  <p>{selected.model || '—'}</p>
                </div>
                <div className="aircraft-detail-group">
                  <label>Registration</label>
                  <p style={{ fontFamily: 'monospace' }}>{selected.registration_number || '—'}</p>
                </div>
                <div className="aircraft-detail-group">
                  <label>Category</label>
                  <p>{selected.category_display || selected.category || '—'}</p>
                </div>
                <div className="aircraft-detail-group">
                  <label>Passenger Capacity</label>
                  <p>{selected.passenger_capacity || '—'} pax</p>
                </div>
              </div>
              <div>
                <div className="aircraft-detail-group">
                  <label>Base Location</label>
                  <p>{selected.base_location || '—'}</p>
                </div>
                <div className="aircraft-detail-group">
                  <label>Hourly Rate</label>
                  <p className="td-price">{formatCurrency(selected.hourly_rate_usd)}/hr</p>
                </div>
                <div className="aircraft-detail-group">
                  <label>Total Flight Hours</label>
                  <p>{selected.total_flight_hours || selected.flight_hours || '—'} hrs</p>
                </div>
                <div className="aircraft-detail-group">
                  <label>Range</label>
                  <p>{selected.range_km?.toLocaleString() || '—'} km</p>
                </div>
              </div>
            </div>

            <div className="aircraft-detail-group">
              <label>Description</label>
              <p style={{ lineHeight: 1.5 }}>{selected.description || 'No description provided.'}</p>
            </div>

            <div className="aircraft-detail-group">
              <label>Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selected.amenities?.length > 0 ? (
                  selected.amenities.map((a, i) => (
                    <span key={i} className="badge badge-gray">{a}</span>
                  ))
                ) : (
                  <span className="text-muted">No amenities listed</span>
                )}
              </div>
            </div>

            <div className="aircraft-detail-group">
              <label>Operator</label>
              <p>{selected.operator_name || selected.operator?.company_name || '—'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
                {selected.operator_email || selected.operator?.email}
              </p>
            </div>

            <div className="aircraft-detail-group">
              <label>Status</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge s={selected.status} />
                {!selected.is_approved && (
                  <span className="badge badge-amber">Awaiting Approval</span>
                )}
                {selected.is_approved && (
                  <span className="badge badge-green">Approved</span>
                )}
              </div>
            </div>

            {selected.maintenance_due && (
              <div className="aircraft-detail-group">
                <label>Maintenance Due</label>
                <p>{new Date(selected.maintenance_due).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminOperatorAircraftPage