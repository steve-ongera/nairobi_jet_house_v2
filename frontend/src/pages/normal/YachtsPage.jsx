// src/pages/public/YachtsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { catalogAPI } from '../../services/api';

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'NairobiJetHouse Yacht Collection',
  description: 'Exclusive superyacht charters available across the Indian Ocean and Mediterranean.',
  numberOfItems: 'variable',
}

export default function YachtsPage() {
  const [yachts, setYachts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    
    catalogAPI.opYachts(params)
      .then(r => setYachts(r.data.results || r.data))
      .catch(() => setYachts([]))
      .finally(() => setLoading(false));
  }, [search, typeFilter]);

  // Get unique yacht types for filtering
  const yachtTypes = [...new Set(yachts.map(y => y.type_display).filter(Boolean))];

  return (
    <>
      <Helmet>
        <title>Yacht Collection | NairobiJetHouse - Superyacht Charters</title>
        <meta name="description" content="Browse our exclusive collection of superyachts available for charter across the Indian Ocean and Mediterranean. Luxury crewed vessels for unforgettable voyages." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/yachts" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="page-hero" style={{
        backgroundImage: 'linear-gradient(135deg, var(--navy-deep) 0%, var(--navy-mid) 100%)',
      }}>
        <div className="container">
          <div className="eyebrow">Yacht Collection</div>
          <h1>Set Sail on <em style={{ color: 'var(--gold-light)' }}>Luxury</em></h1>
          <p style={{ maxWidth: 560, marginTop: '0.5rem' }}>
            Exclusive charters across the Indian Ocean and Mediterranean. From intimate sailing yachts to majestic superyachts — your next voyage awaits.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          
          {/* Filters */}
          <div className="filter-bar" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
            <div className="search-wrap" style={{ width: '100%', maxWidth: '280px' }}>
              <i className="bi bi-search"></i>
              <input 
                className="form-control search-input" 
                placeholder="Search yachts..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            {yachtTypes.length > 0 && (
              <select 
                className="form-control" 
                style={{ width: 'auto', minWidth: '160px' }} 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {yachtTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div className="spinner-dark" style={{ margin: '0 auto' }}></div>
              <p style={{ color: 'var(--gray-400)', marginTop: '1rem' }}>Loading yacht collection...</p>
            </div>
          ) : yachts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <i className="bi bi-water" style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: '1rem', display: 'block' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>No yachts found</h3>
              <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
                No yachts match your search criteria. Try adjusting your filters.
              </p>
              {(search || typeFilter) && (
                <button 
                  onClick={() => { setSearch(''); setTypeFilter(''); }}
                  className="btn btn-outline-navy btn-sm"
                >
                  <i className="bi bi-arrow-counterclockwise" /> Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                  <i className="bi bi-water"></i> {yachts.length} luxury yachts available
                </div>
                {(search || typeFilter) && (
                  <button 
                    onClick={() => { setSearch(''); setTypeFilter(''); }}
                    className="btn btn-ghost btn-xs"
                  >
                    <i className="bi bi-x-circle" /> Clear filters
                  </button>
                )}
              </div>

              {/* Yachts Grid */}
              <div className="fleet-grid">
                {yachts.map(y => (
                  <div key={y.id} className="aircraft-card">
                    <div className="aircraft-img">
                      {y.image_url ? 
                        <img src={y.image_url} alt={y.name} /> : 
                        <i className="fas fa-ship"></i>
                      }
                      <div className="aircraft-category-pill">{y.type_display || 'Superyacht'}</div>
                    </div>
                    <div className="aircraft-body">
                      <div className="aircraft-name">{y.name}</div>
                      <div className="aircraft-model">{y.operator_name} · {y.home_port}</div>
                      <div className="aircraft-specs">
                        <div className="aircraft-spec">
                          <i className="bi bi-people"></i>
                          <span>{y.guest_capacity} guests</span>
                        </div>
                        <div className="aircraft-spec">
                          <i className="bi bi-rulers"></i>
                          <span>{y.length_meters}m length</span>
                        </div>
                        {y.crew_count > 0 && (
                          <div className="aircraft-spec">
                            <i className="bi bi-person-badge"></i>
                            <span>{y.crew_count} crew members</span>
                          </div>
                        )}
                        {y.cabins > 0 && (
                          <div className="aircraft-spec">
                            <i className="bi bi-door-closed"></i>
                            <span>{y.cabins} cabins</span>
                          </div>
                        )}
                      </div>
                      <div className="aircraft-price">
                        ${parseFloat(y.daily_rate_usd)?.toLocaleString()}
                        <small> / day</small>
                      </div>
                      <div className="card-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                        <Link to="/book-yacht" state={{ yacht: y }} className="btn btn-navy btn-sm">
                          <i className="bi bi-water"></i> Charter
                        </Link>
                        <Link to={`/yachts/${y.id}`} className="btn btn-outline-navy btn-sm">
                          <i className="bi bi-info-circle"></i> Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CTA Section */}
          <div className="card" style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)' }}>
            <i className="bi bi-water" style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '1rem', display: 'block' }} />
            <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Custom Yacht Charter Requests</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              Don't see the perfect vessel? Our team can source any yacht for your specific requirements worldwide.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-gold">
                <i className="bi bi-envelope"></i> Contact Our Yacht Specialists
              </Link>
              <Link to="/yacht-charter" className="btn btn-outline-gold" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
                <i className="bi bi-send"></i> Request a Charter Quote
              </Link>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />
    </>
  );
}