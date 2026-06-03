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
    setLoading(true);
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

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">Yacht Collection</span>
          <h1>Set Sail on <em style={{ color: 'var(--color-gold-light)' }}>Luxury</em></h1>
          <p>Exclusive charters across the Indian Ocean and Mediterranean. From intimate sailing yachts to majestic superyachts — your next voyage awaits.</p>
        </div>
      </div>

      {/* Main Content */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          
          {/* Filters */}
          <div className="yacht-filters">
            <div className="yacht-search">
              <i className="bi bi-search"></i>
              <input 
                className="form-input-gov" 
                placeholder="Search yachts..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            {yachtTypes.length > 0 && (
              <select 
                className="form-input-gov yacht-type-select" 
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
            <div className="loading-page">
              <div className="spinner-gov"></div>
              <p>Loading yacht collection...</p>
            </div>
          ) : yachts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <i className="bi bi-water"></i>
              </div>
              <h3>No yachts found</h3>
              <p>No yachts match your search criteria. Try adjusting your filters.</p>
              {(search || typeFilter) && (
                <button 
                  onClick={() => { setSearch(''); setTypeFilter(''); }}
                  className="btn-primary-gov btn-sm"
                >
                  <i className="bi bi-arrow-counterclockwise" /> Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="yacht-results-header">
                <div className="text-muted">
                  <i className="bi bi-water"></i> {yachts.length} luxury yachts available
                </div>
                {(search || typeFilter) && (
                  <button 
                    onClick={() => { setSearch(''); setTypeFilter(''); }}
                    className="btn-ghost btn-sm"
                  >
                    <i className="bi bi-x-circle" /> Clear filters
                  </button>
                )}
              </div>

              {/* Yachts Grid */}
              <div className="yacht-grid">
                {yachts.map(y => (
                  <div key={y.id} className="yacht-card">
                    <div className="yacht-card__image">
                      {y.image_url ? 
                        <img src={y.image_url} alt={y.name} /> : 
                        <div className="yacht-card__placeholder"><i className="bi bi-water"></i></div>
                      }
                      <span className="badge-gold yacht-card__badge">{y.type_display || 'Superyacht'}</span>
                    </div>
                    <div className="yacht-card__body">
                      <h3 className="yacht-card__title">{y.name}</h3>
                      <div className="yacht-card__operator">{y.operator_name}</div>
                      <div className="yacht-card__location">
                        <i className="bi bi-geo-alt"></i> {y.home_port || 'Worldwide'}
                      </div>
                      <div className="yacht-card__specs">
                        <div className="yacht-card__spec">
                          <i className="bi bi-people"></i>
                          <span>{y.guest_capacity} guests</span>
                        </div>
                        <div className="yacht-card__spec">
                          <i className="bi bi-rulers"></i>
                          <span>{y.length_meters}m</span>
                        </div>
                        {y.crew_count > 0 && (
                          <div className="yacht-card__spec">
                            <i className="bi bi-person-badge"></i>
                            <span>{y.crew_count} crew</span>
                          </div>
                        )}
                        {y.cabins > 0 && (
                          <div className="yacht-card__spec">
                            <i className="bi bi-door-closed"></i>
                            <span>{y.cabins} cabins</span>
                          </div>
                        )}
                      </div>
                      <div className="yacht-card__price">
                        ${parseFloat(y.daily_rate_usd)?.toLocaleString()}
                        <small> / day</small>
                      </div>
                      <div className="yacht-card__actions">
                        <Link to="/book-yacht" state={{ yacht: y }} className="btn-primary-gov btn-sm">
                          <i className="bi bi-water"></i> Charter
                        </Link>
                        <Link to={`/yachts/${y.id}`} className="btn-outline-gov btn-sm">
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
          <div className="yacht-cta">
            <i className="bi bi-water"></i>
            <h3>Custom Yacht Charter Requests</h3>
            <p>Don't see the perfect vessel? Our team can source any yacht for your specific requirements worldwide.</p>
            <div className="yacht-cta__actions">
              <Link to="/contact" className="btn-gold">
                <i className="bi bi-envelope"></i> Contact Our Yacht Specialists
              </Link>
              <Link to="/yacht-charter" className="btn-outline-white">
                <i className="bi bi-send"></i> Request a Charter Quote
              </Link>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Yacht Page Specific Styles */
        .yacht-filters {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }
        
        .yacht-search {
          position: relative;
          width: 100%;
          max-width: 300px;
        }
        
        .yacht-search i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-mid-gray);
          z-index: 1;
        }
        
        .yacht-search .form-input-gov {
          padding-left: 2.5rem;
        }
        
        .yacht-type-select {
          width: auto;
          min-width: 160px;
        }
        
        .yacht-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .yacht-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2rem;
        }
        
        .yacht-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all var(--transition-base);
          position: relative;
        }
        
        .yacht-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
          border-color: rgba(15,45,94,0.12);
        }
        
        .yacht-card__image {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: var(--color-off-white);
        }
        
        .yacht-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .yacht-card__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--color-mid-gray);
        }
        
        .yacht-card__badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
        }
        
        .yacht-card__body {
          padding: 1.5rem;
        }
        
        .yacht-card__title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
        }
        
        .yacht-card__operator {
          font-family: var(--font-label);
          font-size: 0.75rem;
          color: var(--color-gold-dark);
          margin-bottom: 0.5rem;
        }
        
        .yacht-card__location {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-label);
          font-size: 0.75rem;
          color: var(--color-mid-gray);
          margin-bottom: 1rem;
        }
        
        .yacht-card__location i {
          color: var(--color-gold);
          font-size: 0.75rem;
        }
        
        .yacht-card__specs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        .yacht-card__spec {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-label);
          font-size: 0.75rem;
          color: var(--color-mid-gray);
        }
        
        .yacht-card__spec i {
          color: var(--color-gold);
          font-size: 0.75rem;
        }
        
        .yacht-card__price {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-navy);
          margin-bottom: 1rem;
        }
        
        .yacht-card__price small {
          font-family: var(--font-label);
          font-size: 0.7rem;
          font-weight: 400;
          color: var(--color-mid-gray);
        }
        
        .yacht-card__actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-light-gray);
        }
        
        .yacht-card__actions .btn-primary-gov,
        .yacht-card__actions .btn-outline-gov {
          flex: 1;
          justify-content: center;
        }
        
        .yacht-cta {
          margin-top: 3rem;
          padding: 3rem;
          text-align: center;
          background: linear-gradient(135deg, var(--color-navy) 0%, #1a3a6b 100%);
          border-radius: var(--radius-lg);
          position: relative;
          overflow: hidden;
        }
        
        .yacht-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(201,153,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,153,46,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        
        .yacht-cta i {
          font-size: 2rem;
          color: var(--color-gold);
          margin-bottom: 1rem;
          display: inline-block;
          position: relative;
          z-index: 1;
        }
        
        .yacht-cta h3 {
          color: var(--color-white);
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        
        .yacht-cta p {
          color: rgba(255,255,255,0.6);
          margin-bottom: 1.5rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          z-index: 1;
        }
        
        .yacht-cta__actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        
        @media (max-width: 768px) {
          .yacht-filters {
            flex-direction: column;
            align-items: stretch;
          }
          
          .yacht-search {
            max-width: 100%;
          }
          
          .yacht-type-select {
            width: 100%;
          }
          
          .yacht-grid {
            grid-template-columns: 1fr;
          }
          
          .yacht-cta {
            padding: 2rem;
          }
          
          .yacht-cta__actions {
            flex-direction: column;
          }
          
          .yacht-cta__actions a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}