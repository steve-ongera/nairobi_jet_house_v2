// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER FLEET PAGE - Clean & Simple
// ═══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { catalogAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'

export default function MemberFleetPage() {
  const navigate = useNavigate()
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
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '8px' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid var(--color-light-gray)', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--color-mid-gray)' }}>Loading fleet...</p>
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
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>Browse Fleet</h2>
          <p style={{ color: 'var(--color-mid-gray)', fontSize: '0.875rem' }}>Explore our curated selection of private aircraft</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mid-gray)', fontSize: '0.9rem' }}></i>
            <input 
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s ease' }}
              placeholder="Search by name or model..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
            />
          </div>
        </div>
        <div style={{ minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-mid-gray)', marginBottom: '0.25rem' }}>Category</label>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid var(--color-light-gray)', borderRadius: '6px', fontSize: '0.875rem', background: 'var(--color-white)', cursor: 'pointer', outline: 'none' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-navy)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-light-gray)'}
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fleet Grid */}
      {filteredAircraft.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-white)', border: '1px solid var(--color-light-gray)', borderRadius: '10px' }}>
          <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--color-light-gray)', display: 'block', marginBottom: '1rem' }}></i>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>No Aircraft Found</h3>
          <p style={{ color: 'var(--color-mid-gray)' }}>Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredAircraft.map(ac => (
            <div 
              key={ac.id} 
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-light-gray)',
                borderRadius: '10px',
                overflow: 'hidden',
                transition: 'all var(--transition-base)'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{
                height: '160px',
                background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-airplane-fill" style={{ fontSize: '3rem', color: 'var(--color-gold)' }}></i>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '0.2rem' }}>{ac.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)', marginBottom: '0.5rem' }}>{ac.model}</div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-dark-gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="bi bi-people" style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}></i> {ac.passenger_capacity} pax
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-dark-gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="bi bi-arrow-left-right" style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}></i> {ac.range_km?.toLocaleString()} km
                  </span>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)' }}>{formatCurrency(ac.hourly_rate_usd)}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-mid-gray)' }}>/hour</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {ac.wifi_available && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <i className="bi bi-wifi" style={{ fontSize: '0.65rem', color: 'var(--color-gold)' }}></i> WiFi
                    </span>
                  )}
                  {ac.pets_allowed && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-mid-gray)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <i className="bi bi-pet" style={{ fontSize: '0.65rem', color: 'var(--color-gold)' }}></i> Pets
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => navigate('/member/book')}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    background: 'var(--color-navy)',
                    color: 'var(--color-white)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-navy-mid)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-navy)'}
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