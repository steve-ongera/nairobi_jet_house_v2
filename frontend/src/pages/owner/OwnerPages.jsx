// ═══════════════════════════════════════════════════════════════════════════════
// Owner Portal Pages
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { dashboardApi, marketplaceApi, maintenanceApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'  // ✅ CORRECT

function PageHeader({ title, sub, action }) {
  return (
    <div className="dash-header">
      <div className="dash-header-left"><h2>{title}</h2><p>{sub}</p></div>
      {action}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OWNER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function OwnerDashboardPage() {
  const { user }  = useAuth()
  const [dash, setDash]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.owner().then(setDash).finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString(undefined,{maximumFractionDigits:0})}` : '—'

  if (loading) return <div style={{ textAlign:'center', padding:'4rem' }}><div className="spinner-ring" /></div>

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Owner Dashboard</h2>
          <p>Fleet performance overview for {user?.first_name || user?.company || user?.username}</p>
        </div>
        <a href="/owner/aircraft" className="btn btn-navy btn-sm"><i className="bi bi-airplane" /> Manage Fleet</a>
      </div>

      <div className="stat-grid" style={{ marginBottom:'2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-currency-dollar" /></div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{fmt(dash?.total_revenue_usd)}</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-card-icon"><i className="bi bi-calendar-month" /></div>
          <div className="stat-label">This Month</div>
          <div className="stat-value">{fmt(dash?.monthly_revenue_usd)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-hourglass-split" /></div>
          <div className="stat-label">Total Flight Hours</div>
          <div className="stat-value">{dash?.total_flight_hours ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-airplane" /></div>
          <div className="stat-label">Aircraft Listed</div>
          <div className="stat-value">{dash?.aircraft_count ?? '—'}</div>
        </div>
      </div>

      {dash?.maintenance_alerts?.length > 0 && (
        <div>
          <div style={{ marginBottom:'1rem' }}><span className="eyebrow">⚠ Maintenance Alerts</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            {dash.maintenance_alerts.map(m => (
              <div key={m.id} style={{ background:'var(--amber-light)', border:'1px solid #DFBD7A', borderRadius:'var(--radius)', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
                <div>
                  <div style={{ fontWeight:600, color:'var(--amber)', marginBottom:'0.2rem' }}>{m.aircraft_name} — {m.maintenance_type}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--amber)' }}>Scheduled: {m.scheduled_date}</div>
                </div>
                <a href="/owner/maintenance" className="btn btn-ghost btn-xs">View</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OWNER AIRCRAFT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function OwnerAircraftPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const blank = () => ({ name:'', model:'', category:'light', registration_number:'', base_location:'', passenger_capacity:'', range_km:'', hourly_rate_usd:'', description:'', amenities:[] })
  const [form, setForm]   = useState(blank())
  const [saving, setSaving] = useState(false)
  const [err,   setErr]    = useState('')

  const load = async () => { setLoading(true); try { const d = await marketplaceApi.getAircraft(); setAircraft(d.results||d) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr('')
    try { await marketplaceApi.addAircraft(form); setModal(false); setForm(blank()); load() }
    catch (err) { setErr(err?.detail || JSON.stringify(err)) }
    finally { setSaving(false) }
  }

  const CATS = ['light','midsize','super_midsize','heavy','ultra_long','vip_airliner']

  return (
    <div>
      <PageHeader title="My Aircraft" sub="Aircraft you have listed on the platform"
        action={<button className="btn btn-navy btn-sm" onClick={() => { setForm(blank()); setErr(''); setModal(true) }}><i className="bi bi-plus-lg" /> Add Aircraft</button>} />

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : aircraft.length === 0 ? (
        <div style={{ background:'var(--white)', border:'2px dashed var(--gray-200)', borderRadius:'var(--radius-xl)', padding:'4rem 2rem', textAlign:'center' }}>
          <i className="bi bi-airplane" style={{ fontSize:'3rem', color:'var(--gray-200)', display:'block', marginBottom:'1rem' }} />
          <h3 style={{ marginBottom:'0.75rem', fontSize:'1.2rem' }}>No Aircraft Listed</h3>
          <p style={{ marginBottom:'1.5rem', fontSize:'0.875rem' }}>Add your aircraft to start earning revenue from the NairobiJetHouse marketplace.</p>
          <button className="btn btn-navy" onClick={() => { setForm(blank()); setModal(true) }}><i className="bi bi-plus-lg" /> Add First Aircraft</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {aircraft.map(ac => (
            <div key={ac.id} style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-xs)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
                <div style={{ width:64, height:44, background:'var(--navy)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className="bi bi-airplane-fill" style={{ color:'var(--gold)', fontSize:'1.2rem' }} />
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1rem' }}>{ac.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--gray-400)', marginTop:2 }}>
                    {ac.registration_number} · {ac.category_display||ac.category} · {ac.passenger_capacity} pax · {ac.range_km?.toLocaleString()} km
                  </div>
                  <div style={{ fontSize:'0.82rem', color:'var(--gray-600)', marginTop:3 }}>
                    ${Number(ac.hourly_rate_usd).toLocaleString()}/hr · Base: {ac.base_location}
                  </div>
                  {ac.maintenance_due && (
                    <span className="badge badge-red" style={{ marginTop:'0.35rem' }}>⚠ Maintenance Due</span>
                  )}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ textAlign:'right', marginRight:'0.5rem' }}>
                  <div style={{ fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--gray-400)', marginBottom:2 }}>Hours to service</div>
                  <div style={{ fontWeight:600, color: ac.hours_until_maintenance < 20 ? 'var(--red)' : 'var(--navy)', fontSize:'1rem' }}>{ac.hours_until_maintenance}</div>
                </div>
                <span className={`badge badge-${ac.status==='available'?'green':ac.status==='pending'?'amber':'gray'}`}>{ac.status}</span>
                {ac.is_approved ? <span style={{ fontSize:'0.72rem', color:'var(--green)' }}><i className="bi bi-check-circle-fill" /></span>
                : <span className="badge badge-amber">Pending Approval</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title"><i className="bi bi-airplane" /> Add Aircraft</div>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              {err && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" /><span>{err}</span></div>}
              <form onSubmit={submit}>
                <div className="form-grid" style={{ marginBottom:'1rem' }}>
                  <div className="form-group"><label className="form-label">Aircraft Name <span className="req">*</span></label><input className="form-control" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Model <span className="req">*</span></label><input className="form-control" value={form.model} onChange={e=>setForm(f=>({...f,model:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Category</label>
                    <select className="form-control" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                      {CATS.map(c=><option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Registration <span className="req">*</span></label><input className="form-control" value={form.registration_number} onChange={e=>setForm(f=>({...f,registration_number:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Base Location <span className="req">*</span></label><input className="form-control" value={form.base_location} onChange={e=>setForm(f=>({...f,base_location:e.target.value}))} placeholder="Nairobi, Kenya" required /></div>
                  <div className="form-group"><label className="form-label">Passengers <span className="req">*</span></label><input className="form-control" type="number" value={form.passenger_capacity} onChange={e=>setForm(f=>({...f,passenger_capacity:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Range km <span className="req">*</span></label><input className="form-control" type="number" value={form.range_km} onChange={e=>setForm(f=>({...f,range_km:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Hourly Rate USD <span className="req">*</span></label><input className="form-control" type="number" step="0.01" value={form.hourly_rate_usd} onChange={e=>setForm(f=>({...f,hourly_rate_usd:e.target.value}))} required /></div>
                </div>
                <div className="form-group" style={{ marginBottom:'1.25rem' }}><label className="form-label">Description</label><textarea className="form-control" style={{ minHeight:80 }} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
                <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>{saving?'Adding…':'Add Aircraft'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OWNER MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════════
export function OwnerMaintenancePage() {
  const [logs,    setLogs]    = useState([])
  const [aircraft,setAircraft]= useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const blank = () => ({ aircraft:'', maintenance_type:'routine', status:'scheduled', scheduled_date:'', flight_hours_at:'0', description:'', technician:'', cost_usd:'' })
  const [form, setForm]   = useState(blank())
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [l, a] = await Promise.all([maintenanceApi.getAll(), marketplaceApi.getAircraft()])
      setLogs(l.results||l); setAircraft(a.results||a)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await maintenanceApi.create(form); setModal(false); setForm(blank()); load() }
    finally { setSaving(false) }
  }

  const updateStatus = async (id, status) => { await maintenanceApi.update(id, { status }); load() }

  const STATUS_COLOR = { scheduled:'amber', in_progress:'navy', completed:'green', cancelled:'gray' }
  const TYPE_COLOR   = { routine:'navy', repair:'red', inspection:'gold', upgrade:'green', emergency:'red' }

  return (
    <div>
      <PageHeader title="Maintenance" sub="Log and track aircraft maintenance schedules"
        action={<button className="btn btn-navy btn-sm" onClick={()=>{ setForm(blank()); setModal(true) }}><i className="bi bi-plus-lg" /> Log Maintenance</button>} />

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : logs.length === 0 ? <div className="table-empty"><i className="bi bi-tools" />No maintenance records yet.</div>
      : (
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Aircraft</th><th>Type</th><th>Status</th><th>Scheduled</th><th>Hours At</th><th>Cost</th><th>Technician</th><th>Actions</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="td-name">{l.aircraft_name || l.aircraft}</td>
                    <td><span className={`badge badge-${TYPE_COLOR[l.maintenance_type]||'gray'}`}>{l.type_display||l.maintenance_type}</span></td>
                    <td><span className={`badge badge-${STATUS_COLOR[l.status]||'gray'}`}>{l.status}</span></td>
                    <td style={{ fontSize:'0.82rem' }}>{l.scheduled_date}</td>
                    <td style={{ fontSize:'0.82rem' }}>{l.flight_hours_at} hrs</td>
                    <td style={{ fontSize:'0.83rem' }}>{l.cost_usd ? `$${Number(l.cost_usd).toLocaleString()}` : '—'}</td>
                    <td style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>{l.technician || '—'}</td>
                    <td>
                      <div className="td-actions">
                        {l.status === 'scheduled'    && <button className="btn btn-outline-navy btn-xs" onClick={()=>updateStatus(l.id,'in_progress')}>Start</button>}
                        {l.status === 'in_progress'  && <button className="btn btn-green btn-xs" onClick={()=>updateStatus(l.id,'completed')}>Complete</button>}
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
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title"><i className="bi bi-tools" /> Log Maintenance</div>
              <button className="modal-close" onClick={()=>setModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={submit}>
                <div className="form-grid" style={{ marginBottom:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Aircraft <span className="req">*</span></label>
                    <select className="form-control" value={form.aircraft} onChange={e=>setForm(f=>({...f,aircraft:e.target.value}))} required>
                      <option value="">Select aircraft…</option>
                      {aircraft.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-control" value={form.maintenance_type} onChange={e=>setForm(f=>({...f,maintenance_type:e.target.value}))}>
                      {['routine','repair','inspection','upgrade','emergency'].map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Scheduled Date <span className="req">*</span></label><input className="form-control" type="date" value={form.scheduled_date} onChange={e=>setForm(f=>({...f,scheduled_date:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Flight Hours At</label><input className="form-control" type="number" step="0.1" value={form.flight_hours_at} onChange={e=>setForm(f=>({...f,flight_hours_at:e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">Technician</label><input className="form-control" value={form.technician} onChange={e=>setForm(f=>({...f,technician:e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">Estimated Cost (USD)</label><input className="form-control" type="number" step="0.01" value={form.cost_usd} onChange={e=>setForm(f=>({...f,cost_usd:e.target.value}))} /></div>
                </div>
                <div className="form-group" style={{ marginBottom:'1.25rem' }}><label className="form-label">Description <span className="req">*</span></label><textarea className="form-control" style={{ minHeight:90 }} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required /></div>
                <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>{saving?'Saving…':'Save Record'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OWNER REVENUE
// ═══════════════════════════════════════════════════════════════════════════════
export function OwnerRevenuePage() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    marketplaceApi.getBookings().then(d => setBookings(d.results||d)).finally(() => setLoading(false))
  }, [])

  const totalGross    = bookings.reduce((s,b) => s + Number(b.gross_amount_usd||0), 0)
  const totalNet      = bookings.reduce((s,b) => s + Number(b.net_owner_usd||0),   0)
  const totalCommission = bookings.reduce((s,b) => s + Number(b.commission_usd||0), 0)
  const fmt = (n) => `$${Number(n).toLocaleString(undefined,{maximumFractionDigits:0})}`

  const STATUS_COLOR = { pending:'amber', confirmed:'green', in_flight:'green', completed:'gray', cancelled:'red' }

  return (
    <div>
      <PageHeader title="Revenue" sub="Earnings and commission breakdown from your fleet" />

      <div className="stat-grid" style={{ marginBottom:'2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-currency-dollar" /></div>
          <div className="stat-label">Gross Revenue</div>
          <div className="stat-value">{fmt(totalGross)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-icon"><i className="bi bi-wallet2" /></div>
          <div className="stat-label">Your Net</div>
          <div className="stat-value">{fmt(totalNet)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon"><i className="bi bi-percent" /></div>
          <div className="stat-label">Platform Commission</div>
          <div className="stat-value">{fmt(totalCommission)}</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-card-icon"><i className="bi bi-list-ol" /></div>
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{bookings.length}</div>
        </div>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : bookings.length === 0 ? <div className="table-empty"><i className="bi bi-bar-chart" />No bookings to display.</div>
      : (
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Client</th><th>Aircraft</th><th>Route</th><th>Date</th><th>Gross</th><th>Commission</th><th>Your Net</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="td-name">{b.client_name || '—'}</td>
                    <td style={{ fontSize:'0.83rem' }}>{b.aircraft_name}</td>
                    <td style={{ fontSize:'0.83rem' }}>{b.origin} → {b.destination}</td>
                    <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{new Date(b.departure_datetime).toLocaleDateString()}</td>
                    <td className="td-price">{fmt(b.gross_amount_usd)}</td>
                    <td style={{ color:'var(--gray-400)', fontSize:'0.83rem' }}>-{fmt(b.commission_usd)}</td>
                    <td className="td-price" style={{ color:'var(--green)' }}>{fmt(b.net_owner_usd)}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[b.status]||'gray'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerDashboardPage