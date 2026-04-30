// ═══════════════════════════════════════════════════════════════════════════════
// OWNER AIRCRAFT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { marketplaceApi } from '../../services/api'

function PageHeader({ title, sub, action }) {
  return (
    <div className="dash-header">
      <div className="dash-header-left"><h2>{title}</h2><p>{sub}</p></div>
      {action}
    </div>
  )
}

export function OwnerAircraftPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const blank = () => ({ name: '', model: '', category: 'light', registration_number: '', base_location: '', passenger_capacity: '', range_km: '', hourly_rate_usd: '', description: '', amenities: [] })
  const [form, setForm] = useState(blank())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const d = await marketplaceApi.getAircraft()
      setAircraft(d.results || d)
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
    setErr('')
    try {
      await marketplaceApi.addAircraft(form)
      setModal(false)
      setForm(blank())
      load()
    } catch (err) {
      setErr(err?.detail || JSON.stringify(err))
    } finally {
      setSaving(false)
    }
  }

  const CATS = ['light', 'midsize', 'super_midsize', 'heavy', 'ultra_long', 'vip_airliner']

  return (
    <div>
      <PageHeader
        title="My Aircraft"
        sub="Aircraft you have listed on the platform"
        action={
          <button className="btn btn-navy btn-sm" onClick={() => { setForm(blank()); setErr(''); setModal(true) }}>
            <i className="bi bi-plus-lg" /> Add Aircraft
          </button>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
      ) : aircraft.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-xl)', padding: '4rem 2rem', textAlign: 'center' }}>
          <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--gray-200)', display: 'block', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>No Aircraft Listed</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Add your aircraft to start earning revenue from the NairobiJetHouse marketplace.</p>
          <button className="btn btn-navy" onClick={() => { setForm(blank()); setModal(true) }}>
            <i className="bi bi-plus-lg" /> Add First Aircraft
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {aircraft.map(ac => (
            <div key={ac.id} style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 64, height: 44, background: 'var(--navy)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-airplane-fill" style={{ color: 'var(--gold)', fontSize: '1.2rem' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>{ac.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 2 }}>
                    {ac.registration_number} · {ac.category_display || ac.category} · {ac.passenger_capacity} pax · {ac.range_km?.toLocaleString()} km
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginTop: 3 }}>
                    ${Number(ac.hourly_rate_usd).toLocaleString()}/hr · Base: {ac.base_location}
                  </div>
                  {ac.maintenance_due && (
                    <span className="badge badge-red" style={{ marginTop: '0.35rem' }}>⚠ Maintenance Due</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gray-400)', marginBottom: 2 }}>Hours to service</div>
                  <div style={{ fontWeight: 600, color: ac.hours_until_maintenance < 20 ? 'var(--red)' : 'var(--navy)', fontSize: '1rem' }}>{ac.hours_until_maintenance}</div>
                </div>
                <span className={`badge badge-${ac.status === 'available' ? 'green' : ac.status === 'pending' ? 'amber' : 'gray'}`}>{ac.status}</span>
                {ac.is_approved ? (
                  <span style={{ fontSize: '0.72rem', color: 'var(--green)' }}><i className="bi bi-check-circle-fill" /></span>
                ) : (
                  <span className="badge badge-amber">Pending Approval</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title"><i className="bi bi-airplane" /> Add Aircraft</div>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              {err && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" /><span>{err}</span></div>}
              <form onSubmit={submit}>
                <div className="form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Aircraft Name <span className="req">*</span></label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model <span className="req">*</span></label>
                    <input className="form-control" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration <span className="req">*</span></label>
                    <input className="form-control" value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Location <span className="req">*</span></label>
                    <input className="form-control" value={form.base_location} onChange={e => setForm(f => ({ ...f, base_location: e.target.value }))} placeholder="Nairobi, Kenya" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Passengers <span className="req">*</span></label>
                    <input className="form-control" type="number" value={form.passenger_capacity} onChange={e => setForm(f => ({ ...f, passenger_capacity: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Range km <span className="req">*</span></label>
                    <input className="form-control" type="number" value={form.range_km} onChange={e => setForm(f => ({ ...f, range_km: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hourly Rate USD <span className="req">*</span></label>
                    <input className="form-control" type="number" step="0.01" value={form.hourly_rate_usd} onChange={e => setForm(f => ({ ...f, hourly_rate_usd: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" style={{ minHeight: 80 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>{saving ? 'Adding…' : 'Add Aircraft'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}