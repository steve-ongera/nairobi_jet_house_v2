// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR AVAILABILITY PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function OperatorAvailabilityPage() {
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

  const BLOCK_TYPES = [
    { value: 'maintenance', label: 'Maintenance', color: 'red' },
    { value: 'private_use', label: 'Private Use', color: 'navy' },
    { value: 'other_booking', label: 'Other Booking', color: 'amber' },
    { value: 'seasonal_off', label: 'Seasonal Off', color: 'gray' }
  ]

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
    return found?.color || 'gray'
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
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading availability data...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Availability Management</h2>
          <p>Mark blackout windows when your fleet is unavailable for charter</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
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
          <div className="operator-stat-label">Total Blocks</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--red)' }}>{stats.maintenance}</div>
          <div className="operator-stat-label">Maintenance</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--navy)' }}>{stats.privateUse}</div>
          <div className="operator-stat-label">Private Use</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--amber)' }}>{stats.upcoming}</div>
          <div className="operator-stat-label">Upcoming</div>
        </div>
      </div>

      {/* Add Block Form */}
      <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
        <div className="settings-card-header">
          <h4><i className="bi bi-calendar-x" /> Add Availability Block</h4>
        </div>
        <div className="settings-card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Asset Type</label>
                <select 
                  className="form-control" 
                  value={form.asset_type} 
                  onChange={e => setForm(f => ({ ...f, asset_type: e.target.value, aircraft: '', yacht: '' }))}
                >
                  <option value="aircraft">Aircraft</option>
                  <option value="yacht">Yacht</option>
                </select>
              </div>

              {form.asset_type === 'aircraft' ? (
                <div className="form-group">
                  <label className="form-label">Select Aircraft <span className="req">*</span></label>
                  <select 
                    className="form-control" 
                    value={form.aircraft} 
                    onChange={e => setForm(f => ({ ...f, aircraft: e.target.value }))} 
                    required
                  >
                    <option value="">Choose aircraft</option>
                    {aircraft.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.registration_number})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Select Yacht <span className="req">*</span></label>
                  <select 
                    className="form-control" 
                    value={form.yacht} 
                    onChange={e => setForm(f => ({ ...f, yacht: e.target.value }))} 
                    required
                  >
                    <option value="">Choose yacht</option>
                    {yachts.map(y => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Block Type</label>
                <select 
                  className="form-control" 
                  value={form.block_type} 
                  onChange={e => setForm(f => ({ ...f, block_type: e.target.value }))}
                >
                  {BLOCK_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  type="date" 
                  value={form.start_date} 
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  type="date" 
                  value={form.end_date} 
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} 
                  required 
                />
              </div>

              <div className="form-group form-full">
                <label className="form-label">Notes (Optional)</label>
                <input 
                  className="form-control" 
                  value={form.notes} 
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
                  placeholder="Reason for block..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-navy" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner" style={{ borderTopColor: 'white' }} /> Adding…</>
                ) : (
                  <><i className="bi bi-plus-lg" /> Add Block</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Existing Blocks */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h4><i className="bi bi-list-ul" /> Current Blocked Periods</h4>
        </div>
        <div className="settings-card-body" style={{ padding: 0 }}>
          {blocks.length === 0 ? (
            <div className="table-empty" style={{ padding: '2rem' }}>
              <i className="bi bi-calendar-check" />
              <p>No availability blocks set. Your fleet is fully available.</p>
            </div>
          ) : (
            blocks.map(b => (
              <div key={b.id} className="block-item">
                <div className="block-info">
                  <div className="block-title">
                    {b.aircraft_name || b.yacht_name || '—'}
                    <span className={`badge badge-${getBlockTypeColor(b.block_type)}`}>
                      {getBlockTypeLabel(b.block_type)}
                    </span>
                  </div>
                  <div className="block-dates">
                    <i className="bi bi-calendar" /> {formatDate(b.start_date)} → {formatDate(b.end_date)}
                    {b.notes && <span className="block-notes"> · {b.notes}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(b.id)}
                  className="btn btn-outline-red btn-sm"
                >
                  <i className="bi bi-trash" /> Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Remove Availability Block">
        <div style={{ textAlign: 'center' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', color: 'var(--amber)', marginBottom: '1rem', display: 'block' }} />
          <p style={{ marginBottom: '1rem' }}>Are you sure you want to remove this availability block?</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-red" onClick={() => handleDelete(deleteConfirm)}>
              Yes, Remove
            </button>
          </div>
        </div>
      </Modal>

      {/* Info Note */}
      <div className="alert alert-info" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
        <i className="bi bi-lightbulb" />
        <div>
          <strong>Tip:</strong> Marking maintenance or private use periods helps prevent double-booking. NJH will not dispatch charters during blocked dates.
        </div>
      </div>
    </div>
  )
}

export default OperatorAvailabilityPage