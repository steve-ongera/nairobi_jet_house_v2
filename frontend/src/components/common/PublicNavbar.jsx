import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const SERVICES = [
  { icon: 'bi-airplane',          label: 'Private Jet Charter',  desc: 'Airport to airport, worldwide',        href: '/book-flight' },
  { icon: 'bi-water',             label: 'Superyacht Charter',   desc: 'Mediterranean, Caribbean & beyond',    href: '/book-yacht' },
  { icon: 'bi-file-earmark-text', label: 'Long-Term Leasing',    desc: 'Dedicated aircraft & yacht programs',  href: '/lease' },
  { icon: 'bi-send',              label: 'Flight Inquiry',       desc: 'Explore options, no commitment',       href: '/book-flight' },
  { icon: 'bi-boxes',             label: 'Air Cargo',            desc: 'Gold, minerals, pharma & freight',     href: '/air-cargo' },
  { icon: 'bi-people',            label: 'Group Charter',        desc: 'Corporate, sports & incentives',       href: '/contact' },
]

const PORTAL_MAP = {
  admin:    '/admin',
  staff:    '/staff',
  client:   '/member',
  owner:    '/owner',
  operator: '/operator',
}

export default function PublicNavbar({ dark = false }) {
  const { user, logout }        = useAuth()
  const navigate                = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawer] = useState(false)
  const [servOpen, setServ]     = useState(false)
  const [userOpen, setUser]     = useState(false)
  const servRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (servRef.current && !servRef.current.contains(e.target)) setServ(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUser(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const handleLogout = () => { logout(); navigate('/'); setDrawer(false) }

  const navbarClass = `navbar${scrolled ? ' scrolled' : ''}${dark && !scrolled ? ' navbar-dark-mode' : ''}`

  return (
    <>
      <style>{`
        .navbar-dark-mode {
          background: rgba(11,29,58,0.15) !important;
          border-bottom-color: rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(12px);
        }
        .navbar-dark-mode .navbar-links a,
        .navbar-dark-mode .dropdown-toggle { color: rgba(255,255,255,0.92) !important; }
        .navbar-dark-mode .navbar-links a:hover,
        .navbar-dark-mode .dropdown-toggle:hover { background: transparent !important; color: inherit !important; }
        .navbar-dark-mode .sign-in-btn { border-color: rgba(255,255,255,0.5) !important; color: #fff !important; }
        .navbar-dark-mode .sign-in-btn:hover { background: rgba(255,255,255,0.15) !important; }
        .navbar-dark-mode .navbar-cta-btn { background: var(--gold) !important; color: var(--navy) !important; }
        .navbar-dark-mode .navbar-toggle { color: #fff !important; }
        .navbar-dark-mode .navbar-logo-wordmark { color: rgba(255,255,255,0.88) !important; }
        .navbar-dark-mode .navbar-logo-divider  { color: rgba(255,255,255,0.4) !important; }

        /* Nav links — no hover background, underline active only */
        .navbar-links a {
          background: transparent !important;
          text-decoration: none !important;
        }
        .navbar-links a:hover {
          background: transparent !important;
          text-decoration: none !important;
        }
        .navbar-links a.active {
          text-decoration: underline !important;
          text-underline-offset: 4px !important;
          text-decoration-thickness: 2px !important;
          background: transparent !important;
        }

        /* Logo lockup */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none !important;
        }
        .navbar-logo-wordmark {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          color: var(--navy);
          letter-spacing: 0.01em;
        }
        .navbar-logo-divider {
          color: var(--gray-400, #aaa);
          font-weight: 300;
          font-size: 1rem;
          line-height: 1;
        }
        .navbar-logo-name {
          font-weight: 700;
          white-space: nowrap;
        }
      `}</style>

      <nav className={navbarClass}>
        <div className="navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img
              src="/logo.png"
              alt="Nairobi Jet House"
              style={{ height: '2.24em', width: 'auto', display: 'block' }}
            />
            <span className="navbar-logo-wordmark">
              <span className="navbar-logo-divider">|</span>
              <span className="navbar-logo-name">Nairobi Jet House</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="navbar-links">
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/fleet">Fleet</NavLink></li>
            <li><NavLink to="/yachts">Yachts</NavLink></li>

            {/* Services dropdown */}
            <li ref={servRef} className="dropdown">
              <button className={`dropdown-toggle${servOpen ? ' open' : ''}`} onClick={() => setServ(s => !s)}>
                Services <i className={`bi bi-chevron-${servOpen ? 'up' : 'down'}`} />
              </button>
              {servOpen && (
                <div className="dropdown-menu services-menu">
                  <div className="dropdown-header">Our Services</div>
                  <div className="services-grid">
                    {SERVICES.map(s => (
                      <Link key={s.label} to={s.href} className="service-item" onClick={() => setServ(false)}>
                        <div className="service-icon"><i className={`bi ${s.icon}`} /></div>
                        <div className="service-info">
                          <div className="service-label">{s.label}</div>
                          <div className="service-desc">{s.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <Link to="/track" className="track-link" onClick={() => setServ(false)}>
                      <i className="bi bi-search" /> Track a booking
                    </Link>
                    <Link to="/membership" className="track-link" onClick={() => setServ(false)}>
                      <i className="bi bi-star" /> Membership
                    </Link>
                  </div>
                </div>
              )}
            </li>

            <li><NavLink to="/book-flight">Private Charter</NavLink></li>
            <li><NavLink to="/lease">Leasing</NavLink></li>
            <li><NavLink to="/air-cargo">Air Cargo</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <div ref={userRef} className="dropdown">
                <button className={`user-menu-btn${userOpen ? ' open' : ''}`} onClick={() => setUser(u => !u)}>
                  <i className="bi bi-person-circle" />
                  <span className="user-name">{user.first_name || user.username}</span>
                  <i className={`bi bi-chevron-${userOpen ? 'up' : 'down'}`} style={{ fontSize: '0.6rem' }} />
                </button>
                {userOpen && (
                  <div className="dropdown-menu user-menu">
                    <div className="user-info">
                      <div className="user-name-full">{user.first_name} {user.last_name}</div>
                      <div className="user-email">{user.email}</div>
                      <span className="user-role-badge">{user.role}</span>
                    </div>
                    <div className="user-menu-links">
                      {PORTAL_MAP[user.role] && (
                        <Link to={PORTAL_MAP[user.role]} className="user-menu-link" onClick={() => setUser(false)}>
                          <i className="bi bi-grid-1x2" /> My Portal
                        </Link>
                      )}
                      <Link to="/track" className="user-menu-link" onClick={() => setUser(false)}>
                        <i className="bi bi-search" /> Track Booking
                      </Link>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="sign-in-btn">Sign In</Link>
                <Link to="/book-flight" className="btn btn-gold btn-sm navbar-cta-btn">
                  <i className="bi bi-airplane" /> Book Now
                </Link>
              </>
            )}
            <button className="navbar-toggle" onClick={() => setDrawer(true)} aria-label="Menu">
              <i className="bi bi-list" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawer(false)} />
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.png" alt="Nairobi Jet House" style={{ height: '1.8rem', width: 'auto', display: 'block' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>Nairobi Jet House</span>
          </div>
          <button className="drawer-close" onClick={() => setDrawer(false)}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <nav className="drawer-nav">
          <div className="drawer-section-label">Book</div>
          {[
            ['/',            'bi-house',     'Home'],
            ['/book-flight', 'bi-airplane',  'Book a Flight'],
            ['/book-yacht',  'bi-water',     'Charter a Yacht'],
            ['/fleet',       'bi-grid-3x3',  'Browse Fleet'],
            ['/yachts',      'bi-grid-3x3',  'Browse Yachts'],
            ['/track',       'bi-search',    'Track Booking'],
          ].map(([to, icon, label]) => (
            <Link key={to} to={to} className="drawer-link" onClick={() => setDrawer(false)}>
              <i className={`bi ${icon}`} />{label}
            </Link>
          ))}

          <div className="drawer-divider" />
          <div className="drawer-section-label">Explore</div>
          {[
            ['/services',    'bi-grid',              'Services'],
            ['/membership',  'bi-star',              'Membership'],
            ['/book-flight', 'bi-airplane',          'Private Charter'],
            ['/lease',       'bi-file-earmark-text', 'Leasing'],
            ['/air-cargo',   'bi-boxes',             'Air Cargo'],
            ['/contact',     'bi-envelope',          'Contact'],
          ].map(([to, icon, label]) => (
            <Link key={to + label} to={to} className="drawer-link" onClick={() => setDrawer(false)}>
              <i className={`bi ${icon}`} />{label}
            </Link>
          ))}

          {user && (
            <>
              <div className="drawer-divider" />
              <div className="drawer-section-label">My Account</div>
              {PORTAL_MAP[user.role] && (
                <Link to={PORTAL_MAP[user.role]} className="drawer-link" onClick={() => setDrawer(false)}>
                  <i className="bi bi-grid-1x2" /> My Portal
                </Link>
              )}
              <button className="drawer-logout-btn" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right" /> Sign Out
              </button>
            </>
          )}
        </nav>

        <div className="drawer-footer">
          {!user ? (
            <>
              <p className="drawer-footer-text">New to NairobiJetHouse?</p>
              <Link to="/book-flight" className="btn btn-navy drawer-footer-btn" onClick={() => setDrawer(false)}>
                <i className="bi bi-airplane" /> Book a Flight
              </Link>
            </>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
              Signed in as <strong style={{ color: 'var(--navy)' }}>{user.username}</strong>
            </div>
          )}
        </div>
      </div>
    </>
  )
}