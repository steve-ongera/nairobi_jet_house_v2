// ═══════════════════════════════════════════════════════════════════════════════
// OWNER MAINTENANCE PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { maintenanceAPI, marketplaceAPI } from '../../services/api'

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

export function OwnerMaintenancePage() {
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
    { value: 'routine', label: 'Routine Service', color: 'navy' },
    { value: 'repair', label: 'Repair', color: 'red' },
    { value: 'inspection', label: 'Inspection', color: 'gold' },
    { value: 'upgrade', label: 'Upgrade', color: 'green' },
    { value: 'emergency', label: 'Emergency', color: 'red' }
  ]

  const STATUS_OPTIONS = [
    { value: 'scheduled', label: 'Scheduled', color: 'amber' },
    { value: 'in_progress', label: 'In Progress', color: 'navy' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
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
      setMessage({ text: `Status updated to ${status}`, type: 'success' })
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

  const getTypeBadge = (type) => {
    const found = MAINTENANCE_TYPES.find(t => t.value === type)
    return found?.color || 'gray'
  }

  const getStatusBadge = (status) => {
    const found = STATUS_OPTIONS.find(s => s.value === status)
    return found?.color || 'gray'
  }

  const stats = {
    total: logs.length,
    scheduled: logs.filter(l => l.status === 'scheduled').length,
    inProgress: logs.filter(l => l.status === 'in_progress').length,
    completed: logs.filter(l => l.status === 'completed').length,
    totalCost: logs.reduce((sum, l) => sum + (Number(l.cost_usd) || 0), 0)
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Maintenance</h2>
          <p>Log and track aircraft maintenance schedules</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
          <button className="btn btn-navy btn-sm" onClick={openAddModal}>
            <i className="bi bi-plus-lg" /> Log Maintenance
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
          <div className="operator-stat-label">Total Records</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--amber)' }}>{stats.scheduled}</div>
          <div className="operator-stat-label">Scheduled</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--navy)' }}>{stats.inProgress}</div>
          <div className="operator-stat-label">In Progress</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--green)' }}>{stats.completed}</div>
          <div className="operator-stat-label">Completed</div>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="payout-summary" style={{ marginBottom: '1.5rem' }}>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Total Maintenance Cost</div>
          <div className="payout-summary-value">{formatCurrency(stats.totalCost)}</div>
        </div>
        <div className="payout-summary-item">
          <div className="payout-summary-label">Average per Record</div>
          <div className="payout-summary-value">
            {stats.total > 0 ? formatCurrency(stats.totalCost / stats.total) : '—'}
          </div>
        </div>
      </div>

      {/* Maintenance Table */}
      {loading ? (
        <div className="table-empty">
          <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
          <p>Loading maintenance records...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-tools" />
          <h3>No Maintenance Records</h3>
          <p>Log your first maintenance record to track aircraft service history.</p>
          <button className="btn btn-navy" onClick={openAddModal}>
            <i className="bi bi-plus-lg" /> Log Maintenance
          </button>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-scroll">
            <tr>
              <thead>
                <tr>
                  <th>Aircraft</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Scheduled Date</th>
                  <th>Hours At</th>
                  <th>Cost</th>
                  <th>Technician</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ cursor: 'pointer' }} onClick={() => openEditModal(l)}>
                      <div className="td-name">{l.aircraft_name || l.aircraft || '—'}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${getTypeBadge(l.maintenance_type)}`}>
                        {l.type_display || l.maintenance_type?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${getStatusBadge(l.status)}`}>
                        {l.status?.replace(/_/g, ' ') || '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{formatDate(l.scheduled_date)}</td>
                    <td style={{ fontSize: '0.82rem' }}>{l.flight_hours_at || '—'} hrs</td>
                    <td className="td-price">{formatCurrency(l.cost_usd)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{l.technician || '—'}</td>
                    <td>
                      <div className="td-actions">
                        {l.status === 'scheduled' && (
                          <button 
                            className="btn btn-outline-navy btn-xs" 
                            onClick={() => updateStatus(l.id, 'in_progress')}
                            title="Start Maintenance"
                          >
                            <i className="bi bi-play-circle" /> Start
                          </button>
                        )}
                        {l.status === 'in_progress' && (
                          <button 
                            className="btn btn-green btn-xs" 
                            onClick={() => updateStatus(l.id, 'completed')}
                            title="Complete"
                          >
                            <i className="bi bi-check-lg" /> Complete
                          </button>
                        )}
                        <button 
                          className="btn btn-ghost btn-xs" 
                          onClick={() => openEditModal(l)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </tr>
          </div>
        </div>
      )}

      {/* Add/Edit Maintenance Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={<><i className="bi bi-tools" /> {editingRecord ? 'Edit Maintenance Record' : 'Log Maintenance'}</>}>
        <form onSubmit={submitRecord}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Aircraft <span className="req">*</span></label>
              <select 
                className="form-control" 
                value={form.aircraft} 
                onChange={e => setForm(f => ({ ...f, aircraft: e.target.value }))}
                required
              >
                <option value="">Select Aircraft</option>
                {aircraft.map(ac => (
                  <option key={ac.id} value={ac.id}>{ac.name} ({ac.registration_number})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Maintenance Type <span className="req">*</span></label>
              <select 
                className="form-control" 
                value={form.maintenance_type} 
                onChange={e => setForm(f => ({ ...f, maintenance_type: e.target.value }))}
                required
              >
                {MAINTENANCE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-control" 
                value={form.status} 
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date <span className="req">*</span></label>
              <input 
                className="form-control" 
                type="date" 
                value={form.scheduled_date} 
                onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Flight Hours At</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.1"
                value={form.flight_hours_at} 
                onChange={e => setForm(f => ({ ...f, flight_hours_at: e.target.value }))}
                placeholder="Current flight hours"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost (USD)</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01"
                value={form.cost_usd} 
                onChange={e => setForm(f => ({ ...f, cost_usd: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Technician</label>
              <input 
                className="form-control" 
                value={form.technician} 
                onChange={e => setForm(f => ({ ...f, technician: e.target.value }))}
                placeholder="Technician name"
              />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Description</label>
              <textarea 
                className="form-control" 
                rows={3}
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Work performed, parts replaced, notes..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
              ) : (
                <><i className="bi bi-check-lg" /> {editingRecord ? 'Update Record' : 'Add Record'}</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default OwnerMaintenancePage