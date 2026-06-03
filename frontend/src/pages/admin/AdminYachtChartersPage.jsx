// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN YACHT CHARTERS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'active', 'completed', 'cancelled']
const STATUS_COLOR = {
  inquiry: '#f59e0b',
  rfq_sent: '#0f2d5e',
  quoted: '#0f2d5e',
  confirmed: '#22c55e',
  active: '#22c55e',
  completed: '#64748b',
  cancelled: '#ef4444'
}

const STATUS_LABEL = {
  inquiry: 'Inquiry',
  rfq_sent: 'RFQ Sent',
  quoted: 'Quoted',
  confirmed: 'Confirmed',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

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

function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  
  const width = size === 'lg' ? '640px' : size === 'md' ? '520px' : '360px'
  
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
        borderRadius: '12px',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
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

export default function AdminYachtChartersPage() {
  const [charters, setCharters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [priceForm, setPriceForm] = useState({ 
    quoted_price_usd: '', 
    operator_cost_usd: '', 
    status: 'quoted', 
    send_email: true, 
    email_message: '' 
  })
  const [saving, setSaving] = useState(false)
  const [priceErr, setPriceErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const response = await adminAPI.charters(params)
      const data = response?.data || response
      setCharters(data.results || data || [])
    } catch (err) {
      console.error('Failed to load charters:', err)
      setCharters([])
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  const openPrice = (c) => {
    setSelected(c)
    setPriceForm({
      quoted_price_usd: c.quoted_price_usd || '',
      operator_cost_usd: c.operator_cost_usd || '',
      status: c.status || 'quoted',
      send_email: true,
      email_message: ''
    })
    setPriceErr('')
    setModal(true)
  }

  const openDetail = (c) => {
    setSelected(c)
    setDetailModal(true)
  }

  const submitPrice = async (e) => {
    e.preventDefault()
    setSaving(true)
    setPriceErr('')
    try {
      await adminAPI.setCharterPrice(selected.id, priceForm)
      await load()
      setModal(false)
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.detail || data?.message || 'Failed to update price'
      setPriceErr(msg)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateDuration = (start, end) => {
    if (!start || !end) return null
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays === 1 ? '1 day' : `${diffDays} days`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Yacht Charters</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage all yacht charter requests and bookings</p>
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }}></i>
            <input 
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s ease' }}
              placeholder="Guest name, email, reference…" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
        </div>
        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Status</label>
          <select 
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            value={status} 
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
        {(search || status) && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>&nbsp;</label>
            <button 
              style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: 'var(--color-mid-gray)', fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => { setSearch(''); setStatus('') }}
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
              <p style={{ color: 'var(--color-mid-gray)' }}>Loading charters...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : charters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-water" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No charters found.</p>
              {(search || status) && (
                <button 
                  style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--color-navy)', border: '1.5px solid var(--color-navy)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                  onClick={() => { setSearch(''); setStatus('') }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-light-gray)', background: 'var(--color-off-white)' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Reference</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Guest</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Charter Period</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Yacht / Port</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Guests</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Cabins</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Quoted</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {charters.map(c => {
                  const duration = calculateDuration(c.charter_start, c.charter_end)
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                        {String(c.reference || c.id).slice(0, 8)}…
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', background: 'var(--color-off-white)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>
                            {c.guest_name?.[0]?.toUpperCase() || 'G'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{c.guest_name || '—'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{c.guest_email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem' }}>
                        <div style={{ color: 'var(--color-dark-gray)' }}>
                          {formatDate(c.charter_start)} → {formatDate(c.charter_end)}
                        </div>
                        {duration && (
                          <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                            <i className="bi bi-calendar-week"></i> {duration}
                          </div>
                        )}
                       </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{c.yacht_name || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                          <i className="bi bi-geo-alt" style={{ fontSize: '0.6rem' }}></i> {c.departure_port || '—'}
                        </div>
                       </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{c.guest_count || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>{c.cabin_count || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>
                        {formatCurrency(c.quoted_price_usd)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <Badge status={c.status} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            style={{ padding: '0.3rem 0.6rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                            onClick={() => openPrice(c)} 
                            title="Set price"
                          >
                            <i className="bi bi-currency-dollar"></i>
                          </button>
                          <button 
                            style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                            onClick={() => openDetail(c)} 
                            title="View details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && charters.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)', textAlign: 'center' }}>
          Showing {charters.length} charter{charters.length !== 1 ? 's' : ''}
          {(search || status) && ' with current filters'}
        </div>
      )}

      {/* Price Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={<><i className="bi bi-currency-dollar"></i> Set Price — {selected?.guest_name}</>} size="md">
        <form onSubmit={submitPrice}>
          {priceErr && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{priceErr}</span>
            </div>
          )}
          
          {/* Charter info summary */}
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(15,92,164,0.08)', border: '1px solid rgba(15,92,164,0.22)', borderRadius: '6px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <i className="bi bi-info-circle" style={{ color: 'var(--color-info)', marginTop: '0.15rem' }}></i>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-info)' }}>
              <strong>{selected?.yacht_name || 'Yacht Charter'}</strong><br />
              {formatDate(selected?.charter_start)} → {formatDate(selected?.charter_end)}<br />
              <strong>Port:</strong> {selected?.departure_port || '—'} &nbsp;|&nbsp;
              <strong>Guests:</strong> {selected?.guest_count || '—'} &nbsp;|&nbsp;
              <strong>Cabins:</strong> {selected?.cabin_count || '—'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Client Price (USD) <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input 
                type="number" 
                step="0.01" 
                value={priceForm.quoted_price_usd} 
                onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd: e.target.value }))} 
                placeholder="e.g., 50000.00"
                required 
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
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
                onChange={e => setPriceForm(f => ({ ...f, operator_cost_usd: e.target.value }))} 
                placeholder="e.g., 40000.00"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem', display: 'block' }}>Internal cost for reporting</span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Update Status</label>
              <select 
                value={priceForm.status} 
                onChange={e => setPriceForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s] || s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Email Message to Client</label>
            <textarea 
              rows={3}
              value={priceForm.email_message} 
              onChange={e => setPriceForm(f => ({ ...f, email_message: e.target.value }))} 
              placeholder="Optional: Add a personal message to the client..."
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem', display: 'block' }}>This will be included in the quote email</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input 
              type="checkbox" 
              id="send_email_charter" 
              checked={priceForm.send_email} 
              onChange={e => setPriceForm(f => ({ ...f, send_email: e.target.checked }))} 
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="send_email_charter" style={{ fontSize: '0.84rem', color: 'var(--color-dark-gray)', cursor: 'pointer' }}>
              Send quote email to client
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModal(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {saving ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</>
              ) : (
                <><i className="bi bi-check-lg"></i> Save Quote</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title={<><i className="bi bi-water"></i> Charter Details</>} size="lg">
        {selected && (
          <div>
            {/* Yacht Info Section */}
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--color-off-white)', borderRadius: '8px' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '0.15rem' }}>{selected.yacht_name || 'Yacht Charter'}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>Charter booking reference: {selected.reference || selected.id}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-calendar-event" style={{ color: 'var(--color-gold)' }}></i>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>Charter Period</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>
                      {formatDate(selected.charter_start)} → {formatDate(selected.charter_end)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-people" style={{ color: 'var(--color-gold)' }}></i>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>Guests</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>{selected.guest_count || '—'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-door-closed" style={{ color: 'var(--color-gold)' }}></i>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>Cabins</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>{selected.cabin_count || '—'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-geo-alt" style={{ color: 'var(--color-gold)' }}></i>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)' }}>Departure Port</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-navy)' }}>{selected.departure_port || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Info Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Guest Name</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.guest_name || '—'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Email</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.guest_email || '—'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Phone</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.guest_phone || '—'}</div>
            </div>
            
            {/* Pricing Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Quoted Price</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{formatCurrency(selected.quoted_price_usd)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Operator Cost</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{formatCurrency(selected.operator_cost_usd)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Commission</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.commission_pct ? `${selected.commission_pct}%` : '—'}</div>
            </div>
            
            {/* Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Status</div>
              <div><Badge status={selected.status} /></div>
            </div>

            {/* Special Requests */}
            {selected.special_requests && (
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Special Requests</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selected.special_requests}</div>
              </div>
            )}

            {/* Timestamps */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Created</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selected.created_at).toLocaleString()}</div>
            </div>
            {selected.updated_at && (
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Last Updated</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selected.updated_at).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}