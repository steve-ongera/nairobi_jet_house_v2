// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN OPERATOR AIRCRAFT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api'

export function AdminOperatorAircraftPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const data = await adminApi.getOperatorAircraft(params)
      setAircraft(data.results || data)
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateAircraftStatus(id, { status: newStatus })
      await load()
    } catch (err) {
      console.error('Failed to update aircraft status:', err)
    }
  }

  const viewDetails = (ac) => {
    setSelected(ac)
    setModal(true)
  }

  const STATUS_COLOR = {
    pending: 'amber',
    approved: 'green',
    active: 'green',
    maintenance: 'red',
    inactive: 'gray',
    rejected: 'red'
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Operator Aircraft</h2>
          <p>Manage all aircraft listed by operators on the platform</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <i className="bi bi-search" />
          <input 
            className="form-control search-input" 
            placeholder="Search aircraft, operator, registration…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="form-control" style={{ width: 180 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending', 'approved', 'active', 'maintenance', 'inactive', 'rejected'].map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
          ) : aircraft.length === 0 ? (
            <div className="table-empty"><i className="bi bi-airplane" />No aircraft found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Aircraft</th>
                  <th>Operator</th>
                  <th>Registration</th>
                  <th>Category</th>
                  <th>Hourly Rate</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {aircraft.map(ac => (
                  <tr key={ac.id}>
                    <td className="td-name">
                      {ac.name}
                      <div className="td-sub">{ac.model}</div>
                    </td>
                    <td>
                      <div className="td-name">{ac.operator_name || ac.operator?.company_name || '—'}</div>
                      <div className="td-email">{ac.operator_email || ac.operator?.email}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>{ac.registration_number}</td>
                    <td><span className="badge badge-gray">{ac.category_display || ac.category}</span></td>
                    <td className="td-price">${Number(ac.hourly_rate_usd).toLocaleString()}/hr</td>
                    <td>{ac.total_flight_hours || ac.flight_hours || '—'} hrs</td>
                    <td>
                      <span className={`badge badge-${STATUS_COLOR[ac.status] || 'gray'}`}>
                        {ac.status?.toUpperCase() || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${ac.is_approved ? 'green' : 'amber'}`}>
                        {ac.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-xs" onClick={() => viewDetails(ac)}>
                          <i className="bi bi-eye" />
                        </button>
                        {!ac.is_approved && (
                          <button className="btn btn-green btn-xs" onClick={() => updateStatus(ac.id, 'approved')}>
                            Approve
                          </button>
                        )}
                        {ac.is_approved && ac.status === 'active' && (
                          <button className="btn btn-amber btn-xs" onClick={() => updateStatus(ac.id, 'maintenance')}>
                            Set Maintenance
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

      {/* Aircraft Details Modal */}
      {modal && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">
                <i className="bi bi-info-circle" /> {selected.name} — {selected.registration_number}
              </div>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div className="detail-group">
                    <label>Model</label>
                    <p>{selected.model}</p>
                  </div>
                  <div className="detail-group">
                    <label>Category</label>
                    <p>{selected.category_display || selected.category}</p>
                  </div>
                  <div className="detail-group">
                    <label>Passenger Capacity</label>
                    <p>{selected.passenger_capacity} pax</p>
                  </div>
                  <div className="detail-group">
                    <label>Range</label>
                    <p>{selected.range_km?.toLocaleString()} km</p>
                  </div>
                </div>
                <div>
                  <div className="detail-group">
                    <label>Base Location</label>
                    <p>{selected.base_location}</p>
                  </div>
                  <div className="detail-group">
                    <label>Hourly Rate</label>
                    <p className="td-price">${Number(selected.hourly_rate_usd).toLocaleString()}/hr</p>
                  </div>
                  <div className="detail-group">
                    <label>Total Flight Hours</label>
                    <p>{selected.total_flight_hours || selected.flight_hours || '—'} hrs</p>
                  </div>
                  <div className="detail-group">
                    <label>Maintenance Due</label>
                    <p>{selected.maintenance_due || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="detail-group">
                <label>Description</label>
                <p style={{ lineHeight: 1.5 }}>{selected.description || 'No description provided.'}</p>
              </div>
              <div className="detail-group">
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
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOperatorAircraftPage