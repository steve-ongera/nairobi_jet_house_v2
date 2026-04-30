// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR YACHTS PAGE - Clean & Simple
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

export function OperatorYachtsPage() {
  const [yachts, setYachts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingYacht, setEditingYacht] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [form, setForm] = useState({
    name: '',
    yacht_type: 'motor',
    length_meters: '',
    guest_capacity: '',
    crew_count: '',
    daily_rate_usd: '',
    home_port: '',
    description: '',
  })

  const YACHT_TYPES = [
    { value: 'sailing', label: 'Sailing Yacht' },
    { value: 'motor', label: 'Motor Yacht' },
    { value: 'catamaran', label: 'Catamaran' },
    { value: 'gulet', label: 'Gulet' },
    { value: 'superyacht', label: 'Superyacht' },
    { value: 'mega', label: 'Mega Yacht' }
  ]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await operatorAPI.myYachts()
      const data = response?.data?.results || response?.data || response || []
      setYachts(data)
    } catch (err) {
      console.error('Failed to load yachts:', err)
      setYachts([])
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
      yacht_type: 'motor',
      length_meters: '',
      guest_capacity: '',
      crew_count: '',
      daily_rate_usd: '',
      home_port: '',
      description: '',
    })
    setError('')
    setEditingYacht(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage({ text: '', type: '' })
    try {
      if (editingYacht) {
        await operatorAPI.updateYacht(editingYacht.id, form)
        setMessage({ text: 'Yacht updated successfully!', type: 'success' })
      } else {
        await operatorAPI.createYacht(form)
        setMessage({ text: 'Yacht submitted for approval!', type: 'success' })
      }
      setShowForm(false)
      resetForm()
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      const data = err?.response?.data
      setError(data?.detail || data?.message || 'Failed to save yacht.')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (yacht) => {
    setEditingYacht(yacht)
    setForm({
      name: yacht.name || '',
      yacht_type: yacht.yacht_type || 'motor',
      length_meters: yacht.length_meters || '',
      guest_capacity: yacht.guest_capacity || '',
      crew_count: yacht.crew_count || '',
      daily_rate_usd: yacht.daily_rate_usd || '',
      home_port: yacht.home_port || '',
      description: yacht.description || '',
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
    total: yachts.length,
    available: yachts.filter(y => y.status === 'available').length,
    pending: yachts.filter(y => y.status === 'pending' || !y.is_approved).length,
    booked: yachts.filter(y => y.status === 'booked').length
  }

  if (loading) {
    return (
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading yachts...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>My Yachts</h2>
          <p>Manage your yacht fleet for charter</p>
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
            {showForm ? 'Cancel' : 'Add Yacht'}
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
          <div className="operator-stat-label">Total Yachts</div>
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
          <div className="operator-stat-number" style={{ color: 'var(--navy)' }}>{stats.booked}</div>
          <div className="operator-stat-label">Booked</div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <div className="settings-card-header">
            <h4><i className="bi bi-water" /> {editingYacht ? 'Edit Yacht' : 'Add New Yacht'}</h4>
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
                  <label className="form-label">Yacht Name <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                    placeholder="Ocean Majesty"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Yacht Type</label>
                  <select 
                    className="form-control" 
                    value={form.yacht_type} 
                    onChange={e => setForm(f => ({ ...f, yacht_type: e.target.value }))}
                  >
                    {YACHT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Length (meters) <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.1"
                    value={form.length_meters} 
                    onChange={e => setForm(f => ({ ...f, length_meters: e.target.value }))} 
                    required 
                    placeholder="45"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guest Capacity <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="number" 
                    value={form.guest_capacity} 
                    onChange={e => setForm(f => ({ ...f, guest_capacity: e.target.value }))} 
                    required 
                    placeholder="12"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Crew Count <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="number" 
                    value={form.crew_count} 
                    onChange={e => setForm(f => ({ ...f, crew_count: e.target.value }))} 
                    required 
                    placeholder="6"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Daily Rate (USD) <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01"
                    value={form.daily_rate_usd} 
                    onChange={e => setForm(f => ({ ...f, daily_rate_usd: e.target.value }))} 
                    required 
                    placeholder="15000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Home Port <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.home_port} 
                    onChange={e => setForm(f => ({ ...f, home_port: e.target.value }))} 
                    required 
                    placeholder="Monaco"
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
                  placeholder="Yacht features, amenities, and special considerations..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-navy" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                  ) : (
                    <><i className="bi bi-check-lg" /> {editingYacht ? 'Update Yacht' : 'Submit for Approval'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yacht List */}
      {yachts.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-water" />
          <h3>No Yachts Listed</h3>
          <p>Click "Add Yacht" to list your first yacht for charter.</p>
        </div>
      ) : (
        <div className="yacht-list">
          {yachts.map(y => (
            <div key={y.id} className="yacht-card-item" onClick={() => openEditModal(y)} style={{ cursor: 'pointer' }}>
              <div className="yacht-card-left">
                <div className="yacht-icon">
                  <i className="bi bi-water" />
                </div>
                <div className="yacht-info">
                  <div className="yacht-name">{y.name}</div>
                  <div className="yacht-details">
                    {y.yacht_type} · {formatNumber(y.length_meters)}m · {y.guest_capacity} guests · {y.crew_count} crew
                  </div>
                  <div className="yacht-rate">
                    {formatCurrency(y.daily_rate_usd)}/day · Port: {y.home_port}
                  </div>
                </div>
              </div>
              <div className="yacht-card-right">
                <Badge s={y.status} />
                {!y.is_approved && y.status !== 'pending' && (
                  <span className="badge badge-amber">Pending Approval</span>
                )}
                {y.is_approved && (
                  <span className="approved-badge">
                    <i className="bi bi-check-circle-fill" /> Approved
                  </span>
                )}
                <button className="btn btn-outline-navy btn-sm" onClick={(e) => { e.stopPropagation(); openEditModal(y); }}>
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
          <strong>Note:</strong> All newly listed yachts require NJH admin approval before they appear publicly in search results and become available for charter.
        </div>
      </div>
    </div>
  )
}

export default OperatorYachtsPage