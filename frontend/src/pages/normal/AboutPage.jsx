// src/pages/public/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const LEADERSHIP = [
  { name: 'Alexander Mercer', title: 'Chief Executive Officer', bio: 'Former VP at NetJets with 22 years in private aviation. Has overseen 40,000+ flights across 6 continents.', initials: 'AM', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { name: 'Sophie Laurent', title: 'Chief Operations Officer', bio: 'Ex-Air France operations director. Built and manages our 24/7 global dispatch and concierge infrastructure.', initials: 'SL', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
  { name: 'James Okonkwo', title: 'Head of Fleet Acquisitions', bio: 'Type-rated on 14 aircraft types. Oversees safety audits and operator vetting for all 2,400+ aircraft in our network.', initials: 'JO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
  { name: 'Priya Mehta', title: 'Director of Client Experience', bio: 'Pioneered our white-glove concierge program. Former luxury hospitality lead at Four Seasons Hotels globally.', initials: 'PM', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
]

const MILESTONES = [
  { year: '2004', event: 'NairobiJetHouse founded in Geneva with a fleet of 12 aircraft and a vision for frictionless private travel.' },
  { year: '2008', event: 'Expanded to Middle East and Asia Pacific, establishing regional hubs in Dubai and Singapore.' },
  { year: '2012', event: 'Launched our 24/7 concierge program and became the first private aviation company to offer guaranteed availability.' },
  { year: '2016', event: 'Added superyacht charter to our portfolio, creating the first integrated air & sea luxury travel platform.' },
  { year: '2019', event: 'Surpassed 100,000 flights completed. Opened our dedicated aircraft leasing and sales division.' },
  { year: '2023', event: 'Network grows to 2,400+ aircraft across 187 countries. Launched air cargo and group charter divisions.' },
]

const VALUES = [
  { icon: 'bi-shield-check', title: 'Safety First, Always', desc: 'Every operator in our network is ARGUS Platinum or Wyvern Wingman certified. Our own safety team conducts independent audits — no exceptions, no compromises.' },
  { icon: 'bi-gem', title: 'Relentless Excellence', desc: 'We obsess over every detail of your journey, from the cabin temperature on boarding to the brand of still water at your seat. Excellence is our baseline.' },
  { icon: 'bi-eye', title: 'Complete Transparency', desc: 'No hidden fees. No last-minute surcharges. The price we quote is the price you pay. We publish our pricing model and welcome scrutiny.' },
  { icon: 'bi-globe2', title: 'Truly Global Reach', desc: 'We access destinations others cannot. High-altitude strips, remote island runways, frozen northern airfields. The world is your runway — all of it.' },
]

const STATS = [
  { number: '2,400+', label: 'Aircraft in Network' },
  { number: '187', label: 'Countries Served' },
  { number: '100K+', label: 'Flights Completed' },
  { number: '20', label: 'Years of Excellence' },
]

const CERTIFICATIONS = [
  { icon: 'bi-patch-check', label: 'ARGUS Platinum', sub: 'Highest charter operator rating', image: '/assets/certifications/argus.svg' },
  { icon: 'bi-award', label: 'IS-BAO Stage 3', sub: 'International safety standards', image: '/assets/certifications/is-bao.svg' },
  { icon: 'bi-shield-fill-check', label: 'Wyvern Wingman', sub: 'Independent safety audits', image: '/assets/certifications/wyvern.svg' },
  { icon: 'bi-file-earmark-check', label: 'EASA & FAA', sub: 'Dual regulatory compliance', image: '/assets/certifications/easa-faa.svg' },
]

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About NairobiJetHouse',
  description: 'Two decades of defining private aviation. Learn about our mission, values, leadership team, and commitment to safety and excellence.',
  url: 'https://www.nairobijethouse.com/about',
}

/* ═══════════════════════════════════════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us | NairobiJetHouse - Two Decades of Private Aviation Excellence</title>
        <meta name="description" content="Learn about NairobiJetHouse's 20-year journey in private aviation. Our mission, values, leadership team, safety certifications, and commitment to excellence." />
        <meta name="keywords" content="private aviation company, private jet charter about, luxury travel company, aircraft charter history" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/about" />
        <meta property="og:title" content="About NairobiJetHouse | Private Aviation Excellence" />
        <meta property="og:description" content="Two decades of defining private aviation. Learn about our mission, values, and leadership team." />
        <meta property="og:image" content="https://www.nairobijethouse.com/images/about-og.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <div className="page-header" style={{ 
        backgroundImage: 'linear-gradient(140deg, var(--color-navy-dark) 0%, var(--color-navy) 55%, var(--color-navy-light) 100%), url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundBlend: 'overlay',
      }}>
        <div className="page-header__glow"></div>
        <div className="container page-header__inner">
          <span className="section-label">
            <i className="bi bi-building"></i> Our Story
          </span>
          <h1>Two Decades of <em style={{ color: 'var(--color-gold-light)' }}>Defining</em> Private Aviation</h1>
          <p>Founded in Geneva in 2004, NairobiJetHouse was born from a simple conviction: private aviation should feel effortless, transparent, and truly global. Twenty years later, that conviction drives everything we do.</p>
        </div>
      </div>

      {/* Mission & Stats Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="about-mission-grid">
            <div>
              <div className="section-label">Our Mission</div>
              <h2 className="section-title">Private Travel Without the <em style={{ color: 'var(--color-gold)' }}>Friction</em></h2>
              <div className="gold-divider"></div>
              <p className="about-mission-text">
                We believe that the moment you decide to fly privately, every decision afterward should feel natural and inevitable — not complicated, not anxious, not expensive in unexpected ways.
              </p>
              <p className="about-mission-text">
                Our mission is to eliminate the opacity that has long defined this industry. We build technology and processes that give you clear pricing, instant access to aircraft, and human support that never sleeps.
              </p>
              <p className="about-mission-text">
                Whether you're a first-time charter customer or a Fortune 500 flight department, you deserve the same standard of care, the same quality of aircraft, and the same level of honest communication.
              </p>
            </div>
            <div className="about-stats-grid">
              {STATS.map(({ number, label }) => (
                <div key={label} className="about-stat-card">
                  <div className="about-stat-number">{number}</div>
                  <div className="about-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">What We Stand For</div>
            <h2 className="section-title">Our Core <em style={{ color: 'var(--color-gold)' }}>Values</em></h2>
            <div className="gold-divider center"></div>
          </div>
          <div className="about-values-grid">
            {VALUES.map(({ icon, title, desc }) => (
              <div key={title} className="about-value-card">
                <div className="about-value-icon">
                  <i className={`bi ${icon}`}></i>
                </div>
                <h4 className="about-value-title">{title}</h4>
                <p className="about-value-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="about-timeline-section">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label" style={{ color: 'var(--color-gold-light)' }}>Our Journey</div>
            <h2 className="section-title" style={{ color: 'var(--color-white)' }}>Twenty Years of <em style={{ color: 'var(--color-gold-light)' }}>Milestones</em></h2>
            <div className="gold-divider center"></div>
          </div>
          <div className="about-timeline">
            {MILESTONES.map(({ year, event }, i) => (
              <div key={year} className={`about-timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="about-timeline-dot"></div>
                {i % 2 === 0 ? (
                  <>
                    <div className="about-timeline-content">
                      <div className="about-timeline-year">{year}</div>
                      <p className="about-timeline-event">{event}</p>
                    </div>
                    <div className="about-timeline-spacer"></div>
                  </>
                ) : (
                  <>
                    <div className="about-timeline-spacer"></div>
                    <div className="about-timeline-content">
                      <div className="about-timeline-year">{year}</div>
                      <p className="about-timeline-event">{event}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">The Team</div>
            <h2 className="section-title">Leadership You Can <em style={{ color: 'var(--color-gold)' }}>Trust</em></h2>
            <div className="gold-divider center"></div>
            <p className="section-subtitle">Our leadership team brings over 150 combined years of aviation, hospitality, and technology experience to every decision we make.</p>
          </div>
          <div className="about-leadership-grid">
            {LEADERSHIP.map(({ name, title, bio, image }) => (
              <div key={name} className="about-leadership-card">
                <div className="about-leadership-image">
                  <img src={image} alt={name} loading="lazy" />
                </div>
                <div className="about-leadership-body">
                  <h4 className="about-leadership-name">{name}</h4>
                  <div className="about-leadership-title">{title}</div>
                  <p className="about-leadership-bio">{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Safety & Compliance</div>
            <h2 className="section-title">Certified to the <em style={{ color: 'var(--color-gold)' }}>Highest Standard</em></h2>
            <div className="gold-divider center"></div>
          </div>
          <div className="about-cert-grid">
            {CERTIFICATIONS.map(({ label, sub }) => (
              <div key={label} className="about-cert-card">
                <div className="about-cert-icon">
                  <i className="bi bi-patch-check"></i>
                </div>
                <div className="about-cert-label">{label}</div>
                <div className="about-cert-sub">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <div>
              <div className="section-label" style={{ color: 'var(--color-gold-light)' }}>Ready to Fly?</div>
              <h2>Experience the <em>NairobiJetHouse</em> Difference</h2>
              <p>Whether you're booking your first private flight or managing a fleet of corporate aircraft, we're here to make every journey seamless, safe, and exceptional.</p>
            </div>
            <div className="cta-actions">
              <Link to="/book-flight" className="btn-gold btn-lg">
                <i className="bi bi-airplane"></i> Book a Flight
              </Link>
              <Link to="/contact" className="btn-outline-white btn-lg">
                <i className="bi bi-envelope"></i> Get in Touch
              </Link>
              <Link to="/membership" className="btn-outline-white btn-lg">
                <i className="bi bi-star"></i> View Membership
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* About Mission Grid */
        .about-mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .about-mission-text {
          color: var(--color-dark-gray);
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .about-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .about-stat-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 1.75rem;
          text-align: center;
        }
        .about-stat-number {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-gold);
          line-height: 1.2;
          margin-bottom: 0.3rem;
        }
        .about-stat-label {
          font-family: var(--font-label);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-mid-gray);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Values Grid */
        .about-values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 3rem;
        }
        .about-value-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2rem;
        }
        .about-value-icon {
          width: 52px;
          height: 52px;
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .about-value-icon i {
          font-size: 1.4rem;
          color: var(--color-gold);
        }
        .about-value-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.65rem;
        }
        .about-value-desc {
          font-size: 0.875rem;
          line-height: 1.75;
          color: var(--color-mid-gray);
          margin: 0;
        }

        /* Timeline Section */
        .about-timeline-section {
          padding: 5rem 0;
          background: var(--color-navy);
          position: relative;
          overflow: hidden;
        }
        .about-timeline-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(201,153,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,153,46,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .about-timeline {
          max-width: 720px;
          margin: 3rem auto 0;
          position: relative;
        }
        .about-timeline::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255,255,255,0.1);
          transform: translateX(-50%);
        }
        .about-timeline-item {
          display: flex;
          gap: 2rem;
          margin-bottom: 2.5rem;
          position: relative;
        }
        .about-timeline-item.left {
          flex-direction: row;
        }
        .about-timeline-item.right {
          flex-direction: row-reverse;
        }
        .about-timeline-dot {
          width: 14px;
          height: 14px;
          background: var(--color-gold);
          flex-shrink: 0;
          margin-top: 0.5rem;
          box-shadow: 0 0 0 4px rgba(201,153,46,0.25);
        }
        .about-timeline-content {
          flex: 1;
        }
        .about-timeline-item.left .about-timeline-content {
          text-align: right;
        }
        .about-timeline-item.right .about-timeline-content {
          text-align: left;
        }
        .about-timeline-spacer {
          flex: 1;
        }
        .about-timeline-year {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-gold);
          margin-bottom: 0.4rem;
        }
        .about-timeline-event {
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          line-height: 1.7;
        }

        /* Leadership Grid */
        .about-leadership-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 3rem;
        }
        .about-leadership-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          overflow: hidden;
        }
        .about-leadership-image {
          height: 200px;
          overflow: hidden;
        }
        .about-leadership-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .about-leadership-body {
          padding: 1.25rem;
        }
        .about-leadership-name {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-navy);
          margin-bottom: 0.2rem;
        }
        .about-leadership-title {
          font-size: 0.7rem;
          color: var(--color-gold-dark);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
        }
        .about-leadership-bio {
          font-size: 0.8rem;
          line-height: 1.65;
          color: var(--color-mid-gray);
          margin: 0;
        }

        /* Certifications Grid */
        .about-cert-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 2.5rem;
        }
        .about-cert-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          text-align: center;
          padding: 2rem;
        }
        .about-cert-icon {
          margin-bottom: 1rem;
        }
        .about-cert-icon i {
          font-size: 2rem;
          color: var(--color-gold);
        }
        .about-cert-label {
          font-weight: 700;
          color: var(--color-navy);
          margin-bottom: 0.3rem;
        }
        .about-cert-sub {
          font-size: 0.78rem;
          color: var(--color-mid-gray);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .about-values-grid,
          .about-leadership-grid,
          .about-cert-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 900px) {
          .about-mission-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 768px) {
          .about-values-grid,
          .about-leadership-grid,
          .about-cert-grid {
            grid-template-columns: 1fr;
          }
          .about-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .about-timeline::before {
            left: 16px;
          }
          .about-timeline-item {
            flex-direction: row !important;
            padding-left: 2rem;
          }
          .about-timeline-dot {
            position: absolute;
            left: 0;
            top: 0.5rem;
          }
          .about-timeline-item.left .about-timeline-content,
          .about-timeline-item.right .about-timeline-content {
            text-align: left;
          }
          .about-timeline-spacer {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .about-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}