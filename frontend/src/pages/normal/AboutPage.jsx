import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'James Mwangi', role: 'Founder & CEO', bio: 'Former airline executive with 20+ years in African aviation. Pioneered private charter services across East Africa.' },
  { name: 'Amara Osei', role: 'Head of Charter Operations', bio: 'Certified flight dispatcher and charter specialist. Manages over 500 bookings annually across the continent.' },
  { name: 'Fatima Al-Rashid', role: 'Director of Client Experience', bio: 'Luxury hospitality veteran who has managed VIP services for royalty and Fortune 500 executives.' },
  { name: 'David Kariuki', role: 'Chief Technical Officer', bio: 'Aviation engineer with expertise in fleet maintenance, airworthiness, and safety compliance.' },
];

const STATS = [
  { number: '500+', label: 'Flights Completed' },
  { number: '48', label: 'Partner Operators' },
  { number: '35', label: 'Countries Served' },
  { number: '99.2%', label: 'On-time Performance' },
];

const VALUES = [
  { icon: '✦', title: 'Safety First', desc: 'Every aircraft and operator in our network is rigorously vetted — AOC verified, ARGUS rated, and insurance confirmed before a single booking.' },
  { icon: '✦', title: 'Transparency', desc: 'Clear pricing, no hidden fees. You see exactly what you pay and where your money goes.' },
  { icon: '✦', title: 'African Excellence', desc: 'Built in Nairobi, operating across Africa. We understand the continent, its routes, its demands, and its opportunities.' },
  { icon: '✦', title: 'Bespoke Service', desc: 'No two journeys are the same. Our concierge team tailors every detail from ground transport to in-flight catering.' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy, #0B1D3A)', color: '#fff' }}>
      {/* Nav breadcrumb */}
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>← Home</Link>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 3rem', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <p style={{ color: 'var(--gold, #C9A84C)', letterSpacing: '0.2em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Who We Are
        </p>
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2.8rem', color: '#fff', margin: '0 auto 1.5rem', maxWidth: '700px', lineHeight: '1.2' }}>
          Africa's Premier Private Aviation & Yacht Charter Platform
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '620px', margin: '0 auto', lineHeight: '1.8', fontSize: '1rem' }}>
          NairobiJetHouse was founded with one mission: to make world-class private aviation accessible across Africa. We connect discerning travellers with vetted charter operators, managed aircraft owners, and curated yacht fleets — all through one seamless platform.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem', gap: '2rem', textAlign: 'center' }}>
        {STATS.map(s => (
          <div key={s.label}>
            <p style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '2.5rem', color: 'var(--gold, #C9A84C)', margin: 0 }}>{s.number}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Story */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', color: 'var(--gold, #C9A84C)', fontSize: '1.8rem', marginBottom: '1.25rem' }}>Our Story</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.9', marginBottom: '1rem' }}>
          Founded in Nairobi in 2020, NairobiJetHouse emerged from a simple observation: private aviation in Africa was fragmented, opaque, and inaccessible to the growing class of African executives, entrepreneurs, and high-net-worth individuals who deserved better.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.9', marginBottom: '1rem' }}>
          We built a platform that brings together charter operators, fleet owners, and luxury seekers in one transparent marketplace. From a Gulfstream G650 to a superyacht on the Kenyan coast, we handle every detail so our clients can focus on what matters.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.9' }}>
          In V2, we've opened our network to partner charter operators across Africa and beyond — allowing qualified airlines and charter companies to list their aircraft, respond to RFQs, and manage bookings through our platform. This means more choices, better prices, and greater reliability for every client.
        </p>
      </div>

      {/* Values */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', color: '#fff', fontSize: '1.8rem', textAlign: 'center', marginBottom: '2.5rem' }}>Our Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {VALUES.map(v => (
              <div key={v.title} style={{ padding: '1.5rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--gold, #C9A84C)', fontSize: '1rem', marginBottom: '0.75rem' }}>{v.icon} <strong>{v.title}</strong></p>
                <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', fontSize: '0.875rem', margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display, Georgia, serif)', color: '#fff', fontSize: '1.8rem', textAlign: 'center', marginBottom: '2.5rem' }}>
          Leadership Team
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {TEAM.map(p => (
            <div key={p.name} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(201,168,76,0.2)', borderRadius: '50%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                {p.name.charAt(0)}
              </div>
              <h4 style={{ margin: '0 0 0.25rem', color: '#fff', fontSize: '1rem' }}>{p.name}</h4>
              <p style={{ margin: '0 0 0.75rem', color: 'var(--gold, #C9A84C)', fontSize: '0.8rem' }}>{p.role}</p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: '1.6' }}>{p.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '3rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to experience the difference?</h3>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/book-flight" style={primaryBtn}>Book a Flight</Link>
          <Link to="/contact" style={secondaryBtn}>Get in Touch</Link>
          <Link to="/membership" style={secondaryBtn}>View Membership</Link>
        </div>
      </div>
    </div>
  );
}

const primaryBtn = {
  display: 'inline-block', padding: '0.8rem 1.75rem', background: 'var(--gold, #C9A84C)',
  color: 'var(--navy, #0B1D3A)', borderRadius: '4px', fontWeight: '600', textDecoration: 'none',
};
const secondaryBtn = {
  display: 'inline-block', padding: '0.8rem 1.75rem', border: '1px solid rgba(255,255,255,0.2)',
  color: '#fff', borderRadius: '4px', fontWeight: '500', textDecoration: 'none',
};