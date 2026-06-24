import { useState, useEffect, useCallback } from 'react'
import { adminAPI, catalogAPI } from '../../services/api'

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'light',         label: 'Light Jet' },
  { value: 'midsize',       label: 'Midsize Jet' },
  { value: 'super_midsize', label: 'Super Midsize' },
  { value: 'heavy',         label: 'Heavy Jet' },
  { value: 'ultra_long',    label: 'Ultra Long Range' },
  { value: 'vip_airliner',  label: 'VIP Airliner' },
  { value: 'turboprop',     label: 'Turboprop' },
  { value: 'helicopter',    label: 'Helicopter' },
]

const STATUSES = [
  { value: 'available',   label: 'Available',   color: '#22c55e' },
  { value: 'booked',      label: 'Booked',      color: '#f59e0b' },
  { value: 'maintenance', label: 'Maintenance', color: '#ef4444' },
  { value: 'inactive',    label: 'Inactive',    color: '#94a3b8' },
  { value: 'pending',     label: 'Pending',     color: '#0a2540' },
]

const STATUS_COLOR = Object.fromEntries(STATUSES.map(s => [s.value, s.color]))

// ── Helpers ───────────────────────────────────────────────────────────────────
function Badge({ status, label }) {
  const color = STATUS_COLOR[status] || '#64748b'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '0.2rem 0.6rem',
      background: `${color}15`,
      color,
      border: `1px solid ${color}35`,
      borderRadius: '4px',
      fontSize: '0.7rem', fontWeight: 600
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label || status}
    </span>
  )
}

