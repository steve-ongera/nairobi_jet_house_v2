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

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
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

      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Our Fleet</div>
          <h1>Explore Our <em style={{ color: 'var(--gold-light)' }}>Aircraft</em></h1>
          <p style={{ maxWidth: 560, marginTop: '0.5rem' }}>
            Approved partner aircraft available for charter. From nimble light jets to ultra-long-range flagships — we have the right aircraft for every mission.
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
                placeholder="Search aircraft..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <select 
              className="form-control" 
              style={{ width: 'auto', minWidth: '180px' }} 
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
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div className="spinner-dark" style={{ margin: '0 auto' }}></div>
              <p style={{ color: 'var(--gray-400)', marginTop: '1rem' }}>Loading fleet...</p>
            </div>
          ) : aircraft.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--gray-300)', marginBottom: '1rem', display: 'block' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>No aircraft found</h3>
              <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
                No aircraft match your search criteria. Try adjusting your filters.
              </p>
              <button 
                onClick={() => { setSearch(''); setCat(''); }}
                className="btn btn-outline-navy btn-sm"
              >
                <i className="bi bi-arrow-counterclockwise" /> Clear Filters
              </button>
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
                  <i className="bi bi-airplane"></i> {aircraft.length} aircraft available
                </div>
                {(search || cat) && (
                  <button 
                    onClick={() => { setSearch(''); setCat(''); }}
                    className="btn btn-ghost btn-xs"
                  >
                    <i className="bi bi-x-circle" /> Clear filters
                  </button>
                )}
              </div>

              {/* Aircraft Grid */}
              <div className="fleet-grid">
                {aircraft.map(ac => (
                  <div key={ac.id} className="aircraft-card">
                    <div className="aircraft-img">
                      {ac.image_url ? 
                        <img src={ac.image_url} alt={ac.name} /> : 
                        <i className="fas fa-plane"></i>
                      }
                      <div className="aircraft-category-pill">{ac.category_display}</div>
                    </div>
                    <div className="aircraft-body">
                      <div className="aircraft-name">{ac.name}</div>
                      <div className="aircraft-model">{ac.operator_name}</div>
                      <div className="aircraft-specs">
                        <div className="aircraft-spec">
                          <i className="bi bi-people"></i>
                          <span>{ac.passenger_capacity} passengers</span>
                        </div>
                        <div className="aircraft-spec">
                          <i className="bi bi-arrow-left-right"></i>
                          <span>{ac.range_km?.toLocaleString()} km range</span>
                        </div>
                      </div>
                      <div className="aircraft-price">
                        ${parseFloat(ac.display_hourly_rate || ac.hourly_rate_usd)?.toLocaleString()}
                        <small> / hour</small>
                      </div>
                      <div className="card-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                        <Link to="/book-flight" state={{ aircraft: ac }} className="btn btn-navy btn-sm">
                          <i className="bi bi-airplane"></i> Charter
                        </Link>
                        <Link to={`/fleet/${ac.id}`} className="btn btn-outline-navy btn-sm">
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
          <div className="card" style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', background: 'var(--navy)' }}>
            <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Don't see what you're looking for?</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              Our team can source any aircraft for your specific needs. Contact us for personalized assistance.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-gold">
                <i className="bi bi-envelope"></i> Contact Our Team
              </Link>
              <Link to="/quote" className="btn btn-outline-gold" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
                <i className="bi bi-send"></i> Request a Quote
              </Link>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />
    </>
  );
}