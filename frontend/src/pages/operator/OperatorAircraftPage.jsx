// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR AIRCRAFT PAGE — list, view modal, edit modal, image management
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

const STATUS_COLOR = {
  available: '#22c55e',
  pending: '#f59e0b',
  booked: '#0f2d5e',
  maintenance: '#ef4444',
  inactive: '#64748b'
}

const STATUS_LABEL = {
  available: 'Available',
  pending: 'Pending',
  booked: 'Booked',
  maintenance: 'Maintenance',
  inactive: 'Inactive'
}

const CATEGORIES = [
  { value: 'light', label: 'Light Jet' },
  { value: 'midsize', label: 'Midsize Jet' },
  { value: 'super_midsize', label: 'Super Midsize' },
  { value: 'heavy', label: 'Heavy Jet' },
  { value: 'ultra_long', label: 'Ultra Long Range' },
  { value: 'vip_airliner', label: 'VIP Airliner' },
  { value: 'turboprop', label: 'Turboprop' },
  { value: 'helicopter', label: 'Helicopter' }
]

// Fields the backend treats as read-only once an operator is editing
// (vs. creating) an aircraft.
const LOCKED_ON_EDIT = ['registration_number', 'hourly_rate_usd']

// Numeric fields that must never be sent as an empty string — DRF's
// IntegerField/DecimalField reject '' outright instead of treating it
// as "unset", which is what was causing the 400s.
const NUMERIC_FIELDS = [
  'passenger_capacity', 'range_km', 'cruise_speed_kmh', 'max_baggage_kg',
  'year_of_manufacture', 'hourly_rate_usd', 'min_hours',
  'positioning_fee_usd', 'overnight_fee_usd'
]

const emptyForm = {
  name: '',
  model: '',
  category: 'midsize',
  registration_number: '',
  passenger_capacity: '',
  range_km: '',
  cruise_speed_kmh: '',
  max_baggage_kg: '',
  year_of_manufacture: '',
  hourly_rate_usd: '',
  min_hours: '1.0',
  positioning_fee_usd: '0',
  overnight_fee_usd: '0',
  wifi_available: false,
  pets_allowed: false,
  smoking_allowed: false,
  description: '',
  image_url: '',
  images: [],
}

function isValidImageUrl(value) {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#64748b'
  const label = STATUS_LABEL[status] || status?.replace(/_/g, ' ') || '—'
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

function Modal({ open, onClose, title, children, maxWidth = '560px' }) {
  if (!open) return null

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
        maxWidth,
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
          borderBottom: '1px solid var(--color-light-gray)',
          flexShrink: 0
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

// A field rendered as plain text with a lock icon — for values the
// operator can see but never edit through this form.
function LockedField({ label, value, hint }) {
  return (
    <div>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: 'var(--color-mid-gray)',
        marginBottom: '0.25rem'
      }}>
        <i className="bi bi-lock-fill" style={{ fontSize: '0.7rem' }}></i>
        {label}
      </label>
      <div style={{
        width: '100%',
        padding: '0.6rem 0.75rem',
        border: '1px solid var(--color-light-gray)',
        borderRadius: '6px',
        fontSize: '0.875rem',
        background: 'var(--color-off-white)',
        color: 'var(--color-dark-gray)'
      }}>
        {value || '—'}
      </div>
      {hint && (
        <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

// Read-only detail row used inside the View modal.
function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-off-white)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--color-mid-gray)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: 'var(--color-navy)', fontWeight: 600, textAlign: 'right' }}>{value ?? '—'}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE MANAGER — add/remove image URLs, choose primary thumbnail.
//
// There is no file-upload endpoint on the backend today (OperatorAircraft.images
// is a JSONField of URL strings, and image_url is the single primary thumbnail).
// Until a real upload endpoint exists (e.g. POST /my-aircraft/{id}/upload-image/
// returning a hosted URL), this manages the URL list directly. Swap the
// "Add by URL" input for a file picker once that endpoint exists — the rest
// of this component (gallery, primary selection, removal) stays the same.
// ─────────────────────────────────────────────────────────────────────────────
function ImageManager({ images, primary, onChange }) {
  const [draftUrl, setDraftUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  const addImage = () => {
    const trimmed = draftUrl.trim()
    if (!trimmed) return
    if (!isValidImageUrl(trimmed)) {
      setUrlError('Enter a valid http(s) image URL.')
      return
    }
    if (images.includes(trimmed)) {
      setUrlError('That image is already in the gallery.')
      return
    }
    const nextImages = [...images, trimmed]
    const nextPrimary = primary || trimmed
    onChange(nextImages, nextPrimary)
    setDraftUrl('')
    setUrlError('')
  }

  const removeImage = (url) => {
    const nextImages = images.filter(i => i !== url)
    const nextPrimary = primary === url ? (nextImages[0] || '') : primary
    onChange(nextImages, nextPrimary)
  }

  const makePrimary = (url) => {
    onChange(images, url)
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
        Aircraft Images
      </label>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          value={draftUrl}
          onChange={e => { setDraftUrl(e.target.value); setUrlError('') }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
          placeholder="https://images.example.com/aircraft/photo.jpg"
          style={{
            flex: 1,
            padding: '0.6rem 0.75rem',
            border: `1px solid ${urlError ? 'var(--color-error)' : 'var(--color-light-gray)'}`,
            borderRadius: '6px',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button
          type="button"
          onClick={addImage}
          style={{
            padding: '0.6rem 1rem',
            background: 'var(--color-navy)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <i className="bi bi-plus-lg"></i> Add
        </button>
      </div>
      {urlError && <div style={{ fontSize: '0.72rem', color: 'var(--color-error)', marginBottom: '0.5rem' }}>{urlError}</div>}

      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginBottom: '0.75rem' }}>
        Paste a hosted image URL and click Add. Star an image to make it the primary thumbnail shown in search results.
      </div>

      {images.length === 0 ? (
        <div style={{
          padding: '1.5rem',
          textAlign: 'center',
          border: '1.5px dashed var(--color-light-gray)',
          borderRadius: '8px',
          color: 'var(--color-mid-gray)',
          fontSize: '0.8rem'
        }}>
          <i className="bi bi-images" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.4rem' }}></i>
          No images yet
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.6rem' }}>
          {images.map(url => (
            <div key={url} style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: url === primary ? '2px solid var(--color-gold)' : '1px solid var(--color-light-gray)',
              aspectRatio: '4 / 3',
              background: 'var(--color-off-white)'
            }}>
              <img
                src={url}
                alt="Aircraft"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
              />
              <div style={{
                display: 'none',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-mid-gray)',
                fontSize: '0.65rem',
                padding: '0.4rem',
                textAlign: 'center'
              }}>
                <i className="bi bi-exclamation-triangle" style={{ marginRight: '0.25rem' }}></i> Couldn't load
              </div>

              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                display: 'flex',
                gap: '4px'
              }}>
                <button
                  type="button"
                  title={url === primary ? 'Primary image' : 'Make primary'}
                  onClick={() => makePrimary(url)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    background: url === primary ? 'var(--color-gold)' : 'rgba(5,20,43,0.6)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem'
                  }}
                >
                  <i className={`bi bi-star${url === primary ? '-fill' : ''}`}></i>
                </button>
                <button
                  type="button"
                  title="Remove image"
                  onClick={() => removeImage(url)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'rgba(192,57,43,0.85)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem'
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>

              {url === primary && (
                <span style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '4px',
                  padding: '0.1rem 0.4rem',
                  background: 'var(--color-gold)',
                  color: 'var(--color-navy)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em'
                }}>
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OperatorAircraftPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })

  // Add-new form (inline panel, unchanged flow from before)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [addErrors, setAddErrors] = useState({})
  const [addError, setAddError] = useState('')
  const [submittingAdd, setSubmittingAdd] = useState(false)

  // View modal
  const [viewing, setViewing] = useState(null)

  // Edit modal
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editErrors, setEditErrors] = useState({})
  const [editError, setEditError] = useState('')
  const [submittingEdit, setSubmittingEdit] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await operatorAPI.myAircraft()
      const data = response?.data?.results || response?.data || response || []
      setAircraft(data)
    } catch (err) {
      console.error('Failed to load aircraft:', err)
      setAircraft([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const flash = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  // ── Numeric / payload helpers (shared by add + edit) ───────────────────────
  const stripEmptyNumerics = (obj) => {
    const out = { ...obj }
    NUMERIC_FIELDS.forEach(key => {
      if (out[key] === '') out[key] = null
    })
    return out
  }

  const mapServerErrors = (err, setErrorsFn, setErrorFn) => {
    const data = err?.response?.data
    if (data && typeof data === 'object' && !data.detail) {
      const flat = {}
      Object.entries(data).forEach(([key, val]) => {
        flat[key] = Array.isArray(val) ? val.join(' ') : String(val)
      })
      setErrorsFn(flat)
      setErrorFn('Please fix the highlighted fields.')
    } else {
      setErrorFn(data?.detail || data?.message || 'Something went wrong.')
    }
  }

  // ── ADD AIRCRAFT ────────────────────────────────────────────────────────────
  const resetAddForm = () => {
    setAddForm(emptyForm)
    setAddError('')
    setAddErrors({})
  }

  const setAddField = (key, value) => {
    setAddForm(f => ({ ...f, [key]: value }))
    if (addErrors[key]) setAddErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  const validateAdd = () => {
    const required = ['name', 'model', 'category', 'registration_number', 'passenger_capacity', 'range_km', 'hourly_rate_usd']
    const errs = {}
    required.forEach(key => {
      if (addForm[key] === '' || addForm[key] === null || addForm[key] === undefined) errs[key] = 'Required'
    })
    setAddErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!validateAdd()) {
      setAddError('Please fill in all required fields.')
      return
    }
    setSubmittingAdd(true)
    setAddError('')
    try {
      const payload = stripEmptyNumerics(addForm)
      await operatorAPI.createAircraft(payload)
      flash('Aircraft submitted for approval.', 'success')
      setShowAddForm(false)
      resetAddForm()
      await load()
    } catch (err) {
      mapServerErrors(err, setAddErrors, setAddError)
    } finally {
      setSubmittingAdd(false)
    }
  }

  // ── VIEW MODAL ──────────────────────────────────────────────────────────────
  const openView = (ac) => setViewing(ac)
  const closeView = () => setViewing(null)

  // ── EDIT MODAL ──────────────────────────────────────────────────────────────
  const openEdit = (ac) => {
    setEditing(ac)
    setEditForm({
      name: ac.name || '',
      model: ac.model || '',
      category: ac.category || 'midsize',
      registration_number: ac.registration_number || '',
      passenger_capacity: ac.passenger_capacity ?? '',
      range_km: ac.range_km ?? '',
      cruise_speed_kmh: ac.cruise_speed_kmh ?? '',
      max_baggage_kg: ac.max_baggage_kg ?? '',
      year_of_manufacture: ac.year_of_manufacture ?? '',
      hourly_rate_usd: ac.hourly_rate_usd ?? '',
      min_hours: ac.min_hours ?? '1.0',
      positioning_fee_usd: ac.positioning_fee_usd ?? '0',
      overnight_fee_usd: ac.overnight_fee_usd ?? '0',
      wifi_available: ac.wifi_available || false,
      pets_allowed: ac.pets_allowed || false,
      smoking_allowed: ac.smoking_allowed || false,
      description: ac.description || '',
      image_url: ac.image_url || '',
      images: Array.isArray(ac.images) ? ac.images : [],
    })
    setEditError('')
    setEditErrors({})
  }

  const closeEdit = () => {
    setEditing(null)
    setEditForm(emptyForm)
    setEditError('')
    setEditErrors({})
  }

  const setEditField = (key, value) => {
    setEditForm(f => ({ ...f, [key]: value }))
    if (editErrors[key]) setEditErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  const handleImagesChange = (nextImages, nextPrimary) => {
    setEditForm(f => ({ ...f, images: nextImages, image_url: nextPrimary }))
  }

  const validateEdit = () => {
    const required = ['name', 'model', 'category', 'passenger_capacity', 'range_km']
    const errs = {}
    required.forEach(key => {
      if (editForm[key] === '' || editForm[key] === null || editForm[key] === undefined) errs[key] = 'Required'
    })
    setEditErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!validateEdit()) {
      setEditError('Please fill in all required fields.')
      return
    }
    setSubmittingEdit(true)
    setEditError('')
    try {
      const payload = stripEmptyNumerics(editForm)
      // Defense in depth: never send the locked fields, even if state
      // somehow holds a value for them.
      LOCKED_ON_EDIT.forEach(key => delete payload[key])

      await operatorAPI.updateAircraft(editing.id, payload)
      flash('Aircraft updated successfully.', 'success')
      closeEdit()
      await load()
    } catch (err) {
      mapServerErrors(err, setEditErrors, setEditError)
    } finally {
      setSubmittingEdit(false)
    }
  }

  // ── Formatting helpers ───────────────────────────────────────────────────────
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '—'
    return Number(value).toLocaleString()
  }
  const formatBool = (value) => value ? 'Yes' : 'No'

  const handleNumberChange = (setter, key) => (e) => setter(key, e.target.value)

  const stats = {
    total: aircraft.length,
    available: aircraft.filter(a => a.status === 'available').length,
    pending: aircraft.filter(a => a.status === 'pending' || !a.is_approved).length,
    maintenance: aircraft.filter(a => a.status === 'maintenance').length
  }

  // ── Shared input style helper, parameterized by which error map to read ────
  const makeInputStyle = (errors) => (key) => ({
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: `1px solid ${errors[key] ? 'var(--color-error)' : 'var(--color-light-gray)'}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none'
  })
  const focusHandlers = (errors, key) => ({
    onFocus: e => { if (!errors[key]) e.currentTarget.style.borderColor = 'var(--color-navy)' },
    onBlur: e => { if (!errors[key]) e.currentTarget.style.borderColor = 'var(--color-light-gray)' }
  })

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading aircraft...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const addInputStyle = makeInputStyle(addErrors)
  const editInputStyle = makeInputStyle(editErrors)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>My Aircraft</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage your aircraft fleet for charter</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={load} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', background: 'transparent', color: 'var(--color-navy)',
            border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-navy)'; e.currentTarget.style.color = 'var(--color-white)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-navy)' }}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); if (!showAddForm) resetAddForm() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem', background: showAddForm ? '#ef4444' : 'var(--color-navy)',
              color: 'var(--color-white)', border: 'none', borderRadius: '6px',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <i className={`bi bi-${showAddForm ? 'x-lg' : 'plus-lg'}`}></i>
            {showAddForm ? 'Cancel' : 'Add Aircraft'}
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{
          marginBottom: '1rem', padding: '0.75rem 1rem',
          background: message.type === 'success' ? 'rgba(26,127,90,0.08)' : 'rgba(192,57,43,0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(26,127,90,0.25)' : 'rgba(192,57,43,0.25)'}`,
          borderRadius: '6px', color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total Aircraft</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.available}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Available</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Pending Approval</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ef4444' }}>{stats.maintenance}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Maintenance</div>
        </div>
      </div>

      {/* Add New Aircraft — inline panel */}
      {showAddForm && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-airplane"></i> Add New Aircraft
            </h4>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {addError && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle"></i>
                <span>{addError}</span>
              </div>
            )}
            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Aircraft Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input value={addForm.name} onChange={e => setAddField('name', e.target.value)} required placeholder="Gulfstream G650" style={addInputStyle('name')} {...focusHandlers(addErrors, 'name')} />
                  {addErrors.name && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{addErrors.name}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Model <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input value={addForm.model} onChange={e => setAddField('model', e.target.value)} required placeholder="G650" style={addInputStyle('model')} {...focusHandlers(addErrors, 'model')} />
                  {addErrors.model && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{addErrors.model}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Category</label>
                  <select value={addForm.category} onChange={e => setAddField('category', e.target.value)} style={{ ...addInputStyle('category'), background: 'var(--color-white)', cursor: 'pointer' }} {...focusHandlers(addErrors, 'category')}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Registration <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input value={addForm.registration_number} onChange={e => setAddField('registration_number', e.target.value)} required placeholder="5Y-ABC" style={addInputStyle('registration_number')} {...focusHandlers(addErrors, 'registration_number')} />
                  {addErrors.registration_number && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{addErrors.registration_number}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Passenger Capacity <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="number" min="1" value={addForm.passenger_capacity} onChange={handleNumberChange(setAddField, 'passenger_capacity')} required placeholder="14" style={addInputStyle('passenger_capacity')} {...focusHandlers(addErrors, 'passenger_capacity')} />
                  {addErrors.passenger_capacity && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{addErrors.passenger_capacity}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Range (km) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="number" min="0" value={addForm.range_km} onChange={handleNumberChange(setAddField, 'range_km')} required placeholder="7000" style={addInputStyle('range_km')} {...focusHandlers(addErrors, 'range_km')} />
                  {addErrors.range_km && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{addErrors.range_km}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Hourly Rate (USD) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input type="number" step="0.01" min="0" value={addForm.hourly_rate_usd} onChange={handleNumberChange(setAddField, 'hourly_rate_usd')} required placeholder="8500" style={addInputStyle('hourly_rate_usd')} {...focusHandlers(addErrors, 'hourly_rate_usd')} />
                  {addErrors.hourly_rate_usd && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{addErrors.hourly_rate_usd}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Year of Manufacture</label>
                  <input type="number" min="1950" max="2030" value={addForm.year_of_manufacture} onChange={handleNumberChange(setAddField, 'year_of_manufacture')} placeholder="2020" style={addInputStyle('year_of_manufacture')} {...focusHandlers(addErrors, 'year_of_manufacture')} />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Description</label>
                <textarea rows={3} value={addForm.description} onChange={e => setAddField('description', e.target.value)} placeholder="Aircraft features, amenities, and special considerations..." style={{ ...addInputStyle('description'), fontFamily: 'inherit', resize: 'vertical' }} {...focusHandlers(addErrors, 'description')} />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <ImageManager
                  images={addForm.images}
                  primary={addForm.image_url}
                  onChange={(imgs, primary) => setAddForm(f => ({ ...f, images: imgs, image_url: primary }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addForm.wifi_available} onChange={e => setAddField('wifi_available', e.target.checked)} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>WiFi Available</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addForm.pets_allowed} onChange={e => setAddField('pets_allowed', e.target.checked)} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>Pets Allowed</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={addForm.smoking_allowed} onChange={e => setAddField('smoking_allowed', e.target.checked)} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>Smoking Allowed</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submittingAdd} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  {submittingAdd ? (<><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Submitting…</>) : (<><i className="bi bi-check-lg"></i> Submit for Approval</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Aircraft List */}
      {aircraft.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Aircraft Listed</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>Click "Add Aircraft" to list your first aircraft for charter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {aircraft.map(ac => (
            <div key={ac.id} style={{
              background: 'var(--color-white)', border: '1px solid var(--color-light-gray)',
              borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '1rem', transition: 'all var(--transition-base)'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: '260px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden',
                  background: 'var(--color-off-white)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  {ac.image_url ? (
                    <img src={ac.image_url} alt={ac.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <i className="bi bi-airplane-fill" style={{ fontSize: '1.2rem', color: 'var(--color-gold)' }}></i>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.9rem' }}>{ac.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                    {ac.registration_number} · {ac.category_display || ac.category} · {ac.passenger_capacity} pax · {formatNumber(ac.range_km)} km
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {formatCurrency(ac.hourly_rate_usd)}/hr
                  </div>
                  {ac.maintenance_due && (
                    <span style={{
                      display: 'inline-flex', marginTop: '0.5rem', padding: '0.15rem 0.5rem',
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600
                    }}>
                      <i className="bi bi-tools"></i> Maintenance Due
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <Badge status={ac.status} />
                {!ac.is_approved && (
                  <span style={{
                    display: 'inline-flex', padding: '0.2rem 0.6rem', background: 'rgba(245,158,11,0.1)',
                    color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px',
                    fontSize: '0.7rem', fontWeight: 600
                  }}>Pending Approval</span>
                )}
                {ac.is_approved && (
                  <span style={{ fontSize: '0.7rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="bi bi-check-circle-fill"></i> Approved
                  </span>
                )}
                <button onClick={() => openView(ac)} title="View details" style={{
                  padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)',
                  border: '1px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer'
                }}>
                  <i className="bi bi-eye"></i>
                </button>
                <button onClick={() => openEdit(ac)} title="Edit aircraft" style={{
                  padding: '0.3rem 0.6rem', background: 'var(--color-navy)', color: 'var(--color-white)',
                  border: '1px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer'
                }}>
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      <div style={{
        marginTop: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(15,92,164,0.08)',
        border: '1px solid rgba(15,92,164,0.22)', borderRadius: '8px', display: 'flex',
        alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--color-info)'
      }}>
        <i className="bi bi-info-circle" style={{ fontSize: '1rem', color: 'var(--color-info)' }}></i>
        <div>
          <strong>Note:</strong> All newly listed aircraft require NJH admin approval before they appear publicly in search results and become available for charter.
        </div>
      </div>

      {/* ═══════════════════════ VIEW MODAL ═══════════════════════ */}
      <Modal open={!!viewing} onClose={closeView} title={<><i className="bi bi-airplane-fill" style={{ color: 'var(--color-gold)' }}></i> {viewing?.name}</>} maxWidth="640px">
        {viewing && (
          <div>
            {/* Gallery */}
            {(viewing.images?.length > 0 || viewing.image_url) ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {[viewing.image_url, ...(viewing.images || [])]
                  .filter(Boolean)
                  .filter((url, idx, arr) => arr.indexOf(url) === idx)
                  .map(url => (
                    <div key={url} style={{
                      aspectRatio: '4 / 3', borderRadius: '8px', overflow: 'hidden',
                      border: url === viewing.image_url ? '2px solid var(--color-gold)' : '1px solid var(--color-light-gray)',
                      background: 'var(--color-off-white)'
                    }}>
                      <img src={url} alt={viewing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{
                padding: '2rem', textAlign: 'center', background: 'var(--color-off-white)',
                borderRadius: '8px', color: 'var(--color-mid-gray)', fontSize: '0.8rem', marginBottom: '1.25rem'
              }}>
                <i className="bi bi-images" style={{ fontSize: '1.6rem', display: 'block', marginBottom: '0.4rem' }}></i>
                No images uploaded
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Badge status={viewing.status} />
              {viewing.is_approved ? (
                <span style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <i className="bi bi-check-circle-fill"></i> Approved
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <i className="bi bi-hourglass-split"></i> Pending Approval
                </span>
              )}
            </div>

            <DetailRow label="Registration" value={viewing.registration_number} />
            <DetailRow label="Model" value={viewing.model} />
            <DetailRow label="Category" value={viewing.category_display || viewing.category} />
            <DetailRow label="Passenger Capacity" value={`${formatNumber(viewing.passenger_capacity)} pax`} />
            <DetailRow label="Range" value={`${formatNumber(viewing.range_km)} km`} />
            <DetailRow label="Cruise Speed" value={viewing.cruise_speed_kmh ? `${formatNumber(viewing.cruise_speed_kmh)} km/h` : '—'} />
            <DetailRow label="Max Baggage" value={viewing.max_baggage_kg ? `${formatNumber(viewing.max_baggage_kg)} kg` : '—'} />
            <DetailRow label="Year of Manufacture" value={viewing.year_of_manufacture || '—'} />
            <DetailRow label="Your Hourly Rate" value={`${formatCurrency(viewing.hourly_rate_usd)}/hr`} />
            {viewing.display_hourly_rate && (
              <DetailRow label="Client-Facing Rate" value={`${formatCurrency(viewing.display_hourly_rate)}/hr`} />
            )}
            <DetailRow label="Minimum Hours" value={viewing.min_hours} />
            <DetailRow label="Positioning Fee" value={formatCurrency(viewing.positioning_fee_usd)} />
            <DetailRow label="Overnight Fee" value={formatCurrency(viewing.overnight_fee_usd)} />
            <DetailRow label="WiFi" value={formatBool(viewing.wifi_available)} />
            <DetailRow label="Pets Allowed" value={formatBool(viewing.pets_allowed)} />
            <DetailRow label="Smoking Allowed" value={formatBool(viewing.smoking_allowed)} />
            <DetailRow label="Hours Until Maintenance" value={viewing.hours_until_maintenance ?? '—'} />

            {viewing.description && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-mid-gray)', fontWeight: 600, marginBottom: '0.3rem' }}>Description</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)', lineHeight: 1.5 }}>{viewing.description}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={closeView} style={{ padding: '0.55rem 1.1rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Close</button>
              <button onClick={() => { closeView(); openEdit(viewing) }} style={{ padding: '0.55rem 1.1rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="bi bi-pencil"></i> Edit
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════ EDIT MODAL ═══════════════════════ */}
      <Modal open={!!editing} onClose={closeEdit} title={<><i className="bi bi-pencil-square"></i> Edit Aircraft</>} maxWidth="640px">
        {editing && (
          <form onSubmit={handleEditSubmit}>
            {editError && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-exclamation-triangle"></i>
                <span>{editError}</span>
              </div>
            )}

            <div style={{
              marginBottom: '1.25rem', padding: '0.6rem 0.9rem', background: 'rgba(15,92,164,0.06)',
              border: '1px solid rgba(15,92,164,0.18)', borderRadius: '6px', fontSize: '0.78rem',
              color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <i className="bi bi-shield-lock"></i>
              Registration number and hourly rate are locked once an aircraft is listed. Contact NJH support to change these.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Aircraft Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input value={editForm.name} onChange={e => setEditField('name', e.target.value)} required style={editInputStyle('name')} {...focusHandlers(editErrors, 'name')} />
                {editErrors.name && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{editErrors.name}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Model <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input value={editForm.model} onChange={e => setEditField('model', e.target.value)} required style={editInputStyle('model')} {...focusHandlers(editErrors, 'model')} />
                {editErrors.model && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{editErrors.model}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Category</label>
                <select value={editForm.category} onChange={e => setEditField('category', e.target.value)} style={{ ...editInputStyle('category'), background: 'var(--color-white)', cursor: 'pointer' }} {...focusHandlers(editErrors, 'category')}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <LockedField label="Registration" value={editForm.registration_number} />

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Passenger Capacity <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input type="number" min="1" value={editForm.passenger_capacity} onChange={handleNumberChange(setEditField, 'passenger_capacity')} required style={editInputStyle('passenger_capacity')} {...focusHandlers(editErrors, 'passenger_capacity')} />
                {editErrors.passenger_capacity && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{editErrors.passenger_capacity}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Range (km) <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input type="number" min="0" value={editForm.range_km} onChange={handleNumberChange(setEditField, 'range_km')} required style={editInputStyle('range_km')} {...focusHandlers(editErrors, 'range_km')} />
                {editErrors.range_km && <div style={{ fontSize: '0.7rem', color: 'var(--color-error)', marginTop: '0.2rem' }}>{editErrors.range_km}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Cruise Speed (km/h)</label>
                <input type="number" min="0" value={editForm.cruise_speed_kmh} onChange={handleNumberChange(setEditField, 'cruise_speed_kmh')} style={editInputStyle('cruise_speed_kmh')} {...focusHandlers(editErrors, 'cruise_speed_kmh')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Max Baggage (kg)</label>
                <input type="number" min="0" value={editForm.max_baggage_kg} onChange={handleNumberChange(setEditField, 'max_baggage_kg')} style={editInputStyle('max_baggage_kg')} {...focusHandlers(editErrors, 'max_baggage_kg')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Year of Manufacture</label>
                <input type="number" min="1950" max="2030" value={editForm.year_of_manufacture} onChange={handleNumberChange(setEditField, 'year_of_manufacture')} style={editInputStyle('year_of_manufacture')} {...focusHandlers(editErrors, 'year_of_manufacture')} />
              </div>

              <LockedField label="Hourly Rate (USD)" value={formatCurrency(editForm.hourly_rate_usd)} hint="Rate changes go through NJH commercial team." />

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Minimum Hours</label>
                <input type="number" step="0.5" min="0" value={editForm.min_hours} onChange={handleNumberChange(setEditField, 'min_hours')} style={editInputStyle('min_hours')} {...focusHandlers(editErrors, 'min_hours')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Positioning Fee (USD)</label>
                <input type="number" step="0.01" min="0" value={editForm.positioning_fee_usd} onChange={handleNumberChange(setEditField, 'positioning_fee_usd')} style={editInputStyle('positioning_fee_usd')} {...focusHandlers(editErrors, 'positioning_fee_usd')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Overnight Fee (USD)</label>
                <input type="number" step="0.01" min="0" value={editForm.overnight_fee_usd} onChange={handleNumberChange(setEditField, 'overnight_fee_usd')} style={editInputStyle('overnight_fee_usd')} {...focusHandlers(editErrors, 'overnight_fee_usd')} />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Description</label>
              <textarea rows={3} value={editForm.description} onChange={e => setEditField('description', e.target.value)} style={{ ...editInputStyle('description'), fontFamily: 'inherit', resize: 'vertical' }} {...focusHandlers(editErrors, 'description')} />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <ImageManager images={editForm.images} primary={editForm.image_url} onChange={handleImagesChange} />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '1.25rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editForm.wifi_available} onChange={e => setEditField('wifi_available', e.target.checked)} />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>WiFi Available</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editForm.pets_allowed} onChange={e => setEditField('pets_allowed', e.target.checked)} />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>Pets Allowed</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={editForm.smoking_allowed} onChange={e => setEditField('smoking_allowed', e.target.checked)} />
                <span style={{ fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>Smoking Allowed</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={closeEdit} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={submittingEdit} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {submittingEdit ? (<><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</>) : (<><i className="bi bi-check-lg"></i> Save Changes</>)}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}