// ═══════════════════════════════════════════════════════════════════════════════
// OWNER MAINTENANCE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { maintenanceAPI, marketplaceAPI } from '../../services/api'  // ← Fixed imports

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
      const [l, a] = await Promise.all([
        maintenanceAPI.getAll(),  // ← Fixed
        marketplaceAPI.aircraft()  // ← Fixed
      ])
      setLogs(l.data?.results || l.data || l)
      setAircraft(a.data?.results || a.data || a)
    } catch (error) {
      console.error('Failed to load maintenance data:', error)
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
      await maintenanceAPI.create(form)  // ← Fixed
      setModal(false)
      setForm(blank())
      load()
    } catch (error) {
      console.error('Failed to create maintenance record:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await maintenanceAPI.update(id, { status })  // ← Fixed
      load()
    } catch (error) {
      console.error('Failed to update maintenance status:', error)
    }
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

      {/* Modal JSX remains the same */}
    </div>
  )
}

export default OwnerMaintenancePage