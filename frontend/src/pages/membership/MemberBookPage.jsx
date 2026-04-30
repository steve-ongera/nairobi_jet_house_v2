// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER BOOK PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI, catalogAPI } from '../../services/api'

export function MemberBookPage() {
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
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Book a Flight</h2>
          <p>Search and book private charter flights</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
        <div className="settings-card-header">
          <h4><i className="bi bi-search" /> Search Flights</h4>
        </div>
        <div className="settings-card-body">
          <form onSubmit={handleSearch}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Origin <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  value={searchForm.origin} 
                  onChange={e => setSearchForm(f => ({ ...f, origin: e.target.value.toUpperCase() }))}
                  placeholder="Airport code or city"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Destination <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  value={searchForm.destination} 
                  onChange={e => setSearchForm(f => ({ ...f, destination: e.target.value.toUpperCase() }))}
                  placeholder="Airport code or city"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Departure Date <span className="req">*</span></label>
                <input 
                  className="form-control" 
                  type="date" 
                  value={searchForm.departure_date} 
                  onChange={e => setSearchForm(f => ({ ...f, departure_date: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Return Date</label>
                <input 
                  className="form-control" 
                  type="date" 
                  value={searchForm.return_date} 
                  onChange={e => setSearchForm(f => ({ ...f, return_date: e.target.value }))}
                  disabled={searchForm.trip_type === 'one_way'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Trip Type</label>
                <select 
                  className="form-control" 
                  value={searchForm.trip_type} 
                  onChange={e => setSearchForm(f => ({ ...f, trip_type: e.target.value }))}
                >
                  <option value="one_way">One Way</option>
                  <option value="round_trip">Round Trip</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Passengers</label>
                <input 
                  className="form-control" 
                  type="number" 
                  min="1" 
                  max="50"
                  value={searchForm.passengers} 
                  onChange={e => setSearchForm(f => ({ ...f, passengers: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-navy" disabled={searching}>
                {searching ? (
                  <><span className="spinner" /> Searching…</>
                ) : (
                  <><i className="bi bi-search" /> Search Flights</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'error' ? 'error' : 'info'}`} style={{ marginBottom: '1rem' }}>
          <i className={`bi bi-${message.type === 'error' ? 'exclamation-triangle' : 'info-circle'}`} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="settings-card">
          <div className="settings-card-header">
            <h4><i className="bi bi-airplane" /> Available Aircraft ({results.length})</h4>
          </div>
          <div className="settings-card-body" style={{ padding: 0 }}>
            {results.map(ac => (
              <div key={ac.id} className="aircraft-result-item">
                <div className="aircraft-result-info">
                  <div className="aircraft-result-name">{ac.name}</div>
                  <div className="aircraft-result-details">
                    {ac.category_display || ac.category} · {ac.passenger_capacity} pax · {ac.range_km?.toLocaleString()} km range
                  </div>
                  <div className="aircraft-result-amenities">
                    {ac.wifi_available && <span><i className="bi bi-wifi" /> WiFi</span>}
                    {ac.pets_allowed && <span><i className="bi bi-pet" /> Pets</span>}
                  </div>
                </div>
                <div className="aircraft-result-right">
                  <div className="aircraft-result-price">{formatCurrency(ac.hourly_rate_usd)}<span>/hr</span></div>
                  <button 
                    className="btn btn-navy btn-sm"
                    onClick={() => navigate('/member/checkout', { state: { aircraft: ac, search: searchForm } })}
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

export default MemberBookPage