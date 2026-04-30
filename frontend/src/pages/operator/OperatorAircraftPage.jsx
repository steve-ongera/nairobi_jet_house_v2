// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR AIRCRAFT PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

function Badge({ s, type = 'status' }) {
  const STATUS_COLOR = {
    available: 'green',
    pending: 'amber',
    booked: 'navy',
    maintenance: 'red',
    inactive: 'gray'
  }
  const colorClass = STATUS_COLOR[s] || 'gray'
  const displayText = s?.replace(/_/g, ' ') || '—'
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

export function OperatorAircraftPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingAircraft, setEditingAircraft] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [form, setForm] = useState({
    name: '',
    model: '',
    category: 'midsize',
    registration_number: '',
    passenger_capacity: '',
    range_km: '',
    hourly_rate_usd: '',
    year_of_manufacture: '',
    wifi_available: false,
    pets_allowed: false,
    description: '',
  })

  const CATEGORIES = [
    { value: 'light', label: 'Light Jet' },
    { value: 'midsize', label: 'Midsize Jet' },
    { value: 'super_midsize', label: 'Super Midsize' },
    { value: 'heavy', label: 'Heavy Jet' },
    { value: 'ultra_long', label: 'Ultra Long Range' },
    { value: 'vip_airliner', label: 'VIP Airliner' },
    { value: 'turboprop', label: 'Turboprop' },
    { value: 'helicopter', label: 'Helicopter' }
  ]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await operatorAPI.myAircraft()
      const data = response?.data?.results || response?.data || response || []
      setAircraft(data)
    } catch (err) {
      console.error('Failed to load aircraft:', err)
      setAircraft([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm({
      name: '',
      model: '',
      category: 'midsize',
      registration_number: '',
      passenger_capacity: '',
      range_km: '',
      hourly_rate_usd: '',
      year_of_manufacture: '',
      wifi_available: false,
      pets_allowed: false,
      description: '',
    })
    setError('')
    setEditingAircraft(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage({ text: '', type: '' })
    try {
      if (editingAircraft) {
        await operatorAPI.updateAircraft(editingAircraft.id, form)
        setMessage({ text: 'Aircraft updated successfully!', type: 'success' })
      } else {
        await operatorAPI.createAircraft(form)
        setMessage({ text: 'Aircraft submitted for approval!', type: 'success' })
      }
      setShowForm(false)
      resetForm()
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      const data = err?.response?.data
      setError(data?.detail || data?.message || 'Failed to save aircraft.')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (ac) => {
    setEditingAircraft(ac)
    setForm({
      name: ac.name || '',
      model: ac.model || '',
      category: ac.category || 'midsize',
      registration_number: ac.registration_number || '',
      passenger_capacity: ac.passenger_capacity || '',
      range_km: ac.range_km || '',
      hourly_rate_usd: ac.hourly_rate_usd || '',
      year_of_manufacture: ac.year_of_manufacture || '',
      wifi_available: ac.wifi_available || false,
      pets_allowed: ac.pets_allowed || false,
      description: ac.description || '',
    })
    setError('')
    setShowForm(true)
  }

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const formatNumber = (value) => {
    if (!value) return '—'
    return Number(value).toLocaleString()
  }

  const stats = {
    total: aircraft.length,
    available: aircraft.filter(a => a.status === 'available').length,
    pending: aircraft.filter(a => a.status === 'pending' || !a.is_approved).length,
    maintenance: aircraft.filter(a => a.status === 'maintenance').length
  }

  if (loading) {
    return (
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading aircraft...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>My Aircraft</h2>
          <p>Manage your aircraft fleet for charter</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
          <button 
            className={`btn ${showForm ? 'btn-outline-red' : 'btn-navy'} btn-sm`} 
            onClick={() => { setShowForm(!showForm); if (!showForm) resetForm() }}
          >
            <i className={`bi bi-${showForm ? 'x-lg' : 'plus-lg'}`} /> 
            {showForm ? 'Cancel' : 'Add Aircraft'}
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="operator-stats">
        <div className="operator-stat-card">
          <div className="operator-stat-number">{stats.total}</div>
          <div className="operator-stat-label">Total Aircraft</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--green)' }}>{stats.available}</div>
          <div className="operator-stat-label">Available</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--amber)' }}>{stats.pending}</div>
          <div className="operator-stat-label">Pending Approval</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--red)' }}>{stats.maintenance}</div>
          <div className="operator-stat-label">Maintenance</div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <div className="settings-card-header">
            <h4><i className="bi bi-airplane" /> {editingAircraft ? 'Edit Aircraft' : 'Add New Aircraft'}</h4>
          </div>
          <div className="settings-card-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <i className="bi bi-exclamation-triangle" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Aircraft Name <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                    placeholder="Gulfstream G650"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Model <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.model} 
                    onChange={e => setForm(f => ({ ...f, model: e.target.value }))} 
                    required 
                    placeholder="G650"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control" 
                    value={form.category} 
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Registration <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.registration_number} 
                    onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} 
                    required 
                    placeholder="N12345"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Passenger Capacity <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="number" 
                    value={form.passenger_capacity} 
                    onChange={e => setForm(f => ({ ...f, passenger_capacity: e.target.value }))} 
                    required 
                    placeholder="14"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Range (km) <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="number" 
                    value={form.range_km} 
                    onChange={e => setForm(f => ({ ...f, range_km: e.target.value }))} 
                    required 
                    placeholder="7000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rate (USD) <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01" 
                    value={form.hourly_rate_usd} 
                    onChange={e => setForm(f => ({ ...f, hourly_rate_usd: e.target.value }))} 
                    required 
                    placeholder="8500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Manufacture</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    value={form.year_of_manufacture} 
                    onChange={e => setForm(f => ({ ...f, year_of_manufacture: e.target.value }))} 
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  placeholder="Aircraft features, amenities, and special considerations..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.wifi_available} 
                    onChange={e => setForm(f => ({ ...f, wifi_available: e.target.checked }))} 
                  />
                  <span style={{ fontSize: '0.85rem' }}>WiFi Available</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.pets_allowed} 
                    onChange={e => setForm(f => ({ ...f, pets_allowed: e.target.checked }))} 
                  />
                  <span style={{ fontSize: '0.85rem' }}>Pets Allowed</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-navy" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                  ) : (
                    <><i className="bi bi-check-lg" /> {editingAircraft ? 'Update Aircraft' : 'Submit for Approval'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Aircraft List */}
      {aircraft.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-airplane" />
          <h3>No Aircraft Listed</h3>
          <p>Click "Add Aircraft" to list your first aircraft for charter.</p>
        </div>
      ) : (
        <div className="aircraft-list">
          {aircraft.map(ac => (
            <div key={ac.id} className="aircraft-card-item" onClick={() => openEditModal(ac)} style={{ cursor: 'pointer' }}>
              <div className="aircraft-card-left">
                <div className="aircraft-icon">
                  <i className="bi bi-airplane-fill" />
                </div>
                <div className="aircraft-info">
                  <div className="aircraft-name">{ac.name}</div>
                  <div className="aircraft-details">
                    {ac.registration_number} · {ac.category_display || ac.category} · {ac.passenger_capacity} pax · {formatNumber(ac.range_km)} km
                  </div>
                  <div className="aircraft-rate">
                    {formatCurrency(ac.hourly_rate_usd)}/hr
                  </div>
                  {ac.maintenance_due && (
                    <span className="badge badge-red" style={{ marginTop: '0.5rem' }}>
                      <i className="bi bi-tools" /> Maintenance Due
                    </span>
                  )}
                </div>
              </div>
              <div className="aircraft-card-right">
                <Badge s={ac.status} />
                {!ac.is_approved && ac.status !== 'pending' && (
                  <span className="badge badge-amber">Pending Approval</span>
                )}
                {ac.is_approved && (
                  <span className="approved-badge">
                    <i className="bi bi-check-circle-fill" /> Approved
                  </span>
                )}
                <button className="btn btn-outline-navy btn-sm" onClick={(e) => { e.stopPropagation(); openEditModal(ac); }}>
                  <i className="bi bi-pencil" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      <div className="alert alert-info" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
        <i className="bi bi-info-circle" />
        <div>
          <strong>Note:</strong> All newly listed aircraft require NJH admin approval before they appear publicly in search results and become available for charter.
        </div>
      </div>
    </div>
  )
}

export default OperatorAircraftPage