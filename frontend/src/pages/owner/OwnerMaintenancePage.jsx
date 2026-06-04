// ═══════════════════════════════════════════════════════════════════════════════
// OWNER MAINTENANCE PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { maintenanceAPI, marketplaceAPI } from '../../services/api'

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
        maxWidth: '680px',
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

export default function OwnerMaintenancePage() {
  const [logs, setLogs] = useState([])
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const blankForm = () => ({ 
    aircraft: '', 
    maintenance_type: 'routine', 
    status: 'scheduled', 
    scheduled_date: '', 
    flight_hours_at: '', 
    description: '', 
    technician: '', 
    cost_usd: '' 
  })

  const [form, setForm] = useState(blankForm())

  const MAINTENANCE_TYPES = [
    { value: 'routine', label: 'Routine Service', color: '#0f2d5e' },
    { value: 'repair', label: 'Repair', color: '#ef4444' },
    { value: 'inspection', label: 'Inspection', color: '#c9992e' },
    { value: 'upgrade', label: 'Upgrade', color: '#22c55e' },
    { value: 'emergency', label: 'Emergency', color: '#ef4444' }
  ]

  const STATUS_OPTIONS = [
    { value: 'scheduled', label: 'Scheduled', color: '#f59e0b' },
    { value: 'in_progress', label: 'In Progress', color: '#0f2d5e' },
    { value: 'completed', label: 'Completed', color: '#22c55e' },
    { value: 'cancelled', label: 'Cancelled', color: '#64748b' }
  ]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [maintenanceRes, aircraftRes] = await Promise.all([
        maintenanceAPI.getAll(),
        marketplaceAPI.aircraft()
      ])
      const maintenanceData = maintenanceRes?.data?.results || maintenanceRes?.data || maintenanceRes || []
      const aircraftData = aircraftRes?.data?.results || aircraftRes?.data || aircraftRes || []
      setLogs(maintenanceData)
      setAircraft(aircraftData)
    } catch (error) {
      console.error('Failed to load maintenance data:', error)
      setLogs([])
      setAircraft([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submitRecord = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      if (editingRecord) {
        await maintenanceAPI.update(editingRecord.id, form)
        setMessage({ text: 'Maintenance record updated!', type: 'success' })
      } else {
        await maintenanceAPI.create(form)
        setMessage({ text: 'Maintenance record added!', type: 'success' })
      }
      setModal(false)
      setForm(blankForm())
      setEditingRecord(null)
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (error) {
      setMessage({ text: 'Failed to save maintenance record', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await maintenanceAPI.update(id, { status })
      setMessage({ text: `Status updated to ${status.replace(/_/g, ' ')}`, type: 'success' })
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (error) {
      setMessage({ text: 'Failed to update status', type: 'error' })
    }
  }

  const openAddModal = () => {
    setForm(blankForm())
    setEditingRecord(null)
    setMessage({ text: '', type: '' })
    setModal(true)
  }

  const openEditModal = (record) => {
    setEditingRecord(record)
    setForm({
      aircraft: record.aircraft_id || record.aircraft,
      maintenance_type: record.maintenance_type,
      status: record.status,
      scheduled_date: record.scheduled_date?.split('T')[0] || '',
      flight_hours_at: record.flight_hours_at || '',
      description: record.description || '',
      technician: record.technician || '',
      cost_usd: record.cost_usd || ''
    })
    setModal(true)
  }

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTypeColor = (type) => {
    const found = MAINTENANCE_TYPES.find(t => t.value === type)
    return found?.color || '#64748b'
  }

  const getTypeLabel = (type) => {
    const found = MAINTENANCE_TYPES.find(t => t.value === type)
    return found?.label || type?.replace(/_/g, ' ') || '—'
  }

  const getStatusColor = (status) => {
    const found = STATUS_OPTIONS.find(s => s.value === status)
    return found?.color || '#64748b'
  }

  const getStatusLabel = (status) => {
    const found = STATUS_OPTIONS.find(s => s.value === status)
    return found?.label || status?.replace(/_/g, ' ') || '—'
  }

  const stats = {
    total: logs.length,
    scheduled: logs.filter(l => l.status === 'scheduled').length,
    inProgress: logs.filter(l => l.status === 'in_progress').length,
    completed: logs.filter(l => l.status === 'completed').length,
    totalCost: logs.reduce((sum, l) => sum + (Number(l.cost_usd) || 0), 0)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading maintenance records...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Maintenance</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Log and track aircraft maintenance schedules</p>
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
          <button onClick={openAddModal} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'var(--color-navy)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <i className="bi bi-plus-lg"></i> Log Maintenance
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
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Records</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.scheduled}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Scheduled</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f2d5e' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>In Progress</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Completed</div>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Total Maintenance Cost</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>{formatCurrency(stats.totalCost)}</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-off-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Average per Record</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy)' }}>
            {stats.total > 0 ? formatCurrency(stats.totalCost / stats.total) : '—'}
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-tools" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Maintenance Records</h3>
          <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>Log your first maintenance record to track aircraft service history.</p>
          <button onClick={openAddModal} style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-navy)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}>
            <i className="bi bi-plus-lg"></i> Log Maintenance
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Aircraft</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Scheduled Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Hours At</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Cost</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Technician</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem', cursor: 'pointer' }} onClick={() => openEditModal(l)}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{l.aircraft_name || l.aircraft || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.2rem 0.6rem',
                        background: `${getTypeColor(l.maintenance_type)}15`,
                        color: getTypeColor(l.maintenance_type),
                        border: `1px solid ${getTypeColor(l.maintenance_type)}30`,
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        {getTypeLabel(l.maintenance_type)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.2rem 0.6rem',
                        background: `${getStatusColor(l.status)}15`,
                        color: getStatusColor(l.status),
                        border: `1px solid ${getStatusColor(l.status)}30`,
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        {getStatusLabel(l.status)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{formatDate(l.scheduled_date)}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>{l.flight_hours_at || '—'} hrs</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>{formatCurrency(l.cost_usd)}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)' }}>{l.technician || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {l.status === 'scheduled' && (
                          <button 
                            onClick={() => updateStatus(l.id, 'in_progress')}
                            style={{
                              padding: '0.3rem 0.6rem',
                              background: 'transparent',
                              color: 'var(--color-navy)',
                              border: '1px solid var(--color-navy)',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                            title="Start Maintenance"
                          >
                            <i className="bi bi-play-circle"></i> Start
                          </button>
                        )}
                        {l.status === 'in_progress' && (
                          <button 
                            onClick={() => updateStatus(l.id, 'completed')}
                            style={{
                              padding: '0.3rem 0.6rem',
                              background: '#22c55e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                            title="Complete"
                          >
                            <i className="bi bi-check-lg"></i> Complete
                          </button>
                        )}
                        <button 
                          onClick={() => openEditModal(l)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            background: 'transparent',
                            color: 'var(--color-mid-gray)',
                            border: '1px solid var(--color-light-gray)',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </div>
                    </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Maintenance Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={<><i className="bi bi-tools"></i> {editingRecord ? 'Edit Maintenance Record' : 'Log Maintenance'}</>}>
        <form onSubmit={submitRecord}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Aircraft <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <select 
                value={form.aircraft} 
                onChange={e => setForm(f => ({ ...f, aircraft: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              >
                <option value="">Select Aircraft</option>
                {aircraft.map(ac => (
                  <option key={ac.id} value={ac.id}>{ac.name} ({ac.registration_number})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Maintenance Type <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <select 
                value={form.maintenance_type} 
                onChange={e => setForm(f => ({ ...f, maintenance_type: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              >
                {MAINTENANCE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Scheduled Date <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input 
                type="date" 
                value={form.scheduled_date} 
                onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                required 
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Flight Hours At</label>
              <input 
                type="number" 
                step="0.1"
                value={form.flight_hours_at} 
                onChange={e => setForm(f => ({ ...f, flight_hours_at: e.target.value }))}
                placeholder="Current flight hours"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Cost (USD)</label>
              <input 
                type="number" 
                step="0.01"
                value={form.cost_usd} 
                onChange={e => setForm(f => ({ ...f, cost_usd: e.target.value }))}
                placeholder="0.00"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Technician</label>
              <input 
                value={form.technician} 
                onChange={e => setForm(f => ({ ...f, technician: e.target.value }))}
                placeholder="Technician name"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Description</label>
              <textarea 
                rows={3}
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Work performed, parts replaced, notes..."
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModal(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {saving ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</>
              ) : (
                <><i className="bi bi-check-lg"></i> {editingRecord ? 'Update Record' : 'Add Record'}</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}