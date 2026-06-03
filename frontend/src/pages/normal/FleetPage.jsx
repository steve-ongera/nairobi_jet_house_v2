// src/pages/public/Fleet.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { catalogAPI } from '../../services/api';

const CATS = ['', 'light', 'midsize', 'super_midsize', 'heavy', 'ultra_long', 'vip_airliner', 'turboprop', 'helicopter'];

const CATEGORY_NAMES = {
  '': 'All Categories',
  'light': 'Light Jets',
  'midsize': 'Midsize Jets',
  'super_midsize': 'Super Midsize',
  'heavy': 'Heavy Jets',
  'ultra_long': 'Ultra Long Range',
  'vip_airliner': 'VIP Airliners',
  'turboprop': 'Turboprops',
  'helicopter': 'Helicopters'
};

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'NairobiJetHouse Fleet',
  description: 'Our network of approved private aircraft available for charter worldwide.',
  numberOfItems: 'variable',
}

export default function FleetPage() {
  const [aircraft, setAircraft] = useState([]);
  const [cat, setCat]           = useState('');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (cat)    params.category = cat;
    if (search) params.search   = search;
    catalogAPI.opAircraft(params)
      .then(r => setAircraft(r.data.results || r.data))
      .catch(() => setAircraft([]))
      .finally(() => setLoading(false));
  }, [cat, search]);

  return (
    <>
      <Helmet>
        <title>Our Fleet | NairobiJetHouse - Private Aircraft Available for Charter</title>
        <meta name="description" content="Browse our extensive fleet of private aircraft available for charter. From light jets to ultra-long-range aircraft, find the perfect plane for your journey." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/fleet" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">Our Fleet</span>
          <h1>Explore Our <em style={{ color: 'var(--color-gold-light)' }}>Aircraft</em></h1>
          <p>Approved partner aircraft available for charter. From nimble light jets to ultra-long-range flagships — we have the right aircraft for every mission.</p>
        </div>
      </div>

      {/* Main Content */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          
          {/* Filters */}
          <div className="fleet-filters">
            <div className="fleet-search">
              <i className="bi bi-search"></i>
              <input 
                className="form-input-gov" 
                placeholder="Search aircraft..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <select 
              className="form-input-gov fleet-category-select" 
              value={cat} 
              onChange={e => setCat(e.target.value)}
            >
              {CATS.map(c => (
                <option key={c} value={c}>{CATEGORY_NAMES[c]}</option>
              ))}
            </select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="loading-page">
              <div className="spinner-gov"></div>
              <p>Loading fleet...</p>
            </div>
          ) : aircraft.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <i className="bi bi-airplane"></i>
              </div>
              <h3>No aircraft found</h3>
              <p>No aircraft match your search criteria. Try adjusting your filters.</p>
              <button 
                onClick={() => { setSearch(''); setCat(''); }}
                className="btn-primary-gov btn-sm"
              >
                <i className="bi bi-arrow-counterclockwise" /> Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="fleet-results-header">
                <div className="text-muted">
                  <i className="bi bi-airplane"></i> {aircraft.length} aircraft available
                </div>
                {(search || cat) && (
                  <button 
                    onClick={() => { setSearch(''); setCat(''); }}
                    className="btn-ghost btn-sm"
                  >
                    <i className="bi bi-x-circle" /> Clear filters
                  </button>
                )}
              </div>

              {/* Aircraft Grid */}
              <div className="fleet-grid">
                {aircraft.map(ac => (
                  <div key={ac.id} className="aircraft-card">
                    <div className="aircraft-card__image">
                      {ac.image_url ? 
                        <img src={ac.image_url} alt={ac.name} /> : 
                        <div className="aircraft-card__placeholder"><i className="bi bi-airplane"></i></div>
                      }
                      <span className="badge-gold aircraft-card__badge">{ac.category_display}</span>
                    </div>
                    <div className="aircraft-card__body">
                      <h3 className="aircraft-card__title">{ac.name}</h3>
                      <div className="aircraft-card__operator">{ac.operator_name}</div>
                      <div className="aircraft-card__specs">
                        <div className="aircraft-card__spec">
                          <i className="bi bi-people"></i>
                          <span>{ac.passenger_capacity} passengers</span>
                        </div>
                        <div className="aircraft-card__spec">
                          <i className="bi bi-arrow-left-right"></i>
                          <span>{ac.range_km?.toLocaleString()} km range</span>
                        </div>
                      </div>
                      <div className="aircraft-card__price">
                        ${parseFloat(ac.display_hourly_rate || ac.hourly_rate_usd)?.toLocaleString()}
                        <small> / hour</small>
                      </div>
                      <div className="aircraft-card__actions">
                        <Link to="/book-flight" state={{ aircraft: ac }} className="btn-primary-gov btn-sm">
                          <i className="bi bi-airplane"></i> Charter
                        </Link>
                        <Link to={`/fleet/${ac.id}`} className="btn-outline-gov btn-sm">
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
          <div className="fleet-cta">
            <h3>Don't see what you're looking for?</h3>
            <p>Our team can source any aircraft for your specific needs. Contact us for personalized assistance.</p>
            <div className="fleet-cta__actions">
              <Link to="/contact" className="btn-gold">
                <i className="bi bi-envelope"></i> Contact Our Team
              </Link>
              <Link to="/quote" className="btn-outline-white">
                <i className="bi bi-send"></i> Request a Quote
              </Link>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Fleet Page Specific Styles */
        .fleet-filters {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }
        
        .fleet-search {
          position: relative;
          width: 100%;
          max-width: 300px;
        }
        
        .fleet-search i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-mid-gray);
          z-index: 1;
        }
        
        .fleet-search .form-input-gov {
          padding-left: 2.5rem;
        }
        
        .fleet-category-select {
          width: auto;
          min-width: 180px;
        }
        
        .fleet-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .fleet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
        
        .aircraft-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all var(--transition-base);
          position: relative;
        }
        
        .aircraft-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
          border-color: rgba(15,45,94,0.12);
        }
        
        .aircraft-card__image {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: var(--color-off-white);
        }
        
        .aircraft-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .aircraft-card__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--color-mid-gray);
        }
        
        .aircraft-card__badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
        }
        
        .aircraft-card__body {
          padding: 1.5rem;
        }
        
        .aircraft-card__title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
        }
        
        .aircraft-card__operator {
          font-family: var(--font-label);
          font-size: 0.75rem;
          color: var(--color-gold-dark);
          margin-bottom: 1rem;
        }
        
        .aircraft-card__specs {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        .aircraft-card__spec {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-label);
          font-size: 0.8rem;
          color: var(--color-mid-gray);
        }
        
        .aircraft-card__spec i {
          color: var(--color-gold);
          font-size: 0.85rem;
        }
        
        .aircraft-card__price {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-navy);
          margin-bottom: 1rem;
        }
        
        .aircraft-card__price small {
          font-family: var(--font-label);
          font-size: 0.7rem;
          font-weight: 400;
          color: var(--color-mid-gray);
        }
        
        .aircraft-card__actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-light-gray);
        }
        
        .aircraft-card__actions .btn-primary-gov,
        .aircraft-card__actions .btn-outline-gov {
          flex: 1;
          justify-content: center;
        }
        
        .fleet-cta {
          margin-top: 3rem;
          padding: 3rem;
          text-align: center;
          background: var(--color-navy);
          border-radius: var(--radius-lg);
          position: relative;
          overflow: hidden;
        }
        
        .fleet-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(201,153,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,153,46,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        
        .fleet-cta h3 {
          color: var(--color-white);
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        
        .fleet-cta p {
          color: rgba(255,255,255,0.6);
          margin-bottom: 1.5rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          z-index: 1;
        }
        
        .fleet-cta__actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        
        @media (max-width: 768px) {
          .fleet-filters {
            flex-direction: column;
            align-items: stretch;
          }
          
          .fleet-search {
            max-width: 100%;
          }
          
          .fleet-category-select {
            width: 100%;
          }
          
          .fleet-grid {
            grid-template-columns: 1fr;
          }
          
          .fleet-cta {
            padding: 2rem;
          }
          
          .fleet-cta__actions {
            flex-direction: column;
          }
          
          .fleet-cta__actions a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}