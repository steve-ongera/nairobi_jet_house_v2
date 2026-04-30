// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER FLEET PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { catalogAPI } from '../../services/api'

export function MemberFleetPage() {
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadAircraft = async () => {
      setLoading(true)
      try {
        const response = await catalogAPI.aircraft({ status: 'available', is_approved: true })
        setAircraft(response?.data?.results || response?.data || [])
      } catch (err) {
        console.error('Failed to load fleet:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAircraft()
  }, [])

  const filteredAircraft = aircraft.filter(ac => {
    if (filter === 'light') return ac.category === 'light'
    if (filter === 'midsize') return ac.category === 'midsize'
    if (filter === 'heavy') return ac.category === 'heavy'
    if (search) {
      return ac.name.toLowerCase().includes(search.toLowerCase()) ||
             ac.model?.toLowerCase().includes(search.toLowerCase())
    }
    return true
  })

  const formatCurrency = (value) => {
    return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const categories = [
    { value: 'all', label: 'All Aircraft' },
    { value: 'light', label: 'Light Jets' },
    { value: 'midsize', label: 'Midsize Jets' },
    { value: 'heavy', label: 'Heavy Jets' },
  ]

  if (loading) {
    return (
      <div className="table-empty">
        <div className="spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p>Loading fleet...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Browse Fleet</h2>
          <p>Explore our curated selection of private aircraft</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input 
              className="form-control search-input" 
              placeholder="Search by name or model..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fleet Grid */}
      {filteredAircraft.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-airplane" />
          <h3>No Aircraft Found</h3>
          <p>Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="fleet-grid">
          {filteredAircraft.map(ac => (
            <div key={ac.id} className="fleet-card">
              <div className="fleet-card-image">
                <i className="bi bi-airplane-fill" />
              </div>
              <div className="fleet-card-body">
                <div className="fleet-card-name">{ac.name}</div>
                <div className="fleet-card-model">{ac.model}</div>
                <div className="fleet-card-specs">
                  <span><i className="bi bi-people" /> {ac.passenger_capacity} pax</span>
                  <span><i className="bi bi-speedometer" /> {ac.range_km?.toLocaleString()} km</span>
                </div>
                <div className="fleet-card-price">{formatCurrency(ac.hourly_rate_usd)}<span>/hour</span></div>
                <div className="fleet-card-amenities">
                  {ac.wifi_available && <span><i className="bi bi-wifi" /></span>}
                  {ac.pets_allowed && <span><i className="bi bi-pet" /></span>}
                </div>
                <button 
                  className="btn btn-navy btn-full btn-sm"
                  onClick={() => window.location.href = '/member/book'}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MemberFleetPage