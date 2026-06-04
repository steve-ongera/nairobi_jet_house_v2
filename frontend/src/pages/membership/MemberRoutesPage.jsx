// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER ROUTES PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { savedRoutesAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'

export default function MemberRoutesPage() {
  const navigate = useNavigate()
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
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading saved routes...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Saved Routes</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Save your favorite routes for quick booking</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: showForm ? '#ef4444' : 'var(--color-navy)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <i className={`bi bi-${showForm ? 'x-lg' : 'plus-lg'}`} /> 
          {showForm ? 'Cancel' : 'Add Route'}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem 1rem', 
          background: message.type === 'success' ? 'rgba(26,127,90,0.08)' : 'rgba(192,57,43,0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(26,127,90,0.25)' : 'rgba(192,57,43,0.25)'}`,
          borderRadius: '6px',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Add Route Form */}
      {showForm && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-geo-alt" style={{ color: 'var(--color-gold)' }}></i> Save New Route
            </h4>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Route Name</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Nairobi to Dubai"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Origin <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    value={form.origin} 
                    onChange={e => setForm(f => ({ ...f, origin: e.target.value.toUpperCase() }))}
                    required
                    placeholder="NBO"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Destination <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    value={form.destination} 
                    onChange={e => setForm(f => ({ ...f, destination: e.target.value.toUpperCase() }))}
                    required
                    placeholder="DXB"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Notes</label>
                  <textarea 
                    rows={2}
                    value={form.notes} 
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any notes about this route..."
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={saving} style={{
                  padding: '0.6rem 1.2rem',
                  background: 'var(--color-navy)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {saving ? (
                    <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</>
                  ) : (
                    <><i className="bi bi-save"></i> Save Route</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Routes List */}
      {routes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-geo-alt" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Saved Routes</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>Save your favorite routes for quick booking in the future.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {routes.map(route => (
            <div 
              key={route.id} 
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-light-gray)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                transition: 'all var(--transition-base)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  {route.name || `${route.origin} → ${route.destination}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-navy)', fontSize: '0.8rem' }}>{route.origin}</span>
                  <i className="bi bi-arrow-right" style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}></i>
                  <span style={{ fontWeight: 500, color: 'var(--color-navy)', fontSize: '0.8rem' }}>{route.destination}</span>
                </div>
                {route.notes && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.15rem' }}>
                    {route.notes}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  onClick={() => navigate(`/member/book?origin=${route.origin}&destination=${route.destination}`)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    background: 'var(--color-navy)',
                    color: 'var(--color-white)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Book Now
                </button>
                <button 
                  onClick={() => handleDelete(route.id)}
                  style={{
                    padding: '0.4rem 0.7rem',
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}