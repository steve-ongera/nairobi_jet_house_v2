// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER BOOK PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI, catalogAPI } from '../../services/api'

export default function MemberBookPage() {
  const navigate = useNavigate()
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    passengers: 1,
    trip_type: 'one_way'
  })
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState([])
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSearch = async (e) => {
    e.preventDefault()
    setSearching(true)
    setMessage({ text: '', type: '' })
    try {
      const response = await catalogAPI.aircraft({ 
        origin: searchForm.origin,
        destination: searchForm.destination,
        date: searchForm.departure_date
      })
      const aircraft = response?.data?.results || response?.data || []
      setResults(aircraft)
      if (aircraft.length === 0) {
        setMessage({ text: 'No aircraft available for this route. Try different dates.', type: 'info' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to search. Please try again.', type: 'error' })
    } finally {
      setSearching(false)
    }
  }

  const formatCurrency = (value) => {
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Book a Flight</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Search and book private charter flights</p>
        </div>
      </div>

      {/* Search Form */}
      <div style={{ marginBottom: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-search" style={{ color: 'var(--color-gold)' }}></i> Search Flights
          </h4>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Origin <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input 
                  value={searchForm.origin} 
                  onChange={e => setSearchForm(f => ({ ...f, origin: e.target.value.toUpperCase() }))}
                  placeholder="Airport code or city"
                  required
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Destination <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input 
                  value={searchForm.destination} 
                  onChange={e => setSearchForm(f => ({ ...f, destination: e.target.value.toUpperCase() }))}
                  placeholder="Airport code or city"
                  required
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Departure Date <span style={{ color: 'var(--color-error)' }}>*</span></label>
                <input 
                  type="date" 
                  value={searchForm.departure_date} 
                  onChange={e => setSearchForm(f => ({ ...f, departure_date: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Return Date</label>
                <input 
                  type="date" 
                  value={searchForm.return_date} 
                  onChange={e => setSearchForm(f => ({ ...f, return_date: e.target.value }))}
                  disabled={searchForm.trip_type === 'one_way'}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', opacity: searchForm.trip_type === 'one_way' ? 0.6 : 1 }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Trip Type</label>
                <select 
                  value={searchForm.trip_type} 
                  onChange={e => setSearchForm(f => ({ ...f, trip_type: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                >
                  <option value="one_way">One Way</option>
                  <option value="round_trip">Round Trip</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Passengers</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={searchForm.passengers} 
                  onChange={e => setSearchForm(f => ({ ...f, passengers: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
                />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button type="submit" disabled={searching} style={{
                padding: '0.6rem 1.2rem',
                background: 'var(--color-navy)',
                color: 'var(--color-white)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {searching ? (
                  <><span style={{ width: '16px', height: '16px', border: '2px solid var(--color-white)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }}></span> Searching…</>
                ) : (
                  <><i className="bi bi-search"></i> Search Flights</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem 1rem', 
          background: message.type === 'error' ? 'rgba(192,57,43,0.08)' : 'rgba(15,92,164,0.08)',
          border: `1px solid ${message.type === 'error' ? 'rgba(192,57,43,0.25)' : 'rgba(15,92,164,0.22)'}`,
          borderRadius: '6px',
          color: message.type === 'error' ? 'var(--color-error)' : 'var(--color-info)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className={`bi bi-${message.type === 'error' ? 'exclamation-triangle' : 'info-circle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'var(--color-off-white)', borderBottom: '1px solid var(--color-light-gray)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-airplane" style={{ color: 'var(--color-gold)' }}></i> Available Aircraft ({results.length})
            </h4>
          </div>
          <div>
            {results.map(ac => (
              <div 
                key={ac.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--color-light-gray)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{ac.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>
                    {ac.category_display || ac.category} · {ac.passenger_capacity} pax · {ac.range_km?.toLocaleString()} km range
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {ac.wifi_available && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <i className="bi bi-wifi" style={{ fontSize: '0.65rem' }}></i> WiFi
                      </span>
                    )}
                    {ac.pets_allowed && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <i className="bi bi-pet" style={{ fontSize: '0.65rem' }}></i> Pets
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)' }}>{formatCurrency(ac.hourly_rate_usd)}<span style={{ fontSize: '0.7rem', fontWeight: 400 }}>/hr</span></div>
                  </div>
                  <button 
                    onClick={() => navigate('/member/checkout', { state: { aircraft: ac, search: searchForm } })}
                    style={{
                      padding: '0.4rem 0.9rem',
                      background: 'var(--color-navy)',
                      color: 'var(--color-white)',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}