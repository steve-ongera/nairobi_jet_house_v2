import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  'inquiry','rfq_sent','quoted','confirmed',
  'in_transit','delivered','completed','cancelled','disputed',
]

const STATUS_COLOR = {
  inquiry:    '#f59e0b',
  rfq_sent:   '#0f2d5e',
  quoted:     '#0f2d5e',
  confirmed:  '#22c55e',
  in_transit: '#22c55e',
  delivered:  '#22c55e',
  completed:  '#64748b',
  cancelled:  '#ef4444',
  disputed:   '#ef4444',
}

const STATUS_LABEL = {
  inquiry:    'Inquiry',
  rfq_sent:   'RFQ Sent',
  quoted:     'Quoted',
  confirmed:  'Confirmed',
  in_transit: 'In Transit',
  delivered:  'Delivered',
  completed:  'Completed',
  cancelled:  'Cancelled',
  disputed:   'Disputed',
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

function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  const label = STATUS_LABEL[status] || status?.replace(/_/g, ' ')
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'capitalize'
    }}>
      {label}
    </span>
  )
}

function UrgencyTag({ urgency }) {
  const m = URGENCY_META[urgency] || { label: urgency, color: '#6b7280' }
  return (
    <span style={{
      fontSize: '0.7rem',
      fontWeight: 700,
      color: m.color,
      letterSpacing: '0.06em',
      textTransform: 'uppercase'
    }}>
      {m.label}
    </span>
  )
}

