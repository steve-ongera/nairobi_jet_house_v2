// ═══════════════════════════════════════════════════════════════════════════════
// Operator Portal Pages — V2
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'  // ✅ CORRECT

// ─── Shared helpers ────────────────────────────────────────────────────────────
function EmptyState({ icon, text }) {
  return <div className="table-empty"><i className={`bi ${icon}`} />{text}</div>
}

function PageHeader({ title, sub, action }) {
  return (
    <div className="dash-header">
      <div className="dash-header-left"><h2>{title}</h2><p>{sub}</p></div>
      {action}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function OperatorDashboardPage() {
  const { user } = useAuth()
  const [bids,     setBids]     = useState([])
  const [bookings, setBookings] = useState([])
  const [payouts,  setPayouts]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      operatorApi.getBids({ status: 'submitted' }),
      operatorApi.getBookings({ status: 'sent' }),
      operatorApi.getPayouts(),
    ]).then(([b, bk, p]) => {
      setBids(b.results || b)
      setBookings(bk.results || bk)
      setPayouts(p.results || p)
    }).finally(() => setLoading(false))
  }, [])

  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount_usd), 0)

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Operator Dashboard</h2>
          <p>Welcome back, {user?.first_name || user?.username}</p>
        </div>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div> : (
        <>
          <div className="stat-grid" style={{ marginBottom:'2rem' }}>
            <div className="stat-card navy">
              <div className="stat-card-icon"><i className="bi bi-file-earmark-text" /></div>
              <div className="stat-label">Open RFQs</div>
              <div className="stat-value">{bids.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><i className="bi bi-clock-history" /></div>
              <div className="stat-label">Pending Bookings</div>
              <div className="stat-value">{bookings.length}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-card-icon"><i className="bi bi-cash-stack" /></div>
              <div className="stat-label">Pending Payout</div>
              <div className="stat-value">${pendingPayouts.toLocaleString()}</div>
            </div>
          </div>

          {/* Pending bookings */}
          {bookings.length > 0 && (
            <div className="table-card" style={{ marginBottom:'1.5rem' }}>
              <div className="table-card-header">
                <div className="table-card-title"><i className="bi bi-calendar-check" /> Bookings Awaiting Acceptance</div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Reference</th><th>Asset</th><th>Payout</th><th>Status</th></tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td><span className="td-ref">{String(b.reference).slice(0,8)}…</span></td>
                        <td style={{ fontSize:'0.83rem' }}>{b.asset_label || b.asset_type}</td>
                        <td className="td-price">${Number(b.operator_payout_usd).toLocaleString()}</td>
                        <td><span className="badge badge-amber">{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR AIRCRAFT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function OperatorAircraftPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const blank = () => ({ name:'', model:'', category:'light', registration_number:'', passenger_capacity:'', range_km:'', hourly_rate_usd:'', wifi_available:false, pets_allowed:false, description:'' })
  const [form, setForm]   = useState(blank())
  const [saving, setSaving] = useState(false)

  const load = async () => { setLoading(true); try { const d = await operatorApi.getMyAircraft(); setAircraft(d.results || d) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await operatorApi.addAircraft(form); setModal(false); setForm(blank()); load() }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="My Aircraft" sub="Manage your listed aircraft" action={<button className="btn btn-navy btn-sm" onClick={() => { setForm(blank()); setModal(true) }}><i className="bi bi-plus-lg" /> Add Aircraft</button>} />

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : aircraft.length === 0 ? <EmptyState icon="bi-airplane" text="No aircraft listed yet. Add your first aircraft to get started." />
      : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {aircraft.map(ac => (
            <div key={ac.id} style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.25rem 1.5rem', boxShadow:'var(--shadow-xs)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                {ac.image_url ? <img src={ac.image_url} alt={ac.name} style={{ width:72, height:48, objectFit:'cover', borderRadius:6 }} /> : <div style={{ width:72, height:48, background:'var(--navy)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}><i className="bi bi-airplane-fill" style={{ color:'var(--gold)', fontSize:'1.2rem' }} /></div>}
                <div>
                  <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1rem' }}>{ac.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>{ac.registration_number} · {ac.category_display || ac.category} · {ac.passenger_capacity} pax</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--gray-500)', marginTop:2 }}>${Number(ac.hourly_rate_usd).toLocaleString()}/hr · {ac.range_km?.toLocaleString()} km range</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span className={`badge badge-${ac.status==='available'?'green':ac.status==='pending'?'amber':'gray'}`}>{ac.status}</span>
                {!ac.is_approved && <span className="badge badge-amber">Pending NJH Approval</span>}
                {ac.is_approved  && <span style={{ fontSize:'0.72rem', color:'var(--green)' }}><i className="bi bi-check-circle-fill" /> Approved</span>}
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
              <form onSubmit={submit}>
                <div className="form-grid" style={{ marginBottom:'1rem' }}>
                  <div className="form-group"><label className="form-label">Aircraft Name <span className="req">*</span></label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} required placeholder="Bombardier Challenger 300" /></div>
                  <div className="form-group"><label className="form-label">Model <span className="req">*</span></label><input className="form-control" value={form.model} onChange={e => setForm(f => ({ ...f, model:e.target.value }))} required placeholder="Challenger 300" /></div>
                  <div className="form-group"><label className="form-label">Category</label>
                    <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
                      {['light','midsize','super_midsize','heavy','ultra_long','vip_airliner','turboprop','helicopter'].map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Registration <span className="req">*</span></label><input className="form-control" value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number:e.target.value }))} required placeholder="5Y-NJH" /></div>
                  <div className="form-group"><label className="form-label">Passengers <span className="req">*</span></label><input className="form-control" type="number" value={form.passenger_capacity} onChange={e => setForm(f => ({ ...f, passenger_capacity:e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Range (km) <span className="req">*</span></label><input className="form-control" type="number" value={form.range_km} onChange={e => setForm(f => ({ ...f, range_km:e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Hourly Rate (USD) <span className="req">*</span></label><input className="form-control" type="number" step="0.01" value={form.hourly_rate_usd} onChange={e => setForm(f => ({ ...f, hourly_rate_usd:e.target.value }))} required /></div>
                </div>
                <div className="form-group" style={{ marginBottom:'1.25rem' }}><label className="form-label">Description</label><textarea className="form-control" style={{ minHeight:80 }} value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} /></div>
                <div style={{ display:'flex', gap:'0.65rem', marginBottom:'1.25rem' }}>
                  {[['wifi_available','bi-wifi','WiFi'],['pets_allowed','bi-heart','Pets OK']].map(([k,icon,label]) => (
                    <button key={k} type="button" onClick={() => setForm(f => ({ ...f, [k]:!f[k] }))}
                      style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.4rem 0.85rem', fontSize:'0.8rem', fontWeight:500, borderRadius:20, border:`1.5px solid ${form[k]?'var(--navy)':'var(--gray-200)'}`, background:form[k]?'var(--blue-soft)':'transparent', color:form[k]?'var(--navy)':'var(--gray-500)', cursor:'pointer' }}>
                      <i className={`bi ${icon}`} />{label}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>{saving?<><span className="spinner" style={{ borderTopColor:'white' }} /> Adding…</>:<><i className="bi bi-plus-lg" /> Add Aircraft</>}</button>
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
// OPERATOR RFQ PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function OperatorRFQPage() {
  const [bids,    setBids]    = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [bidForm, setBidForm] = useState({ operator_price_usd:'', estimated_hours:'', positioning_cost:'0', catering_cost:'0', notes:'' })
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    operatorApi.getBids().then(d => setBids(d.results || d)).finally(() => setLoading(false))
  }, [])

  const openBid = (bid) => { setModal(bid); setBidForm({ operator_price_usd:'', estimated_hours:'', positioning_cost:'0', catering_cost:'0', notes:'' }) }

  const submitBid = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await operatorApi.submitBid({ ...bidForm, booking: modal.booking, operator: modal.operator }); setModal(null); const d = await operatorApi.getBids(); setBids(d.results || d) }
    finally { setSaving(false) }
  }

  const STATUS_COLOR = { submitted:'navy', shortlisted:'gold', accepted:'green', rejected:'red', expired:'gray' }

  return (
    <div>
      <PageHeader title="RFQ Bids" sub="View incoming RFQs and submit competitive bids" />

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : bids.length === 0 ? <EmptyState icon="bi-file-earmark-text" text="No RFQs at the moment. You'll be notified when NJH sends a new request." />
      : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {bids.map(bid => (
            <div key={bid.id} style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.25rem 1.5rem', boxShadow:'var(--shadow-xs)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.5rem' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:600, color:'var(--navy)' }}>RFQ #{bid.booking}</span>
                    <span className={`badge badge-${STATUS_COLOR[bid.status]||'gray'}`}>{bid.status}</span>
                  </div>
                  {bid.aircraft_name && <div style={{ fontSize:'0.83rem', color:'var(--gray-500)' }}><i className="bi bi-airplane" style={{ color:'var(--gold)', marginRight:5 }} />{bid.aircraft_name} ({bid.aircraft_reg})</div>}
                  {bid.operator_price_usd && <div style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--navy)', marginTop:'0.35rem' }}>Bid: ${Number(bid.operator_price_usd).toLocaleString()}</div>}
                  {bid.notes && <div style={{ fontSize:'0.78rem', color:'var(--gray-400)', marginTop:'0.25rem' }}>{bid.notes}</div>}
                </div>
                {bid.status === 'submitted' && (
                  <button className="btn btn-outline-navy btn-sm" onClick={() => openBid(bid)}>
                    <i className="bi bi-pencil" /> Update Bid
                  </button>
                )}
                {bid.status !== 'submitted' && bid.status !== 'accepted' && (
                  <button className="btn btn-navy btn-sm" onClick={() => openBid(bid)}>
                    <i className="bi bi-send" /> Submit Bid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><i className="bi bi-send" /> Submit Bid — RFQ #{modal.booking}</div>
              <button className="modal-close" onClick={() => setModal(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={submitBid}>
                <div className="form-grid" style={{ marginBottom:'1rem' }}>
                  <div className="form-group"><label className="form-label">Your Price (USD) <span className="req">*</span></label><input className="form-control" type="number" step="0.01" value={bidForm.operator_price_usd} onChange={e => setBidForm(f => ({ ...f, operator_price_usd:e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Estimated Hours</label><input className="form-control" type="number" step="0.5" value={bidForm.estimated_hours} onChange={e => setBidForm(f => ({ ...f, estimated_hours:e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Positioning Cost</label><input className="form-control" type="number" step="0.01" value={bidForm.positioning_cost} onChange={e => setBidForm(f => ({ ...f, positioning_cost:e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Catering Cost</label><input className="form-control" type="number" step="0.01" value={bidForm.catering_cost} onChange={e => setBidForm(f => ({ ...f, catering_cost:e.target.value }))} /></div>
                </div>
                <div className="form-group" style={{ marginBottom:'1.25rem' }}><label className="form-label">Notes</label><textarea className="form-control" style={{ minHeight:80 }} value={bidForm.notes} onChange={e => setBidForm(f => ({ ...f, notes:e.target.value }))} placeholder="Aircraft availability, special conditions, inclusion details…" /></div>
                <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>{saving?<><span className="spinner" style={{ borderTopColor:'white' }} /> Submitting…</>:<><i className="bi bi-send" /> Submit Bid</>}</button>
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
// OPERATOR BOOKINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export function OperatorBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(null)

  const load = async () => { setLoading(true); try { const d = await operatorApi.getBookings(); setBookings(d.results || d) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const accept = async (id) => {
    const ref   = prompt('Your booking reference (optional):') || ''
    const notes = prompt('Any notes (optional):') || ''
    setSaving(id)
    try { await operatorApi.acceptBooking(id, { operator_reference:ref, operator_notes:notes }); load() }
    finally { setSaving(null) }
  }

  const reject = async (id) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    setSaving(id)
    try { await operatorApi.rejectBooking(id, { rejection_reason:reason }); load() }
    finally { setSaving(null) }
  }

  const STATUS_COLOR = { sent:'amber', accepted:'green', rejected:'red', in_service:'green', completed:'gray', disputed:'red' }

  return (
    <div>
      <PageHeader title="Operator Bookings" sub="Accept or reject bookings dispatched by NairobiJetHouse" />

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : bookings.length === 0 ? <EmptyState icon="bi-calendar-check" text="No bookings dispatched to you yet." />
      : (
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Reference</th><th>Asset</th><th>Payout</th><th>NJH Margin</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><span className="td-ref">{String(b.reference).slice(0,8)}…</span></td>
                    <td style={{ fontSize:'0.83rem' }}>{b.asset_label || b.asset_type}</td>
                    <td className="td-price">${Number(b.operator_payout_usd).toLocaleString()}</td>
                    <td style={{ color:'var(--gray-400)', fontSize:'0.83rem' }}>${Number(b.njh_margin_usd).toLocaleString()}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[b.status]||'gray'}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'sent' && (
                        <div className="td-actions">
                          <button className="btn btn-green btn-xs" onClick={() => accept(b.id)} disabled={saving===b.id}><i className="bi bi-check-lg" /> Accept</button>
                          <button className="btn btn-ghost btn-xs" onClick={() => reject(b.id)} disabled={saving===b.id}><i className="bi bi-x-lg" /> Reject</button>
                        </div>
                      )}
                      {b.status === 'accepted' && <span style={{ fontSize:'0.72rem', color:'var(--green)' }}><i className="bi bi-check-circle-fill" /> Accepted</span>}
                    </td>
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

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE STUB PAGES
// ═══════════════════════════════════════════════════════════════════════════════
export function OperatorYachtsPage() {
  const [yachts, setYachts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { operatorApi.getMyYachts().then(d => setYachts(d.results||d)).finally(() => setLoading(false)) }, [])
  return (
    <div>
      <PageHeader title="My Yachts" sub="Manage your listed yachts" />
      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : yachts.length === 0 ? <EmptyState icon="bi-water" text="No yachts listed yet." />
      : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {yachts.map(y => (
            <div key={y.id} style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.25rem 1.5rem', boxShadow:'var(--shadow-xs)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
              <div>
                <div style={{ fontWeight:700, color:'var(--navy)' }}>{y.name}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>{y.length_meters}m · {y.guest_capacity} guests · {y.home_port}</div>
                <div style={{ fontSize:'0.83rem', color:'var(--gray-600)', marginTop:2 }}>${Number(y.daily_rate_usd).toLocaleString()}/day</div>
              </div>
              <span className={`badge badge-${y.status==='available'?'green':'amber'}`}>{y.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function OperatorAvailabilityPage() {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ asset_type:'aircraft', start_date:'', end_date:'', block_type:'maintenance', notes:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { operatorApi.getBlocks().then(d => setBlocks(d.results||d)).finally(() => setLoading(false)) }, [])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await operatorApi.addBlock(form); const d = await operatorApi.getBlocks(); setBlocks(d.results||d) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="Availability" sub="Mark dates when your assets are unavailable" />
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'var(--shadow-xs)' }}>
        <h4 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Add Blackout Period</h4>
        <form onSubmit={submit}>
          <div className="form-grid" style={{ marginBottom:'1rem' }}>
            <div className="form-group"><label className="form-label">Asset Type</label><select className="form-control" value={form.asset_type} onChange={e => setForm(f => ({ ...f, asset_type:e.target.value }))}><option value="aircraft">Aircraft</option><option value="yacht">Yacht</option></select></div>
            <div className="form-group"><label className="form-label">Block Type</label><select className="form-control" value={form.block_type} onChange={e => setForm(f => ({ ...f, block_type:e.target.value }))}><option value="maintenance">Maintenance</option><option value="private_use">Private Use</option><option value="other_booking">Other Booking</option><option value="seasonal_off">Seasonal Off</option></select></div>
            <div className="form-group"><label className="form-label">Start Date <span className="req">*</span></label><input className="form-control" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date:e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">End Date <span className="req">*</span></label><input className="form-control" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date:e.target.value }))} required /></div>
          </div>
          <div className="form-group" style={{ marginBottom:'1rem' }}><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} /></div>
          <button type="submit" className="btn btn-navy" disabled={saving}>{saving?'Adding…':'Add Block'}</button>
        </form>
      </div>
      {loading ? <div style={{ textAlign:'center', padding:'2rem' }}><div className="spinner-ring" /></div>
      : blocks.length === 0 ? <EmptyState icon="bi-calendar-x" text="No availability blocks set." />
      : (
        <div className="table-card"><div className="table-scroll"><table>
          <thead><tr><th>Asset</th><th>Type</th><th>Start</th><th>End</th><th>Notes</th><th></th></tr></thead>
          <tbody>
            {blocks.map(b => (
              <tr key={b.id}>
                <td style={{ fontSize:'0.83rem' }}>{b.aircraft_name || b.yacht_name || b.asset_type}</td>
                <td><span className="badge badge-gray">{b.block_type?.replace(/_/g,' ')}</span></td>
                <td style={{ fontSize:'0.82rem' }}>{b.start_date}</td>
                <td style={{ fontSize:'0.82rem' }}>{b.end_date}</td>
                <td style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>{b.notes || '—'}</td>
                <td><button className="btn btn-ghost btn-xs" onClick={async () => { await operatorApi.deleteBlock(b.id); const d = await operatorApi.getBlocks(); setBlocks(d.results||d) }}><i className="bi bi-trash" /></button></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}
    </div>
  )
}

export function OperatorPayoutsPage() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { operatorApi.getPayouts().then(d => setPayouts(d.results||d)).finally(() => setLoading(false)) }, [])
  const STATUS_COLOR = { pending:'amber', processing:'navy', paid:'green', failed:'red' }
  return (
    <div>
      <PageHeader title="Payouts" sub="Your payout history from NairobiJetHouse" />
      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : payouts.length === 0 ? <EmptyState icon="bi-cash-stack" text="No payouts yet. Payouts are released after booking completion." />
      : (
        <div className="table-card"><div className="table-scroll"><table>
          <thead><tr><th>Reference</th><th>Amount</th><th>Method</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id}>
                <td><span className="td-ref">{String(p.reference).slice(0,8)}…</span></td>
                <td className="td-price">${Number(p.amount_usd).toLocaleString()} <span style={{ fontSize:'0.73rem', color:'var(--gray-400)' }}>{p.currency}</span></td>
                <td style={{ fontSize:'0.82rem' }}>{p.payment_method || 'Bank Transfer'}</td>
                <td style={{ fontSize:'0.82rem' }}>{p.due_date || '—'}</td>
                <td><span className={`badge badge-${STATUS_COLOR[p.status]||'gray'}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}
    </div>
  )
}

export function OperatorProfilePage() {
  const { user } = useAuth()
  return (
    <div>
      <PageHeader title="Company Profile" sub="Your operator account and company details" />
      <div style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'2rem', boxShadow:'var(--shadow-xs)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
          <div style={{ width:56, height:56, background:'var(--navy)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', color:'var(--gold)' }}>
            <i className="bi bi-building" />
          </div>
          <div>
            <div style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--navy)' }}>{user?.company || user?.first_name}</div>
            <div style={{ fontSize:'0.83rem', color:'var(--gray-400)' }}>{user?.email}</div>
          </div>
        </div>
        <div className="alert alert-navy"><i className="bi bi-info-circle" /><span>To update your company profile, safety certifications, or bank details, please contact NairobiJetHouse operations at <strong>ops@nairobijethouse.com</strong>.</span></div>
      </div>
    </div>
  )
}

export default OperatorDashboardPage