import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', color: '#fff' }}>
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>← Home</Link>
        <Link to="/login" style={{ color: 'var(--gold, #C9A84C)', fontSize: '0.85rem', textDecoration: 'none' }}>Sign in to your account →</Link>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 3rem', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <p style={{ color: 'var(--gold, #C9A84C)', letterSpacing: '0.2em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Membership</p>
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2.5rem', margin: '0 auto 1rem', maxWidth: '600px', lineHeight: '1.2' }}>
          Your Key to Africa's Private Skies
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '550px', margin: '0 auto 2rem', lineHeight: '1.8' }}>
          Join NairobiJetHouse and get priority access to our full fleet, exclusive rates, and dedicated concierge — all for a single monthly or annual fee.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', padding: '0.3rem' }}>
          {['monthly', 'annual'].map(b => (
            <button key={b} onClick={() => setBilling(b)}
              style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
                background: billing === b ? 'var(--gold, #C9A84C)' : 'transparent',
                color: billing === b ? 'var(--navy, #0B1D3A)' : 'rgba(255,255,255,0.6)',
              }}>
              {b.charAt(0).toUpperCase() + b.slice(1)}
              {b === 'annual' && <span style={{ fontSize: '0.7rem', marginLeft: '0.4rem', opacity: 0.8 }}>Save ~15%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Cards */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {tiers.map(tier => {
            const isPremium = tier.name === 'premium';
            const price = billing === 'annual' ? tier.annual_fee_usd : tier.monthly_fee_usd;
            const color = TIER_COLORS[tier.name] || '#aaa';
            return (
              <div key={tier.name} style={{
                background: isPremium ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isPremium ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '2rem', position: 'relative',
              }}>
                {isPremium && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold, #C9A84C)', color: 'var(--navy, #0B1D3A)', padding: '0.2rem 1rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ width: '40px', height: '4px', background: color, borderRadius: '2px', marginBottom: '1.25rem' }} />
                <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 0.25rem', fontFamily: 'var(--font-display, Georgia, serif)' }}>{tier.display_name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 1.5rem', lineHeight: '1.5' }}>{tier.description}</p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2.2rem', color: color, fontWeight: '600' }}>
                    ${Number(price).toLocaleString()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>/{billing === 'annual' ? 'year' : 'month'}</span>
                  {billing === 'annual' && (
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', margin: '0.3rem 0 0' }}>
                      ≈ ${Math.round(price / 12).toLocaleString()}/month billed annually
                    </p>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem' }}>
                  {(tier.features_list || []).map(f => (
                    <li key={f} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                      <span style={{ color, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <Link to="/register"
                  style={{ display: 'block', textAlign: 'center', padding: '0.8rem', borderRadius: '5px', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none',
                    background: isPremium ? 'var(--gold, #C9A84C)' : 'transparent',
                    color: isPremium ? 'var(--navy, #0B1D3A)' : '#fff',
                    border: isPremium ? 'none' : '1px solid rgba(255,255,255,0.25)',
                  }}>
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', color: '#fff', fontSize: '1.6rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          Feature Comparison
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={th()}>Feature</th>
                <th style={th(TIER_COLORS.basic)}>Basic</th>
                <th style={th(TIER_COLORS.premium)}>Premium</th>
                <th style={th(TIER_COLORS.corporate)}>Corporate</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td style={td()}>{row.feature}</td>
                  <td style={tdCenter(TIER_COLORS.basic)}>{row.basic}</td>
                  <td style={tdCenter(TIER_COLORS.premium)}>{row.premium}</td>
                  <td style={tdCenter(TIER_COLORS.corporate)}>{row.corporate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ-style Note */}
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Frequently Asked Questions</h3>
          {[
            ['Can I upgrade my plan?', 'Yes — you can upgrade at any time and pay the prorated difference.'],
            ['Is there a minimum commitment?', 'Annual plans require a 12-month commitment. Monthly plans can be cancelled with 30 days notice.'],
            ['Do membership fees include flights?', 'No — membership gives you access to discounted rates and priority booking. Flights are billed separately.'],
            ['Can we have multiple users on one corporate account?', 'Yes — Corporate accounts support multi-user access with role-based permissions.'],
          ].map(([q, a]) => (
            <details key={q} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <summary style={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>{q}</summary>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', lineHeight: '1.7', fontSize: '0.875rem' }}>{a}</p>
            </details>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Not sure which plan is right for you?
          </p>
          <Link to="/contact" style={{ color: 'var(--gold, #C9A84C)', textDecoration: 'none', fontWeight: '500' }}>
            Talk to our team →
          </Link>
        </div>
      </div>
    </div>
  );
}

const th = (color) => ({
  padding: '0.75rem 1rem', textAlign: 'left', color: color || 'rgba(255,255,255,0.5)',
  borderBottom: `2px solid ${color || 'rgba(255,255,255,0.1)'}`, fontWeight: '600', fontSize: '0.85rem',
});
const td = () => ({ padding: '0.65rem 1rem', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)' });
const tdCenter = (color) => ({ ...td(), textAlign: 'center', color: color });