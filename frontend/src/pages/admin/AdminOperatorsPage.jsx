import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const TIER_COLOR = { standard: 'gray', preferred: 'navy', exclusive: 'gold' }
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
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [stFilter, setStFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null) // 'detail' | 'create' | 'tier'
  const [detail, setDetail] = useState(null)
  const [detailTab, setDetailTab] = useState('aircraft')
  const [message, setMessage] = useState({ text: '', type: '' })

  // Create form
  const blankForm = () => ({ 
    name: '', trading_name: '', country: '', city: '', 
    contact_email: '', contact_phone: '', tier: 'standard', 
    registration_no: '', aoc_number: '', website: '' 
  })
  const [form, setForm] = useState(blankForm())
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (tierFilter) params.tier = tierFilter
      if (stFilter) params.status = stFilter
      const response = await adminAPI.operators(params)
      const data = response?.data || response
      setOperators(data.results || data || [])
    } catch (err) {
      console.error('Failed to load operators:', err)
      setOperators([])
    } finally {
      setLoading(false)
    }
  }, [search, tierFilter, stFilter])

  useEffect(() => {
    load()
  }, [load])

  const openDetail = async (op) => {
    setSelected(op)
    setDetailTab('aircraft')
    setModal('detail')
    try {
      const [aircraft, yachts, bookings, payouts, reviews] = await Promise.all([
        adminAPI.opAircraft(op.id),
        adminAPI.opYachts(op.id),
        adminAPI.opBookings(op.id),
        adminAPI.opPayouts(op.id),
        adminAPI.opReviews(op.id),
      ])
      setDetail({ 
        aircraft: aircraft?.data?.results || aircraft?.data || aircraft || [], 
        yachts: yachts?.data?.results || yachts?.data || yachts || [],
        bookings: bookings?.data?.results || bookings?.data || bookings || [],
        payouts: payouts?.data?.results || payouts?.data || payouts || [],
        reviews: reviews?.data?.results || reviews?.data || reviews || []
      })
    } catch (err) {
      console.error('Failed to load operator details:', err)
    }
  }

  const activate = async (op) => {
    try {
      await adminAPI.activateOperator(op.id)
      setMessage({ text: 'Operator activated successfully.', type: 'success' })
      load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to activate operator.', type: 'error' })
    }
  }

  const suspend = async (op) => {
    try {
      await adminAPI.suspendOperator(op.id)
      setMessage({ text: 'Operator suspended.', type: 'success' })
      load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to suspend operator.', type: 'error' })
    }
  }

  const approveAircraft = async (id) => {
    try {
      await adminAPI.approveAircraft(id)
      if (selected) openDetail(selected)
      setMessage({ text: 'Aircraft approved.', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to approve aircraft.', type: 'error' })
    }
  }

  const submitCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormErr('')
    try {
      await adminAPI.createOperator(form)
      setMessage({ text: 'Operator created successfully.', type: 'success' })
      setModal(null)
      setForm(blankForm())
      load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      const data = err?.response?.data
      setFormErr(data?.detail || data?.message || 'Failed to create operator')
    } finally {
      setSaving(false)
    }
  }

  const changeTier = async (op, tier) => {
    try {
      await adminAPI.changeTier(op.id, { tier })
      setMessage({ text: `Tier changed to ${tier}.`, type: 'success' })
      load()
      setModal(null)
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to change tier.', type: 'error' })
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const stats = {
    total: operators.length,
    active: operators.filter(o => o.status === 'active').length,
    pending: operators.filter(o => o.status === 'pending').length,
    totalAircraft: operators.reduce((sum, o) => sum + (o.active_aircraft_count || 0), 0)
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Charter Operators</h2>
          <p>V2 partner operator network — aircraft & yacht suppliers</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
          <button className="btn btn-navy btn-sm" onClick={() => { setForm(blankForm()); setFormErr(''); setModal('create') }}>
            <i className="bi bi-plus-lg" /> Add Operator
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="operator-stats">
        <div className="operator-stat-card">
          <div className="operator-stat-number">{stats.total}</div>
          <div className="operator-stat-label">Total Operators</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--green)' }}>{stats.active}</div>
          <div className="operator-stat-label">Active</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--amber)' }}>{stats.pending}</div>
          <div className="operator-stat-label">Pending</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number">{stats.totalAircraft}</div>
          <div className="operator-stat-label">Total Aircraft</div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input 
              className="form-control search-input" 
              placeholder="Name, country, email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Tier</label>
          <select className="form-control" value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
            <option value="">All Tiers</option>
            <option value="standard">Standard</option>
            <option value="preferred">Preferred</option>
            <option value="exclusive">Exclusive</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select className="form-control" value={stFilter} onChange={e => setStFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        {(search || tierFilter || stFilter) && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setTierFilter(''); setStFilter('') }}>
              <i className="bi bi-x-lg" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Operators Table */}
      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p>Loading operators...</p>
            </div>
          ) : operators.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-building" />
              <p>No operators found.</p>
              {(search || tierFilter || stFilter) && (
                <button className="btn btn-outline-navy btn-sm" onClick={() => { setSearch(''); setTierFilter(''); setStFilter('') }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Location</th>
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
                    <td style={{ cursor: 'pointer' }} onClick={() => openDetail(op)}>
                      <div className="td-name">{op.name}</div>
                      {op.trading_name && <div className="td-email">{op.trading_name}</div>}
                    </td>
                    <td>{op.country}{op.city ? `, ${op.city}` : ''}</td>
                    <td><Badge label={op.tier} color={TIER_COLOR[op.tier]} /></td>
                    <td><Badge label={op.status} color={STATUS_COLOR[op.status]} /></td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{op.active_aircraft_count || 0}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}> active</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{op.active_yacht_count || 0}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}> active</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>{op.contact_email}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{op.contact_phone || '—'}</div>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-navy btn-xs" onClick={() => openDetail(op)} title="View details">
                          <i className="bi bi-eye" />
                        </button>
                        {op.status !== 'active' && (
                          <button className="btn btn-green btn-xs" onClick={() => activate(op)} title="Activate">
                            <i className="bi bi-check-circle" />
                          </button>
                        )}
                        {op.status === 'active' && (
                          <button className="btn btn-amber btn-xs" onClick={() => suspend(op)} title="Suspend">
                            <i className="bi bi-pause-circle" />
                          </button>
                        )}
                        <button className="btn btn-outline-navy btn-xs" onClick={() => { setSelected(op); setModal('tier') }} title="Change tier">
                          <i className="bi bi-stars" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && operators.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: 'var(--gray-400)',
          textAlign: 'center',
          borderTop: '1px solid var(--gray-100)'
        }}>
          Showing {operators.length} operator{operators.length !== 1 ? 's' : ''}
          {(search || tierFilter || stFilter) && ' with current filters'}
        </div>
      )}

      {/* ── Detail Modal ── */}
      <Modal open={modal === 'detail'} onClose={() => { setModal(null); setDetail(null) }} title={<><i className="bi bi-building" /> {selected?.name}</>} maxWidth={820}>
        {selected && (
          <div>
            {/* Operator header info */}
            <div className="operator-stats" style={{ marginBottom: '1rem' }}>
              <div className="operator-stat-card">
                <div className="operator-stat-number">{selected.tier}</div>
                <div className="operator-stat-label">Tier</div>
              </div>
              <div className="operator-stat-card">
                <div className="operator-stat-number">{selected.status}</div>
                <div className="operator-stat-label">Status</div>
              </div>
              <div className="operator-stat-card">
                <div className="operator-stat-number">{selected.country}</div>
                <div className="operator-stat-label">Country</div>
              </div>
              <div className="operator-stat-card">
                <div className="operator-stat-number">{selected.active_aircraft_count || 0}</div>
                <div className="operator-stat-label">Aircraft</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="settings-card" style={{ marginBottom: '1rem' }}>
              <div className="settings-card-header">
                <h4><i className="bi bi-envelope" /> Contact Information</h4>
              </div>
              <div className="settings-card-body">
                <div className="detail-item">
                  <span className="detail-item-label">Email</span>
                  <span className="detail-item-value">{selected.contact_email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Phone</span>
                  <span className="detail-item-value">{selected.contact_phone || '—'}</span>
                </div>
                {selected.website && (
                  <div className="detail-item">
                    <span className="detail-item-label">Website</span>
                    <span className="detail-item-value">
                      <a href={selected.website} target="_blank" rel="noopener noreferrer">{selected.website}</a>
                    </span>
                  </div>
                )}
                {selected.aoc_number && (
                  <div className="detail-item">
                    <span className="detail-item-label">AOC Number</span>
                    <span className="detail-item-value">{selected.aoc_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="tab-nav">
              {['aircraft', 'yachts', 'bookings', 'payouts', 'reviews'].map(tab => (
                <button key={tab} className={`tab-btn${detailTab === tab ? ' active' : ''}`} onClick={() => setDetailTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {detail && detail[tab]?.length > 0 && (
                    <span className="badge badge-gray" style={{ marginLeft: 5 }}>{detail[tab].length}</span>
                  )}
                </button>
              ))}
            </div>

            {!detail ? (
              <div className="table-empty"><div className="spinner-ring" style={{ margin: '1rem auto' }} /></div>
            ) : (
              <>
                {/* Aircraft Tab */}
                {detailTab === 'aircraft' && (
                  detail.aircraft.length === 0 ? (
                    <div className="table-empty"><i className="bi bi-airplane" />No aircraft listed.</div>
                  ) : (
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr><th>Aircraft</th><th>Registration</th><th>Category</th><th>Rate/hr</th><th>Status</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {detail.aircraft.map(ac => (
                            <tr key={ac.id}>
                              <td className="td-name">{ac.name}<div className="td-email">{ac.model}</div></td>
                              <td style={{ fontFamily: 'monospace' }}>{ac.registration_number}</td>
                              <td>{ac.category_display || ac.category}</td>
                              <td className="td-price">{formatCurrency(ac.hourly_rate_usd)}</td>
                              <td><Badge label={ac.status} color={ac.status === 'active' ? 'green' : 'amber'} /></td>
                              <td>
                                {!ac.is_approved && (
                                  <button className="btn btn-green btn-xs" onClick={() => approveAircraft(ac.id)}>
                                    <i className="bi bi-check-lg" /> Approve
                                  </button>
                                )}
                                {ac.is_approved && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--green)' }}>
                                    <i className="bi bi-check-circle-fill" /> Approved
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                {/* Yachts Tab */}
                {detailTab === 'yachts' && (
                  detail.yachts.length === 0 ? (
                    <div className="table-empty"><i className="bi bi-water" />No yachts listed.</div>
                  ) : (
                    detail.yachts.map(y => (
                      <div key={y.id} className="yacht-card">
                        <div>
                          <div className="yacht-name">{y.name}</div>
                          <div className="yacht-specs">{y.length_meters}m · {y.guest_capacity} guests · {y.home_port}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="td-price">{formatCurrency(y.daily_rate_usd)}/day</span>
                          <Badge label={y.status} color={y.status === 'available' ? 'green' : 'amber'} />
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Bookings Tab */}
                {detailTab === 'bookings' && (
                  detail.bookings.length === 0 ? (
                    <div className="table-empty"><i className="bi bi-calendar-check" />No bookings yet.</div>
                  ) : (
                    detail.bookings.map(b => (
                      <div key={b.id} className="yacht-card">
                        <div>
                          <div className="yacht-name" style={{ fontFamily: 'monospace' }}>{String(b.reference).slice(0, 8)}…</div>
                          <div className="yacht-specs">{b.asset_type} · {new Date(b.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="td-price">{formatCurrency(b.operator_payout_usd)}</span>
                          <Badge label={b.status} color={STATUS_COLOR[b.status] || 'gray'} />
                        </div>
                      </div>
                    ))
                  )
                )}

                {/* Payouts Tab */}
                {detailTab === 'payouts' && (
                  detail.payouts.length === 0 ? (
                    <div className="table-empty"><i className="bi bi-cash-stack" />No payouts yet.</div>
                  ) : (
                    detail.payouts.map(p => (
                      <div key={p.id} className="yacht-card">
                        <div>
                          <div className="yacht-name">{formatCurrency(p.amount_usd)} {p.currency}</div>
                          <div className="yacht-specs">{p.payment_method || 'Bank transfer'} · {new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                        <Badge label={p.status} color={{ pending: 'amber', processing: 'navy', paid: 'green', failed: 'red' }[p.status] || 'gray'} />
                      </div>
                    ))
                  )
                )}

                {/* Reviews Tab */}
                {detailTab === 'reviews' && (
                  detail.reviews.length === 0 ? (
                    <div className="table-empty"><i className="bi bi-star" />No reviews yet.</div>
                  ) : (
                    detail.reviews.map(r => (
                      <div key={r.id} className="settings-card" style={{ marginBottom: '0.75rem' }}>
                        <div className="settings-card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div className="yacht-name">{r.reviewer_name}</div>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1, 2, 3, 4, 5].map(n => (
                                <i key={n} className={`bi bi-star${n <= r.rating_overall ? '-fill' : ''}`} style={{ color: 'var(--gold)', fontSize: '0.8rem' }} />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p style={{ fontSize: '0.83rem', color: 'var(--gray-500)', margin: '0.5rem 0 0' }}>{r.comment}</p>}
                          {!r.is_published && <span className="badge badge-amber" style={{ marginTop: '0.5rem' }}>Pending approval</span>}
                        </div>
                      </div>
                    ))
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
          {formErr && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-triangle" />
              <span>{formErr}</span>
            </div>
          )}
          <div className="form-grid">
            <div className="form-group form-full">
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
            <div className="form-group form-full">
              <label className="form-label">Website</label>
              <input className="form-control" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={saving}>
              {saving ? <><span className="spinner" /> Creating…</> : <><i className="bi bi-check-lg" /> Create Operator</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Change Tier Modal ── */}
      <Modal open={modal === 'tier'} onClose={() => setModal(null)} title={<><i className="bi bi-stars" /> Change Tier — {selected?.name}</>} maxWidth={420}>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Select a new partnership tier for this operator.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[
            ['standard', 'Standard Partner', 'Base commission rates apply'],
            ['preferred', 'Preferred Partner', 'Reduced commission, priority dispatch'],
            ['exclusive', 'Exclusive Partner', 'Custom commission, dedicated support']
          ].map(([val, label, desc]) => (
            <button 
              key={val} 
              type="button"
              onClick={() => changeTier(selected, val)}
              className={`tier-option ${selected?.tier === val ? 'selected' : ''}`}
            >
              <i className="bi bi-patch-check tier-icon" />
              <div>
                <div className="tier-title">{label}</div>
                <div className="tier-desc">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}