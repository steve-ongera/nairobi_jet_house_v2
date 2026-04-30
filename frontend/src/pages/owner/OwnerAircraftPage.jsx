// ═══════════════════════════════════════════════════════════════════════════════
// OWNER AIRCRAFT PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { marketplaceAPI } from '../../services/api'

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

export function OwnerAircraftPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingAircraft, setEditingAircraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const blankForm = () => ({ 
    name: '', 
    model: '', 
    category: 'light', 
    registration_number: '', 
    base_location: '', 
    passenger_capacity: '', 
    range_km: '', 
    hourly_rate_usd: '', 
    description: '', 
    amenities: [] 
  })

  const [form, setForm] = useState(blankForm())

  const CATEGORIES = [
    { value: 'light', label: 'Light Jet' },
    { value: 'midsize', label: 'Midsize Jet' },
    { value: 'super_midsize', label: 'Super Midsize' },
    { value: 'heavy', label: 'Heavy Jet' },
    { value: 'ultra_long', label: 'Ultra Long Range' },
    { value: 'vip_airliner', label: 'VIP Airliner' }
  ]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await marketplaceAPI.aircraft()
      const data = response?.data || response
      setAircraft(data.results || data || [])
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

  const submitAircraft = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      if (editingAircraft) {
        await marketplaceAPI.updateAircraft(editingAircraft.id, form)
        setMessage({ text: 'Aircraft updated successfully!', type: 'success' })
      } else {
        await marketplaceAPI.createAircraft(form)
        setMessage({ text: 'Aircraft added successfully!', type: 'success' })
      }
      setModal(false)
      setForm(blankForm())
      setEditingAircraft(null)
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      const data = err?.response?.data
      setMessage({ text: data?.detail || 'Failed to save aircraft', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const openAddModal = () => {
    setForm(blankForm())
    setEditingAircraft(null)
    setMessage({ text: '', type: '' })
    setModal(true)
  }

  const openEditModal = (ac) => {
    setEditingAircraft(ac)
    setForm({
      name: ac.name || '',
      model: ac.model || '',
      category: ac.category || 'light',
      registration_number: ac.registration_number || '',
      base_location: ac.base_location || '',
      passenger_capacity: ac.passenger_capacity || '',
      range_km: ac.range_km || '',
      hourly_rate_usd: ac.hourly_rate_usd || '',
      description: ac.description || '',
      amenities: ac.amenities || []
    })
    setMessage({ text: '', type: '' })
    setModal(true)
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

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>My Aircraft</h2>
          <p>Aircraft you have listed on the platform</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
          <button className="btn btn-navy btn-sm" onClick={openAddModal}>
            <i className="bi bi-plus-lg" /> Add Aircraft
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
          <div className="operator-stat-label">Pending</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--red)' }}>{stats.maintenance}</div>
          <div className="operator-stat-label">Maintenance</div>
        </div>
      </div>

      {/* Aircraft List */}
      {loading ? (
        <div className="table-empty">
          <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
          <p>Loading aircraft...</p>
        </div>
      ) : aircraft.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-airplane" />
          <h3>No Aircraft Listed</h3>
          <p>Add your aircraft to start earning revenue from the NairobiJetHouse marketplace.</p>
          <button className="btn btn-navy" onClick={openAddModal}>
            <i className="bi bi-plus-lg" /> Add First Aircraft
          </button>
        </div>
      ) : (
        <div className="aircraft-list">
          {aircraft.map(ac => (
            <div key={ac.id} className="aircraft-card-item">
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
                    {formatCurrency(ac.hourly_rate_usd)}/hr · Base: {ac.base_location}
                  </div>
                  {ac.maintenance_due && (
                    <span className="badge badge-red" style={{ marginTop: '0.5rem' }}>
                      <i className="bi bi-tools" /> Maintenance Due
                    </span>
                  )}
                </div>
              </div>
              <div className="aircraft-card-right">
                <div className="hours-to-service">
                  <div className="hours-label">Hours to service</div>
                  <div className={`hours-value ${ac.hours_until_maintenance < 20 ? 'urgent' : ''}`}>
                    {ac.hours_until_maintenance || '—'}
                  </div>
                </div>
                <span className={`badge badge-${ac.status === 'available' ? 'green' : ac.status === 'maintenance' ? 'red' : 'amber'}`}>
                  {ac.status || 'pending'}
                </span>
                {ac.is_approved ? (
                  <span className="approved-badge">
                    <i className="bi bi-check-circle-fill" /> Approved
                  </span>
                ) : (
                  <span className="badge badge-amber">Pending Approval</span>
                )}
                <button 
                  className="btn btn-outline-navy btn-sm" 
                  onClick={() => openEditModal(ac)}
                  title="Edit"
                >
                  <i className="bi bi-pencil" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Aircraft Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={<><i className="bi bi-airplane" /> {editingAircraft ? 'Edit Aircraft' : 'Add Aircraft'}</>}>
        <form onSubmit={submitAircraft}>
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
              <label className="form-label">Base Location <span className="req">*</span></label>
              <input 
                className="form-control" 
                value={form.base_location} 
                onChange={e => setForm(f => ({ ...f, base_location: e.target.value }))} 
                required 
                placeholder="Nairobi, Kenya"
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
            <div className="form-group form-full">
              <label className="form-label">Description</label>
              <textarea 
                className="form-control" 
                rows={3}
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                placeholder="Aircraft features, amenities, and special considerations..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
              ) : (
                <><i className="bi bi-check-lg" /> {editingAircraft ? 'Update Aircraft' : 'Add Aircraft'}</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default OwnerAircraftPage