import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { catalogAPI } from '../../services/api';

function StatCounter({ value, label }) {
  return (
    <div style={{textAlign:'center'}}>
      <div style={{fontFamily:'var(--font-display)',fontSize:'3rem',fontWeight:300,color:'var(--gold)',lineHeight:1}}>{value}</div>
      <div style={{fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.15em',color:'var(--muted)',marginTop:8}}>{label}</div>
    </div>
  );
}

export default function HomePage() {
  const [aircraft, setAircraft] = useState([]);

  useEffect(() => {
    catalogAPI.opAircraft({ limit: 6 })
      .then(r => setAircraft(r.data.results || r.data))
      .catch(() => {});
  }, []);

  const services = [
    { icon:'✈', title:'Private Jet Charter', desc:'On-demand access to the finest aircraft for point-to-point luxury travel.' },
    { icon:'⛵', title:'Yacht Charter',       desc:'Exclusive superyacht experiences across the Indian Ocean and beyond.' },
    { icon:'📦', title:'Air Cargo',           desc:'Specialised freight solutions — from fresh produce to dangerous goods.' },
    { icon:'👥', title:'Group Charter',       desc:'Custom aircraft solutions for sports teams, corporates, and VIP groups.' },
    { icon:'🛩', title:'Aircraft Sales',      desc:'Buy, sell, or trade pre-owned jets with full advisory support.' },
    { icon:'📋', title:'Aircraft Leasing',    desc:'Monthly to multi-year dry and wet lease arrangements.' },
  ];

  return (
    <>
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="container">
          <div className="hero-content slide-up">
            <div className="hero-eyebrow">Africa's Premier Private Aviation Platform</div>
            <h1>Elevating Every<br /><em>Journey</em></h1>
            <p className="hero-sub">
              Private jets, superyachts, and bespoke aviation services — curated for the discerning traveller across Africa and beyond.
            </p>
            <div className="hero-actions">
              <Link to="/book-flight" className="btn btn-gold btn-lg">Charter a Jet</Link>
              <Link to="/book-yacht"  className="btn btn-outline btn-lg">Explore Yachts</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section style={{background:'#070f1e',borderBottom:'1px solid var(--border)',padding:'48px 0'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:48}}>
            <StatCounter value="500+" label="Flights Completed" />
            <StatCounter value="48"   label="Partner Operators" />
            <StatCounter value="120+" label="Aircraft in Network" />
            <StatCounter value="24/7" label="Concierge Support" />
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{textAlign:'center',marginBottom:56}}>
            <div className="gold-line" style={{margin:'0 auto 16px'}} />
            <h2 className="section-heading">Our Services</h2>
            <p className="section-subheading" style={{margin:'0 auto'}}>
              A complete suite of private aviation and maritime experiences.
            </p>
          </div>
          <div className="grid-3">
            {services.map((s,i) => (
              <div key={i} className="card" style={{padding:0}}>
                <div className="card-body">
                  <div style={{fontSize:'2rem',marginBottom:16}}>{s.icon}</div>
                  <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',marginBottom:10}}>{s.title}</h3>
                  <p style={{color:'var(--muted)',fontSize:'0.875rem',lineHeight:1.7}}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Fleet ───────────────────────────────────────── */}
      {aircraft.length > 0 && (
        <section className="section" style={{background:'#070f1e'}}>
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="gold-line" />
                <h2 className="section-heading">Featured Fleet</h2>
              </div>
              <Link to="/fleet" className="btn btn-outline btn-sm">View All</Link>
            </div>
            <div className="grid-3">
              {aircraft.slice(0,3).map(ac => (
                <div key={ac.id} className="asset-card">
                  <div className="asset-card-img">
                    {ac.image_url ? <img src={ac.image_url} alt={ac.name} /> : '✈'}
                  </div>
                  <div className="asset-card-body">
                    <div className="asset-card-title">{ac.name}</div>
                    <div className="asset-card-sub">{ac.category_display} · {ac.operator_name}</div>
                    <div className="asset-card-specs">
                      <div className="spec-item">
                        <div className="spec-label">Passengers</div>
                        <div className="spec-value">{ac.passenger_capacity}</div>
                      </div>
                      <div className="spec-item">
                        <div className="spec-label">Range</div>
                        <div className="spec-value">{ac.range_km?.toLocaleString()} km</div>
                      </div>
                    </div>
                    <div className="asset-card-price">
                      ${parseFloat(ac.display_hourly_rate || ac.hourly_rate_usd)?.toLocaleString()}
                      <span> / hr</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="section" style={{
        background:'linear-gradient(135deg, var(--navy-mid) 0%, var(--navy) 100%)',
        borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)'
      }}>
        <div className="container" style={{textAlign:'center'}}>
          <div className="gold-line" style={{margin:'0 auto 16px'}} />
          <h2 className="section-heading">Become a Member</h2>
          <p className="section-subheading" style={{margin:'0 auto 32px'}}>
            Unlock priority booking, exclusive rates, and dedicated concierge support.
          </p>
          <Link to="/membership" className="btn btn-gold btn-lg">Explore Membership</Link>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}