function ApprovalBadge({ approved }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '0.18rem 0.55rem',
      background: approved ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
      color: approved ? '#166534' : '#92400e',
      border: `1px solid ${approved ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
      borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600
    }}>
      <i className={`bi ${approved ? 'bi-patch-check-fill' : 'bi-hourglass-split'}`} style={{ fontSize: '0.65rem' }} />
      {approved ? 'Approved' : 'Pending Approval'}
    </span>
  )
}

function Spinner({ size = 16, color = '#ffffff' }) {
  return (
    <span style={{
      width: size, height: size,
      border: `2px solid ${color}40`, borderTopColor: color,
      borderRadius: '50%', display: 'inline-block',
      animation: 'spin 0.6s linear infinite', flexShrink: 0
    }} />
  )
}

function Modal({ open, onClose, title, children, size = 'lg' }) {
  if (!open) return null
  const maxW = size === 'xl' ? '860px' : size === 'lg' ? '640px' : size === 'md' ? '480px' : '360px'
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,37,64,0.65)',
      backdropFilter: 'blur(4px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: '12px', width: '100%', maxWidth: maxW,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.5rem', borderBottom: '1px solid #e8edf2'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0a2540', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#6b7c93', padding: '0.2rem' }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Input style helper
const inp = (extra = {}) => ({
  style: {
    width: '100%', padding: '0.6rem 0.75rem',
    border: '1.5px solid #e8edf2', borderRadius: '6px',
    fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s', background: '#fff', ...extra
  },
  onFocus: e => { e.currentTarget.style.borderColor = '#0a2540' },
  onBlur:  e => { e.currentTarget.style.borderColor = '#e8edf2' },
})

const label = (text, required) => (
  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#0a2540', marginBottom: '0.3rem' }}>
    {text} {required && <span style={{ color: '#ef4444' }}>*</span>}
  </label>
)

const SectionTitle = ({ icon, children }) => (
  <div style={{
    fontSize: '0.7rem', fontWeight: 700, color: '#0a2540',
    textTransform: 'uppercase', letterSpacing: '1px',
    marginBottom: '0.75rem', paddingBottom: '0.4rem',
    borderBottom: '1px solid #e8edf2',
    display: 'flex', alignItems: 'center', gap: '0.4rem'
  }}>
    {icon && <i className={`bi ${icon}`} />}
    {children}
  </div>
)

// ── Aircraft Avatar ────────────────────────────────────────────────────────────
function AircraftAvatar({ imageUrl, name, size = 40 }) {
  const [imgError, setImgError] = useState(false)
  
  const getInitials = (name) => {
    if (!name) return '✈'
    const words = name.split(' ')
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      background: '#f0f4f8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #e8edf2'
    }}>
      {imageUrl && !imgError ? (
        <img 
          src={imageUrl} 
          alt={name || 'Aircraft'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span style={{
          fontSize: size * 0.4,
          fontWeight: 600,
          color: '#6b7c93'
        }}>
          {getInitials(name)}
        </span>
      )}
    </div>
  )
}

// ── Catalog Aircraft Quick-Add Modal ──────────────────────────────────────────
const EMPTY_CATALOG = {
  name: '', model: '', category: 'light', passenger_capacity: '',
  range_km: '', cruise_speed_kmh: '', description: '', hourly_rate_usd: '',
  is_available: true, amenities: [], image_url: ''
}

function CatalogAddModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_CATALOG)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { if (open) { setForm(EMPTY_CATALOG); setErr('') } }, [open])

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const res = await adminAPI.createCatalogAircraft(form)
      onCreated(res.data)
      onClose()
    } catch (ex) {
      const d = ex?.response?.data
      setErr(d?.detail || JSON.stringify(d) || 'Failed to create catalog aircraft')
    } finally { setLoading(false) }
  }

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <Modal open={open} onClose={onClose} size="lg"
      title={<><i className="bi bi-plus-circle text-success" style={{ color: '#22c55e' }} /> Add to Aircraft Catalog</>}>
      {err && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#dc2626', fontSize: '0.875rem' }}>
          <i className="bi bi-exclamation-triangle-fill" /> {err}
        </div>
      )}
      <p style={{ fontSize: '0.82rem', color: '#6b7c93', marginBottom: '1.25rem' }}>
        This aircraft model isn't in the catalog yet. Fill in the specs below to add it first, then you can link operator aircraft to it.
      </p>
      <form onSubmit={handle}>
        <SectionTitle icon="bi-info-circle">Basic Info</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>{label('Aircraft Name', true)}<input {...inp()} value={form.name} onChange={f('name')} placeholder="e.g. Gulfstream G650" required /></div>
          <div>{label('Model', true)}<input {...inp()} value={form.model} onChange={f('model')} placeholder="e.g. G650ER" required /></div>
          <div>
            {label('Category', true)}
            <select {...inp()} value={form.category} onChange={f('category')} required>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>{label('Hourly Rate (USD)', true)}<input type="number" step="0.01" {...inp()} value={form.hourly_rate_usd} onChange={f('hourly_rate_usd')} placeholder="4500.00" required /></div>
        </div>

        <SectionTitle icon="bi-speedometer2">Performance</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>{label('Pax Capacity', true)}<input type="number" {...inp()} value={form.passenger_capacity} onChange={f('passenger_capacity')} placeholder="14" required /></div>
          <div>{label('Range (km)', true)}<input type="number" {...inp()} value={form.range_km} onChange={f('range_km')} placeholder="12960" required /></div>
          <div>{label('Cruise Speed (km/h)')}<input type="number" {...inp()} value={form.cruise_speed_kmh} onChange={f('cruise_speed_kmh')} placeholder="956" /></div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          {label('Description')}
          <textarea rows={2} {...inp({ resize: 'vertical' })} value={form.description} onChange={f('description')} placeholder="Optional description..." />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          {label('Image URL')}
          <input {...inp()} value={form.image_url} onChange={f('image_url')} placeholder="https://..." />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #e8edf2', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.3rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? <><Spinner /> Creating...</> : <><i className="bi bi-check-lg" /> Add to Catalog</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Operator Aircraft Form Modal ──────────────────────────────────────────────
const EMPTY_AIRCRAFT = {
  operator: '', catalog_aircraft: '', name: '', model: '',
  category: 'light', registration_number: '', year_of_manufacture: '',
  base_airport: '', passenger_capacity: '', range_km: '',
  cruise_speed_kmh: '', max_baggage_kg: '',
  wifi_available: false, pets_allowed: false, smoking_allowed: false,
  hourly_rate_usd: '', min_hours: '1.0', positioning_fee_usd: '0',
  overnight_fee_usd: '0', description: '', image_url: '',
  maintenance_interval_hours: '100', airworthiness_expiry: '', insurance_expiry: ''
}

function AircraftFormModal({ open, onClose, onSaved, operators, catalogAircraft, airports, editData, onRequestAddCatalog }) {
  const [form, setForm] = useState(EMPTY_AIRCRAFT)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const isEdit = !!editData

  // Populate on open
  useEffect(() => {
    if (!open) return
    if (isEdit) {
      setForm({
        ...EMPTY_AIRCRAFT,
        operator: editData.operator || '',
        catalog_aircraft: editData.catalog_aircraft || '',
        name: editData.name || '',
        model: editData.model || '',
        category: editData.category || 'light',
        registration_number: editData.registration_number || '',
        year_of_manufacture: editData.year_of_manufacture || '',
        base_airport: editData.base_airport || '',
        passenger_capacity: editData.passenger_capacity || '',
        range_km: editData.range_km || '',
        cruise_speed_kmh: editData.cruise_speed_kmh || '',
        max_baggage_kg: editData.max_baggage_kg || '',
        wifi_available: editData.wifi_available || false,
        pets_allowed: editData.pets_allowed || false,
        smoking_allowed: editData.smoking_allowed || false,
        hourly_rate_usd: editData.hourly_rate_usd || '',
        min_hours: editData.min_hours || '1.0',
        positioning_fee_usd: editData.positioning_fee_usd || '0',
        overnight_fee_usd: editData.overnight_fee_usd || '0',
        description: editData.description || '',
        image_url: editData.image_url || '',
        maintenance_interval_hours: editData.maintenance_interval_hours || '100',
        airworthiness_expiry: editData.airworthiness_expiry || '',
        insurance_expiry: editData.insurance_expiry || '',
      })
    } else {
      setForm(EMPTY_AIRCRAFT)
    }
    setErr('')
  }, [open, editData])

  // Auto-fill specs when catalog aircraft is selected
  const handleCatalogSelect = (e) => {
    const id = e.target.value
    setForm(p => ({ ...p, catalog_aircraft: id }))
    if (id) {
      const cat = catalogAircraft.find(c => String(c.id) === String(id))
      if (cat) {
        setForm(p => ({
          ...p, catalog_aircraft: id,
          name: p.name || cat.name,
          model: p.model || cat.model,
          category: cat.category || p.category,
          passenger_capacity: p.passenger_capacity || cat.passenger_capacity,
          range_km: p.range_km || cat.range_km,
          cruise_speed_kmh: p.cruise_speed_kmh || (cat.cruise_speed_kmh || ''),
          hourly_rate_usd: p.hourly_rate_usd || cat.hourly_rate_usd,
        }))
      }
    }
  }

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const check = (k) => e => setForm(p => ({ ...p, [k]: e.target.checked }))

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setErr('')
    const payload = {
      ...form,
      catalog_aircraft: form.catalog_aircraft || null,
      base_airport: form.base_airport || null,
      year_of_manufacture: form.year_of_manufacture || null,
      cruise_speed_kmh: form.cruise_speed_kmh || null,
      max_baggage_kg: form.max_baggage_kg || null,
      airworthiness_expiry: form.airworthiness_expiry || null,
      insurance_expiry: form.insurance_expiry || null,
    }
    try {
      if (isEdit) {
        await adminAPI.updateOperatorAircraft(editData.id, payload)
      } else {
        await adminAPI.createOperatorAircraft(payload)
      }
      onSaved()
      onClose()
    } catch (ex) {
      const d = ex?.response?.data
      setErr(typeof d === 'object' ? JSON.stringify(d) : (d || 'Failed to save'))
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} size="xl"
      title={<><i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-airplane-fill'}`} style={{ color: '#c8a245' }} /> {isEdit ? 'Edit Operator Aircraft' : 'Add Operator Aircraft'}</>}>
      {err && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', color: '#dc2626', fontSize: '0.82rem' }}>
          <i className="bi bi-exclamation-triangle-fill" /> {err}
        </div>
      )}
      <form onSubmit={handle}>
        {/* Operator & Catalog Link */}
        <SectionTitle icon="bi-building">Operator & Catalog Link</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            {label('Charter Operator', true)}
            <select {...inp()} value={form.operator} onChange={f('operator')} required>
              <option value="">— Select operator —</option>
              {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
            </select>
          </div>
          <div>
            {label('Catalog Aircraft (optional)')}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <select {...inp()} value={form.catalog_aircraft} onChange={handleCatalogSelect}>
                  <option value="">— None / Add new below —</option>
                  {catalogAircraft.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.model}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={onRequestAddCatalog}
                title="Add a new catalog aircraft"
                style={{ padding: '0.6rem 0.75rem', background: 'rgba(34,197,94,0.1)', color: '#166534', border: '1.5px solid rgba(34,197,94,0.3)', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
                <i className="bi bi-plus-lg" /> New
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#6b7c93', marginTop: '0.3rem' }}>
              Linking to a catalog model auto-fills specs below.
            </p>
          </div>
        </div>

        {/* Identity */}
        <SectionTitle icon="bi-card-text">Aircraft Identity</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>{label('Aircraft Name', true)}<input {...inp()} value={form.name} onChange={f('name')} placeholder="e.g. Gulfstream G650" required /></div>
          <div>{label('Model', true)}<input {...inp()} value={form.model} onChange={f('model')} placeholder="G650ER" required /></div>
          <div>
            {label('Category', true)}
            <select {...inp()} value={form.category} onChange={f('category')} required>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>{label('Registration No.', true)}<input {...inp()} value={form.registration_number} onChange={f('registration_number')} placeholder="5Y-KZA" required /></div>
          <div>{label('Year of Manufacture')}<input type="number" {...inp()} value={form.year_of_manufacture} onChange={f('year_of_manufacture')} placeholder="2019" /></div>
          <div>
            {label('Base Airport')}
            <select {...inp()} value={form.base_airport} onChange={f('base_airport')}>
              <option value="">— Select airport —</option>
              {airports.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
            </select>
          </div>
        </div>

        {/* Specs */}
        <SectionTitle icon="bi-speedometer2">Performance Specs</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>{label('Pax Capacity', true)}<input type="number" {...inp()} value={form.passenger_capacity} onChange={f('passenger_capacity')} placeholder="14" required /></div>
          <div>{label('Range (km)', true)}<input type="number" {...inp()} value={form.range_km} onChange={f('range_km')} placeholder="12960" required /></div>
          <div>{label('Cruise Speed (km/h)')}<input type="number" {...inp()} value={form.cruise_speed_kmh} onChange={f('cruise_speed_kmh')} placeholder="956" /></div>
          <div>{label('Max Baggage (kg)')}<input type="number" {...inp()} value={form.max_baggage_kg} onChange={f('max_baggage_kg')} placeholder="500" /></div>
        </div>

        {/* Cabin Features */}
        <SectionTitle icon="bi-star">Cabin Features</SectionTitle>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
          {[['wifi_available', 'Wi-Fi Available', 'bi-wifi'], ['pets_allowed', 'Pets Allowed', 'bi-heart-fill'], ['smoking_allowed', 'Smoking Allowed', 'bi-slash-circle']].map(([key, text, icon]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#2a3a4e' }}>
              <input type="checkbox" checked={form[key]} onChange={check(key)} style={{ width: 15, height: 15 }} />
              <i className={`bi ${icon}`} style={{ fontSize: '0.85rem', color: '#6b7c93' }} /> {text}
            </label>
          ))}
        </div>

        {/* Pricing */}
        <SectionTitle icon="bi-currency-dollar">Pricing</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>{label('Hourly Rate (USD)', true)}<input type="number" step="0.01" {...inp()} value={form.hourly_rate_usd} onChange={f('hourly_rate_usd')} placeholder="4500.00" required /></div>
          <div>{label('Min Hours')}<input type="number" step="0.5" {...inp()} value={form.min_hours} onChange={f('min_hours')} placeholder="1.0" /></div>
          <div>{label('Positioning Fee (USD)')}<input type="number" step="0.01" {...inp()} value={form.positioning_fee_usd} onChange={f('positioning_fee_usd')} placeholder="0" /></div>
          <div>{label('Overnight Fee (USD)')}<input type="number" step="0.01" {...inp()} value={form.overnight_fee_usd} onChange={f('overnight_fee_usd')} placeholder="0" /></div>
        </div>

        {/* Compliance */}
        <SectionTitle icon="bi-shield-check">Compliance & Maintenance</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>{label('Maintenance Interval (hrs)')}<input type="number" {...inp()} value={form.maintenance_interval_hours} onChange={f('maintenance_interval_hours')} /></div>
          <div>{label('Airworthiness Expiry')}<input type="date" {...inp()} value={form.airworthiness_expiry} onChange={f('airworthiness_expiry')} /></div>
          <div>{label('Insurance Expiry')}<input type="date" {...inp()} value={form.insurance_expiry} onChange={f('insurance_expiry')} /></div>
        </div>

        {/* Presentation */}
        <SectionTitle icon="bi-image">Presentation</SectionTitle>
        <div style={{ marginBottom: '0.75rem' }}>
          {label('Image URL')}
          <input {...inp()} value={form.image_url} onChange={f('image_url')} placeholder="https://..." />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          {label('Description')}
          <textarea rows={3} {...inp({ resize: 'vertical' })} value={form.description} onChange={f('description')} placeholder="Optional cabin and service description..." />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #e8edf2', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.4rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? <><Spinner /> Saving...</> : <><i className="bi bi-check-lg" /> {isEdit ? 'Save Changes' : 'Add Aircraft'}</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function AircraftDetailModal({ open, onClose, aircraft, onApprove, onReject, approveLoading }) {
  if (!aircraft) return null
  const fmt = v => v ? `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
  return (
    <Modal open={open} onClose={onClose} size="lg"
      title={<><i className="bi bi-airplane-fill" style={{ color: '#c8a245' }} /> {aircraft.name} ({aircraft.registration_number})</>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          {aircraft.image_url && (
            <img src={aircraft.image_url} alt={aircraft.name} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', objectFit: 'cover', height: 160 }} />
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <Badge status={aircraft.status} label={STATUSES.find(s => s.value === aircraft.status)?.label || aircraft.status} />
            <ApprovalBadge approved={aircraft.is_approved} />
          </div>
          {[
            ['Operator', aircraft.operator_name || `ID: ${aircraft.operator}`],
            ['Category', CATEGORIES.find(c => c.value === aircraft.category)?.label || aircraft.category],
            ['Registration', aircraft.registration_number],
            ['Year', aircraft.year_of_manufacture || '—'],
            ['Base Airport', aircraft.base_airport || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
              <span style={{ color: '#6b7c93', fontWeight: 600 }}>{k}</span>
              <span style={{ color: '#1a2a3e' }}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7c93', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>Performance</div>
          {[
            ['Capacity', `${aircraft.passenger_capacity} pax`],
            ['Range', `${aircraft.range_km?.toLocaleString() || '—'} km`],
            ['Speed', aircraft.cruise_speed_kmh ? `${aircraft.cruise_speed_kmh} km/h` : '—'],
            ['Baggage', aircraft.max_baggage_kg ? `${aircraft.max_baggage_kg} kg` : '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
              <span style={{ color: '#6b7c93', fontWeight: 600 }}>{k}</span>
              <span style={{ color: '#1a2a3e' }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', height: 1, background: '#e8edf2' }} />
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7c93', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>Pricing</div>
          {[
            ['Hourly Rate', fmt(aircraft.hourly_rate_usd)],
            ['Client Rate', fmt(aircraft.display_hourly_rate)],
            ['Min Hours', aircraft.min_hours || '1.0'],
            ['Positioning', fmt(aircraft.positioning_fee_usd)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
              <span style={{ color: '#6b7c93', fontWeight: 600 }}>{k}</span>
              <span style={{ color: '#1a2a3e', fontWeight: k === 'Client Rate' ? 600 : 400 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {aircraft.wifi_available && <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: '#f0fdf4', color: '#166534', borderRadius: '4px', border: '1px solid #bbf7d0' }}><i className="bi bi-wifi" /> Wi-Fi</span>}
            {aircraft.pets_allowed && <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', background: '#fef9c3', color: '#713f12', borderRadius: '4px', border: '1px solid #fde68a' }}><i className="bi bi-heart-fill" /> Pets</span>}
          </div>
        </div>
      </div>
      {!aircraft.is_approved && (
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.82rem', color: '#92400e', marginBottom: '0.75rem' }}>
            <i className="bi bi-hourglass-split" /> This aircraft is pending approval before it becomes publicly listed.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onApprove} disabled={approveLoading}
              style={{ padding: '0.5rem 1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: approveLoading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {approveLoading ? <><Spinner size={14} /> Approving...</> : <><i className="bi bi-patch-check-fill" /> Approve</>}
            </button>
            <button onClick={onReject} disabled={approveLoading}
              style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <i className="bi bi-x-circle" /> Reject
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ══ Main Page ════════════════════════════════════════════════════════════════
export default function AdminOperatorAircraftPage() {
  const [aircraft, setAircraft]     = useState([])
  const [operators, setOperators]   = useState([])
  const [catalog, setCatalog]       = useState([])
  const [airports, setAirports]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterOperator, setFilterOperator] = useState('')
  const [filterApproved, setFilterApproved] = useState('')

  const [modal, setModal]           = useState(null) // 'add' | 'edit' | 'detail' | 'catalog-add'
  const [editData, setEditData]     = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [approveLoading, setApproveLoading] = useState(false)
  const [actionMsg, setActionMsg]   = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [acRes, opRes, catRes, airRes] = await Promise.all([
        adminAPI.allOperatorAircraft({ 
          search, 
          status: filterStatus, 
          operator: filterOperator 
        }),
        adminAPI.operators({ status: 'active' }),
        catalogAPI.aircraft(),
        catalogAPI.airports(),
      ])
      
      let aircraftData = acRes?.data?.results || acRes?.data || []
      setAircraft(Array.isArray(aircraftData) ? aircraftData : [])
      
      let operatorsData = opRes?.data?.results || opRes?.data || []
      setOperators(Array.isArray(operatorsData) ? operatorsData : [])
      
      const airportsData = Array.isArray(airRes) ? airRes : (airRes?.results || airRes?.data || [])
      setAirports(airportsData)
      
      const catData = catRes?.data?.results || catRes?.data || catRes || []
      setCatalog(Array.isArray(catData) ? catData : [])
    } catch (e) {
      console.error('Error loading data:', e)
      setActionMsg('Failed to load data. Please refresh and try again.')
    } finally { 
      setLoading(false) 
    }
  }, [search, filterStatus, filterOperator])

  useEffect(() => { loadData() }, [loadData])

  const displayed = filterApproved === ''
    ? aircraft
    : filterApproved === 'yes'
      ? aircraft.filter(a => a.is_approved)
      : aircraft.filter(a => !a.is_approved)

  const openAdd  = () => { setEditData(null); setModal('add') }
  const openEdit = (ac) => { setEditData(ac); setModal('edit') }
  const openDetail = (ac) => { setDetailData(ac); setModal('detail') }

  const handleApprove = async () => {
    setApproveLoading(true)
    try {
      await adminAPI.approveOperatorAircraft(detailData.id)
      setActionMsg(`${detailData.name} approved successfully.`)
      setModal(null)
      loadData()
    } catch (e) { 
      console.error(e)
      setActionMsg(`Failed to approve ${detailData.name}. Please try again.`)
    }
    finally { setApproveLoading(false) }
  }

  const handleReject = async () => {
    setApproveLoading(true)
    try {
      await adminAPI.rejectOperatorAircraft(detailData.id)
      setActionMsg(`${detailData.name} rejected.`)
      setModal(null)
      loadData()
    } catch (e) { 
      console.error(e)
      setActionMsg(`Failed to reject ${detailData.name}. Please try again.`)
    }
    finally { setApproveLoading(false) }
  }

  const handleCatalogCreated = (newCat) => {
    setCatalog(prev => [...prev, newCat])
    setModal('add')
  }

  const handleRequestAddCatalog = () => {
    setModal('catalog-add')
  }

  const handleQuickApprove = async (ac) => {
    try { 
      await adminAPI.approveOperatorAircraft(ac.id)
      setActionMsg(`${ac.name} approved.`)
      loadData() 
    } catch (e) { 
      console.error(e)
      setActionMsg(`Failed to approve ${ac.name}. Please try again.`)
    }
  }

  const fmt = v => v ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'
  const pendingCount = aircraft.filter(a => !a.is_approved).length

  return (
    <div style={{ padding: '1.25rem', maxWidth: '1600px', margin: '0 auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0a2540', marginBottom: '0.2rem', letterSpacing: '-0.3px' }}>
            
            Operator Aircraft
          </h2>
          <p style={{ color: '#6b7c93', fontSize: '0.875rem' }}>
            Manage partner operator aircraft listings, approvals and catalog links
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {pendingCount > 0 && (
            <div style={{ padding: '0.4rem 0.85rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', fontSize: '0.78rem', color: '#92400e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="bi bi-hourglass-split" /> {pendingCount} pending approval
            </div>
          )}
          <button onClick={loadData} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#0a2540', border: '1.5px solid #0a2540', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
          <button onClick={openAdd} style={{ padding: '0.5rem 1.1rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-plus-lg" /> Add Aircraft
          </button>
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: actionMsg.includes('Failed') ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${actionMsg.includes('Failed') ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`, borderRadius: '6px', color: actionMsg.includes('Failed') ? '#dc2626' : '#166534', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className={`bi ${actionMsg.includes('Failed') ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`} /> {actionMsg}</span>
          <button onClick={() => setActionMsg('')} style={{ background: 'none', border: 'none', color: actionMsg.includes('Failed') ? '#dc2626' : '#166534', cursor: 'pointer' }}><i className="bi bi-x-lg" /></button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7c93', fontSize: '0.85rem' }} />
            <input style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
              placeholder="Search aircraft name, reg, model…"
              value={search} onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#0a2540'}
              onBlur={e => e.target.style.borderColor = '#e8edf2'} />
          </div>
        </div>
        <div>
          <select style={{ padding: '0.6rem 0.75rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', background: '#fff', outline: 'none', cursor: 'pointer' }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <select style={{ padding: '0.6rem 0.75rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', background: '#fff', outline: 'none', cursor: 'pointer' }}
            value={filterOperator} onChange={e => setFilterOperator(e.target.value)}>
            <option value="">All Operators</option>
            {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
          </select>
        </div>
        <div>
          <select style={{ padding: '0.6rem 0.75rem', border: '1.5px solid #e8edf2', borderRadius: '6px', fontSize: '0.875rem', background: '#fff', outline: 'none', cursor: 'pointer' }}
            value={filterApproved} onChange={e => setFilterApproved(e.target.value)}>
            <option value="">All Approvals</option>
            <option value="yes">Approved</option>
            <option value="no">Pending</option>
          </select>
        </div>
        {(search || filterStatus || filterOperator || filterApproved) && (
          <button style={{ padding: '0.6rem 0.75rem', background: 'transparent', border: 'none', color: '#6b7c93', fontSize: '0.8rem', cursor: 'pointer' }}
            onClick={() => { setSearch(''); setFilterStatus(''); setFilterOperator(''); setFilterApproved('') }}>
            <i className="bi bi-x-lg" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem' }}>
              <div style={{ width: 40, height: 40, margin: '0 auto 1rem', border: '3px solid #e8edf2', borderTopColor: '#0a2540', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#6b7c93' }}>Loading aircraft…</p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem' }}>
              <i className="bi bi-airplane" style={{ fontSize: '2.5rem', color: '#cbd5e1', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7c93', marginBottom: '1rem' }}>No aircraft found.</p>
              <button onClick={openAdd} style={{ padding: '0.5rem 1.1rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <i className="bi bi-plus-lg" /> Add First Aircraft
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8edf2', background: '#f8fafc' }}>
                  {['Aircraft', 'Operator', 'Category', 'Registration', 'Capacity', 'Hourly Rate', 'Status', 'Approval', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#0a2540', whiteSpace: 'nowrap', fontSize: '0.72rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(ac => (
                  <tr key={ac.id} style={{ borderBottom: '1px solid #e8edf2' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AircraftAvatar imageUrl={ac.image_url} name={ac.name} size={40} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0a2540' }}>{ac.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6b7c93' }}>{ac.model}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#2a3a4e', fontSize: '0.83rem' }}>{ac.operator_name || `ID: ${ac.operator}`}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: '#f0f4f8', color: '#334155', borderRadius: '4px' }}>
                        {CATEGORIES.find(c => c.value === ac.category)?.label || ac.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: '#334155' }}>{ac.registration_number}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#2a3a4e', textAlign: 'center' }}>{ac.passenger_capacity} pax</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0a2540' }}>{fmt(ac.hourly_rate_usd)}/hr</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Badge status={ac.status} label={STATUSES.find(s => s.value === ac.status)?.label || ac.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <ApprovalBadge approved={ac.is_approved} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button title="View details" onClick={() => openDetail(ac)}
                          style={{ padding: '0.3rem 0.55rem', background: 'transparent', color: '#0a2540', border: '1px solid #e8edf2', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}>
                          <i className="bi bi-eye" />
                        </button>
                        <button title="Edit" onClick={() => openEdit(ac)}
                          style={{ padding: '0.3rem 0.55rem', background: '#0a2540', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}>
                          <i className="bi bi-pencil-square" />
                        </button>
                        {!ac.is_approved && (
                          <button title="Quick approve" onClick={() => handleQuickApprove(ac)} 
                            style={{ padding: '0.3rem 0.55rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}>
                            <i className="bi bi-patch-check-fill" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {!loading && displayed.length > 0 && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#6b7c93', textAlign: 'center' }}>
          Showing {displayed.length} aircraft · {aircraft.filter(a => a.is_approved).length} approved · {pendingCount} pending
        </div>
      )}

      {/* Modals */}
      <CatalogAddModal
        open={modal === 'catalog-add'}
        onClose={() => setModal('add')}
        onCreated={handleCatalogCreated}
      />

      <AircraftFormModal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        onSaved={() => { loadData(); setActionMsg(editData ? 'Aircraft updated.' : 'Aircraft added — pending approval.') }}
        operators={operators}
        catalogAircraft={catalog}
        airports={airports}
        editData={modal === 'edit' ? editData : null}
        onRequestAddCatalog={handleRequestAddCatalog}
      />

      <AircraftDetailModal
        open={modal === 'detail'}
        onClose={() => setModal(null)}
        aircraft={detailData}
        onApprove={handleApprove}
        onReject={handleReject}
        approveLoading={approveLoading}
      />
    </div>
  )
}