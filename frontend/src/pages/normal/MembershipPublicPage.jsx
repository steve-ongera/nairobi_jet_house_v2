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

const FAQS = [
  { q: 'Can I upgrade my plan?', a: 'Yes — you can upgrade at any time and pay the prorated difference. Your new benefits take effect immediately.' },
  { q: 'Is there a minimum commitment?', a: 'Annual plans require a 12-month commitment. Monthly plans can be cancelled with 30 days notice.' },
  { q: 'Do membership fees include flights?', a: 'No — membership gives you access to discounted rates and priority booking. Flights are billed separately at the discounted rate.' },
  { q: 'Can we have multiple users on one corporate account?', a: 'Yes — Corporate accounts support multi-user access with role-based permissions. Perfect for flight departments and executive assistants.' },
  { q: 'What happens if I don\'t use all my bookings?', a: 'Unused bookings do not roll over to the next month. However, our team can help you maximise your membership value.' },
]

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
        <meta name="keywords" content="private aviation membership, jet card, flight membership, private jet subscription" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/membership" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">
            <i className="bi bi-gem"></i> Membership
          </span>
          <h1>Your Key to Africa's <em style={{ color: 'var(--color-gold-light)' }}>Private Skies</em></h1>
          <p>Join NairobiJetHouse and get priority access to our full fleet, exclusive rates, and dedicated concierge — all for a single monthly or annual fee.</p>
          
          {/* Billing toggle */}
          <div className="membership-billing-toggle">
            <div className="tabs-gov membership-tabs">
              <button 
                onClick={() => setBilling('monthly')}
                className={`tab-btn ${billing === 'monthly' ? 'active' : ''}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBilling('annual')}
                className={`tab-btn ${billing === 'annual' ? 'active' : ''}`}
              >
                Annual <span className="membership-save-badge">Save ~15%</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Cards Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="membership-tier-grid">
            {tiers.map(tier => {
              const isPremium = tier.name === 'premium';
              const price = billing === 'annual' ? tier.annual_fee_usd : tier.monthly_fee_usd;
              
              return (
                <div key={tier.name} className={`membership-tier-card ${isPremium ? 'featured' : ''}`}>
                  {isPremium && <div className="membership-tier-badge">MOST POPULAR</div>}
                  <div className="membership-tier-icon">
                    <i className={`bi ${tier.name === 'basic' ? 'bi-star' : tier.name === 'premium' ? 'bi-gem' : 'bi-building'}`}></i>
                  </div>
                  <div className="membership-tier-name">{tier.display_name}</div>
                  <div className="membership-tier-price">
                    ${Number(price).toLocaleString()}
                    <span className="membership-tier-period">/{billing === 'annual' ? 'year' : 'month'}</span>
                  </div>
                  {billing === 'annual' && (
                    <div className="membership-tier-savings">
                      ≈ ${Math.round(price / 12).toLocaleString()}/month billed annually
                    </div>
                  )}
                  <p className="membership-tier-description">{tier.description}</p>
                  <div className="membership-tier-features">
                    {(tier.features_list || []).map(f => (
                      <div key={f} className="membership-tier-feature">
                        <i className="bi bi-check-lg"></i>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/register" className="btn-primary-gov btn-full membership-tier-btn">
                    Get Started <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="membership-comparison">
            <div className="membership-comparison__header">
              <i className="bi bi-table"></i> Feature Comparison
            </div>
            <div className="membership-comparison__body">
              <div className="membership-table-wrapper">
                <table className="membership-comparison-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Basic</th>
                      <th>Premium</th>
                      <th>Corporate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row) => (
                      <tr key={row.feature}>
                        <td className="membership-table-feature">{row.feature}</td>
                        <td className="membership-table-value">{row.basic}</td>
                        <td className="membership-table-value">{row.premium}</td>
                        <td className="membership-table-value">{row.corporate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="membership-faq">
            <div className="membership-faq__header">
              <i className="bi bi-question-circle"></i> Frequently Asked Questions
            </div>
            <div className="membership-faq__body">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="membership-faq-item">
                  <summary className="membership-faq-question">
                    <i className="bi bi-plus-circle"></i> {q}
                  </summary>
                  <p className="membership-faq-answer">{a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="membership-cta">
            <h3>Not sure which plan is right for you?</h3>
            <p>Our membership specialists can help you choose the perfect plan based on your travel patterns.</p>
            <div className="membership-cta-actions">
              <Link to="/contact" className="btn-gold">
                <i className="bi bi-chat-dots"></i> Talk to Our Team
              </Link>
              <Link to="/register" className="btn-outline-white">
                <i className="bi bi-person-plus"></i> Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Border radius variables - increased to 8-10px */
        .membership-tier-card,
        .membership-comparison,
        .membership-faq,
        .membership-cta {
          border-radius: 10px;
        }
        .membership-tier-card .btn-primary-gov,
        .membership-cta .btn-gold,
        .membership-cta .btn-outline-white {
          border-radius: 8px;
        }
        .membership-tier-feature i,
        .membership-faq-question i {
          border-radius: 50%;
        }

        /* Billing Toggle */
        .membership-billing-toggle {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }
        .membership-tabs {
          border-bottom: none;
          gap: 0.5rem;
          background: rgba(255,255,255,0.1);
          padding: 0.25rem;
          border-radius: 10px;
        }
        .membership-tabs .tab-btn {
          border-radius: 8px;
          padding: 0.5rem 1.5rem;
          color: rgba(255,255,255,0.7);
        }
        .membership-tabs .tab-btn.active {
          background: var(--color-gold);
          color: var(--color-navy-dark);
          border-bottom-color: transparent;
        }
        .membership-save-badge {
          font-size: 0.7rem;
          margin-left: 0.4rem;
          opacity: 0.8;
        }

        /* Tier Grid */
        .membership-tier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }
        .membership-tier-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2rem;
          position: relative;
          transition: all var(--transition-base);
        }
        .membership-tier-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .membership-tier-card.featured {
          border: 2px solid var(--color-gold);
          background: var(--color-off-white);
        }
        .membership-tier-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-gold);
          color: var(--color-navy-dark);
          padding: 0.25rem 1rem;
          font-family: var(--font-label);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1px;
          white-space: nowrap;
        }
        .membership-tier-icon {
          width: 60px;
          height: 60px;
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .membership-tier-icon i {
          font-size: 1.6rem;
          color: var(--color-gold);
        }
        .membership-tier-name {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }
        .membership-tier-price {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
        }
        .membership-tier-period {
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--color-mid-gray);
        }
        .membership-tier-savings {
          color: var(--color-mid-gray);
          font-size: 0.78rem;
          margin-top: -0.5rem;
          margin-bottom: 1rem;
        }
        .membership-tier-description {
          color: var(--color-mid-gray);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .membership-tier-features {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
        }
        .membership-tier-feature {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--color-dark-gray);
        }
        .membership-tier-feature i {
          color: var(--color-success);
          font-size: 0.9rem;
        }
        .membership-tier-btn {
          width: 100%;
          justify-content: center;
        }

        /* Comparison Table */
        .membership-comparison {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          margin-top: 3rem;
          overflow: hidden;
        }
        .membership-comparison__header {
          background: var(--color-navy);
          color: var(--color-white);
          padding: 1rem 1.5rem;
          font-family: var(--font-label);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .membership-comparison__header i {
          color: var(--color-gold);
        }
        .membership-comparison__body {
          padding: 0;
          overflow-x: auto;
        }
        .membership-table-wrapper {
          overflow-x: auto;
        }
        .membership-comparison-table {
          width: 100%;
          border-collapse: collapse;
        }
        .membership-comparison-table th,
        .membership-comparison-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--color-light-gray);
        }
        .membership-comparison-table th {
          background: var(--color-off-white);
          font-weight: 600;
          color: var(--color-navy);
        }
        .membership-table-feature {
          color: var(--color-dark-gray);
          font-weight: 500;
        }
        .membership-table-value {
          text-align: center;
          color: var(--color-mid-gray);
        }
        .membership-table-value:contains("✓") {
          color: var(--color-success);
        }

        /* FAQ Section */
        .membership-faq {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          margin-top: 2rem;
          overflow: hidden;
        }
        .membership-faq__header {
          background: var(--color-navy);
          color: var(--color-white);
          padding: 1rem 1.5rem;
          font-family: var(--font-label);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .membership-faq__header i {
          color: var(--color-gold);
        }
        .membership-faq__body {
          padding: 1.5rem;
        }
        .membership-faq-item {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-light-gray);
        }
        .membership-faq-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .membership-faq-question {
          color: var(--color-navy);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          list-style: none;
        }
        .membership-faq-question::-webkit-details-marker {
          display: none;
        }
        .membership-faq-question i {
          color: var(--color-gold);
          margin-right: 0.5rem;
          font-size: 0.8rem;
        }
        .membership-faq-answer {
          color: var(--color-mid-gray);
          margin-top: 0.75rem;
          margin-left: 1.5rem;
          line-height: 1.7;
          font-size: 0.875rem;
        }

        /* CTA Section */
        .membership-cta {
          margin-top: 3rem;
          text-align: center;
          padding: 3rem;
          background: var(--color-navy);
          position: relative;
          overflow: hidden;
        }
        .membership-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(201,153,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,153,46,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .membership-cta h3 {
          color: var(--color-white);
          margin-bottom: 0.5rem;
          position: relative;
          z-index: 1;
        }
        .membership-cta p {
          color: rgba(255,255,255,0.6);
          margin-bottom: 1.5rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          z-index: 1;
        }
        .membership-cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .membership-cta-actions .btn-outline-white {
          background: transparent;
          color: var(--color-white);
          border: 1.5px solid rgba(255,255,255,0.3);
        }
        .membership-cta-actions .btn-outline-white:hover {
          border-color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.09);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .membership-tier-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .membership-comparison-table th,
          .membership-comparison-table td {
            padding: 0.75rem;
            font-size: 0.8rem;
          }
          .membership-cta {
            padding: 2rem;
          }
          .membership-cta-actions {
            flex-direction: column;
          }
          .membership-cta-actions a {
            width: 100%;
            justify-content: center;
          }
          .membership-tabs .tab-btn {
            padding: 0.4rem 1rem;
            font-size: 0.8rem;
          }
        }
        @media (max-width: 480px) {
          .membership-tier-card {
            padding: 1.5rem;
          }
          .membership-tier-price {
            font-size: 1.5rem;
          }
          .membership-faq__body {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
}