import { Link } from 'react-router-dom'

export default function PublicFooter() {
  const year = new Date().getFullYear()
  
  return (
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
                <a href="#" className="social-icon" aria-label="Instagram" target="_blank" rel="noreferrer">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                  <i className="bi bi-linkedin"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Twitter" target="_blank" rel="noreferrer">
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a href="#" className="social-icon" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                  <i className="bi bi-whatsapp"></i>
                </a>
              </div>
            </div>

            {/* Services Column */}
            <div>
              <h4 className="footer-col-title">Services</h4>
              <div className="footer-links-list">
                <Link to="/book-flight" className="footer-link">
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
                <Link to="/contact" className="footer-link">
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

            {/* Contact & Newsletter Column */}
            <div>
              <h4 className="footer-col-title">Contact</h4>
              <div className="footer-contact-item">
                <i className="bi bi-telephone-fill"></i>
                <a href="tel:+254700000000">+254 700 000 000</a>
              </div>
              <div className="footer-contact-item">
                <i className="bi bi-envelope-fill"></i>
                <a href="mailto:ops@nairobijethouse.com">ops@nairobijethouse.com</a>
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
  )
}