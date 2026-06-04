// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR AIRCRAFT PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

const STATUS_COLOR = {
  available: '#22c55e',
  pending: '#f59e0b',
  booked: '#0f2d5e',
  maintenance: '#ef4444',
  inactive: '#64748b'
}

const STATUS_LABEL = {
  available: 'Available',
  pending: 'Pending',
  booked: 'Booked',
  maintenance: 'Maintenance',
  inactive: 'Inactive'
}

function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  const label = STATUS_LABEL[status] || status?.replace(/_/g, ' ') || '—'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'capitalize'
    }}>
      {label}
    </span>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 20, 43, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-white)',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--color-light-gray)'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            color: 'var(--color-mid-gray)',
            padding: '0.25rem'
          }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function OperatorAircraftPage() {
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
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading aircraft...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>My Aircraft</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage your aircraft fleet for charter</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
          <button 
            onClick={() => { setShowForm(!showForm); if (!showForm) resetForm() }}
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
            <i className={`bi bi-${showForm ? 'x-lg' : 'plus-lg'}`}></i> 
            {showForm ? 'Cancel' : 'Add Aircraft'}
          </button>
        </div>
      </div>

      {/* Message Alert */}
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Aircraft</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.available}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Available</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Pending Approval</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ef4444' }}>{stats.maintenance}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Maintenance</div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-airplane"></i> {editingAircraft ? 'Edit Aircraft' : 'Add New Aircraft'}
            </h4>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {error && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Aircraft Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                    placeholder="Gulfstream G650"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Model <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    value={form.model} 
                    onChange={e => setForm(f => ({ ...f, model: e.target.value }))} 
                    required 
                    placeholder="G650"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Category</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Registration <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    value={form.registration_number} 
                    onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} 
                    required 
                    placeholder="N12345"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Passenger Capacity <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    value={form.passenger_capacity} 
                    onChange={e => setForm(f => ({ ...f, passenger_capacity: e.target.value }))} 
                    required 
                    placeholder="14"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Range (km) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    value={form.range_km} 
                    onChange={e => setForm(f => ({ ...f, range_km: e.target.value }))} 
                    required 
                    placeholder="7000"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Hourly Rate (USD) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={form.hourly_rate_usd} 
                    onChange={e => setForm(f => ({ ...f, hourly_rate_usd: e.target.value }))} 
                    required 
                    placeholder="8500"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Year of Manufacture</label>
                  <input 
                    type="number" 
                    value={form.year_of_manufacture} 
                    onChange={e => setForm(f => ({ ...f, year_of_manufacture: e.target.value }))} 
                    placeholder="2020"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Description</label>
                <textarea 
                  rows={3}
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  placeholder="Aircraft features, amenities, and special considerations..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.wifi_available} 
                    onChange={e => setForm(f => ({ ...f, wifi_available: e.target.checked }))} 
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>WiFi Available</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.pets_allowed} 
                    onChange={e => setForm(f => ({ ...f, pets_allowed: e.target.checked }))} 
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>Pets Allowed</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  {submitting ? (
                    <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Submitting…</>
                  ) : (
                    <><i className="bi bi-check-lg"></i> {editingAircraft ? 'Update Aircraft' : 'Submit for Approval'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Aircraft List */}
      {aircraft.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Aircraft Listed</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>Click "Add Aircraft" to list your first aircraft for charter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {aircraft.map(ac => (
            <div 
              key={ac.id} 
              onClick={() => openEditModal(ac)} 
              style={{ 
                cursor: 'pointer',
                background: 'var(--color-white)',
                border: '1px solid var(--color-light-gray)',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                transition: 'all var(--transition-base)'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--color-off-white)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-airplane-fill" style={{ fontSize: '1.2rem', color: 'var(--color-gold)' }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9rem' }}>{ac.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                    {ac.registration_number} · {ac.category_display || ac.category} · {ac.passenger_capacity} pax · {formatNumber(ac.range_km)} km
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {formatCurrency(ac.hourly_rate_usd)}/hr
                  </div>
                  {ac.maintenance_due && (
                    <span style={{
                      display: 'inline-flex',
                      marginTop: '0.5rem',
                      padding: '0.15rem 0.5rem',
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 600
                    }}>
                      <i className="bi bi-tools"></i> Maintenance Due
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <Badge status={ac.status} />
                {!ac.is_approved && ac.status !== 'pending' && (
                  <span style={{
                    display: 'inline-flex',
                    padding: '0.2rem 0.6rem',
                    background: 'rgba(245,158,11,0.1)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}>Pending Approval</span>
                )}
                {ac.is_approved && (
                  <span style={{ fontSize: '0.7rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="bi bi-check-circle-fill"></i> Approved
                  </span>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(ac); }}
                  style={{
                    padding: '0.3rem 0.6rem',
                    background: 'transparent',
                    color: 'var(--color-navy)',
                    border: '1px solid var(--color-navy)',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '0.75rem 1rem', 
        background: 'rgba(15,92,164,0.08)', 
        border: '1px solid rgba(15,92,164,0.22)', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.8rem',
        color: 'var(--color-info)'
      }}>
        <i className="bi bi-info-circle" style={{ fontSize: '1rem', color: 'var(--color-info)' }}></i>
        <div>
          <strong>Note:</strong> All newly listed aircraft require NJH admin approval before they appear publicly in search results and become available for charter.
        </div>
      </div>
    </div>
  )
}