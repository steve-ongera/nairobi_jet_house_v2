// ═══════════════════════════════════════════════════════════════════════════════
// OPERATOR RFQ PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { operatorAPI } from '../../services/api'

function Badge({ s }) {
  const STATUS_COLORS = {
    submitted: 'amber',
    shortlisted: 'navy',
    accepted: 'green',
    rejected: 'red',
    expired: 'gray'
  }
  const colorClass = STATUS_COLORS[s] || 'gray'
  const displayText = s?.replace(/_/g, ' ') || '—'
  return <span className={`badge badge-${colorClass}`}>{displayText}</span>
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function OperatorRFQPage() {
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
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading RFQ bids...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>RFQ Bids</h2>
          <p>View Request For Quote invitations and submit competitive bids</p>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-outline-navy btn-sm" onClick={load}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="operator-stats">
        <div className="operator-stat-card">
          <div className="operator-stat-number">{stats.total}</div>
          <div className="operator-stat-label">Total RFQs</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--gold)' }}>{stats.open}</div>
          <div className="operator-stat-label">Open to Bid</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--navy)' }}>{stats.shortlisted}</div>
          <div className="operator-stat-label">Shortlisted</div>
        </div>
        <div className="operator-stat-card">
          <div className="operator-stat-number" style={{ color: 'var(--green)' }}>{stats.accepted}</div>
          <div className="operator-stat-label">Accepted</div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Open RFQs Section */}
      <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
        <div className="settings-card-header">
          <h4><i className="bi bi-bell" /> Open RFQs ({openBids.length})</h4>
        </div>
        <div className="settings-card-body" style={{ padding: 0 }}>
          {openBids.length === 0 ? (
            <div className="table-empty" style={{ padding: '2rem' }}>
              <i className="bi bi-check-circle" style={{ color: 'var(--green)' }} />
              <p>No open RFQs at the moment. Check back later!</p>
            </div>
          ) : (
            openBids.map(bid => (
              <div key={bid.id} className="rfq-item">
                <div className="rfq-info">
                  <div className="rfq-booking">
                    Booking: {String(bid.booking).slice(0, 8).toUpperCase()}
                    <Badge s={bid.status} />
                  </div>
                  <div className="rfq-details">
                    Your bid: {formatCurrency(bid.operator_price_usd)}
                    {bid.valid_until && ` · Valid until ${formatDate(bid.valid_until)}`}
                  </div>
                  {bid.route && (
                    <div className="rfq-route">
                      <i className="bi bi-geo-alt" /> {bid.route}
                    </div>
                  )}
                </div>
                <button onClick={() => openBid(bid)} className="btn btn-navy btn-sm">
                  <i className="bi bi-send" /> Submit Bid
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Previous Bids Section */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h4><i className="bi bi-clock-history" /> Previous Bids ({pastBids.length})</h4>
        </div>
        <div className="settings-card-body" style={{ padding: 0 }}>
          {pastBids.length === 0 ? (
            <div className="table-empty" style={{ padding: '2rem' }}>
              <i className="bi bi-inbox" />
              <p>No previous bids yet.</p>
            </div>
          ) : (
            pastBids.map(bid => (
              <div key={bid.id} className="rfq-item past">
                <div className="rfq-info">
                  <div className="rfq-booking">
                    Booking: {String(bid.booking).slice(0, 8).toUpperCase()}
                    <Badge s={bid.status} />
                  </div>
                  <div className="rfq-details">
                    Your bid: {formatCurrency(bid.operator_price_usd)}
                    {bid.njh_client_price && (
                      <span className="client-price">
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
      <Modal open={activeBid !== null} onClose={() => setActiveBid(null)} title={<><i className="bi bi-send" /> Submit Bid</>}>
        <form onSubmit={handleSubmitBid}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Assign Aircraft <span className="req">*</span></label>
              <select 
                className="form-control" 
                value={bidForm.aircraft} 
                onChange={e => setBidForm(f => ({ ...f, aircraft: e.target.value }))}
                required
              >
                <option value="">Select aircraft</option>
                {myAircraft.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Your Price (USD) <span className="req">*</span></label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01"
                value={bidForm.operator_price_usd} 
                onChange={e => setBidForm(f => ({ ...f, operator_price_usd: e.target.value }))} 
                required 
                placeholder="25000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.1"
                value={bidForm.estimated_hours} 
                onChange={e => setBidForm(f => ({ ...f, estimated_hours: e.target.value }))} 
                placeholder="2.5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Positioning Cost (USD)</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01"
                value={bidForm.positioning_cost} 
                onChange={e => setBidForm(f => ({ ...f, positioning_cost: e.target.value }))} 
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Catering Cost (USD)</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01"
                value={bidForm.catering_cost} 
                onChange={e => setBidForm(f => ({ ...f, catering_cost: e.target.value }))} 
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Overnight Cost (USD)</label>
              <input 
                className="form-control" 
                type="number" 
                step="0.01"
                value={bidForm.overnight_cost} 
                onChange={e => setBidForm(f => ({ ...f, overnight_cost: e.target.value }))} 
                placeholder="0"
              />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Notes</label>
              <textarea 
                className="form-control" 
                rows={3}
                value={bidForm.notes} 
                onChange={e => setBidForm(f => ({ ...f, notes: e.target.value }))} 
                placeholder="Any notes for the NJH team..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setActiveBid(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={submitting}>
              {submitting ? (
                <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
              ) : (
                <><i className="bi bi-check-lg" /> Submit Bid</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default OperatorRFQPage