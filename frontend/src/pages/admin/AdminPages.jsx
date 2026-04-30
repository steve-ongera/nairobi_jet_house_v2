// ═══════════════════════════════════════════════════════════════════════════════
// AdminEmailLogsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

export function AdminEmailLogsPage() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  // Send email form
  const [showSend, setShowSend] = useState(false)
  const [sendForm, setSendForm] = useState({ to_email:'', to_name:'', subject:'', body:'', inquiry_type:'general' })
  const [sending, setSending]   = useState(false)
  const [sendOk,  setSendOk]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminAPI.getEmailLogs(search ? { search } : {})
      setLogs(data.results || data)
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  const sendEmail = async (e) => {
    e.preventDefault(); setSending(true); setSendOk('')
    try { await adminAPI.sendEmail(sendForm); setSendOk('Email sent successfully.'); setSendForm(f => ({ ...f, to_email:'', to_name:'', subject:'', body:'' })); load() }
    catch { setSendOk('Failed to send email.') }
    finally { setSending(false) }
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left"><h2>Email Logs</h2><p>All outbound emails sent from the platform</p></div>
        <button className="btn btn-navy btn-sm" onClick={() => setShowSend(s => !s)}>
          <i className="bi bi-send" /> {showSend ? 'Hide' : 'Send Email'}
        </button>
      </div>

      {showSend && (
        <div style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'var(--shadow-xs)' }}>
          <h4 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Send Manual Email</h4>
          {sendOk && <div className={`alert alert-${sendOk.includes('Failed') ? 'error' : 'success'}`} style={{ marginBottom:'1rem' }}><i className={`bi bi-${sendOk.includes('Failed') ? 'x-circle' : 'check-circle'}`} /><span>{sendOk}</span></div>}
          <form onSubmit={sendEmail}>
            <div className="form-grid" style={{ marginBottom:'1rem' }}>
              <div className="form-group">
                <label className="form-label">To Email <span className="req">*</span></label>
                <input className="form-control" type="email" value={sendForm.to_email} onChange={e => setSendForm(f => ({ ...f, to_email:e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">To Name</label>
                <input className="form-control" value={sendForm.to_name} onChange={e => setSendForm(f => ({ ...f, to_name:e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom:'1rem' }}>
              <label className="form-label">Subject <span className="req">*</span></label>
              <input className="form-control" value={sendForm.subject} onChange={e => setSendForm(f => ({ ...f, subject:e.target.value }))} required />
            </div>
            <div className="form-group" style={{ marginBottom:'1rem' }}>
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea className="form-control" style={{ minHeight:120 }} value={sendForm.body} onChange={e => setSendForm(f => ({ ...f, body:e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-navy" disabled={sending}>
              {sending ? <><span className="spinner" style={{ borderTopColor:'white' }} /> Sending…</> : <><i className="bi bi-send" /> Send</>}
            </button>
          </form>
        </div>
      )}

      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem' }}>
        <div className="search-wrap" style={{ flex:1 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search email, subject…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
          : logs.length === 0 ? <div className="table-empty"><i className="bi bi-envelope" />No email logs found.</div>
          : (
            <table>
              <thead><tr><th>To</th><th>Subject</th><th>Type</th><th>Sent</th><th>Status</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td><div className="td-name">{l.to_name || l.to_email}</div><div className="td-email">{l.to_email}</div></td>
                    <td style={{ maxWidth:280, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:'0.84rem' }}>{l.subject}</td>
                    <td><span className="badge badge-gray">{l.inquiry_type}</span></td>
                    <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{new Date(l.sent_at).toLocaleString()}</td>
                    <td><span className={`badge badge-${l.success ? 'green' : 'red'}`}>{l.success ? 'Sent' : 'Failed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AdminYachtChartersPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminYachtChartersPage() {
  const [charters, setCharters] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [selected, setSelected] = useState(null)
  const [modal,    setModal]    = useState(false)
  const [priceForm,setPriceForm]= useState({ quoted_price_usd:'', operator_cost_usd:'', status:'quoted', send_email:true, email_message:'' })
  const [saving,   setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const data = await adminAPI.getCharters(params)
      setCharters(data.results || data)
    } finally { setLoading(false) }
  }, [search, status])

  useEffect(() => { load() }, [load])

  const openPrice = (c) => { setSelected(c); setPriceForm({ quoted_price_usd:c.quoted_price_usd||'', operator_cost_usd:c.operator_cost_usd||'', status:c.status, send_email:true, email_message:'' }); setModal(true) }

  const submitPrice = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await adminAPI.setCharterPrice(selected.id, priceForm); await load(); setModal(false) }
    finally { setSaving(false) }
  }

  const STATUS_COLOR = { inquiry:'amber', rfq_sent:'navy', quoted:'navy', confirmed:'green', active:'green', completed:'gray', cancelled:'red' }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left"><h2>Yacht Charters</h2><p>Manage all yacht charter requests</p></div>
      </div>
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <div className="search-wrap" style={{ flex:1, minWidth:220 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search guest, ref…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width:180 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['inquiry','rfq_sent','quoted','confirmed','active','completed','cancelled'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>
      <div className="table-card">
        <div className="table-scroll">
          {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
          : charters.length === 0 ? <div className="table-empty"><i className="bi bi-water" />No charters found.</div>
          : (
            <table>
              <thead><tr><th>Ref</th><th>Guest</th><th>Dates</th><th>Port</th><th>Guests</th><th>Quoted</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {charters.map(c => (
                  <tr key={c.id}>
                    <td><span className="td-ref">{String(c.reference).slice(0,8)}…</span></td>
                    <td><div className="td-name">{c.guest_name}</div><div className="td-email">{c.guest_email}</div></td>
                    <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{c.charter_start} → {c.charter_end}</td>
                    <td style={{ fontSize:'0.82rem' }}>{c.departure_port}</td>
                    <td>{c.guest_count}</td>
                    <td className="td-price">{c.quoted_price_usd ? `$${Number(c.quoted_price_usd).toLocaleString()}` : '—'}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[c.status]||'gray'}`}>{c.status?.replace(/_/g,' ')}</span></td>
                    <td><button className="btn btn-navy btn-xs" onClick={() => openPrice(c)}><i className="bi bi-currency-dollar" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><i className="bi bi-currency-dollar" /> Set Price — {selected?.guest_name}</div>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={submitPrice}>
                <div className="form-grid" style={{ marginBottom:'1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Client Price (USD) <span className="req">*</span></label>
                    <input className="form-control" type="number" step="0.01" value={priceForm.quoted_price_usd} onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd:e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operator Cost (USD)</label>
                    <input className="form-control" type="number" step="0.01" value={priceForm.operator_cost_usd} onChange={e => setPriceForm(f => ({ ...f, operator_cost_usd:e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Update Status</label>
                    <select className="form-control" value={priceForm.status} onChange={e => setPriceForm(f => ({ ...f, status:e.target.value }))}>
                      {['inquiry','quoted','confirmed','active','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-navy" disabled={saving}>
                    {saving ? <><span className="spinner" style={{ borderTopColor:'white' }} /> Saving…</> : <><i className="bi bi-check-lg" /> Save</>}
                  </button>
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
// AdminInquiriesPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminInquiriesPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('contacts')

  useEffect(() => {
    adminAPI.getInquiries().then(setData).finally(() => setLoading(false))
  }, [])

  const TABS = [
    { key:'contacts',  label:'Contacts',       icon:'bi-envelope',       items: data?.contacts  },
    { key:'leases',    label:'Leases',          icon:'bi-file-earmark',   items: data?.leases    },
    { key:'groups',    label:'Group Charters',  icon:'bi-people',         items: data?.groups    },
    { key:'cargo',     label:'Air Cargo',       icon:'bi-boxes',          items: data?.cargo     },
    { key:'sales',     label:'Aircraft Sales',  icon:'bi-shop',           items: data?.sales     },
    { key:'flights',   label:'Flight Inquiries',icon:'bi-airplane',       items: data?.flights   },
  ]

  const renderItem = (item, type) => {
    const name  = item.full_name || item.guest_name || item.contact_name || item.contact_name || '—'
    const email = item.email || item.guest_email || '—'
    const date  = new Date(item.created_at).toLocaleDateString()
    return (
      <div key={item.id} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'1rem', border:'1px solid var(--gray-100)', borderRadius:'var(--radius)', marginBottom:'0.65rem', background:'var(--white)', gap:'1rem', flexWrap:'wrap' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600, color:'var(--navy)', marginBottom:'0.2rem' }}>{name}</div>
          <div style={{ fontSize:'0.78rem', color:'var(--gray-400)', marginBottom:'0.35rem' }}>{email} · {date}</div>
          <div style={{ fontSize:'0.83rem', color:'var(--gray-600)' }}>
            {item.message || item.cargo_description || item.usage_description || item.additional_notes || '—'}
          </div>
        </div>
        <span className="badge badge-amber">{item.status || 'new'}</span>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left"><h2>Inquiries</h2><p>All incoming inquiry types</p></div>
      </div>
      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn${tab===t.key?' active':''}`} onClick={() => setTab(t.key)}>
            <i className={`bi ${t.icon}`} /> {t.label}
            {t.items && <span className="badge badge-gray" style={{ marginLeft:4 }}>{t.items.length}</span>}
          </button>
        ))}
      </div>
      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
      : (
        <div>
          {TABS.find(t => t.key===tab)?.items?.length === 0
            ? <div className="table-empty"><i className="bi bi-inbox" />No {tab} found.</div>
            : TABS.find(t => t.key===tab)?.items?.map(item => renderItem(item, tab))
          }
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AdminMarketplacePage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminMarketplacePage() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    adminAPI.getMarketplace().then(d => setBookings(d.results || d)).finally(() => setLoading(false))
  }, [])

  const STATUS_COLOR = { pending:'amber', confirmed:'green', in_flight:'green', completed:'gray', cancelled:'red', disputed:'red' }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left"><h2>Marketplace Bookings</h2><p>Member bookings from listed fleet</p></div>
      </div>
      <div className="table-card">
        <div className="table-scroll">
          {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
          : bookings.length === 0 ? <div className="table-empty"><i className="bi bi-shop" />No marketplace bookings.</div>
          : (
            <table>
              <thead><tr><th>Client</th><th>Aircraft</th><th>Route</th><th>Date</th><th>Gross</th><th>Commission</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><div className="td-name">{b.client_name}</div><div className="td-email">{b.client_email}</div></td>
                    <td style={{ fontSize:'0.83rem' }}>{b.aircraft_name}</td>
                    <td style={{ fontSize:'0.83rem' }}>{b.origin} → {b.destination}</td>
                    <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{new Date(b.departure_datetime).toLocaleDateString()}</td>
                    <td className="td-price">${Number(b.gross_amount_usd).toLocaleString()}</td>
                    <td style={{ color:'var(--gold)', fontWeight:600 }}>${Number(b.commission_usd).toLocaleString()}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[b.status]||'gray'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// AdminCareersPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminCareersPage() {
  const [jobs, setJobs] = useState([])
  const [apps, setApps] = useState([])
  const [tab,  setTab]  = useState('jobs')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.getJobs(), adminAPI.getApplications()])
      .then(([j, a]) => { setJobs(j.results || j); setApps(a.results || a) })
      .finally(() => setLoading(false))
  }, [])

  const toggleJob = async (id) => { await adminAPI.toggleJobActive(id); const d = await adminAPI.getJobs(); setJobs(d.results || d) }
  const updateApp = async (id, status) => { await adminAPI.updateAppStatus(id, { status }); const d = await adminAPI.getApplications(); setApps(d.results || d) }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left"><h2>Careers</h2><p>Job postings and applications</p></div>
      </div>
      <div className="tab-nav">
        <button className={`tab-btn${tab==='jobs'?' active':''}`} onClick={() => setTab('jobs')}><i className="bi bi-briefcase" /> Jobs <span className="badge badge-gray">{jobs.length}</span></button>
        <button className={`tab-btn${tab==='apps'?' active':''}`} onClick={() => setTab('apps')}><i className="bi bi-people" /> Applications <span className="badge badge-gray">{apps.length}</span></button>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div> : (
        <>
          {tab === 'jobs' && (
            <div className="table-card">
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Title</th><th>Department</th><th>Location</th><th>Applications</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id}>
                        <td className="td-name">{j.title}{j.is_featured && <span className="badge badge-gold" style={{ marginLeft:6 }}>Featured</span>}</td>
                        <td style={{ fontSize:'0.82rem' }}>{j.department_display || j.department}</td>
                        <td style={{ fontSize:'0.82rem' }}>{j.location_display  || j.location}</td>
                        <td>{j.application_count ?? '—'}</td>
                        <td><span className={`badge badge-${j.is_active?'green':'gray'}`}>{j.is_active?'Active':'Closed'}</span></td>
                        <td><button className="btn btn-ghost btn-xs" onClick={() => toggleJob(j.id)}>{j.is_active?'Close':'Reopen'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'apps' && (
            <div className="table-card">
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Applicant</th><th>Role</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
                  <tbody>
                    {apps.map(a => (
                      <tr key={a.id}>
                        <td><div className="td-name">{a.full_name}</div><div className="td-email">{a.email}</div></td>
                        <td style={{ fontSize:'0.82rem' }}>{a.job_title}</td>
                        <td><span className={`status-${a.status} badge`}>{a.status_display || a.status}</span></td>
                        <td style={{ fontSize:'0.78rem' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                        <td>
                          <select className="form-control" style={{ padding:'0.2rem 0.5rem', fontSize:'0.72rem', height:'auto', width:'auto' }}
                            value={a.status} onChange={e => updateApp(a.id, e.target.value)}>
                            {['received','reviewing','shortlisted','interview','offered','hired','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
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
// AdminSettingsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminSettingsPage() {
  const [rules,   setRules]   = useState([])
  const [legacy,  setLegacy]  = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState({ name:'', markup_pct:'20', commission_pct:'15', priority:'0', operator_tier:'', asset_category:'', min_booking_usd:'', max_booking_usd:'' })
  const [saving,  setSaving]  = useState(false)
  const [ok,      setOk]      = useState('')

  useEffect(() => {
    Promise.all([adminAPI.getCommRules(), adminAPI.getCommission()])
      .then(([r, l]) => { setRules(r.results || r); setLegacy(l.results || l) })
      .finally(() => setLoading(false))
  }, [])

  const createRule = async (e) => {
    e.preventDefault(); setSaving(true); setOk('')
    try { await adminAPI.createCommRule(form); setOk('Commission rule saved.'); const d = await adminAPI.getCommRules(); setRules(d.results || d) }
    catch { setOk('Failed to save rule.') }
    finally { setSaving(false) }
  }

  const toggleRule = async (id) => { await adminAPI.toggleCommRule(id); const d = await adminAPI.getCommRules(); setRules(d.results || d) }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left"><h2>Settings</h2><p>Platform commission rules and configuration</p></div>
      </div>

      {/* V2 Commission Rules */}
      <div style={{ marginBottom:'0.75rem' }}>
        <span className="eyebrow" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          Commission Rules Engine
          <span style={{ fontSize:'0.5rem', fontWeight:700, background:'var(--gold)', color:'var(--navy)', padding:'1px 5px', borderRadius:3 }}>V2</span>
        </span>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:'2rem' }}><div className="spinner-ring" /></div> : (
        <>
          <div className="table-card" style={{ marginBottom:'1.5rem' }}>
            <div className="table-scroll">
              {rules.length === 0 ? <div className="table-empty"><i className="bi bi-sliders" />No commission rules defined.</div> : (
                <table>
                  <thead><tr><th>Rule Name</th><th>Markup %</th><th>Commission %</th><th>Priority</th><th>Tier Match</th><th>Active</th><th>Action</th></tr></thead>
                  <tbody>
                    {rules.map(r => (
                      <tr key={r.id}>
                        <td className="td-name">{r.name}</td>
                        <td style={{ fontWeight:600, color:'var(--navy)' }}>{r.markup_pct}%</td>
                        <td style={{ fontWeight:600, color:'var(--gold)' }}>{r.commission_pct}%</td>
                        <td>{r.priority}</td>
                        <td>{r.operator_tier || 'Any'}</td>
                        <td><span className={`badge badge-${r.is_active?'green':'gray'}`}>{r.is_active?'Active':'Off'}</span></td>
                        <td><button className="btn btn-ghost btn-xs" onClick={() => toggleRule(r.id)}>{r.is_active?'Disable':'Enable'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Create new rule */}
          <div style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.5rem', marginBottom:'2rem', boxShadow:'var(--shadow-xs)' }}>
            <h4 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Add Commission Rule</h4>
            {ok && <div className={`alert alert-${ok.includes('Failed')?'error':'success'}`} style={{ marginBottom:'1rem' }}><i className="bi bi-check-circle" /><span>{ok}</span></div>}
            <form onSubmit={createRule}>
              <div className="form-grid" style={{ marginBottom:'1rem' }}>
                <div className="form-group form-full">
                  <label className="form-label">Rule Name <span className="req">*</span></label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} required placeholder="e.g. Standard 20% Markup" />
                </div>
                <div className="form-group">
                  <label className="form-label">Markup % (client price)</label>
                  <input className="form-control" type="number" step="0.01" value={form.markup_pct} onChange={e => setForm(f => ({ ...f, markup_pct:e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission % (NJH keeps)</label>
                  <input className="form-control" type="number" step="0.01" value={form.commission_pct} onChange={e => setForm(f => ({ ...f, commission_pct:e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority (higher = checked first)</label>
                  <input className="form-control" type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority:e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Operator Tier Match</label>
                  <select className="form-control" value={form.operator_tier} onChange={e => setForm(f => ({ ...f, operator_tier:e.target.value }))}>
                    <option value="">Any tier</option>
                    <option value="standard">Standard</option>
                    <option value="preferred">Preferred</option>
                    <option value="exclusive">Exclusive</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-navy" disabled={saving}>
                {saving ? <><span className="spinner" style={{ borderTopColor:'white' }} /> Saving…</> : <><i className="bi bi-plus-lg" /> Add Rule</>}
              </button>
            </form>
          </div>

          {/* Legacy V1 commission */}
          <div style={{ marginBottom:'0.75rem' }}><span className="eyebrow">Legacy Commission (V1 Marketplace)</span></div>
          <div className="table-card">
            <div className="table-scroll">
              <table>
                <thead><tr><th>Rate</th><th>Effective From</th><th>Notes</th></tr></thead>
                <tbody>
                  {legacy.map(l => (
                    <tr key={l.id}>
                      <td className="td-price">{l.rate_pct}%</td>
                      <td style={{ fontSize:'0.82rem' }}>{l.effective_from}</td>
                      <td style={{ fontSize:'0.82rem', color:'var(--gray-400)' }}>{l.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminEmailLogsPage