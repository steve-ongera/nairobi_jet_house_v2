import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  'inquiry','rfq_sent','quoted','confirmed',
  'in_transit','delivered','completed','cancelled','disputed',
]

const STATUS_COLOR = {
  inquiry:    'amber',
  rfq_sent:   'navy',
  quoted:     'navy',
  confirmed:  'green',
  in_transit: 'green',
  delivered:  'green',
  completed:  'gray',
  cancelled:  'red',
  disputed:   'red',
}

const URGENCY_META = {
  standard: { label: 'Standard', color: '#6b7280' },
  express:  { label: 'Express',  color: '#d97706' },
  critical: { label: 'Critical', color: '#dc2626' },
}

const CARGO_TYPE_LABELS = {
  general: 'General', perishables: 'Perishables', pharma: 'Pharma',
  dangerous_goods: 'DG', live_animals: 'Animals', artwork: 'Artwork',
  automotive: 'Automotive', oversized: 'Oversized',
  humanitarian: 'Humanitarian', gold_minerals: 'Gold/Minerals', other: 'Other',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = n => n != null ? `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0 })}` : '—'
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateTime = d => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'
const str8 = s => s ? String(s).slice(0, 8).toUpperCase() : '—'

function Badge({ s }) {
  const label = s?.replace(/_/g, ' ')
  const color = STATUS_COLOR[s] || 'gray'
  return <span className={`badge badge-${color}`}>{label}</span>
}

function UrgencyTag({ urgency }) {
  const m = URGENCY_META[urgency] || { label: urgency, color: '#6b7280' }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: m.color,
      letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {m.label}
    </span>
  )
}

