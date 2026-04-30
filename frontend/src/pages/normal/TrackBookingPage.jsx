import { useState } from 'react'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import { bookingAPI, charterAPI } from '../../services/api'  // ← CHANGE THIS

const STATUS_COLORS = { 
  inquiry: 'amber', 
  rfq_sent: 'navy', 
  quoted: 'navy', 
  confirmed: 'green', 
  in_flight: 'green', 
  completed: 'gray', 
  cancelled: 'red', 
  active: 'green' 
}

function StatusBadge({ s }) {
  const c = STATUS_COLORS[s] || 'gray'
  return <span className={`badge badge-${c}`}>{s?.replace(/_/g,' ')}</span>
}

export default function TrackBookingPage() {
  const [mode, setMode] = useState('ref')   // ref | email
  const [ref, setRef] = useState('')
  const [email, setEmail] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      if (mode === 'ref') {
        const trimmed = ref.trim()
        let data = null
        
        // Try flight booking first
        try {
          const response = await bookingAPI.track(trimmed)
          data = response.data
        } catch {}
        
        // If not found, try yacht charter
        if (!data) {
          try {
            const response = await charterAPI.track(trimmed)
            data = response.data
          } catch {}
        }
        
        if (!data) throw new Error('No booking found with that reference.')
        setResults({ type: 'single', item: data })
      } else {
        // Use bookingAPI.byEmail instead of bookingsByEmail
        const response = await bookingAPI.byEmail(email.trim())
        const list = response.data?.results || response.data || []
        
        if (!list.length) throw new Error('No bookings found for that email address.')
        setResults({ type: 'list', items: list })
      }
    } catch (err) {
      setError(err?.message || err?.detail || 'No booking found.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PublicNavbar />
      <div className="page-header" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <span className="eyebrow"><i className="bi bi-search" /> Booking Tracker</span>
          <h1>Track Your <em>Booking</em></h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 480 }}>Enter your reference number or email address to check the status of any flight booking or yacht charter.</p>
        </div>
      </div>

      <section className="section" style={{ background: 'var(--off-white)', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', padding: '0.25rem' }}>
            {[['ref','Reference Number'],['email','Email Address']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setResults(null); setError('') }}
                style={{ flex: 1, padding: '0.6rem', borderRadius: 6, border: 'none', fontFamily: 'inherit', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', background: mode === m ? 'var(--navy)' : 'transparent', color: mode === m ? 'white' : 'var(--gray-500)', transition: 'var(--transition)' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', marginBottom: '2rem' }}>
            <form onSubmit={search}>
              {mode === 'ref' ? (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Booking Reference <span className="req">*</span></label>
                  <input className="form-control" value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. 3f8a1c2d-…" required style={{ fontFamily: 'monospace', fontSize: '0.875rem' }} />
                  <span className="form-hint">The UUID reference sent to your email when you submitted the booking.</span>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Email Address <span className="req">*</span></label>
                  <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
                  <span className="form-hint">The email address you used when making the booking.</span>
                </div>
              )}
              {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><i className="bi bi-exclamation-triangle" /><span>{error}</span></div>}
              <button type="submit" className="btn btn-navy btn-full" disabled={loading}>
                {loading ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Searching…</> : <><i className="bi bi-search" /> Find Booking</>}
              </button>
            </form>
          </div>

          {/* Results */}
          {results?.type === 'single' && <BookingCard item={results.item} />}
          {results?.type === 'list' && results.items.map(item => <BookingCard key={item.id} item={item} />)}
        </div>
      </section>
      <PublicFooter />
    </div>
  )
}

function BookingCard({ item }) {
  const isYacht = !!item.charter_start
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem', boxShadow: 'var(--shadow-xs)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.35rem' }}>
            {isYacht ? 'Yacht Charter' : 'Flight Booking'}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--navy)' }}>{item.guest_name}</div>
        </div>
        <StatusBadge s={item.status} />
      </div>

      {!isYacht && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--navy)' }}>
            {item.origin_detail?.code || item.origin?.code || '—'}
          </span>
          <i className="bi bi-arrow-right" style={{ color: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--navy)' }}>
            {item.destination_detail?.code || item.destination?.code || '—'}
          </span>
          <span style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>{item.departure_date}</span>
        </div>
      )}

      {isYacht && (
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          <i className="bi bi-geo-alt" style={{ color: 'var(--gold)', marginRight: 5 }} />
          {item.departure_port} — {item.charter_start} → {item.charter_end}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '0.85rem' }}>
        {[
          ['Reference', String(item.reference).slice(0,8) + '…'],
          ['Passengers', item.passenger_count || item.guest_count],
          item.quoted_price_usd ? ['Quoted Price', `$${Number(item.quoted_price_usd).toLocaleString()}`] : null,
          item.payment_status ? ['Payment', item.payment_status] : null,
        ].filter(Boolean).map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>{k}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}