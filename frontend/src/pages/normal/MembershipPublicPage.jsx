// src/pages/public/MembershipPublicPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { membershipAPI } from '../../services/api';

const TIER_COLORS = { basic: '#64b5f6', premium: '#C9A84C', corporate: '#ce93d8' };

const DEFAULT_TIERS = [
  {
    name: 'basic', display_name: 'Basic', monthly_fee_usd: 2500, annual_fee_usd: 25000,
    hourly_discount_pct: 5, priority_booking: false, dedicated_support: false, exclusive_listings: false,
    max_monthly_bookings: 4,
    features_list: ['Up to 4 bookings/month', '5% hourly rate discount', 'Standard fleet access', 'Email support', 'Online booking portal'],
    description: 'Perfect for occasional private flyers who want seamless booking without the hassle.',
  },
  {
    name: 'premium', display_name: 'Premium', monthly_fee_usd: 6500, annual_fee_usd: 65000,
    hourly_discount_pct: 12, priority_booking: true, dedicated_support: true, exclusive_listings: false,
    max_monthly_bookings: 15,
    features_list: ['Up to 15 bookings/month', '12% hourly rate discount', 'Priority booking queue', 'Dedicated account manager', 'Full fleet access', 'Concierge services', 'Ground transport coordination'],
    description: 'For frequent flyers who demand priority access and personalised service.',
  },
  {
    name: 'corporate', display_name: 'Corporate', monthly_fee_usd: 15000, annual_fee_usd: 150000,
    hourly_discount_pct: 20, priority_booking: true, dedicated_support: true, exclusive_listings: true,
    max_monthly_bookings: 999,
    features_list: ['Unlimited bookings', '20% hourly rate discount', 'Exclusive fleet listings', 'Dedicated flight team', 'Multi-passenger management', 'Custom contract terms', 'White-glove concierge', 'Group charter priority', 'Monthly account reporting'],
    description: 'The complete corporate aviation solution — unlimited access, maximum savings, full concierge.',
  },
];

const COMPARISON = [
  { feature: 'Monthly Bookings', basic: 'Up to 4', premium: 'Up to 15', corporate: 'Unlimited' },
  { feature: 'Hourly Discount', basic: '5%', premium: '12%', corporate: '20%' },
  { feature: 'Priority Booking', basic: '—', premium: '✓', corporate: '✓' },
  { feature: 'Dedicated Account Manager', basic: '—', premium: '✓', corporate: '✓' },
  { feature: 'Exclusive Fleet Listings', basic: '—', premium: '—', corporate: '✓' },
  { feature: 'Concierge Services', basic: '—', premium: '✓', corporate: '✓' },
  { feature: 'Custom Contract', basic: '—', premium: '—', corporate: '✓' },
  { feature: 'Group Charter Priority', basic: '—', premium: '—', corporate: '✓' },
];

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'NairobiJetHouse Membership',
  description: 'Priority access to private aviation with exclusive rates and dedicated concierge service.',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: 2500,
    highPrice: 15000,
  },
}

