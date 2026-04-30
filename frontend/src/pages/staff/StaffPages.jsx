// ═══════════════════════════════════════════════════════════════════════════════
// Staff Portal Pages
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'  // ✅ CORRECT

// ─── Shared ───────────────────────────────────────────────────────────────────
function PageHeader({ title, sub, action }) {
  return (
    <div className="dash-header">
      <div className="dash-header-left"><h2>{title}</h2><p>{sub}</p></div>
      {action}
    </div>
  )
}

const STATUS_COLOR = {
  inquiry:'amber', rfq_sent:'navy', quoted:'navy', confirmed:'green',
  in_flight:'green', completed:'gray', cancelled:'red', active:'green', pending:'amber'
}

function Badge({ s }) {
  return <span className={`badge badge-${STATUS_COLOR[s]||'gray'}`}>{s?.replace(/_/g,' ')}</span>
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export function StaffDashboardPage() {
  const { user } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    adminAPI.overview().then(setOverview).finally(() => setLoading(false))
  }, [])

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString(undefined,{maximumFractionDigits:0})}` : '—'

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Staff Dashboard</h2>
          <p>Welcome, {user?.first_name || user?.username} — here's what needs attention today</p>
        </div>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div> : (
        <>
          <div className="stat-grid" style={{ marginBottom:'2rem' }}>
            {[
              { icon:'bi-currency-dollar', label:'Total Revenue',    value: fmt(overview?.total_platform_revenue), color:'' },
              { icon:'bi-percent',         label:'Commissions',      value: fmt(overview?.total_commissions),      color:'' },
              { icon:'bi-people',          label:'Active Members',   value: overview?.total_members,               color:'navy' },
              { icon:'bi-exclamation-triangle', label:'Open Disputes', value: overview?.open_disputes,             color: overview?.open_disputes > 0 ? 'red' : '' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className={`stat-card${color?' '+color:''}`}>
                <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value ?? '—'}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
            {[
              { label:'View Bookings',   icon:'bi-airplane',      href:'/staff/bookings'  },
              { label:'View Inquiries',  icon:'bi-envelope-open', href:'/staff/inquiries' },
              { label:'Send Email',      icon:'bi-send',          href:'/staff/email'     },
            ].map(({ label, icon, href }) => (
              <a key={label} href={href} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius)', padding:'1rem 1.25rem', textDecoration:'none', color:'var(--navy)', fontWeight:500, fontSize:'0.875rem', boxShadow:'var(--shadow-xs)', transition:'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='var(--shadow-xs)'}>
                <i className={`bi ${icon}`} style={{ color:'var(--gold)', fontSize:'1.1rem' }} />{label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF BOOKINGS
// ═══════════════════════════════════════════════════════════════════════════════
export function StaffBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [charters, setCharters] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('flights')
  const [search,   setSearch]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = search ? { search } : {}
      const [b, c] = await Promise.all([adminAPI.getBookings(params), adminAPI.getCharters(params)])
      setBookings(b.results || b)
      setCharters(c.results || c)
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <PageHeader title="Bookings" sub="All flight bookings and yacht charters" />

      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem' }}>
        <div className="search-wrap" style={{ flex:1 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search name, email, reference…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="tab-nav">
        <button className={`tab-btn${tab==='flights'?' active':''}`} onClick={() => setTab('flights')}>
          <i className="bi bi-airplane" /> Flights <span className="badge badge-gray">{bookings.length}</span>
        </button>
        <button className={`tab-btn${tab==='charters'?' active':''}`} onClick={() => setTab('charters')}>
          <i className="bi bi-water" /> Charters <span className="badge badge-gray">{charters.length}</span>
        </button>
      </div>

      {loading ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div> : (
        <div className="table-card">
          <div className="table-scroll">
            {tab === 'flights' && (
              bookings.length === 0
                ? <div className="table-empty"><i className="bi bi-airplane" />No flight bookings found.</div>
                : <table>
                    <thead><tr><th>Ref</th><th>Guest</th><th>Route</th><th>Date</th><th>Pax</th><th>Status</th><th>Quoted</th></tr></thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td><span className="td-ref">{String(b.reference).slice(0,8)}…</span></td>
                          <td><div className="td-name">{b.guest_name}</div><div className="td-email">{b.guest_email}</div></td>
                          <td style={{ fontWeight:600, color:'var(--navy)', fontSize:'0.9rem' }}>{b.origin_detail?.code||'—'} → {b.destination_detail?.code||'—'}</td>
                          <td style={{ fontSize:'0.82rem', whiteSpace:'nowrap' }}>{b.departure_date}</td>
                          <td>{b.passenger_count}</td>
                          <td><Badge s={b.status} /></td>
                          <td className="td-price">{b.quoted_price_usd ? `$${Number(b.quoted_price_usd).toLocaleString()}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            )}
            {tab === 'charters' && (
              charters.length === 0
                ? <div className="table-empty"><i className="bi bi-water" />No yacht charters found.</div>
                : <table>
                    <thead><tr><th>Ref</th><th>Guest</th><th>Port</th><th>Dates</th><th>Guests</th><th>Status</th><th>Quoted</th></tr></thead>
                    <tbody>
                      {charters.map(c => (
                        <tr key={c.id}>
                          <td><span className="td-ref">{String(c.reference).slice(0,8)}…</span></td>
                          <td><div className="td-name">{c.guest_name}</div><div className="td-email">{c.guest_email}</div></td>
                          <td style={{ fontSize:'0.83rem' }}>{c.departure_port}</td>
                          <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{c.charter_start} → {c.charter_end}</td>
                          <td>{c.guest_count}</td>
                          <td><Badge s={c.status} /></td>
                          <td className="td-price">{c.quoted_price_usd ? `$${Number(c.quoted_price_usd).toLocaleString()}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF INQUIRIES
// ═══════════════════════════════════════════════════════════════════════════════
export function StaffInquiriesPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('contacts')

  useEffect(() => {
    adminAPI.getInquiries().then(setData).finally(() => setLoading(false))
  }, [])

  const TABS = [
    { key:'contacts', label:'Contacts',       icon:'bi-envelope',      items: data?.contacts  },
    { key:'leases',   label:'Leases',          icon:'bi-file-earmark',  items: data?.leases    },
    { key:'groups',   label:'Group Charters',  icon:'bi-people',        items: data?.groups    },
    { key:'cargo',    label:'Air Cargo',       icon:'bi-boxes',         items: data?.cargo     },
    { key:'sales',    label:'Aircraft Sales',  icon:'bi-shop',          items: data?.sales     },
  ]

  const renderItem = (item) => {
    const name  = item.full_name || item.guest_name || item.contact_name || '—'
    const email = item.email || item.guest_email || '—'
    return (
      <div key={item.id} style={{ padding:'1rem', border:'1px solid var(--gray-100)', borderRadius:'var(--radius)', marginBottom:'0.65rem', background:'var(--white)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap' }}>
          <div>
            <div style={{ fontWeight:600, color:'var(--navy)', marginBottom:'0.2rem' }}>{name}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--gray-400)', marginBottom:'0.4rem' }}>{email} · {new Date(item.created_at).toLocaleDateString()}</div>
            <div style={{ fontSize:'0.84rem', color:'var(--gray-600)' }}>{item.message || item.cargo_description || item.usage_description || '—'}</div>
          </div>
          <span className="badge badge-amber">{item.status || 'new'}</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Inquiries" sub="All incoming inquiry types" />
      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn${tab===t.key?' active':''}`} onClick={() => setTab(t.key)}>
            <i className={`bi ${t.icon}`} /> {t.label}
            {t.items && <span className="badge badge-gray" style={{ marginLeft:4 }}>{t.items.length}</span>}
          </button>
        ))}
      </div>
      {loading
        ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner-ring" /></div>
        : <div>{TABS.find(t=>t.key===tab)?.items?.length === 0
            ? <div className="table-empty"><i className="bi bi-inbox" />No {tab} found.</div>
            : TABS.find(t=>t.key===tab)?.items?.map(renderItem)
          }</div>
      }
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF EMAIL
// ═══════════════════════════════════════════════════════════════════════════════
export function StaffEmailPage() {
  const [form, setForm]     = useState({ to_email:'', to_name:'', subject:'', body:'', inquiry_type:'general' })
  const [logs, setLogs]     = useState([])
  const [sending, setSending] = useState(false)
  const [msg, setMsg]       = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getEmailLogs().then(d => setLogs(d.results||d)).finally(() => setLoading(false))
  }, [])

  const send = async (e) => {
    e.preventDefault(); setSending(true); setMsg('')
    try {
      await adminAPI.sendEmail(form)
      setMsg('Email sent successfully.')
      setForm(f => ({ ...f, to_email:'', to_name:'', subject:'', body:'' }))
      const d = await adminAPI.getEmailLogs(); setLogs(d.results||d)
    } catch { setMsg('Failed to send email.') }
    finally { setSending(false) }
  }

  return (
    <div>
      <PageHeader title="Send Email" sub="Compose and send emails to clients or operators" />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'start' }}>
        {/* Compose */}
        <div style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-xs)' }}>
          <h4 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Compose</h4>
          {msg && <div className={`alert alert-${msg.includes('Failed')?'error':'success'}`} style={{ marginBottom:'1rem' }}><i className={`bi bi-${msg.includes('Failed')?'x-circle':'check-circle'}`} /><span>{msg}</span></div>}
          <form onSubmit={send}>
            <div className="form-group" style={{ marginBottom:'0.85rem' }}>
              <label className="form-label">To Email <span className="req">*</span></label>
              <input className="form-control" type="email" value={form.to_email} onChange={e => setForm(f=>({...f,to_email:e.target.value}))} required />
            </div>
            <div className="form-group" style={{ marginBottom:'0.85rem' }}>
              <label className="form-label">To Name</label>
              <input className="form-control" value={form.to_name} onChange={e => setForm(f=>({...f,to_name:e.target.value}))} />
            </div>
            <div className="form-group" style={{ marginBottom:'0.85rem' }}>
              <label className="form-label">Subject <span className="req">*</span></label>
              <input className="form-control" value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} required />
            </div>
            <div className="form-group" style={{ marginBottom:'0.85rem' }}>
              <label className="form-label">Type</label>
              <select className="form-control" value={form.inquiry_type} onChange={e => setForm(f=>({...f,inquiry_type:e.target.value}))}>
                {['general','flight_booking','yacht_charter','lease_inquiry','operator','rfq','payout'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom:'1.25rem' }}>
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea className="form-control" style={{ minHeight:160 }} value={form.body} onChange={e => setForm(f=>({...f,body:e.target.value}))} required />
            </div>
            <button type="submit" className="btn btn-navy btn-full" disabled={sending}>
              {sending?<><span className="spinner" style={{ borderTopColor:'white' }} /> Sending…</>:<><i className="bi bi-send" /> Send Email</>}
            </button>
          </form>
        </div>

        {/* Recent logs */}
        <div style={{ background:'var(--white)', border:'1px solid var(--gray-100)', borderRadius:'var(--radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-xs)' }}>
          <h4 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Recent Sent</h4>
          {loading ? <div style={{ textAlign:'center', padding:'1.5rem' }}><div className="spinner-ring" /></div>
          : logs.length === 0 ? <div style={{ textAlign:'center', color:'var(--gray-300)', padding:'2rem', fontSize:'0.875rem' }}>No emails sent yet.</div>
          : logs.slice(0,12).map(l => (
            <div key={l.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'0.65rem 0', borderBottom:'1px solid var(--gray-100)', gap:'0.5rem' }}>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontWeight:600, fontSize:'0.83rem', color:'var(--navy)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.subject}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>{l.to_email} · {new Date(l.sent_at).toLocaleDateString()}</div>
              </div>
              <span className={`badge badge-${l.success?'green':'red'}`} style={{ flexShrink:0 }}>{l.success?'Sent':'Failed'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StaffDashboardPage