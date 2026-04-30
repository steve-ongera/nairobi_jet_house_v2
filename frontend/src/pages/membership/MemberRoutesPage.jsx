// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER ROUTES PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { savedRoutesAPI } from '../../services/api'

export function MemberRoutesPage() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ origin: '', destination: '', name: '', notes: '' })
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    loadRoutes()
  }, [])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const response = await savedRoutesAPI.list()
      setRoutes(response?.data?.results || response?.data || [])
    } catch (err) {
      console.error('Failed to load routes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      await savedRoutesAPI.create(form)
      setMessage({ text: 'Route saved successfully!', type: 'success' })
      setShowForm(false)
      setForm({ origin: '', destination: '', name: '', notes: '' })
      await loadRoutes()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to save route.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this saved route?')) return
    try {
      await savedRoutesAPI.delete(id)
      await loadRoutes()
    } catch (err) {
      console.error('Failed to delete route:', err)
    }
  }

  if (loading) {
    return (
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading saved routes...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Saved Routes</h2>
          <p>Save your favorite routes for quick booking</p>
        </div>
        <div className="admin-actions-right">
          <button 
            className={`btn ${showForm ? 'btn-outline-red' : 'btn-navy'} btn-sm`} 
            onClick={() => setShowForm(!showForm)}
          >
            <i className={`bi bi-${showForm ? 'x-lg' : 'plus-lg'}`} /> 
            {showForm ? 'Cancel' : 'Add Route'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Add Route Form */}
      {showForm && (
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <div className="settings-card-header">
            <h4><i className="bi bi-geo-alt" /> Save New Route</h4>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Route Name</label>
                  <input 
                    className="form-control" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Nairobi to Dubai"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Origin <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.origin} 
                    onChange={e => setForm(f => ({ ...f, origin: e.target.value.toUpperCase() }))}
                    required
                    placeholder="NBO"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.destination} 
                    onChange={e => setForm(f => ({ ...f, destination: e.target.value.toUpperCase() }))}
                    required
                    placeholder="DXB"
                  />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-control" 
                    rows={2}
                    value={form.notes} 
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any notes about this route..."
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-navy" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving…</> : <><i className="bi bi-save" /> Save Route</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routes List */}
      {routes.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-geo-alt" />
          <h3>No Saved Routes</h3>
          <p>Save your favorite routes for quick booking in the future.</p>
        </div>
      ) : (
        <div className="routes-list">
          {routes.map(route => (
            <div key={route.id} className="route-card">
              <div className="route-card-info">
                <div className="route-card-name">{route.name || `${route.origin} → ${route.destination}`}</div>
                <div className="route-card-path">
                  <span className="route-origin">{route.origin}</span>
                  <i className="bi bi-arrow-right" />
                  <span className="route-destination">{route.destination}</span>
                </div>
                {route.notes && <div className="route-card-notes">{route.notes}</div>}
              </div>
              <div className="route-card-actions">
                <button 
                  className="btn btn-navy btn-sm"
                  onClick={() => window.location.href = `/member/book?origin=${route.origin}&destination=${route.destination}`}
                >
                  Book Now
                </button>
                <button 
                  className="btn btn-outline-red btn-sm"
                  onClick={() => handleDelete(route.id)}
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MemberRoutesPage