function Modal({ open, onClose, title, children, size = 'lg' }) {
  if (!open) return null
  
  const width = size === 'lg' ? '720px' : size === 'md' ? '520px' : '380px'
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 20, 43, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-white)',
        borderRadius: '10px',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--color-light-gray)'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            color: 'var(--color-mid-gray)',
            padding: '0.25rem'
          }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats }) {
  if (!stats) return null
  const cards = [
    { label: 'Total Shipments', value: stats.totals?.total_count ?? 0, icon: 'bi-box-seam', color: '#0ea5e9' },
    { label: 'Total Revenue',   value: fmt(stats.totals?.total_revenue_usd), icon: 'bi-currency-dollar', color: '#10b981' },
    { label: 'NJH Commission',  value: fmt(stats.totals?.total_commission), icon: 'bi-percent', color: '#8b5cf6' },
    { label: 'Operator Cost',   value: fmt(stats.totals?.total_cost), icon: 'bi-truck', color: '#f59e0b' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {cards.map(c => (
        <div key={c.label} style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>{c.label}</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: c.color }}>{c.value}</div>
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
  const [modal, setModal]           = useState(null)

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

  // ── Open detail ─────────────────────────────────────────────────────────
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

  // ── Open price modal ────────────────────────────────────────────────────
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

  // ── Open tracking modal ─────────────────────────────────────────────────
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

  // ── Submit price ────────────────────────────────────────────────────────
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

  // ── Submit tracking ─────────────────────────────────────────────────────
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Air Cargo Bookings</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Confirmed shipments — pricing, operator assignment & tracking</p>
        </div>
        <button onClick={load} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          background: 'transparent',
          color: 'var(--color-navy)',
          border: '1.5px solid var(--color-navy)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.color = 'var(--color-white)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-navy)' }}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }}></i>
            <input
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s ease' }}
              placeholder="Name, company, email, AWB…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
        </div>
        <div style={{ minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Status</label>
          <select 
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            value={filterStatus} 
            onChange={e => setStatus(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s] || s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Urgency</label>
          <select 
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            value={filterUrgency} 
            onChange={e => setUrgency(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
          >
            <option value="">All Urgencies</option>
            {Object.entries(URGENCY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        {(search || filterStatus || filterUrgency) && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>&nbsp;</label>
            <button 
              style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: 'var(--color-mid-gray)', fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => { setSearch(''); setStatus(''); setUrgency('') }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-mid-gray)'}
            >
              <i className="bi bi-x-lg"></i> Clear
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: 'var(--color-mid-gray)' }}>Loading cargo bookings…</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No cargo bookings found.</p>
              {(search || filterStatus || filterUrgency) && (
                <button 
                  style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => { setSearch(''); setStatus(''); setUrgency('') }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Ref</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Client / Company</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Route</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Cargo</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Pickup</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Urgency</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Quoted</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Operator</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>AWB</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                      {str8(b.reference)}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.contact_name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{b.company || b.contact_email || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--color-navy)' }}>{b.origin_description?.slice(0, 20) || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>→ {b.destination_description?.slice(0, 20) || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                      {CARGO_TYPE_LABELS[b.cargo_type] || b.cargo_type || '—'}
                      {b.weight_kg && <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>{b.weight_kg} kg</div>}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                      {fmtDate(b.pickup_date)}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                      <UrgencyTag urgency={b.urgency} />
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>
                      {fmt(b.quoted_price_usd)}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                      {b.operator_name || <span style={{ color: 'var(--color-light-gray)' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                      {b.airway_bill_number || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                      <Badge status={b.status} />
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openPrice(b)} 
                          title="Set price / quote"
                        >
                          <i className="bi bi-currency-dollar"></i>
                        </button>
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openTracking(b)} 
                          title="Update tracking"
                        >
                          <i className="bi bi-geo-alt"></i>
                        </button>
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-mid-gray)', border: '1px solid var(--color-light-gray)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openDetail(b)} 
                          title="View details"
                        >
                          <i className="bi bi-eye"></i>
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
      {!loading && bookings.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)', textAlign: 'center' }}>
          Showing {bookings.length} shipment{bookings.length !== 1 ? 's' : ''}
          {(search || filterStatus || filterUrgency) && ' with current filters'}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title={<><i className="bi bi-box-seam"></i> Cargo Booking — {str8(selected?.reference)}</>} size="lg">
        {selected && (
          <div>
            {[
              ['Reference', str8(selected.reference)],
              ['Client', `${selected.contact_name || '—'} — ${selected.contact_email || '—'}`],
              ['Phone', selected.contact_phone || '—'],
              ['Company', selected.company || '—'],
              ['Origin', selected.origin_description],
              ['Destination', selected.destination_description],
              ['Pickup Date', fmtDate(selected.pickup_date)],
              ['Urgency', <UrgencyTag urgency={selected.urgency} />],
              ['Cargo Type', CARGO_TYPE_LABELS[selected.cargo_type] || selected.cargo_type],
              ['Description', selected.cargo_description || '—'],
              ['Weight', selected.weight_kg ? `${selected.weight_kg} kg` : '—'],
              ['Volume', selected.volume_m3 ? `${selected.volume_m3} m³` : '—'],
              ['Hazardous', selected.is_hazardous ? '⚠ Yes' : 'No'],
              ['Temp Control', selected.requires_temperature_control ? `Yes${selected.temperature_range ? ' — ' + selected.temperature_range : ''}` : 'No'],
              ['Insurance', selected.insurance_required ? 'Required' : 'Not required'],
              ['Operator', selected.operator_name || '—'],
              ['Aircraft', selected.aircraft_name ? `${selected.aircraft_name} (${selected.aircraft_reg})` : '—'],
              ['Quoted Price', fmt(selected.quoted_price_usd)],
              ['Operator Cost', fmt(selected.operator_cost_usd)],
              ['Commission', `${selected.commission_pct}% = ${fmt(selected.commission_usd)}`],
              ['NJH Net Revenue', fmt(selected.net_revenue_usd)],
              ['Payment Status', selected.payment_status || '—'],
              ['AWB Number', selected.airway_bill_number || '—'],
              ['Picked Up', fmtDateTime(selected.actual_pickup_at)],
              ['Delivered', fmtDateTime(selected.actual_delivery_at)],
              ['Status', <Badge status={selected.status} />],
              ['Created', fmtDateTime(selected.created_at)],
            ].map(([key, val]) => (
              <div key={key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{key}</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{val || '—'}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-light-gray)' }}>
              <button 
                style={{ padding: '0.4rem 0.8rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                onClick={() => openPrice(selected)}
              >
                <i className="bi bi-currency-dollar"></i> Set Price
              </button>
              <button 
                style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                onClick={() => openTracking(selected)}
              >
                <i className="bi bi-geo-alt"></i> Update Tracking
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Price Modal */}
      <Modal open={modal === 'price'} onClose={() => setModal(null)} title={<><i className="bi bi-currency-dollar"></i> Set Price — {selected?.contact_name}</>}>
        <form onSubmit={submitPrice}>
          {priceErr && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i><span>{priceErr}</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Quoted Price (USD) <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input 
                type="number" 
                step="0.01" 
                required
                value={priceForm.quoted_price_usd}
                onChange={e => setPriceForm(p => ({ ...p, quoted_price_usd: e.target.value }))}
                placeholder="5000.00"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Operator Cost (USD)</label>
              <input 
                type="number" 
                step="0.01"
                value={priceForm.operator_cost_usd}
                onChange={e => setPriceForm(p => ({ ...p, operator_cost_usd: e.target.value }))}
                placeholder="3500.00"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Commission %</label>
              <input 
                type="number" 
                step="0.01"
                value={priceForm.commission_pct}
                onChange={e => setPriceForm(p => ({ ...p, commission_pct: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Insurance Premium (USD)</label>
              <input 
                type="number" 
                step="0.01"
                value={priceForm.insurance_premium_usd}
                onChange={e => setPriceForm(p => ({ ...p, insurance_premium_usd: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Customs Fee (USD)</label>
              <input 
                type="number" 
                step="0.01"
                value={priceForm.customs_fee_usd}
                onChange={e => setPriceForm(p => ({ ...p, customs_fee_usd: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Update Status</label>
              <select 
                value={priceForm.status}
                onChange={e => setPriceForm(p => ({ ...p, status: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              >
                <option value="">— unchanged —</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s] || s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Email Message to Client</label>
            <textarea 
              rows={3}
              value={priceForm.email_message}
              onChange={e => setPriceForm(p => ({ ...p, email_message: e.target.value }))}
              placeholder="Leave blank for auto-generated message…"
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0 1.25rem' }}>
            <input type="checkbox" id="send_email_cargo" checked={priceForm.send_email}
              onChange={e => setPriceForm(p => ({ ...p, send_email: e.target.checked }))} />
            <label htmlFor="send_email_cargo" style={{ fontSize: '0.84rem', color: 'var(--color-dark-gray)', cursor: 'pointer' }}>
              Send quote email to client
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={priceLoading} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {priceLoading
                ? <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</>
                : <><i className="bi bi-check-lg"></i> Save Quote</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Tracking Modal */}
      <Modal open={modal === 'tracking'} onClose={() => setModal(null)} title={<><i className="bi bi-geo-alt"></i> Update Tracking — {str8(selected?.reference)}</>}>
        <form onSubmit={submitTracking}>
          {trackErr && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i><span>{trackErr}</span>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Airway Bill Number (AWB)</label>
            <input 
              value={trackForm.airway_bill_number}
              onChange={e => setTrackForm(p => ({ ...p, airway_bill_number: e.target.value }))}
              placeholder="e.g. 123-45678901"
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Actual Pickup</label>
              <input 
                type="datetime-local" 
                value={trackForm.actual_pickup_at}
                onChange={e => setTrackForm(p => ({ ...p, actual_pickup_at: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Actual Delivery</label>
              <input 
                type="datetime-local" 
                value={trackForm.actual_delivery_at}
                onChange={e => setTrackForm(p => ({ ...p, actual_delivery_at: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Proof of Delivery URL</label>
            <input 
              value={trackForm.proof_of_delivery_url}
              onChange={e => setTrackForm(p => ({ ...p, proof_of_delivery_url: e.target.value }))}
              placeholder="https://…"
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Update Status</label>
            <select 
              value={trackForm.status}
              onChange={e => setTrackForm(p => ({ ...p, status: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            >
              <option value="">— unchanged —</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s] || s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={trackLoading} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {trackLoading
                ? <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</>
                : <><i className="bi bi-check-lg"></i> Update Tracking</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}