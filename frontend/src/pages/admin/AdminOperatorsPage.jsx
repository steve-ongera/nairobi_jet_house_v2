import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/api'

const TIER_COLOR   = { standard: 'gray', preferred: 'navy', exclusive: 'gold' }
const STATUS_COLOR = { pending: 'amber', active: 'green', suspended: 'red', terminated: 'gray' }

function Badge({ label, color }) {
  return <span className={`badge badge-${color || 'gray'}`}>{label}</span>
}

function Modal({ open, onClose, title, children, maxWidth = 580 }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [tierFilter,setTierFilter]= useState('')
  const [stFilter,  setStFilter]  = useState('')
  const [selected,  setSelected]  = useState(null)
  const [modal,     setModal]     = useState(null) // 'detail' | 'create' | 'tier' | 'aircraft'
  const [detail,    setDetail]    = useState(null)
  const [detailTab, setDetailTab] = useState('aircraft')

  // Create form
  const blankForm = () => ({ name: '', trading_name: '', country: '', city: '', contact_email: '', contact_phone: '', tier: 'standard', registration_no: '', aoc_number: '', website: '' })
  const [form,    setForm]    = useState(blankForm())
  const [saving,  setSaving]  = useState(false)
  const [formErr, setFormErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)    params.search = search
      if (tierFilter)params.tier   = tierFilter
      if (stFilter)  params.status = stFilter
      const data = await adminApi.getOperators(params)
      setOperators(data.results || data)
    } finally { setLoading(false) }
  }, [search, tierFilter, stFilter])

  useEffect(() => { load() }, [load])

  const openDetail = async (op) => {
    setSelected(op)
    setDetailTab('aircraft')
    setModal('detail')
    const [ac, yachts, bookings, payouts, reviews] = await Promise.all([
      adminApi.getOpAircraft(op.id),
      adminApi.getOpYachts(op.id),
      adminApi.getOpBookings(op.id),
      adminApi.getOpPayouts(op.id),
      adminApi.getOpReviews(op.id),
    ])
    setDetail({ aircraft: ac.results || ac, yachts: yachts.results || yachts, bookings: bookings.results || bookings, payouts: payouts.results || payouts, reviews: reviews.results || reviews })
  }

  const activate  = async (op) => { await adminApi.activateOperator(op.id); load() }
  const suspend   = async (op) => { await adminApi.suspendOperator(op.id);  load() }
  const approveAc = async (id) => { await adminApi.approveAircraft(id); if (selected) openDetail(selected) }

  const submitCreate = async (e) => {
    e.preventDefault(); setSaving(true); setFormErr('')
    try {
      await adminApi.createOperator(form)
      setModal(null); setForm(blankForm()); load()
    } catch (err) { setFormErr(err?.detail || JSON.stringify(err)) }
    finally { setSaving(false) }
  }

  const changeTier = async (op, tier) => {
    await adminApi.changeTier(op.id, tier)
    load(); setModal(null)
  }

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—'

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Charter Operators</h2>
          <p>V2 partner operator network — aircraft &amp; yacht suppliers</p>
        </div>
        <button className="btn btn-navy btn-sm" onClick={() => { setForm(blankForm()); setFormErr(''); setModal('create') }}>
          <i className="bi bi-plus-lg" /> Add Operator
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search name, country, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 160 }} value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
          <option value="">All Tiers</option>
          <option value="standard">Standard</option>
          <option value="preferred">Preferred</option>
          <option value="exclusive">Exclusive</option>
        </select>
        <select className="form-control" style={{ width: 160 }} value={stFilter} onChange={e => setStFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner-ring" /></div>
          ) : operators.length === 0 ? (
            <div className="table-empty"><i className="bi bi-building" />No operators found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Country</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Aircraft</th>
                  <th>Yachts</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {operators.map(op => (
                  <tr key={op.id}>
                    <td>
                      <div className="td-name">{op.name}</div>
                      {op.trading_name && <div className="td-email">{op.trading_name}</div>}
                    </td>
                    <td style={{ fontSize: '0.83rem' }}>{op.country}{op.city ? `, ${op.city}` : ''}</td>
                    <td><Badge label={op.tier}   color={TIER_COLOR[op.tier]} /></td>
                    <td><Badge label={op.status} color={STATUS_COLOR[op.status]} /></td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{op.active_aircraft_count}</span>
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}> active</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{op.active_yacht_count}</span>
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}> active</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>{op.contact_email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{op.contact_phone}</div>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-navy btn-xs" onClick={() => openDetail(op)} title="View detail"><i className="bi bi-eye" /></button>
                        {op.status !== 'active'     && <button className="btn btn-ghost btn-xs" onClick={() => activate(op)} title="Activate"><i className="bi bi-check-circle" /></button>}
                        {op.status === 'active'     && <button className="btn btn-ghost btn-xs" onClick={() => suspend(op)} title="Suspend"><i className="bi bi-pause-circle" /></button>}
                        <button className="btn btn-ghost btn-xs" onClick={() => { setSelected(op); setModal('tier') }} title="Change tier"><i className="bi bi-stars" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <Modal open={modal === 'detail'} onClose={() => { setModal(null); setDetail(null) }} title={<><i className="bi bi-building" /> {selected?.name}</>} maxWidth={820}>
        {selected && (
          <div>
            {/* Operator header info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
              {[
                ['Tier',    selected.tier],
                ['Status',  selected.status],
                ['Country', selected.country],
                ['AOC',     selected.aoc_number || '—'],
                ['Email',   selected.contact_email],
                ['Phone',   selected.contact_phone || '—'],
              ].map(([k,v]) => (
                <div key={k}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gray-400)', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--navy)', wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="tab-nav" style={{ marginBottom: '1.25rem' }}>
              {['aircraft','yachts','bookings','payouts','reviews'].map(tab => (
                <button key={tab} className={`tab-btn${detailTab === tab ? ' active' : ''}`} onClick={() => setDetailTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {detail && <span className="badge badge-gray" style={{ marginLeft: 5 }}>{detail[tab]?.length || 0}</span>}
                </button>
              ))}
            </div>

            {!detail ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner-ring" /></div>
            ) : (
              <>
                {detailTab === 'aircraft' && (
                  detail.aircraft.length === 0 ? <div className="table-empty"><i className="bi bi-airplane" />No aircraft listed.</div> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                      <thead><tr><th style={{ textAlign: 'left', padding: '0.5rem', background: 'var(--gray-50)', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--gray-400)' }}>Aircraft</th><th style={{ textAlign: 'left', padding: '0.5rem', background: 'var(--gray-50)', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--gray-400)' }}>Reg</th><th style={{ textAlign: 'left', padding: '0.5rem', background: 'var(--gray-50)', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--gray-400)' }}>Category</th><th style={{ textAlign: 'left', padding: '0.5rem', background: 'var(--gray-50)', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--gray-400)' }}>Rate/hr</th><th style={{ textAlign: 'left', padding: '0.5rem', background: 'var(--gray-50)', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--gray-400)' }}>Status</th><th style={{ textAlign: 'left', padding: '0.5rem', background: 'var(--gray-50)', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--gray-400)' }}>Action</th></tr></thead>
                      <tbody>
                        {detail.aircraft.map(ac => (
                          <tr key={ac.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                            <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600, color: 'var(--navy)' }}>{ac.name}</td>
                            <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace', fontSize: '0.78rem' }}>{ac.registration_number}</td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>{ac.category_display || ac.category}</td>
                            <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>${Number(ac.hourly_rate_usd).toLocaleString()}</td>
                            <td style={{ padding: '0.6rem 0.5rem' }}><Badge label={ac.status} color={ac.status === 'available' ? 'green' : ac.status === 'pending' ? 'amber' : 'gray'} /></td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                              {!ac.is_approved && (
                                <button className="btn btn-green btn-xs" onClick={() => approveAc(ac.id)}>
                                  <i className="bi bi-check-lg" /> Approve
                                </button>
                              )}
                              {ac.is_approved && <span style={{ fontSize: '0.72rem', color: 'var(--green)' }}><i className="bi bi-check-circle-fill" /> Approved</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}

                {detailTab === 'yachts' && (
                  detail.yachts.length === 0 ? <div className="table-empty"><i className="bi bi-water" />No yachts listed.</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {detail.yachts.map(y => (
                        <div key={y.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-100)' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.875rem' }}>{y.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{y.length_meters}m · {y.guest_capacity} guests · {y.home_port}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>${Number(y.daily_rate_usd).toLocaleString()}/day</span>
                            <Badge label={y.status} color={y.status === 'available' ? 'green' : 'amber'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {detailTab === 'bookings' && (
                  detail.bookings.length === 0 ? <div className="table-empty"><i className="bi bi-calendar-check" />No bookings yet.</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {detail.bookings.map(b => (
                        <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-100)' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.875rem', fontFamily: 'monospace' }}>{String(b.reference).slice(0,8)}…</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{b.asset_type} · {new Date(b.created_at).toLocaleDateString()}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{fmt(b.operator_payout_usd)}</span>
                            <Badge label={b.status} color={STATUS_COLOR[b.status] || 'gray'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {detailTab === 'payouts' && (
                  detail.payouts.length === 0 ? <div className="table-empty"><i className="bi bi-cash-stack" />No payouts yet.</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {detail.payouts.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-100)' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{fmt(p.amount_usd)} {p.currency}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{p.payment_method || 'Bank transfer'} · {new Date(p.created_at).toLocaleDateString()}</div>
                          </div>
                          <Badge label={p.status} color={{ pending:'amber', processing:'navy', paid:'green', failed:'red' }[p.status] || 'gray'} />
                        </div>
                      ))}
                    </div>
                  )
                )}

                {detailTab === 'reviews' && (
                  detail.reviews.length === 0 ? <div className="table-empty"><i className="bi bi-star" />No reviews yet.</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {detail.reviews.map(r => (
                        <div key={r.id} style={{ padding: '0.85rem 1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-100)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{r.reviewer_name}</div>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1,2,3,4,5].map(n => <i key={n} className={`bi bi-star${n <= r.rating_overall ? '-fill' : ''}`} style={{ color: 'var(--gold)', fontSize: '0.8rem' }} />)}
                            </div>
                          </div>
                          {r.comment && <p style={{ fontSize: '0.83rem', color: 'var(--gray-500)', margin: 0 }}>{r.comment}</p>}
                          {!r.is_published && <span className="badge badge-amber" style={{ marginTop: '0.5rem' }}>Pending approval</span>}
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ── Create Operator Modal ── */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title={<><i className="bi bi-plus-lg" /> Add Charter Operator</>} maxWidth={620}>
        <form onSubmit={submitCreate}>
          {formErr && <div className="alert alert-error"><i className="bi bi-exclamation-triangle" /><span>{formErr}</span></div>}
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Company Name <span className="req">*</span></label>
              <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="East Africa Air" />
            </div>
            <div className="form-group">
              <label className="form-label">Trading Name</label>
              <input className="form-control" value={form.trading_name} onChange={e => setForm(f => ({ ...f, trading_name: e.target.value }))} placeholder="EA Air" />
            </div>
            <div className="form-group">
              <label className="form-label">Country <span className="req">*</span></label>
              <input className="form-control" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required placeholder="Kenya" />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-control" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Nairobi" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email <span className="req">*</span></label>
              <input className="form-control" type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input className="form-control" value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">AOC Number</label>
              <input className="form-control" value={form.aoc_number} onChange={e => setForm(f => ({ ...f, aoc_number: e.target.value }))} placeholder="KEN-AOC-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Tier</label>
              <select className="form-control" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                <option value="standard">Standard</option>
                <option value="preferred">Preferred</option>
                <option value="exclusive">Exclusive</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Website</label>
            <input className="form-control" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://…" />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={saving}>
              {saving ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</> : <><i className="bi bi-check-lg" /> Create Operator</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Change Tier Modal ── */}
      <Modal open={modal === 'tier'} onClose={() => setModal(null)} title={<><i className="bi bi-stars" /> Change Tier — {selected?.name}</>} maxWidth={420}>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Select a new partnership tier for this operator.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[['standard','Standard Partner','Base commission rates apply'],['preferred','Preferred Partner','Reduced commission, priority dispatch'],['exclusive','Exclusive Partner','Custom commission, dedicated NJH support']].map(([val, label, desc]) => (
            <button key={val} onClick={() => { changeTier(selected, val) }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '1rem', border: `1.5px solid ${selected?.tier === val ? 'var(--gold)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius)', background: selected?.tier === val ? 'var(--gold-pale)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)' }}>
              <i className="bi bi-patch-check" style={{ color: 'var(--gold)', fontSize: '1.1rem', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}