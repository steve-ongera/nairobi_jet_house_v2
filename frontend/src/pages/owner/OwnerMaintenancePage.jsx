// ═══════════════════════════════════════════════════════════════════════════════
// OWNER MAINTENANCE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { maintenanceApi, marketplaceApi } from '../../services/api'

function PageHeader({ title, sub, action }) {
  return (
    <div className="dash-header">
      <div className="dash-header-left"><h2>{title}</h2><p>{sub}</p></div>
      {action}
    </div>
  )
}

export function OwnerMaintenancePage() {
  const [logs, setLogs] = useState([])
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const blank = () => ({ aircraft: '', maintenance_type: 'routine', status: 'scheduled', scheduled_date: '', flight_hours_at: '0', description: '', technician: '', cost_usd: '' })
  const [form, setForm] = useState(blank())
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [l, a] = await Promise.all([maintenanceApi.getAll(), marketplaceApi.getAircraft()])
      setLogs(l.results || l)
      setAircraft(a.results || a)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await maintenanceApi.create(form)
      setModal(false)
      setForm(blank())
      load()
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, status) => {
    await maintenanceApi.update(id, { status })
    load()
  }

  const STATUS_COLOR = { scheduled: 'amber', in_progress: 'navy', completed: 'green', cancelled: 'gray' }
  const TYPE_COLOR = { routine: 'navy', repair: 'red', inspection: 'gold', upgrade: 'green', emergency: 'red' }

  return (
    <div>
      <PageHeader
        title="Maintenance"
        sub="Log and track aircraft maintenance schedules"
        action={
          <button className="btn btn-navy btn-sm" onClick={() => { setForm(blank()); setModal(true) }}>
            <i className="bi bi-plus-lg" /> Log Maintenance
          </button>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
      ) : logs.length === 0 ? (
        <div className="table-empty">
          <i className="bi bi-tools" />No maintenance records yet.
        </div>
      ) : (
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Aircraft</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Scheduled</th>
                  <th>Hours At</th>
                  <th>Cost</th>
                  <th>Technician</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="td-name">{l.aircraft_name || l.aircraft}</td>
                    <td>
                      <span className={`badge badge-${TYPE_COLOR[l.maintenance_type] || 'gray'}`}>
                        {l.type_display || l.maintenance_type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${STATUS_COLOR[l.status] || 'gray'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{l.scheduled_date}</td>
                    <td style={{ fontSize: '0.82rem' }}>{l.flight_hours_at} hrs</td>
                    <td style={{ fontSize: '0.83rem' }}>
                      {l.cost_usd ? `$${Number(l.cost_usd).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{l.technician || '—'}</td>
                    <td>
                      <div className="td-actions">
                        {l.status === 'scheduled' && (
                          <button className="btn btn-outline-navy btn-xs" onClick={() => updateStatus(l.id, 'in_progress')}>
                            Start
                          </button>
                        )}
                        {l.status === 'in_progress' && (
                          <button className="btn btn-green btn-xs" onClick={() => updateStatus(l.id, 'completed')}>
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title"><i className="bi bi-tools" /> Log Maintenance</div>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={submit}>
                <div className="form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Aircraft <span className="req">*</span></label>
                    <select className="form-control" value={form.aircraft} onChange={e => setForm(f => ({ ...f, aircraft: e.target.value }))} required>
                      <option value="">Select aircraft…</option>
                      {aircraft.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-control" value={form.maintenance_type} onChange={e => setForm(f => ({ ...f, maintenance_type: e.target.value }))}>
                      {['routine', 'repair', 'inspection', 'upgrade', 'emergency'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Scheduled Date <span className="req">*</span></label>
                    <input className="form-control" type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Flight Hours At</label>
                    <input className="form-control" type="number" step="0.1" value={form.flight_hours_at} onChange={e => setForm(f => ({ ...f, flight_hours_at: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Technician</label>
                    <input className="form-control" value={form.technician} onChange={e => setForm(f => ({ ...f, technician: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Cost (USD)</label>
                    <input className="form-control" type="number" step="0.01" value={form.cost_usd} onChange={e => setForm(f => ({ ...f, cost_usd: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Description <span className="req">*</span></label>
                  <textarea className="form-control" style={{ minHeight: 90 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>{saving ? 'Saving…' : 'Save Record'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}