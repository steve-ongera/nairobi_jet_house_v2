// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR AVAILABILITY PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

const BLOCK_TYPES = [
  { value: 'maintenance', label: 'Maintenance', color: '#ef4444' },
  { value: 'private_use', label: 'Private Use', color: '#0f2d5e' },
  { value: 'other_booking', label: 'Other Booking', color: '#f59e0b' },
  { value: 'seasonal_off', label: 'Seasonal Off', color: '#64748b' }
]

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
        maxWidth: '420px',
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

export default function OperatorAvailabilityPage() {
  const [blocks, setBlocks] = useState([])
  const [aircraft, setAircraft] = useState([])
  const [yachts, setYachts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [form, setForm] = useState({
    asset_type: 'aircraft',
    aircraft: '',
    yacht: '',
    block_type: 'maintenance',
    start_date: '',
    end_date: '',
    notes: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [blocksRes, aircraftRes, yachtsRes] = await Promise.all([
        operatorAPI.blocks(),
        operatorAPI.myAircraft(),
        operatorAPI.myYachts(),
      ])
      
      const blocksData = blocksRes?.data?.results || blocksRes?.data || blocksRes || []
      const aircraftData = aircraftRes?.data?.results || aircraftRes?.data || aircraftRes || []
      const yachtsData = yachtsRes?.data?.results || yachtsRes?.data || yachtsRes || []
      
      setBlocks(blocksData)
      setAircraft(aircraftData)
      setYachts(yachtsData)
    } catch (err) {
      console.error('Failed to load availability data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ text: '', type: '' })
    try {
      await operatorAPI.createBlock(form)
      setMessage({ text: 'Availability block added successfully!', type: 'success' })
      setForm({
        asset_type: 'aircraft',
        aircraft: '',
        yacht: '',
        block_type: 'maintenance',
        start_date: '',
        end_date: '',
        notes: '',
      })
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to create availability block.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await operatorAPI.deleteBlock(id)
      setMessage({ text: 'Block removed successfully.', type: 'success' })
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
      setDeleteConfirm(null)
    } catch (err) {
      setMessage({ text: 'Failed to remove block.', type: 'error' })
    }
  }

  const getBlockTypeLabel = (type) => {
    const found = BLOCK_TYPES.find(t => t.value === type)
    return found?.label || type
  }

  const getBlockTypeColor = (type) => {
    const found = BLOCK_TYPES.find(t => t.value === type)
    return found?.color || '#64748b'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const stats = {
    total: blocks.length,
    maintenance: blocks.filter(b => b.block_type === 'maintenance').length,
    privateUse: blocks.filter(b => b.block_type === 'private_use').length,
    upcoming: blocks.filter(b => new Date(b.start_date) > new Date()).length
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading availability data...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Availability Management</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Mark blackout windows when your fleet is unavailable for charter</p>
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
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Blocks</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ef4444' }}>{stats.maintenance}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Maintenance</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f2d5e' }}>{stats.privateUse}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Private Use</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.upcoming}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Upcoming</div>
        </div>
      </div>

      {/* Add Block Form */}
      <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-calendar-x" style={{ color: 'var(--color-gold)' }}></i> Add Availability Block
          </h4>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Asset Type</label>
                <select 
                  value={form.asset_type} 
                  onChange={e => setForm(f => ({ ...f, asset_type: e.target.value, aircraft: '', yacht: '' }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                >
                  <option value="aircraft">Aircraft</option>
                  <option value="yacht">Yacht</option>
                </select>
              </div>

              {form.asset_type === 'aircraft' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Select Aircraft <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <select 
                    value={form.aircraft} 
                    onChange={e => setForm(f => ({ ...f, aircraft: e.target.value }))} 
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  >
                    <option value="">Choose aircraft</option>
                    {aircraft.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.registration_number})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Select Yacht <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <select 
                    value={form.yacht} 
                    onChange={e => setForm(f => ({ ...f, yacht: e.target.value }))} 
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                  >
                    <option value="">Choose yacht</option>
                    {yachts.map(y => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Block Type</label>
                <select 
                  value={form.block_type} 
                  onChange={e => setForm(f => ({ ...f, block_type: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                >
                  {BLOCK_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Start Date <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input 
                  type="date" 
                  value={form.start_date} 
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} 
                  required 
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>End Date <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input 
                  type="date" 
                  value={form.end_date} 
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} 
                  required 
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Notes (Optional)</label>
                <input 
                  value={form.notes} 
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
                  placeholder="Reason for block..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" disabled={submitting} style={{
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
                {submitting ? (
                  <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Adding…</>
                ) : (
                  <><i className="bi bi-plus-lg"></i> Add Block</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Existing Blocks */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-list-ul" style={{ color: 'var(--color-gold)' }}></i> Current Blocked Periods
          </h4>
        </div>
        <div>
          {blocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="bi bi-calendar-check" style={{ fontSize: '2rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '0.5rem' }}></i>
              <p style={{ color: 'var(--color-mid-gray)' }}>No availability blocks set. Your fleet is fully available.</p>
            </div>
          ) : (
            blocks.map(b => {
              const blockColor = getBlockTypeColor(b.block_type)
              return (
                <div key={b.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--color-light-gray)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem' }}>{b.aircraft_name || b.yacht_name || '—'}</span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.15rem 0.5rem',
                        background: `${blockColor}15`,
                        color: blockColor,
                        border: `1px solid ${blockColor}30`,
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 600
                      }}>
                        {getBlockTypeLabel(b.block_type)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
                      <i className="bi bi-calendar" style={{ fontSize: '0.7rem', marginRight: '0.25rem' }}></i> 
                      {formatDate(b.start_date)} → {formatDate(b.end_date)}
                      {b.notes && <span style={{ marginLeft: '0.5rem' }}>· {b.notes}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(b.id)}
                    style={{
                      padding: '0.3rem 0.7rem',
                      background: 'transparent',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <i className="bi bi-trash"></i> Remove
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Remove Availability Block">
        <div style={{ textAlign: 'center' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '1rem', display: 'block' }}></i>
          <p style={{ marginBottom: '1rem', color: 'var(--color-dark-gray)' }}>Are you sure you want to remove this availability block?</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={() => setDeleteConfirm(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Yes, Remove</button>
          </div>
        </div>
      </Modal>

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
        <i className="bi bi-lightbulb" style={{ fontSize: '1rem', color: 'var(--color-info)' }}></i>
        <div>
          <strong>Tip:</strong> Marking maintenance or private use periods helps prevent double-booking. NJH will not dispatch charters during blocked dates.
        </div>
      </div>
    </div>
  )
}