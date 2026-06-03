// src/pages/public/About.jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const LEADERSHIP = [
  { name: 'Captain Michael Ochieng', title: 'Chief Executive Officer', bio: 'Former pilot with 25+ years in private aviation across Africa. Built Nairobi Jet House from the ground up.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { name: 'Grace Wanjiku', title: 'Head of Operations', bio: 'Ex-Kenya Airways operations director. Manages our 24/7 dispatch and concierge team.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
  { name: 'David Kimathi', title: 'Chief Pilot', bio: 'Type-rated on 8 aircraft types. Oversees all flight operations and safety protocols.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
  { name: 'Sarah Muthoni', title: 'Client Experience Director', bio: 'Luxury hospitality expert ensuring every journey exceeds expectations.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
]

// Trusted Partners with local images from /logo folder
const TRUSTED_PARTNERS = [
  { name: 'Safaricom', logo: '/logo/safaricom_logo.png', width: '120px' },
  { name: 'Coca-Cola', logo: '/logo/cocacola_logo.png', width: '100px' },
  { name: 'KCB Bank', logo: '/logo/kcb_logo.png', width: '100px' },
  { name: 'Equity Bank', logo: '/logo/equity_logo.png', width: '120px' },
  { name: 'Kenya Airways', logo: '/logo/kq_logo.png', width: '120px' },
  { name: 'Visa', logo: '/logo/visa_logo.png', width: '80px' },
  { name: 'Microsoft', logo: '/logo/microsoft_logo.png', width: '120px' },
  { name: 'Samsung', logo: '/logo/samsung.png', width: '100px' },
]

const STATS = [
  { number: '12,000+', label: 'Successful Flights' },
  { number: '15', label: 'African Destinations' },
  { number: '24/7', label: 'Operations & Support' },
  { number: '100%', label: 'Safety Record' },
]

const WHY_CHOOSE_US = [
  { icon: 'bi-airplane', title: 'Diverse Fleet', desc: 'Modern aircraft ranging from light jets for quick trips to spacious cabins for transcontinental comfort.' },
  { icon: 'bi-shield-check', title: 'Safety First', desc: 'Rigorous safety standards and highly trained crew ensure your peace of mind at every altitude.' },
  { icon: 'bi-gem', title: 'Luxury Service', desc: 'Bespoke catering, premium amenities, and personalized service tailored to your preferences.' },
  { icon: 'bi-globe2', title: 'Global Reach', desc: 'Connect to destinations across Africa and beyond with our extensive network.' },
]

const OBJECTIVES = [
  { icon: 'bi-shield-check', text: 'Maintain 100% safety record' },
  { icon: 'bi-geo-alt', text: 'Expand to 15 African destinations' },
  { icon: 'bi-star', text: 'Delight every client with bespoke services' },
  { icon: 'bi-leaf', text: 'Invest in sustainable aviation technology' },
]

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Nairobi Jet House',
  description: 'Since 2010, Nairobi Jet House has been redefining luxury air travel across Africa and beyond. Kenyan-based aircraft charter specialist providing premium charter flights.',
  url: 'https://www.nairobijethouse.com/about',
}

/* ─── Moving Partners Carousel ────────────────────────────────────────────── */
function MovingPartners() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const speed = 1;
    
    const animate = () => {
      if (scrollContainer) {
        scrollAmount += speed;
        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollAmount = 0;
        }
        scrollContainer.scrollLeft = scrollAmount;
      }
      requestAnimationFrame(animate);
    };
    
    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, []);

  // Duplicate partners for seamless looping
  const allPartners = [...TRUSTED_PARTNERS, ...TRUSTED_PARTNERS, ...TRUSTED_PARTNERS];

  return (
    <div className="partners-marquee">
      <div className="partners-marquee__content" ref={scrollRef}>
        {allPartners.map((partner, idx) => (
          <div key={idx} className="partner-item">
            <div className="partner-logo">
              <img 
                src={partner.logo} 
                alt={partner.name} 
                style={{ maxWidth: partner.width, maxHeight: '50px', objectFit: 'contain' }}
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us | Nairobi Jet House - Luxury Private Aviation Since 2010</title>
        <meta name="description" content="Since 2010, Nairobi Jet House has been redefining luxury air travel across Africa and beyond. KCAA certified, 12,000+ successful flights, 24/7 operations." />
        <meta name="keywords" content="Nairobi Jet House, private aviation Kenya, luxury air travel, aircraft charter, private jet Kenya" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/about" />
        <meta property="og:title" content="About Nairobi Jet House | Private Aviation Excellence Since 2010" />
        <meta property="og:description" content="Kenyan-based aircraft charter specialist providing premium charter flights across Africa and beyond." />
        <meta property="og:image" content="https://www.nairobijethouse.com/images/about-hero.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section with SEO Image */}
      <div className="page-header" style={{ 
        backgroundImage: 'linear-gradient(140deg, var(--color-navy-dark) 0%, var(--color-navy) 55%, var(--color-navy-light) 100%), url(https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundBlend: 'overlay',
      }}>
        <div className="page-header__glow"></div>
        <div className="container page-header__inner">
          <span className="section-label">
            <i className="bi bi-building"></i> Our Story
          </span>
          <h1>Elevating Your <em style={{ color: 'var(--color-gold-light)' }}>Travel Experience</em></h1>
          <p>Since 2010, Nairobi Jet House has been redefining luxury air travel across Africa and beyond. We combine African hospitality with global aviation standards to deliver unparalleled private jet experiences.</p>
          <div className="hero-contact">
            <a href="tel:+254780729617" className="btn-outline-white">
              <i className="bi bi-telephone-fill"></i> +254 780 729 617
            </a>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Why Choose Nairobi Jet House</div>
            <h2 className="section-title">African Hospitality Meets <em style={{ color: 'var(--color-gold)' }}>Global Standards</em></h2>
            <div className="gold-divider center"></div>
            <p className="section-subtitle">We combine African hospitality with global aviation standards to deliver unparalleled private jet experiences.</p>
          </div>
          <div className="about-why-grid">
            {WHY_CHOOSE_US.map(({ icon, title, desc }) => (
              <div key={title} className="about-why-card">
                <div className="about-why-icon">
                  <i className={`bi ${icon}`}></i>
                </div>
                <h4 className="about-why-title">{title}</h4>
                <p className="about-why-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding">
        <div className="container">
          <div className="about-stats-grid-full">
            {STATS.map(({ number, label }) => (
              <div key={label} className="about-stat-card">
                <div className="about-stat-number">{number}</div>
                <div className="about-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="about-vm-grid">
            <div className="about-vision">
              <div className="section-label">Our Vision</div>
              <h3 className="about-vm-title">To revolutionize private aviation</h3>
              <p>Making high-end, on-demand chartered flights easily accessible, offering unparalleled comfort, flexibility, and exceptional service.</p>
            </div>
            <div className="about-mission">
              <div className="section-label">Our Mission</div>
              <h3 className="about-vm-title">Personalized, efficient, reliable</h3>
              <p>Providing private air travel solutions, connecting our clients to the world in the fastest, most comfortable way possible while delivering exceptional customer service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Our Objectives</div>
            <h2 className="section-title">Commitment to <em style={{ color: 'var(--color-gold)' }}>Excellence</em></h2>
            <div className="gold-divider center"></div>
          </div>
          <div className="about-objectives-grid">
            {OBJECTIVES.map(({ icon, text }) => (
              <div key={text} className="about-objective-card">
                <i className={`bi ${icon}`}></i>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Detailed Section with SEO Image */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-content">
              <div className="section-label">Our Story</div>
              <h2 className="section-title">Kenyan-Based <em style={{ color: 'var(--color-gold)' }}>Aircraft Charter</em> Specialist</h2>
              <div className="gold-divider"></div>
              <p>Nairobi Jet House is a Kenyan-based aircraft charter specialist located in Nairobi, Kenya, providing premium charter flights for the aviation industry. As a dynamic company, we're establishing a presence in major commercial and aviation hubs through strategic partnerships and venture capital.</p>
              <p className="about-story-highlight">What sets us apart is our commitment to African hospitality combined with global aviation standards. Our team understands the unique travel needs within the region while maintaining international best practices.</p>
              <div className="about-story-badges">
                <span className="badge-gold"><i className="bi bi-check-circle-fill"></i> Certified by Kenya Civil Aviation Authority</span>
                <span className="badge-gold"><i className="bi bi-clock-history"></i> 24/7 operations and support</span>
              </div>
            </div>
            <div className="about-story-image">
              <img 
                src="https://images.unsplash.com/photo-1542296332-2e4473faf563?w=600&q=80" 
                alt="Nairobi Jet House private jet on tarmac" 
                loading="lazy"
              />
              <div className="about-story-image-caption">Our fleet ready for your next journey</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners - Moving Marquee with Local Brand Images */}
      <section className="partners-section">
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Trusted By Industry Leaders</div>
            <h2 className="section-title">Our <em style={{ color: 'var(--color-gold)' }}>Partners</em></h2>
            <div className="gold-divider center"></div>
            <p className="section-subtitle">We collaborate with the best in aviation and business to ensure exceptional service quality</p>
          </div>
        </div>
        <MovingPartners />
      </section>

      {/* Leadership Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Meet Our Aviation Experts</div>
            <h2 className="section-title">The Dedicated Professionals Who <em style={{ color: 'var(--color-gold)' }}>Make Your Journey</em> Exceptional</h2>
            <div className="gold-divider center"></div>
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

      {/* CTA Section */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content">
            <div>
              <div className="section-label" style={{ color: 'var(--color-gold-light)' }}>Ready to Fly?</div>
              <h2>Experience the <em>Nairobi Jet House</em> Difference</h2>
              <p>Whether you're flying for business or leisure, we're here to make every journey seamless, safe, and exceptional.</p>
            </div>
            <div className="cta-actions">
              <Link to="/book-flight" className="btn-gold btn-lg">
                <i className="bi bi-airplane"></i> Book a Flight
              </Link>
              <Link to="/contact" className="btn-outline-white btn-lg">
                <i className="bi bi-envelope"></i> Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Hero Contact */
        .hero-contact {
          margin-top: 1.5rem;
        }

        /* Why Choose Us Grid */
        .about-why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }
        .about-why-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2rem;
          text-align: center;
        }
        .about-why-icon {
          width: 60px;
          height: 60px;
          background: var(--color-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .about-why-icon i {
          font-size: 1.6rem;
          color: var(--color-gold);
        }
        .about-why-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }
        .about-why-desc {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--color-mid-gray);
          margin: 0;
        }

        /* Stats Grid Full */
        .about-stats-grid-full {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        /* Vision & Mission Grid */
        .about-vm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }
        .about-vision, .about-mission {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2rem;
        }
        .about-vm-title {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-navy);
          margin: 0.5rem 0 1rem;
        }
        .about-vision p, .about-mission p {
          color: var(--color-dark-gray);
          line-height: 1.7;
          margin: 0;
        }

        /* Objectives Grid */
        .about-objectives-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .about-objective-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .about-objective-card i {
          font-size: 1.8rem;
          color: var(--color-gold);
        }
        .about-objective-card span {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-navy);
          text-align: center;
        }

        /* Story Grid */
        .about-story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }
        .about-story-highlight {
          font-weight: 500;
          color: var(--color-navy);
          border-left: 3px solid var(--color-gold);
          padding-left: 1rem;
          margin: 1rem 0;
        }
        .about-story-badges {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .about-story-badges .badge-gold {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.8rem;
        }
        .about-story-image {
          position: relative;
        }
        .about-story-image img {
          width: 100%;
          height: 350px;
          object-fit: cover;
        }
        .about-story-image-caption {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--color-mid-gray);
          text-align: center;
        }

        /* Partners Marquee */
        .partners-section {
          padding: 4rem 0;
          background: var(--color-white);
          overflow: hidden;
        }
        .partners-marquee {
          width: 100%;
          overflow: hidden;
          margin-top: 2rem;
        }
        .partners-marquee__content {
          display: flex;
          gap: 3rem;
          overflow-x: auto;
          scrollbar-width: none;
          white-space: nowrap;
          padding: 1rem 0;
        }
        .partners-marquee__content::-webkit-scrollbar {
          display: none;
        }
        .partner-item {
          flex-shrink: 0;
        }
        .partner-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60px;
          padding: 0 1rem;
          transition: all var(--transition-base);
        }
        .partner-logo img {
          filter: grayscale(100%);
          opacity: 0.7;
          transition: all var(--transition-base);
        }
        .partner-logo:hover img {
          filter: grayscale(0%);
          opacity: 1;
          transform: scale(1.05);
        }

        /* Stat Card */
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
          height: 220px;
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

        /* Responsive */
        @media (max-width: 1024px) {
          .about-why-grid,
          .about-stats-grid-full,
          .about-objectives-grid,
          .about-leadership-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 900px) {
          .about-vm-grid,
          .about-story-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .about-story-image img {
            height: 250px;
          }
        }
        @media (max-width: 768px) {
          .about-why-grid,
          .about-stats-grid-full,
          .about-objectives-grid,
          .about-leadership-grid {
            grid-template-columns: 1fr;
          }
          .about-story-badges {
            flex-direction: column;
          }
          .partner-logo {
            height: 50px;
          }
          .partner-logo img {
            max-width: 80px !important;
          }
        }
      `}</style>
    </>
  );
}