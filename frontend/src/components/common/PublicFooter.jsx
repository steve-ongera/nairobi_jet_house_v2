import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function PublicFooter() {
  const year = new Date().getFullYear()
  
  return (
    <>
      {/* SEO Metadata */}
      <Helmet>
        <title>Nairobi Jet House | Luxury Private Jet & Superyacht Charter</title>
        <meta name="description" content="Nairobi Jet House offers luxury private aviation and superyacht charter services, connecting discerning travellers to 2,400+ aircraft and 800+ yachts across 187 countries. Available 24/7." />
        <meta name="keywords" content="private jet charter Nairobi, superyacht charter Kenya, luxury aviation Africa, private aviation Nairobi, jet hire Kenya, Nairobi Jet House, long-term aircraft lease, air cargo Kenya" />
        <meta name="author" content="Nairobi Jet House" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.nairobijethouse.com/" />
        <meta property="og:title" content="Nairobi Jet House | Luxury Private Jet & Superyacht Charter" />
        <meta property="og:description" content="Luxury private aviation and superyacht charter, connecting discerning travellers to 2,400+ aircraft and 800+ yachts across 187 countries." />
        <meta property="og:image" content="https://www.nairobijethouse.com/nairobijethouse.png" />
        <meta property="og:site_name" content="Nairobi Jet House" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter / X Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@NairobiJetHouse" />
        <meta name="twitter:title" content="Nairobi Jet House | Luxury Private Jet & Superyacht Charter" />
        <meta name="twitter:description" content="Luxury private aviation and superyacht charter across 187 countries. Book your flight or yacht today." />
        <meta name="twitter:image" content="https://www.nairobijethouse.com/nairobijethouse.png" />

        {/* Schema.org Structured Data */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "Nairobi Jet House",
            "url": "https://www.nairobijethouse.com",
            "logo": "https://www.nairobijethouse.com/nairobijethouse.png",
            "description": "Luxury private aviation and superyacht charter, connecting discerning travellers to 2,400+ aircraft and 800+ yachts across 187 countries.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Nairobi",
              "addressCountry": "KE"
            },
            "telephone": "+254724878136",
            "email": "nairobijethouse@gmail.com",
            "openingHours": "Mo-Su 00:00-23:59",
            "sameAs": [
              "https://www.facebook.com/nairobijethouse",
              "https://www.instagram.com/nairobijethouse",
              "https://www.linkedin.com/company/nairobijethouse",
              "https://x.com/nairobijethouse",
              "https://www.tiktok.com/@nairobijethouse"
            ]
          }
        `}</script>
      </Helmet>

      <footer className="footer-gov">
        <div className="footer-main">
          <div className="container">
            <div className="footer-grid">
              {/* Brand Column */}
              <div className="footer-brand">
                <Link to="/" className="footer-logo">
                  <div className="footer-logo-icon">
                    <img src="/nairobijethouse.png" alt="Nairobi Jet House logo" className="logo-img" />
                  </div>
                  <div>
                    <span className="footer-logo-name">Nairobi</span>
                    <span className="footer-logo-tag">Jet House</span>
                  </div>
                </Link>
                <p className="footer-desc">
                  Luxury private aviation and superyacht charter, connecting discerning travellers 
                  to 2,400+ aircraft and 800+ yachts across 187 countries.
                </p>
                <div className="footer-badges">
                  <span className="footer-badge"><i className="bi bi-shield-check"></i> ARG/US</span>
                  <span className="footer-badge"><i className="bi bi-award"></i> Wyvern Wingman</span>
                  <span className="footer-badge"><i className="bi bi-star"></i> 5-Star Safety</span>
                </div>
                <div className="footer-socials">
                  <a href="https://www.facebook.com/nairobijethouse" className="social-icon" aria-label="Facebook" target="_blank" rel="noreferrer">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="https://www.instagram.com/nairobijethouse" className="social-icon" aria-label="Instagram" target="_blank" rel="noreferrer">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="https://www.linkedin.com/company/nairobijethouse" className="social-icon" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                    <i className="bi bi-linkedin"></i>
                  </a>
                  <a href="https://x.com/nairobijethouse" className="social-icon" aria-label="X (Twitter)" target="_blank" rel="noreferrer">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                  <a href="https://www.tiktok.com/@nairobijethouse" className="social-icon" aria-label="TikTok" target="_blank" rel="noreferrer">
                    <i className="bi bi-tiktok"></i>
                  </a>
                  <a href="https://wa.me/254724878136" className="social-icon" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                    <i className="bi bi-whatsapp"></i>
                  </a>
                </div>
              </div>

              {/* Services + Company + Developer Credit (spans 2 columns) */}
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Services and Company side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem' }}>

                  {/* Services Column */}
                  <div>
                    <h4 className="footer-col-title">Services</h4>
                    <div className="footer-links-list">
                      <Link to="/private-jet-charter" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Private Jet Charter
                      </Link>
                      <Link to="/book-yacht" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Superyacht Charter
                      </Link>
                      <Link to="/lease" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Long-Term Leasing
                      </Link>
                      <Link to="/air-cargo" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Air Cargo
                      </Link>
                      <Link to="/group-charter" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Group Charter
                      </Link>
                      <Link to="/contact" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Aircraft Sales
                      </Link>
                    </div>
                  </div>

                  {/* Company Column */}
                  <div>
                    <h4 className="footer-col-title">Company</h4>
                    <div className="footer-links-list">
                      <Link to="/about" className="footer-link">
                        <i className="bi bi-chevron-right"></i>About Us
                      </Link>
                      <Link to="/fleet" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Our Fleet
                      </Link>
                      <Link to="/yachts" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Yachts
                      </Link>
                      <Link to="/membership" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Membership
                      </Link>
                      <Link to="/careers" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Careers
                      </Link>
                      <Link to="/contact" className="footer-link">
                        <i className="bi bi-chevron-right"></i>Contact
                      </Link>
                    </div>
                  </div>

                </div>

                {/* Developer Credit — full width across both columns */}
                <div style={{
                  paddingTop: '1.1rem',
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: '0.2rem',
                  }}>
                    Site developed by
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: 'var(--color-white)',
                    marginBottom: '0.3rem',
                    letterSpacing: '0.01em',
                  }}>
                    STEVE ONGERA
                  </p>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <a href="tel:0112284093" style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '0.82rem',
                      color: 'var(--color-gold)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}>
                      <i className="bi bi-telephone-fill" style={{ fontSize: '0.75rem' }}></i>
                      0112 284 093
                    </a>
                    <a href="tel:0757790687" style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '0.82rem',
                      color: 'var(--color-gold)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}>
                      <i className="bi bi-telephone-fill" style={{ fontSize: '0.75rem' }}></i>
                      0757 790 687
                    </a>
                  </div>
                </div>

              </div>

              {/* Contact & Newsletter Column */}
              <div>
                <h4 className="footer-col-title">Contact</h4>
                <div className="footer-contact-item">
                  <i className="bi bi-telephone-fill"></i>
                  <a href="tel:+254724878136">+254 724 878 136</a>
                </div>
                <div className="footer-contact-item">
                  <i className="bi bi-envelope-fill"></i>
                  <a href="mailto:nairobijethouse@gmail.com">nairobijethouse@gmail.com</a>
                </div>
                <div className="footer-contact-item">
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>Nairobi, Kenya</span>
                </div>
                <div className="footer-contact-item">
                  <i className="bi bi-clock-fill"></i>
                  <span>24 / 7 Concierge</span>
                </div>

                <span className="footer-newsletter-label">Newsletter</span>
                <div className="footer-newsletter">
                  <input 
                    type="email" 
                    className="newsletter-input" 
                    placeholder="Your email address"
                    aria-label="Email for newsletter"
                  />
                  <button className="newsletter-btn" aria-label="Subscribe">
                    <i className="bi bi-send"></i>
                  </button>
                </div>
                <div className="newsletter-hint">
                  <i className="bi bi-shield-check"></i>
                  Weekly updates, no spam
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <Link to="/track" className="btn-outline-white" style={{ padding: '0.55rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="bi bi-search"></i> Track Booking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <div className="footer-bottom-inner">
              <div className="footer-bottom-left">
                <span>© {year} Nairobi Jet House.</span>
                <span>All rights reserved.</span>
              </div>
              <div className="footer-bottom-links">
                <Link to="/privacy">Privacy Policy</Link>
                <span className="footer-bottom-sep">•</span>
                <Link to="/terms">Terms of Service</Link>
                <span className="footer-bottom-sep">•</span>
                <Link to="/cookies">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}