export default function MembershipPublicPage() {
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [billing, setBilling] = useState('annual');

  useEffect(() => {
    membershipAPI.tiers().then(res => {
      const data = res.data.results || res.data;
      if (data.length > 0) setTiers(data);
    }).catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>Membership | NairobiJetHouse - Private Aviation Membership Program</title>
        <meta name="description" content="Join NairobiJetHouse membership for priority access to our fleet, exclusive rates, and dedicated concierge service. Monthly and annual plans available." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/membership" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Membership</div>
          <h1>Your Key to Africa's <em style={{ color: 'var(--gold-light)' }}>Private Skies</em></h1>
          <p style={{ maxWidth: 550, marginTop: '0.5rem' }}>
            Join NairobiJetHouse and get priority access to our full fleet, exclusive rates, and dedicated concierge — all for a single monthly or annual fee.
          </p>
          
          {/* Billing toggle */}
          <div className="filter-bar" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <div className="tab-nav" style={{ borderBottom: 'none', gap: '0.5rem' }}>
              {['monthly', 'annual'].map(b => (
                <button 
                  key={b} 
                  onClick={() => setBilling(b)}
                  className={`tab-btn ${billing === b ? 'active' : ''}`}
                  style={{ 
                    borderBottom: billing === b ? '2px solid var(--gold)' : 'none',
                    padding: '0.5rem 1.25rem',
                  }}
                >
                  {b.charAt(0).toUpperCase() + b.slice(1)}
                  {b === 'annual' && <span style={{ fontSize: '0.7rem', marginLeft: '0.4rem', opacity: 0.8 }}>Save ~15%</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tier Cards Section */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="tier-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {tiers.map(tier => {
              const isPremium = tier.name === 'premium';
              const price = billing === 'annual' ? tier.annual_fee_usd : tier.monthly_fee_usd;
              const color = TIER_COLORS[tier.name] || '#aaa';
              
              return (
                <div key={tier.name} className={`tier-card ${isPremium ? 'featured' : ''}`}>
                  {isPremium && <div className="tier-featured-label">MOST POPULAR</div>}
                  <div className="tier-icon">
                    <i className={`bi ${tier.name === 'basic' ? 'bi-star' : tier.name === 'premium' ? 'bi-gem' : 'bi-building'}`}></i>
                  </div>
                  <div className="tier-name">{tier.display_name}</div>
                  <div className="tier-price">
                    ${Number(price).toLocaleString()}
                    <sub>/{billing === 'annual' ? 'year' : 'month'}</sub>
                  </div>
                  {billing === 'annual' && (
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.78rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                      ≈ ${Math.round(price / 12).toLocaleString()}/month billed annually
                    </p>
                  )}
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    {tier.description}
                  </p>
                  <div className="tier-features">
                    {(tier.features_list || []).map(f => (
                      <div key={f} className="tier-feature">
                        <i className="bi bi-check-lg yes"></i>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/register" className="btn btn-navy btn-full" style={{ marginTop: '1.5rem' }}>
                    Get Started <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="detail-card" style={{ marginTop: '3rem' }}>
            <div className="detail-card-header">
              <div className="detail-card-title">
                <i className="bi bi-table"></i> Feature Comparison
              </div>
            </div>
            <div className="detail-card-body" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--navy)', fontWeight: 600 }}>Feature</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: TIER_COLORS.basic, fontWeight: 600 }}>Basic</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: TIER_COLORS.premium, fontWeight: 600 }}>Premium</th>
                    <th style={{ padding: '1rem', textAlign: 'center', color: TIER_COLORS.corporate, fontWeight: 600 }}>Corporate</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={row.feature} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)' }}>{row.feature}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: row.basic === '✓' ? 'var(--green)' : 'var(--gray-400)' }}>{row.basic}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: row.premium === '✓' ? 'var(--green)' : 'var(--gray-400)' }}>{row.premium}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: row.corporate === '✓' ? 'var(--green)' : 'var(--gray-400)' }}>{row.corporate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="detail-card" style={{ marginTop: '2rem' }}>
            <div className="detail-card-header">
              <div className="detail-card-title">
                <i className="bi bi-question-circle"></i> Frequently Asked Questions
              </div>
            </div>
            <div className="detail-card-body">
              {[
                ['Can I upgrade my plan?', 'Yes — you can upgrade at any time and pay the prorated difference. Your new benefits take effect immediately.'],
                ['Is there a minimum commitment?', 'Annual plans require a 12-month commitment. Monthly plans can be cancelled with 30 days notice.'],
                ['Do membership fees include flights?', 'No — membership gives you access to discounted rates and priority booking. Flights are billed separately at the discounted rate.'],
                ['Can we have multiple users on one corporate account?', 'Yes — Corporate accounts support multi-user access with role-based permissions. Perfect for flight departments and executive assistants.'],
                ['What happens if I don\'t use all my bookings?', 'Unused bookings do not roll over to the next month. However, our team can help you maximise your membership value.'],
              ].map(([q, a]) => (
                <details key={q} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--gray-100)' }}>
                  <summary style={{ color: 'var(--navy)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                    <i className="bi bi-plus-circle" style={{ color: 'var(--gold)', marginRight: '0.5rem', fontSize: '0.8rem' }}></i>
                    {q}
                  </summary>
                  <p style={{ color: 'var(--gray-500)', marginTop: '0.75rem', marginLeft: '1.5rem', lineHeight: '1.7', fontSize: '0.875rem' }}>{a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="card" style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', background: 'var(--navy)' }}>
            <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Not sure which plan is right for you?</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              Our membership specialists can help you choose the perfect plan based on your travel patterns.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-gold">
                <i className="bi bi-chat-dots"></i> Talk to Our Team
              </Link>
              <Link to="/register" className="btn btn-outline-gold" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.3)' }}>
                <i className="bi bi-person-plus"></i> Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}