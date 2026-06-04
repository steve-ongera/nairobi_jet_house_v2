// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR RFQ PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

const STATUS_COLORS = {
  submitted: '#f59e0b',
  shortlisted: '#0f2d5e',
  accepted: '#22c55e',
  rejected: '#ef4444',
  expired: '#64748b'
}

const STATUS_LABELS = {
  submitted: 'Submitted',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired'
}

function Badge({ status }) {
  const color = STATUS_COLORS[status] || '#64748b'
  const label = STATUS_LABELS[status] || status?.replace(/_/g, ' ') || '—'
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

function Modal({ open, onClose, title, children }) {
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
        maxWidth: '600px',
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

export default function OperatorRFQPage() {
  const [bids, setBids] = useState([])
  const [myAircraft, setMyAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBid, setActiveBid] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const [bidForm, setBidForm] = useState({
    operator_price_usd: '',
    estimated_hours: '',
    positioning_cost: 0,
    catering_cost: 0,
    overnight_cost: 0,
    notes: '',
    aircraft: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bidsRes, aircraftRes] = await Promise.all([
        operatorAPI.rfqBids(),
        operatorAPI.myAircraft({ status: 'available', is_approved: true }),
      ])
      
      const bidsData = bidsRes?.data?.results || bidsRes?.data || bidsRes || []
      const aircraftData = aircraftRes?.data?.results || aircraftRes?.data || aircraftRes || []
      
      setBids(bidsData)
      setMyAircraft(aircraftData)
    } catch (err) {
      console.error('Failed to load RFQ data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openBid = (bid) => {
    setActiveBid(bid)
    setBidForm({
      operator_price_usd: bid.operator_price_usd || '',
      estimated_hours: bid.estimated_hours || '',
      positioning_cost: bid.positioning_cost || 0,
      catering_cost: bid.catering_cost || 0,
      overnight_cost: bid.overnight_cost || 0,
      notes: bid.notes || '',
      aircraft: myAircraft[0]?.id || '',
    })
    setMessage({ text: '', type: '' })
  }

  const handleSubmitBid = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ text: '', type: '' })
    try {
      await operatorAPI.submitBid({
        ...bidForm,
        booking: activeBid.booking,
        operator: activeBid.operator_id,
      })
      setMessage({ text: 'Bid submitted successfully!', type: 'success' })
      setActiveBid(null)
      await load()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      const data = err?.response?.data
      setMessage({ text: data?.detail || 'Failed to submit bid.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '—'
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

  const openBids = bids.filter(b => b.status === 'submitted')
  const pastBids = bids.filter(b => b.status !== 'submitted')

  const stats = {
    total: bids.length,
    open: openBids.length,
    shortlisted: bids.filter(b => b.status === 'shortlisted').length,
    accepted: bids.filter(b => b.status === 'accepted').length
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading RFQ bids...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>RFQ Bids</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>View Request For Quote invitations and submit competitive bids</p>
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

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-navy)' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Total RFQs</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#c9992e' }}>{stats.open}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Open to Bid</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f2d5e' }}>{stats.shortlisted}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Shortlisted</div>
        </div>
        <div style={{ padding: '1rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{stats.accepted}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-mid-gray)' }}>Accepted</div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem 1rem', 
          background: message.type === 'success' ? 'rgba(26,127,90,0.08)' : 'rgba(192,57,43,0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(26,127,90,0.25)' : 'rgba(192,57,43,0.25)'}`,
          borderRadius: '6px',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Open RFQs Section */}
      <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-bell" style={{ color: 'var(--color-gold)' }}></i> Open RFQs ({openBids.length})
          </h4>
        </div>
        <div>
          {openBids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="bi bi-check-circle" style={{ color: '#22c55e', fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
              <p style={{ color: 'var(--color-mid-gray)' }}>No open RFQs at the moment. Check back later!</p>
            </div>
          ) : (
            openBids.map(bid => (
              <div key={bid.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--color-light-gray)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem' }}>
                      Booking: {String(bid.booking).slice(0, 8).toUpperCase()}
                    </span>
                    <Badge status={bid.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
                    Your bid: {formatCurrency(bid.operator_price_usd)}
                    {bid.valid_until && ` · Valid until ${formatDate(bid.valid_until)}`}
                  </div>
                  {bid.route && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginTop: '0.25rem' }}>
                      <i className="bi bi-geo-alt"></i> {bid.route}
                    </div>
                  )}
                </div>
                <button onClick={() => openBid(bid)} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.9rem',
                  background: 'var(--color-navy)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  <i className="bi bi-send"></i> Submit Bid
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Previous Bids Section */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-clock-history" style={{ color: 'var(--color-gold)' }}></i> Previous Bids ({pastBids.length})
          </h4>
        </div>
        <div>
          {pastBids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="bi bi-inbox" style={{ fontSize: '2rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '0.5rem' }}></i>
              <p style={{ color: 'var(--color-mid-gray)' }}>No previous bids yet.</p>
            </div>
          ) : (
            pastBids.map(bid => (
              <div key={bid.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--color-light-gray)',
                flexWrap: 'wrap',
                gap: '1rem',
                opacity: 0.8
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem' }}>
                      Booking: {String(bid.booking).slice(0, 8).toUpperCase()}
                    </span>
                    <Badge status={bid.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
                    Your bid: {formatCurrency(bid.operator_price_usd)}
                    {bid.njh_client_price && (
                      <span style={{ marginLeft: '0.5rem' }}>
                        · Client price: {formatCurrency(bid.njh_client_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bid Modal */}
      <Modal open={activeBid !== null} onClose={() => setActiveBid(null)} title={<><i className="bi bi-send"></i> Submit Bid</>}>
        <form onSubmit={handleSubmitBid}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Assign Aircraft <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <select 
                value={bidForm.aircraft} 
                onChange={e => setBidForm(f => ({ ...f, aircraft: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              >
                <option value="">Select aircraft</option>
                {myAircraft.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Your Price (USD) <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input 
                type="number" 
                step="0.01"
                value={bidForm.operator_price_usd} 
                onChange={e => setBidForm(f => ({ ...f, operator_price_usd: e.target.value }))} 
                required 
                placeholder="25000"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Estimated Hours</label>
              <input 
                type="number" 
                step="0.1"
                value={bidForm.estimated_hours} 
                onChange={e => setBidForm(f => ({ ...f, estimated_hours: e.target.value }))} 
                placeholder="2.5"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Positioning Cost (USD)</label>
              <input 
                type="number" 
                step="0.01"
                value={bidForm.positioning_cost} 
                onChange={e => setBidForm(f => ({ ...f, positioning_cost: e.target.value }))} 
                placeholder="0"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Catering Cost (USD)</label>
              <input 
                type="number" 
                step="0.01"
                value={bidForm.catering_cost} 
                onChange={e => setBidForm(f => ({ ...f, catering_cost: e.target.value }))} 
                placeholder="0"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Overnight Cost (USD)</label>
              <input 
                type="number" 
                step="0.01"
                value={bidForm.overnight_cost} 
                onChange={e => setBidForm(f => ({ ...f, overnight_cost: e.target.value }))} 
                placeholder="0"
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Notes</label>
            <textarea 
              rows={3}
              value={bidForm.notes} 
              onChange={e => setBidForm(f => ({ ...f, notes: e.target.value }))} 
              placeholder="Any notes for the NJH team..."
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={() => setActiveBid(null)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.2rem', background: 'var(--color-navy)', color: 'var(--color-white)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {submitting ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Submitting…</>
              ) : (
                <><i className="bi bi-check-lg"></i> Submit Bid</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}