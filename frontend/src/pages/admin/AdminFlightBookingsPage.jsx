import { useState, useEffect, useCallback } from 'react'
import { adminAPI } from '../../services/api'

const STATUS_OPTIONS = ['inquiry', 'rfq_sent', 'quoted', 'confirmed', 'in_flight', 'completed', 'cancelled']
const STATUS_COLOR = { 
  inquiry: '#f59e0b', 
  rfq_sent: '#0f2d5e', 
  quoted: '#0f2d5e', 
  confirmed: '#22c55e', 
  in_flight: '#22c55e', 
  completed: '#64748b', 
  cancelled: '#ef4444' 
}

const STATUS_LABEL = {
  inquiry: 'Inquiry',
  rfq_sent: 'RFQ Sent',
  quoted: 'Quoted',
  confirmed: 'Confirmed',
  in_flight: 'In Flight',
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

function Modal({ open, onClose, title, children, size = 'lg' }) {
  if (!open) return null
  
  const width = size === 'lg' ? '640px' : size === 'md' ? '480px' : '360px'
  
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

export default function AdminFlightBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)

  const [priceForm, setPriceForm] = useState({ 
    quoted_price_usd: '', 
    operator_cost_usd: '', 
    commission_pct: '15', 
    status: 'quoted', 
    send_email: true, 
    email_message: '' 
  })
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceErr, setPriceErr] = useState('')

  const [rfqIds, setRfqIds] = useState('')
  const [rfqLoading, setRfqLoading] = useState(false)
  const [rfqErr, setRfqErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (status) params.status = status
      const response = await adminAPI.bookings(params)
      const data = response?.data || response
      setBookings(data.results || data || [])
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setBookings([])
    } finally { 
      setLoading(false) 
    }
  }, [search, status])

  useEffect(() => { load() }, [load])

  const openPrice = (b) => {
    setSelected(b)
    setPriceForm({ 
      quoted_price_usd: b.quoted_price_usd || '', 
      operator_cost_usd: b.operator_cost_usd || '', 
      commission_pct: b.commission_pct || '15', 
      status: b.status, 
      send_email: true, 
      email_message: '' 
    })
    setPriceErr('')
    setModal('price')
  }

  const submitPrice = async (e) => {
    e.preventDefault()
    setPriceLoading(true)
    setPriceErr('')
    try {
      await adminAPI.setPrice(selected.id, priceForm)
      await load()
      setModal(null)
    } catch (err) { 
      const data = err?.response?.data
      const msg = data?.detail || data?.message || JSON.stringify(data) || 'Failed to update price'
      setPriceErr(msg)
    } finally { 
      setPriceLoading(false) 
    }
  }

  const openRFQ = (b) => {
    setSelected(b)
    setRfqIds('')
    setRfqErr('')
    setModal('rfq')
  }

  const submitRFQ = async (e) => {
    e.preventDefault()
    setRfqLoading(true)
    setRfqErr('')
    try {
      const ids = rfqIds.split(',').map(s => parseInt(s.trim())).filter(Boolean)
      if (ids.length === 0) {
        setRfqErr('Please enter at least one valid operator ID')
        return
      }
      await adminAPI.sendRFQ(selected.id, { operator_ids: ids })
      await load()
      setModal(null)
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.detail || data?.message || 'Failed to send RFQ'
      setRfqErr(msg)
    } finally { 
      setRfqLoading(false) 
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '—'
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Flight Bookings</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Manage all flight booking requests and RFQs</p>
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
          <i className="bi bi-arrow-clockwise" /> Refresh
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
              placeholder="Name, email, reference…" 
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
              <p style={{ color: 'var(--color-mid-gray)' }}>Loading bookings...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1rem' }}>No bookings found.</p>
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
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Route</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-navy)' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Pax</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>Quoted</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-navy)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-light-gray)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                      {String(b.reference || b.id).slice(0, 8)}…
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-navy)' }}>{b.guest_name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{b.guest_email || '—'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-navy)' }}>
                        {b.origin_detail?.code || b.origin || '—'} → {b.destination_detail?.code || b.destination || '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>
                        {b.origin_detail?.city || ''} {b.destination_detail?.city ? `→ ${b.destination_detail.city}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--color-dark-gray)' }}>
                      {b.departure_date || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--color-dark-gray)' }}>
                      {b.passenger_count || 1}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--color-navy)' }}>
                      {formatCurrency(b.quoted_price_usd)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <Badge status={b.status} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openPrice(b)} 
                          title="Set price"
                        >
                          <i className="bi bi-currency-dollar"></i>
                        </button>
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => openRFQ(b)} 
                          title="Send RFQ"
                        >
                          <i className="bi bi-send"></i>
                        </button>
                        <button 
                          style={{ padding: '0.3rem 0.6rem', background: 'transparent', color: 'var(--color-mid-gray)', border: '1px solid var(--color-light-gray)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => { setSelected(b); setModal('detail') }} 
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
          Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          {(search || status) && ' with current filters'}
        </div>
      )}

      {/* Price Modal */}
      <Modal open={modal === 'price'} onClose={() => setModal(null)} title={<><i className="bi bi-currency-dollar"></i> Set Price — {selected?.guest_name}</>}>
        <form onSubmit={submitPrice}>
          {priceErr && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{priceErr}</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Client Price (USD) <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input 
                type="number" 
                step="0.01" 
                value={priceForm.quoted_price_usd} 
                onChange={e => setPriceForm(f => ({ ...f, quoted_price_usd: e.target.value }))} 
                placeholder="25000.00" 
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
                placeholder="20000.00" 
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
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
                onChange={e => setPriceForm(f => ({ ...f, commission_pct: e.target.value }))} 
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
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
              placeholder="Leave blank for auto-generated message…"
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem', display: 'block' }}>This will be included in the quote email to the client</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input 
              type="checkbox" 
              id="send_email" 
              checked={priceForm.send_email} 
              onChange={e => setPriceForm(f => ({ ...f, send_email: e.target.checked }))} 
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="send_email" style={{ fontSize: '0.84rem', color: 'var(--color-dark-gray)', cursor: 'pointer' }}>
              Send quote email to client
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={priceLoading} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {priceLoading ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Saving…</>
              ) : (
                <><i className="bi bi-check-lg"></i> Save Quote</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* RFQ Modal */}
      <Modal open={modal === 'rfq'} onClose={() => setModal(null)} title={<><i className="bi bi-send"></i> Send RFQ — {selected?.guest_name}</>}>
        <form onSubmit={submitRFQ}>
          {rfqErr && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{rfqErr}</span>
            </div>
          )}
          <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-dark-gray)' }}>
            Enter operator IDs (comma-separated) to dispatch this RFQ. Operators will receive an email with the route and passenger details and can submit bids via the operator portal.
          </p>
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(15,92,164,0.08)', border: '1px solid rgba(15,92,164,0.22)', borderRadius: '6px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <i className="bi bi-info-circle" style={{ color: 'var(--color-info)', marginTop: '0.15rem' }}></i>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-info)' }}>
              <strong>Route:</strong> {selected?.origin_detail?.code || selected?.origin} → {selected?.destination_detail?.code || selected?.destination}<br/>
              <strong>Date:</strong> {selected?.departure_date} &nbsp;|&nbsp;
              <strong>Pax:</strong> {selected?.passenger_count || 1}
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Operator IDs <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input 
              value={rfqIds} 
              onChange={e => setRfqIds(e.target.value)} 
              placeholder="e.g. 1, 3, 7" 
              required 
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem', display: 'block' }}>Comma-separated operator IDs from the Operators page.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setModal(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={rfqLoading} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {rfqLoading ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Sending…</>
              ) : (
                <><i className="bi bi-send"></i> Send RFQ</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title={<><i className="bi bi-airplane"></i> Booking Details</>} size="lg">
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Reference</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.reference || selected.id}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Guest</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.guest_name || '—'} — {selected.guest_email || '—'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Phone</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.guest_phone || '—'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Route</div>
              <div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selected.origin_detail?.code || selected.origin} → {selected.destination_detail?.code || selected.destination}</div>
                {selected.origin_detail?.city && <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>{selected.origin_detail.city} → {selected.destination_detail?.city}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Date & Time</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>
                {selected.departure_date || '—'}
                {selected.departure_time && ` at ${selected.departure_time}`}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Passengers</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.passenger_count || 1}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Trip Type</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.trip_type || 'one_way'} {selected.return_date ? `(Return: ${selected.return_date})` : ''}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Status</div>
              <div><Badge status={selected.status} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Pricing</div>
              <div>
                <div>Quoted: {formatCurrency(selected.quoted_price_usd)}</div>
                <div>Operator Cost: {formatCurrency(selected.operator_cost_usd)}</div>
                <div>Commission: {formatCurrency(selected.commission_usd)} ({selected.commission_pct}%)</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Extras</div>
              <div>
                <div>Catering: {selected.catering_requested ? 'Yes' : 'No'}</div>
                <div>Ground Transport: {selected.ground_transport_requested ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Special Requests</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{selected.special_requests || '—'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Submitted</div>
              <div style={{ color: 'var(--color-dark-gray)' }}>{new Date(selected.created_at).toLocaleString()}</div>
            </div>
            {selected.assigned_operator && (
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-light-gray)' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Assigned Operator</div>
                <div style={{ color: 'var(--color-dark-gray)' }}>{selected.assigned_operator}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}