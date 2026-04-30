// src/pages/public/TrackBookingPage.jsx
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import { bookingAPI, charterAPI } from '../../services/api'

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

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Track Your Booking | NairobiJetHouse',
  description: 'Track your flight booking or yacht charter status using your reference number or email address.',
}

function StatusBadge({ s }) {
  const c = STATUS_COLORS[s] || 'gray'
  return <span className={`badge badge-${c}`}>{s?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
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
    <>
      <Helmet>
        <title>Track Your Booking | NairobiJetHouse - Flight & Yacht Status</title>
        <meta name="description" content="Track your flight booking or yacht charter status. Enter your reference number or email address to get real-time updates on your booking." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/track" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">
            <i className="bi bi-search" /> Booking Tracker
          </div>
          <h1>Track Your <em style={{ color: 'var(--gold-light)' }}>Booking</em></h1>
          <p style={{ maxWidth: 480, marginTop: '0.5rem' }}>
            Enter your reference number or email address to check the status of any flight booking or yacht charter.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ background: 'var(--off-white)', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          
          {/* Mode Toggle */}
          <div className="tab-nav" style={{ marginBottom: '1.5rem', background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--r)', padding: '0.25rem' }}>
            {[['ref', 'Reference Number'], ['email', 'Email Address']].map(([m, label]) => (
              <button 
                key={m} 
                onClick={() => { setMode(m); setResults(null); setError('') }}
                className={`tab-btn ${mode === m ? 'active' : ''}`}
                style={{ 
                  flex: 1, 
                  textAlign: 'center',
                  borderBottom: mode === m ? '2px solid var(--gold)' : 'none',
                  marginBottom: 0,
                  padding: '0.6rem'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <form onSubmit={search}>
              {mode === 'ref' ? (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Booking Reference <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    value={ref} 
                    onChange={e => setRef(e.target.value)} 
                    placeholder="e.g., 3f8a1c2d-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                    required 
                    style={{ fontFamily: 'monospace', fontSize: '0.875rem' }} 
                  />
                  <span className="form-hint">
                    <i className="bi bi-info-circle"></i> The unique reference sent to your email when you submitted the booking.
                  </span>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Email Address <span className="req">*</span></label>
                  <input 
                    className="form-control" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="email@example.com" 
                    required 
                  />
                  <span className="form-hint">
                    <i className="bi bi-info-circle"></i> The email address you used when making the booking.
                  </span>
                </div>
              )}
              
              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  <i className="bi bi-exclamation-triangle" /> {error}
                </div>
              )}
              
              <button type="submit" className="btn btn-navy btn-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: 'white' }} /> Searching...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search" /> Find Booking
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          {results?.type === 'single' && <BookingCard item={results.item} />}
          {results?.type === 'list' && (
            <div>
              <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                <i className="bi bi-list-check"></i> Found {results.items.length} booking(s)
              </div>
              {results.items.map(item => <BookingCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </>
  )
}

function BookingCard({ item }) {
  const isYacht = !!item.charter_start
  
  return (
    <div className="detail-card" style={{ marginBottom: '1rem' }}>
      <div className="detail-card-header">
        <div>
          <div className="text-xs" style={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.25rem' }}>
            <i className={`bi ${isYacht ? 'bi-water' : 'bi-airplane'}`} style={{ marginRight: '0.35rem' }} />
            {isYacht ? 'Yacht Charter' : 'Flight Booking'}
          </div>
          <div className="detail-card-title" style={{ fontSize: '1rem' }}>
            {item.guest_name}
          </div>
        </div>
        <StatusBadge s={item.status} />
      </div>
      
      <div className="detail-card-body">
        {/* Flight Details */}
        {!isYacht && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '1rem',
            background: 'var(--gray-50)',
            borderRadius: 'var(--r)'
          }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)' }}>
                {item.origin_detail?.code || item.origin?.code || '—'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Departure</div>
            </div>
            <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '1.2rem' }} />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)' }}>
                {item.destination_detail?.code || item.destination?.code || '—'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Arrival</div>
            </div>
            <div style={{ textAlign: 'center', paddingLeft: '1rem', borderLeft: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>{item.departure_date}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Date</div>
            </div>
          </div>
        )}

        {/* Yacht Details */}
        {isYacht && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '1rem',
            background: 'var(--gray-50)',
            borderRadius: 'var(--r)'
          }}>
            <div style={{ flex: 1 }}>
              <i className="bi bi-geo-alt" style={{ color: 'var(--gold)', marginRight: 5 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>From: </span>
              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.departure_port}</span>
            </div>
            <div style={{ flex: 1 }}>
              <i className="bi bi-calendar" style={{ color: 'var(--gold)', marginRight: 5 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Start: </span>
              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.charter_start}</span>
            </div>
            <div style={{ flex: 1 }}>
              <i className="bi bi-calendar-check" style={{ color: 'var(--gold)', marginRight: 5 }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>End: </span>
              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.charter_end}</span>
            </div>
          </div>
        )}

        {/* Booking Details Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '0.75rem',
          marginTop: '0.5rem'
        }}>
          <div>
            <div className="text-xs" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
              Reference
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>
              {String(item.reference).slice(0, 8)}...
            </div>
          </div>
          
          <div>
            <div className="text-xs" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
              {isYacht ? 'Guests' : 'Passengers'}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>
              {item.passenger_count || item.guest_count}
            </div>
          </div>
          
          {item.quoted_price_usd && (
            <div>
              <div className="text-xs" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
                Quoted Price
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gold)' }}>
                ${Number(item.quoted_price_usd).toLocaleString()}
              </div>
            </div>
          )}
          
          {item.payment_status && (
            <div>
              <div className="text-xs" style={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--gray-400)' }}>
                Payment Status
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: item.payment_status === 'paid' ? 'var(--green)' : 'var(--amber)' }}>
                {item.payment_status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        {item.status === 'inquiry' && (
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            <i className="bi bi-clock-history"></i>
            <span>Our team is reviewing your request. You'll receive a quote within 2-4 hours.</span>
          </div>
        )}
        
        {item.status === 'quoted' && (
          <div className="alert alert-navy" style={{ marginTop: '1rem' }}>
            <i className="bi bi-envelope"></i>
            <span>A quote has been sent to your email. Please review and confirm to proceed with your booking.</span>
          </div>
        )}
        
        {item.status === 'confirmed' && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <i className="bi bi-check-circle"></i>
            <span>Your booking is confirmed! A confirmation has been sent to your email with all details.</span>
          </div>
        )}
      </div>
    </div>
  )
}