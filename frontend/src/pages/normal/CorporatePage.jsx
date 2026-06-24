// src/pages/normal/CorporatePage.jsx

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Corporate Aviation Solutions | Nairobi Jet House',
  description: 'Tailored corporate aviation solutions for businesses including executive travel, group charters, and corporate jet management.',
  url: 'https://www.nairobijethouse.com/corporate',
};

const CORPORATE_FEATURES = [
  {
    icon: 'bi-building',
    title: 'Executive Travel',
    desc: 'Tailored solutions for C-suite executives, board members, and key stakeholders requiring seamless, efficient travel.',
  },
  {
    icon: 'bi-people',
    title: 'Group Charters',
    desc: 'Coordinated travel for corporate groups, teams, and delegations with flexible scheduling and dedicated service.',
  },
  {
    icon: 'bi-calendar-check',
    title: 'On-Demand Availability',
    desc: '24/7 aircraft availability with short notice capabilities for urgent business needs and schedule changes.',
  },
  {
    icon: 'bi-shield-check',
    title: 'Corporate Safety',
    desc: 'Strict adherence to international safety standards with enhanced corporate security protocols.',
  },
  {
    icon: 'bi-graph-up',
    title: 'Cost Optimization',
    desc: 'Transparent pricing, volume discounts, and efficient routing to maximize your travel budget.',
  },
  {
    icon: 'bi-headset',
    title: 'Dedicated Account Manager',
    desc: 'A single point of contact for all your corporate aviation needs with personalized service.',
  },
];

const CORPORATE_BENEFITS = [
  {
    number: '24/7',
    label: 'Availability',
    desc: 'Around-the-clock access to our fleet and support team.',
  },
  {
    number: '15+',
    label: 'African Destinations',
    desc: 'Extensive network across the continent and beyond.',
  },
  {
    number: '100%',
    label: 'Safety Record',
    desc: 'Uncompromising commitment to safety and reliability.',
  },
  {
    number: '60min',
    label: 'Response Time',
    desc: 'Guaranteed response to all corporate inquiries.',
  },
];

const INDUSTRY_SECTORS = [
  { icon: 'bi-bank', label: 'Banking & Finance' },
  { icon: 'bi-box-seam', label: 'Logistics & Supply Chain' },
  { icon: 'bi-hospital', label: 'Healthcare & Medical' },
  { icon: 'bi-oil', label: 'Oil, Gas & Mining' },
  { icon: 'bi-globe2', label: 'Diplomatic & Government' },
  { icon: 'bi-building', label: 'Real Estate & Construction' },
  { icon: 'bi-laptop', label: 'Technology & Innovation' },
  { icon: 'bi-briefcase', label: 'Professional Services' },
];

export default function CorporatePage() {
  return (
    <>
      <Helmet>
        <title>Corporate Aviation Solutions | Nairobi Jet House</title>
        <meta name="description" content="Tailored corporate aviation solutions for businesses including executive travel, group charters, and corporate jet management. 24/7 availability across Africa." />
        <meta name="keywords" content="corporate aviation, business travel, executive jets, group charters, Nairobi Jet House, corporate flights" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/corporate" />
        <meta property="og:title" content="Corporate Aviation Solutions | Nairobi Jet House" />
        <meta property="og:description" content="Tailored corporate aviation solutions for businesses across Africa." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <div className="page-header" style={{
        backgroundImage: 'linear-gradient(140deg, var(--color-navy-dark) 0%, var(--color-navy) 55%, var(--color-navy-light) 100%), url(https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundBlend: 'overlay',
      }}>
        <div className="page-header__glow"></div>
        <div className="container page-header__inner">
          <span className="section-label">
            <i className="bi bi-briefcase"></i> Corporate Solutions
          </span>
          <h1>Elevating <em style={{ color: 'var(--color-gold-light)' }}>Corporate</em> Aviation</h1>
          <p>Tailored private aviation solutions for businesses, executives, and organizations across Africa and beyond.</p>
          <div className="hero-contact">
            <Link to="/contact" className="btn-gold">
              <i className="bi bi-envelope"></i> Contact Corporate Team
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="corporate-stats-grid">
            {CORPORATE_BENEFITS.map((stat) => (
              <div key={stat.label} className="corporate-stat-card">
                <div className="corporate-stat-number">{stat.number}</div>
                <div className="corporate-stat-label">{stat.label}</div>
                <div className="corporate-stat-desc">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Why Choose Us</div>
            <h2 className="section-title">Corporate Aviation <em style={{ color: 'var(--color-gold)' }}>Solutions</em></h2>
            <div className="gold-divider center"></div>
            <p className="section-subtitle">Comprehensive aviation services designed specifically for corporate clients with demanding travel requirements.</p>
          </div>
          <div className="corporate-features-grid">
            {CORPORATE_FEATURES.map((feature) => (
              <div key={feature.title} className="corporate-feature-card">
                <div className="corporate-feature-icon">
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h4 className="corporate-feature-title">{feature.title}</h4>
                <p className="corporate-feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Sectors Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Industry Sectors</div>
            <h2 className="section-title">Trusted by <em style={{ color: 'var(--color-gold)' }}>Leading Organizations</em></h2>
            <div className="gold-divider center"></div>
            <p className="section-subtitle">We serve a diverse range of industries with specialized aviation solutions.</p>
          </div>
          <div className="corporate-sectors-grid">
            {INDUSTRY_SECTORS.map((sector) => (
              <div key={sector.label} className="corporate-sector-card">
                <i className={`bi ${sector.icon}`}></i>
                <span>{sector.label}</span>
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
              <div className="section-label" style={{ color: 'var(--color-gold-light)' }}>Corporate Enquiries</div>
              <h2>Let's Discuss Your <em>Corporate Aviation</em> Needs</h2>
              <p>Our corporate team is ready to design a tailored aviation solution that meets your organization's unique requirements.</p>
            </div>
            <div className="cta-actions">
              <Link to="/contact" className="btn-gold btn-lg">
                <i className="bi bi-envelope"></i> Get in Touch
              </Link>
              <a href="tel:+254780729617" className="btn-outline-white btn-lg">
                <i className="bi bi-telephone"></i> Call Corporate Team
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Corporate Stats */
        .corporate-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        .corporate-stat-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2rem;
          text-align: center;
        }
        .corporate-stat-number {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-gold);
          line-height: 1.2;
        }
        .corporate-stat-label {
          font-family: var(--font-label);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-mid-gray);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 0.25rem;
        }
        .corporate-stat-desc {
          font-size: 0.8rem;
          color: var(--color-dark-gray);
          margin-top: 0.5rem;
        }

        /* Corporate Features */
        .corporate-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }
        .corporate-feature-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2rem;
          text-align: center;
        }
        .corporate-feature-icon {
          width: 60px;
          height: 60px;
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .corporate-feature-icon i {
          font-size: 1.6rem;
          color: var(--color-gold);
        }
        .corporate-feature-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }
        .corporate-feature-desc {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--color-mid-gray);
          margin: 0;
        }

        /* Corporate Sectors */
        .corporate-sectors-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .corporate-sector-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .corporate-sector-card i {
          font-size: 2rem;
          color: var(--color-gold);
        }
        .corporate-sector-card span {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-navy);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .corporate-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .corporate-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .corporate-sectors-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .corporate-stats-grid,
          .corporate-features-grid,
          .corporate-sectors-grid {
            grid-template-columns: 1fr;
          }
          .corporate-sector-card {
            flex-direction: row;
            justify-content: center;
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
}