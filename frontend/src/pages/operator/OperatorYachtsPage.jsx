// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR YACHTS PAGE - Clean & Simple
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

export default function OperatorYachtsPage() {
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
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading yachts...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>My Yachts</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage your yacht fleet for charter</p>
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
            {showForm ? 'Cancel' : 'Add Yacht'}
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
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Yachts</div>
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
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f2d5e' }}>{stats.booked}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Booked</div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-water" style={{ color: 'var(--color-gold)' }}></i> {editingYacht ? 'Edit Yacht' : 'Add New Yacht'}
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Yacht Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                    placeholder="Ocean Majesty"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Yacht Type</label>
                  <select 
                    value={form.yacht_type} 
                    onChange={e => setForm(f => ({ ...f, yacht_type: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  >
                    {YACHT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Length (meters) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={form.length_meters} 
                    onChange={e => setForm(f => ({ ...f, length_meters: e.target.value }))} 
                    required 
                    placeholder="45"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Guest Capacity <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    value={form.guest_capacity} 
                    onChange={e => setForm(f => ({ ...f, guest_capacity: e.target.value }))} 
                    required 
                    placeholder="12"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Crew Count <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    value={form.crew_count} 
                    onChange={e => setForm(f => ({ ...f, crew_count: e.target.value }))} 
                    required 
                    placeholder="6"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Daily Rate (USD) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.daily_rate_usd} 
                    onChange={e => setForm(f => ({ ...f, daily_rate_usd: e.target.value }))} 
                    required 
                    placeholder="15000"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Home Port <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input 
                    value={form.home_port} 
                    onChange={e => setForm(f => ({ ...f, home_port: e.target.value }))} 
                    required 
                    placeholder="Monaco"
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
                  placeholder="Yacht features, amenities, and special considerations..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  {submitting ? (
                    <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Submitting…</>
                  ) : (
                    <><i className="bi bi-check-lg"></i> {editingYacht ? 'Update Yacht' : 'Submit for Approval'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yacht List */}
      {yachts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-water" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Yachts Listed</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>Click "Add Yacht" to list your first yacht for charter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {yachts.map(y => (
            <div 
              key={y.id} 
              onClick={() => openEditModal(y)} 
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
                  <i className="bi bi-water" style={{ fontSize: '1.2rem', color: 'var(--color-gold)' }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9rem' }}>{y.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                    {y.yacht_type} · {formatNumber(y.length_meters)}m · {y.guest_capacity} guests · {y.crew_count} crew
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {formatCurrency(y.daily_rate_usd)}/day · Port: {y.home_port}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <Badge status={y.status} />
                {!y.is_approved && y.status !== 'pending' && (
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
                {y.is_approved && (
                  <span style={{ fontSize: '0.7rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="bi bi-check-circle-fill"></i> Approved
                  </span>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(y); }}
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
          <strong>Note:</strong> All newly listed yachts require NJH admin approval before they appear publicly in search results and become available for charter.
        </div>
      </div>
    </div>
  )
}