import { Link } from 'react-router-dom'

export default function PublicFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <span className="footer-logo">
              <i className="bi bi-airplane-fill" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
              Nairobi<span>Jet</span>House
            </span>
            <p>Luxury private aviation and superyacht charter, connecting discerning travellers to 2,400+ aircraft and 800+ yachts across 187 countries.</p>
            <div className="footer-social" style={{ marginTop: '1.5rem' }}>
              {[['bi-instagram','#'],['bi-linkedin','#'],['bi-twitter-x','#'],['bi-whatsapp','#']].map(([icon, href]) => (
                <a key={icon} href={href} target="_blank" rel="noreferrer"><i className={`bi ${icon}`} /></a>
              ))}
            </div>
          </div>

          <div>
            <span className="footer-head">Services</span>
            <div className="footer-links">
              <Link to="/book-flight">Private Jet Charter</Link>
              <Link to="/book-yacht">Superyacht Charter</Link>
              <Link to="/book-flight">Long-Term Leasing</Link>
              <Link to="/contact">Air Cargo</Link>
              <Link to="/contact">Group Charter</Link>
              <Link to="/contact">Aircraft Sales</Link>
            </div>
          </div>

          <div>
            <span className="footer-head">Company</span>
            <div className="footer-links">
              <Link to="/about">About Us</Link>
              <Link to="/fleet">Our Fleet</Link>
              <Link to="/yachts">Yachts</Link>
              <Link to="/membership">Membership</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <span className="footer-head">Contact</span>
            <div className="footer-contact">
              <a href="tel:+254700000000"><i className="bi bi-telephone" /> +254 700 000 000</a>
              <a href="mailto:ops@nairobijethouse.com"><i className="bi bi-envelope" /> ops@nairobijethouse.com</a>
              <a href="#"><i className="bi bi-geo-alt" /> Nairobi, Kenya</a>
              <a href="#"><i className="bi bi-clock" /> 24 / 7 Concierge</a>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/track" className="btn btn-outline-gold btn-sm">
                <i className="bi bi-search" /> Track Booking
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} NairobiJetHouse. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}