function Modal({ open, onClose, title, children, size = 'lg' }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal-${size}`}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats }) {
  if (!stats) return null
  const cards = [
    { label: 'Total Shipments', value: stats.totals?.total_count ?? 0,          icon: 'bi-box-seam',       color: '#0ea5e9' },
    { label: 'Total Revenue',   value: fmt(stats.totals?.total_revenue_usd),    icon: 'bi-currency-dollar', color: '#10b981' },
    { label: 'NJH Commission',  value: fmt(stats.totals?.total_commission),     icon: 'bi-percent',         color: '#8b5cf6' },
    { label: 'Operator Cost',   value: fmt(stats.totals?.total_cost),           icon: 'bi-truck',           color: '#f59e0b' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
      {cards.map(c => (
        <div key={c.label} className="stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{c.value}</div>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCargoBookingsPage() {
  const [bookings, setBookings]     = useState([])
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatus, setStatus]   = useState('')
  const [filterUrgency, setUrgency] = useState('')
  const [selected, setSelected]     = useState(null)
  const [modal, setModal]           = useState(null) // 'detail' | 'price' | 'tracking'

  // Price form
  const [priceForm, setPriceForm] = useState({
    quoted_price_usd: '', operator_cost_usd: '', commission_pct: '15',
    insurance_premium_usd: '', customs_fee_usd: '',
    status: '', send_email: true, email_message: '',
  })
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceErr, setPriceErr]         = useState('')

  // Tracking form
  const [trackForm, setTrackForm] = useState({
    airway_bill_number: '', actual_pickup_at: '', actual_delivery_at: '',
    proof_of_delivery_url: '', status: '',
  })
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackErr, setTrackErr]         = useState('')

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)        params.search  = search
      if (filterStatus)  params.status  = filterStatus
      if (filterUrgency) params.urgency = filterUrgency
      const [bRes, sRes] = await Promise.all([
        adminAPI.cargoBookings(params),
        adminAPI.cargoBookingStats(),
      ])
      setBookings(bRes.data?.results || bRes.data || [])
      setStats(sRes.data)
    } catch (err) {
      console.error('Failed to load cargo bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, filterUrgency])

  useEffect(() => { load() }, [load])

  // ── Open detail (fetch full object) ───────────────────────────────────────
  const openDetail = async (b) => {
    try {
      const r = await adminAPI.getCargoBooking(b.id)
      setSelected(r.data)
      setModal('detail')
    } catch {
      setSelected(b)
      setModal('detail')
    }
  }

  // ── Open price modal ──────────────────────────────────────────────────────
  const openPrice = (b) => {
    setSelected(b)
    setPriceForm({
      quoted_price_usd:      b.quoted_price_usd      || '',
      operator_cost_usd:     b.operator_cost_usd     || '',
      commission_pct:        b.commission_pct        || '15',
      insurance_premium_usd: b.insurance_premium_usd || '',
      customs_fee_usd:       b.customs_fee_usd       || '',
      status:                b.status                || '',
      send_email:            true,
      email_message:         '',
    })
    setPriceErr('')
    setModal('price')
  }

  // ── Open tracking modal ───────────────────────────────────────────────────
  const openTracking = (b) => {
    setSelected(b)
    setTrackForm({
      airway_bill_number:    b.airway_bill_number    || '',
      actual_pickup_at:      b.actual_pickup_at      ? b.actual_pickup_at.slice(0, 16) : '',
      actual_delivery_at:    b.actual_delivery_at    ? b.actual_delivery_at.slice(0, 16) : '',
      proof_of_delivery_url: b.proof_of_delivery_url || '',
      status:                b.status               || '',
    })
    setTrackErr('')
    setModal('tracking')
  }

  // ── Submit price ──────────────────────────────────────────────────────────
  const submitPrice = async (e) => {
    e.preventDefault()
    setPriceLoading(true); setPriceErr('')
    try {
      await adminAPI.setCargoPrice(selected.id, priceForm)
      await load()
      setModal(null)
    } catch (err) {
      const d = err?.response?.data
      setPriceErr(d?.detail || JSON.stringify(d) || 'Failed to save quote')
    } finally { setPriceLoading(false) }
  }

  // ── Submit tracking ───────────────────────────────────────────────────────
  const submitTracking = async (e) => {
    e.preventDefault()
    setTrackLoading(true); setTrackErr('')
    try {
      await adminAPI.updateCargoTracking(selected.id, trackForm)
      await load()
      setModal(null)
    } catch (err) {
      const d = err?.response?.data
      setTrackErr(d?.detail || 'Failed to update tracking')
    } finally { setTrackLoading(false) }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Air Cargo Bookings</h2>
          <p>Confirmed shipments — pricing, operator assignment &amp; tracking</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input
              className="form-control search-input"
              placeholder="Name, company, email, AWB…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select className="form-control" value={filterStatus} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Urgency</label>
          <select className="form-control" value={filterUrgency} onChange={e => setUrgency(e.target.value)}>
            <option value="">All Urgencies</option>
            {Object.entries(URGENCY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        {(search || filterStatus || filterUrgency) && (
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label>&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatus(''); setUrgency('') }}>
              <i className="bi bi-x-lg" /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="table-empty">
              <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p>Loading cargo bookings…</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="table-empty">
              <i className="bi bi-box-seam" />
              <p>No cargo bookings found.</p>
              {(search || filterStatus || filterUrgency) && (
                <button className="btn btn-outline-navy btn-sm"
                  onClick={() => { setSearch(''); setStatus(''); setUrgency('') }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Client / Company</th>
                  <th>Route</th>
                  <th>Cargo</th>
                  <th>Pickup</th>
                  <th>Urgency</th>
                  <th>Quoted</th>
                  <th>Operator</th>
                  <th>AWB</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <span className="td-ref">{str8(b.reference)}</span>
                    </td>
                    <td>
                      <div className="td-name">{b.contact_name || '—'}</div>
                      <div className="td-email">{b.company || b.contact_email || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>
                        {b.origin_description?.slice(0, 20) || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        → {b.destination_description?.slice(0, 20) || '—'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.83rem' }}>
                      {CARGO_TYPE_LABELS[b.cargo_type] || b.cargo_type || '—'}
                      {b.weight_kg && <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{b.weight_kg} kg</div>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.83rem' }}>
                      {fmtDate(b.pickup_date)}
                    </td>
                    <td><UrgencyTag urgency={b.urgency} /></td>
                    <td className="td-price">{fmt(b.quoted_price_usd)}</td>
                    <td style={{ fontSize: '0.83rem' }}>
                      {b.operator_name || <span style={{ color: 'var(--gray-300)' }}>Unassigned</span>}
                      {b.aircraft_name && <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{b.aircraft_reg}</div>}
                    </td>
                    <td>
                      <code style={{ fontSize: 11, color: '#6b7280' }}>{b.airway_bill_number || '—'}</code>
                    </td>
                    <td><Badge s={b.status} /></td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-navy btn-xs" title="Set price / quote"
                          onClick={() => openPrice(b)}>
                          <i className="bi bi-currency-dollar" />
                        </button>
                        <button className="btn btn-outline-navy btn-xs" title="Update tracking"
                          onClick={() => openTracking(b)}>
                          <i className="bi bi-geo-alt" />
                        </button>
                        <button className="btn btn-ghost btn-xs" title="View details"
                          onClick={() => openDetail(b)}>
                          <i className="bi bi-eye" />
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

      {!loading && bookings.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', fontSize: '0.8rem',
          color: 'var(--gray-400)', textAlign: 'center' }}>
          Showing {bookings.length} shipment{bookings.length !== 1 ? 's' : ''}
          {(search || filterStatus || filterUrgency) && ' with current filters'}
        </div>
      )}

      {/* ── Detail Modal ────────────────────────────────────────────────── */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)}
        title={<><i className="bi bi-box-seam" /> Cargo Booking — {str8(selected?.reference)}</>}
        size="lg">
        {selected && (
          <div>
            {[
              ['Reference',        str8(selected.reference)],
              ['Client',           `${selected.contact_name || '—'} — ${selected.contact_email || '—'}`],
              ['Phone',            selected.contact_phone || '—'],
              ['Company',          selected.company || '—'],
              ['Origin',           selected.origin_description],
              ['Destination',      selected.destination_description],
              ['Pickup Date',      fmtDate(selected.pickup_date)],
              ['Urgency',          <UrgencyTag urgency={selected.urgency} />],
              ['Cargo Type',       CARGO_TYPE_LABELS[selected.cargo_type] || selected.cargo_type],
              ['Description',      selected.cargo_description],
              ['Weight',           selected.weight_kg ? `${selected.weight_kg} kg` : '—'],
              ['Volume',           selected.volume_m3 ? `${selected.volume_m3} m³` : '—'],
              ['Hazardous',        selected.is_hazardous ? '⚠ Yes' : 'No'],
              ['Temp Control',     selected.requires_temperature_control ? `Yes${selected.temperature_range ? ' — ' + selected.temperature_range : ''}` : 'No'],
              ['Insurance',        selected.insurance_required ? 'Required' : 'Not required'],
              ['Operator',         selected.operator_name || '—'],
              ['Aircraft',         selected.aircraft_name ? `${selected.aircraft_name} (${selected.aircraft_reg})` : '—'],
              ['Quoted Price',     fmt(selected.quoted_price_usd)],
              ['Operator Cost',    fmt(selected.operator_cost_usd)],
              ['Commission',       `${selected.commission_pct}% = ${fmt(selected.commission_usd)}`],
              ['NJH Net Revenue',  fmt(selected.net_revenue_usd)],
              ['Payment Status',   selected.payment_status],
              ['AWB Number',       selected.airway_bill_number || '—'],
              ['Picked Up',        fmtDateTime(selected.actual_pickup_at)],
              ['Delivered',        fmtDateTime(selected.actual_delivery_at)],
              ['Status',           <Badge s={selected.status} />],
              ['Created',          fmtDateTime(selected.created_at)],
            ].map(([key, val]) => (
              <div className="detail-row" key={key}>
                <div className="detail-key">{key}</div>
                <div className="detail-val">{val || '—'}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
              <button className="btn btn-navy btn-sm" onClick={() => openPrice(selected)}>
                <i className="bi bi-currency-dollar" /> Set Price
              </button>
              <button className="btn btn-outline-navy btn-sm" onClick={() => openTracking(selected)}>
                <i className="bi bi-geo-alt" /> Update Tracking
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Price Modal ──────────────────────────────────────────────────── */}
      <Modal open={modal === 'price'} onClose={() => setModal(null)}
        title={<><i className="bi bi-currency-dollar" /> Set Price — {selected?.contact_name}</>}>
        <form onSubmit={submitPrice}>
          {priceErr && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <i className="bi bi-exclamation-triangle" /><span>{priceErr}</span>
            </div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Quoted Price (USD) <span className="req">*</span></label>
              <input className="form-control" type="number" step="0.01" required
                value={priceForm.quoted_price_usd}
                onChange={e => setPriceForm(p => ({ ...p, quoted_price_usd: e.target.value }))}
                placeholder="5000.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Operator Cost (USD)</label>
              <input className="form-control" type="number" step="0.01"
                value={priceForm.operator_cost_usd}
                onChange={e => setPriceForm(p => ({ ...p, operator_cost_usd: e.target.value }))}
                placeholder="3500.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Commission %</label>
              <input className="form-control" type="number" step="0.01"
                value={priceForm.commission_pct}
                onChange={e => setPriceForm(p => ({ ...p, commission_pct: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Insurance Premium (USD)</label>
              <input className="form-control" type="number" step="0.01"
                value={priceForm.insurance_premium_usd}
                onChange={e => setPriceForm(p => ({ ...p, insurance_premium_usd: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Customs Fee (USD)</label>
              <input className="form-control" type="number" step="0.01"
                value={priceForm.customs_fee_usd}
                onChange={e => setPriceForm(p => ({ ...p, customs_fee_usd: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={priceForm.status}
                onChange={e => setPriceForm(p => ({ ...p, status: e.target.value }))}>
                <option value="">— unchanged —</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Email Message to Client</label>
            <textarea className="form-control" rows={3}
              value={priceForm.email_message}
              onChange={e => setPriceForm(p => ({ ...p, email_message: e.target.value }))}
              placeholder="Leave blank for auto-generated message…" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0 1.25rem' }}>
            <input type="checkbox" id="send_email_cargo" checked={priceForm.send_email}
              onChange={e => setPriceForm(p => ({ ...p, send_email: e.target.checked }))} />
            <label htmlFor="send_email_cargo" style={{ fontSize: '0.84rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
              Send quote email to client
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={priceLoading}>
              {priceLoading
                ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
                : <><i className="bi bi-check-lg" /> Save Quote</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Tracking Modal ───────────────────────────────────────────────── */}
      <Modal open={modal === 'tracking'} onClose={() => setModal(null)}
        title={<><i className="bi bi-geo-alt" /> Update Tracking — {str8(selected?.reference)}</>}>
        <form onSubmit={submitTracking}>
          {trackErr && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <i className="bi bi-exclamation-triangle" /><span>{trackErr}</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Airway Bill Number (AWB)</label>
            <input className="form-control" value={trackForm.airway_bill_number}
              onChange={e => setTrackForm(p => ({ ...p, airway_bill_number: e.target.value }))}
              placeholder="e.g. 123-45678901" />
          </div>
          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Actual Pickup</label>
              <input className="form-control" type="datetime-local" value={trackForm.actual_pickup_at}
                onChange={e => setTrackForm(p => ({ ...p, actual_pickup_at: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Actual Delivery</label>
              <input className="form-control" type="datetime-local" value={trackForm.actual_delivery_at}
                onChange={e => setTrackForm(p => ({ ...p, actual_delivery_at: e.target.value }))} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Proof of Delivery URL</label>
            <input className="form-control" value={trackForm.proof_of_delivery_url}
              onChange={e => setTrackForm(p => ({ ...p, proof_of_delivery_url: e.target.value }))}
              placeholder="https://…" />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Update Status</label>
            <select className="form-control" value={trackForm.status}
              onChange={e => setTrackForm(p => ({ ...p, status: e.target.value }))}>
              <option value="">— unchanged —</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={trackLoading}>
              {trackLoading
                ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Saving…</>
                : <><i className="bi bi-check-lg" /> Update Tracking</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}