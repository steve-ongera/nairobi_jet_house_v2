import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Services dropdown data
const SERVICES_DROPDOWN = [
  { path: '/book-flight', label: 'Private Jet Charter', icon: 'bi-airplane', desc: 'Airport to airport, worldwide' },
  { path: '/book-yacht',  label: 'Superyacht Charter',  icon: 'bi-water', desc: 'Mediterranean, Caribbean & beyond' },
  { path: '/lease',       label: 'Long-Term Leasing',   icon: 'bi-file-earmark-text', desc: 'Dedicated aircraft & yacht programs' },
  { path: '/air-cargo',   label: 'Air Cargo',           icon: 'bi-boxes', desc: 'Gold, minerals, pharma & freight' },
  { path: '/group-charter',     label: 'Group Charter',       icon: 'bi-people', desc: 'Corporate, sports & incentives' },
  { path: '/membership',  label: 'Membership',          icon: 'bi-star', desc: 'Exclusive jet house membership' },
]

// Subnavbar links (TOP BAR) - Priority order for responsive
const SUBNAV_LINKS = [
  { path: '/emergency', label: '24/7 Emergency Charter', icon: 'bi-exclamation-triangle', priority: 1 },
  { path: '/corporate', label: 'Corporate Accounts',     icon: 'bi-briefcase', priority: 2 },
  { path: '/membership', label: 'Jet House Membership',  icon: 'bi-gem', priority: 3 },
  { path: 'mailto:nairobijethouse@gmail.com', label: 'Email Us', icon: 'bi-envelope-fill', priority: 4 },
]

// Main nav links
const NAV_LINKS = [
  { path: '/',          label: 'Home',      icon: 'bi-house-door' },
  { path: '/fleet',     label: 'Fleet',     icon: 'bi-grid-3x3' },
  { path: '/yachts',    label: 'Yachts',    icon: 'bi-water' },
  { path: '/services',  label: 'Services',  icon: 'bi-grid-1x2' },
  { path: '/book-flight', label: 'Private Jet Charter',   icon: 'bi-airplane' },
  { path: '/lease',     label: 'Leasing',   icon: 'bi-file-earmark-text' },
  { path: '/air-cargo', label: 'Air Cargo', icon: 'bi-boxes' },
  { path: '/contact',   label: 'Contact',   icon: 'bi-envelope' },
]

const PORTAL_MAP = {
  admin:    '/admin',
  staff:    '/staff',
  client:   '/member',
  owner:    '/owner',
  operator: '/operator',
}

export default function PublicNavbar() {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const { pathname } = useLocation()
  const servicesRef = useRef(null)

  // Close drawer on route change
  useEffect(() => setDrawerOpen(false), [pathname])

  // Close dropdown on route change
  useEffect(() => setServicesOpen(false), [pathname])

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Window resize detection for responsive subnavbar
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // Click outside for services dropdown
  useEffect(() => {
    const handler = (e) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ESC key closes drawer and dropdown
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setDrawerOpen(false)
      setServicesOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleLogout = () => {
    logout()
    setDrawerOpen(false)
  }

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  // Responsive subnavbar logic - show fewer items on smaller screens
  const getVisibleSubnavLinks = () => {
    if (windowWidth >= 1024) return SUBNAV_LINKS // Show all on desktop
    if (windowWidth >= 768) return SUBNAV_LINKS.slice(0, 3) // Show first 3 on tablet
    if (windowWidth >= 480) return SUBNAV_LINKS.slice(0, 2) // Show first 2 on mobile
    return SUBNAV_LINKS.slice(0, 1) // Show only 1 on very small screens
  }

  const visibleSubnavLinks = getVisibleSubnavLinks()

  return (
    <>
      {/* ── SUBNAVBAR (TOP BAR - ABOVE MAIN NAVBAR) ── */}
      <div className="subnavbar-gov">
        <div className="subnavbar-container">
          {visibleSubnavLinks.map(({ path, label, icon }) => (
            <Link key={path} to={path} className="subnavbar-link">
              <i className={`bi ${icon}`}></i>
              <span className="subnavbar-label">{label}</span>
            </Link>
          ))}
          <a href="tel:+254700000000" className="subnavbar-phone">
            <i className="bi bi-telephone-fill"></i>
            <span className="subnavbar-phone-text">+254 724 878 136</span>
          </a>
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <nav className={`navbar-gov${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="nav-container">

          {/* Logo - Always shows icon AND text on all screen sizes */}
          <Link to="/" className="nav-logo" aria-label="Nairobi Jet House — Home">
            <div className="logo-icon" aria-hidden="true">
              <img src="/nairobijethouse.png" alt="Nairobi Jet House logo" className="logo-img" />
            </div>
            <div className="logo-text">
              <span className="logo-main">Nairobi</span>
              <span className="logo-sub">Jet House</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links" role="list">
            {NAV_LINKS.map(({ path, label }) => {
              // Special handling for Services dropdown
              if (label === 'Services') {
                return (
                  <li key={label} ref={servicesRef} style={{ position: 'relative' }}>
                    <button
                      className={`nav-link-item${servicesOpen ? ' active' : ''}`}
                      onClick={() => setServicesOpen(!servicesOpen)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {label}
                      <i className={`bi bi-chevron-${servicesOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem' }}></i>
                    </button>
                    
                    {servicesOpen && (
                      <div className="services-dropdown">
                        <div className="dropdown-header">
                          <div className="dropdown-header-title">Our Services</div>
                          <div className="dropdown-header-desc">Luxury travel solutions tailored to you</div>
                        </div>
                        <div className="dropdown-grid">
                          {SERVICES_DROPDOWN.map((service) => (
                            <Link
                              key={service.path}
                              to={service.path}
                              className="dropdown-item"
                              onClick={() => setServicesOpen(false)}
                            >
                              <div className="dropdown-item-icon">
                                <i className={`bi ${service.icon}`}></i>
                              </div>
                              <div className="dropdown-item-content">
                                <div className="dropdown-item-label">{service.label}</div>
                                <div className="dropdown-item-desc">{service.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="dropdown-footer">
                          <Link to="/track" className="dropdown-footer-link" onClick={() => setServicesOpen(false)}>
                            <i className="bi bi-search"></i> Track a booking
                          </Link>
                          <Link to="/membership" className="dropdown-footer-link" onClick={() => setServicesOpen(false)}>
                            <i className="bi bi-star"></i> Membership program
                          </Link>
                        </div>
                      </div>
                    )}
                  </li>
                )
              }
              
              // Regular nav links
              return (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) => `nav-link-item${isActive ? ' active' : ''}`}
                    end={path === '/'}
                  >
                    {label}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          {/* Sign In / User Menu (desktop) */}
          {user ? (
            <>
              <button className="nav-lang" aria-label="My Account" title="My Account">
                <i className="bi bi-person-circle"></i>
                <span className="nav-lang-text">{user.first_name || user.username}</span>
              </button>
              {PORTAL_MAP[user.role] && (
                <Link to={PORTAL_MAP[user.role]} className="nav-lang">
                  <i className="bi bi-grid-1x2"></i>
                  <span className="nav-lang-text">Portal</span>
                </Link>
              )}
              <button onClick={handleLogout} className="nav-lang" aria-label="Sign Out">
                <i className="bi bi-box-arrow-right"></i>
                <span className="nav-lang-text">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-lang" aria-label="Sign In">
                <i className="bi bi-box-arrow-in-right"></i>
                <span className="nav-lang-text">Sign In</span>
              </Link>
              <Link to="/book-flight" className="nav-cta">
                <i className="bi bi-airplane" aria-hidden="true"></i>
                <span className="nav-cta-text">Request Quote</span>
              </Link>
            </>
          )}

          {/* Hamburger (mobile) */}
          <button
            className="hamburger"
            onClick={openDrawer}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="side-drawer"
          >
            <i className="bi bi-list" aria-hidden="true"></i>
          </button>
        </div>
      </nav>

      {/* ── Side Drawer (mobile) ── */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        id="side-drawer"
        className={`side-drawer${drawerOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="drawer-header">
          <Link to="/" className="drawer-logo" onClick={closeDrawer} aria-label="Home">
            <div className="drawer-logo-icon">
              <img src="/nairobijethouse.png" alt="Nairobi Jet House logo" className="logo-img" />
            </div>
            <div className="drawer-logo-text">
              <span className="logo-main">Nairobi</span>
              <span className="logo-sub">Jet House</span>
            </div>
          </Link>

          <button
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>

        {/* Drawer navigation */}
        <nav className="drawer-nav" aria-label="Mobile navigation">
          <span className="drawer-section-label">Navigation</span>

          {NAV_LINKS.map(({ path, label, icon }) => {
            // Special handling for Services dropdown in drawer
            if (label === 'Services') {
              return (
                <div key={label}>
                  <div className="drawer-link static">
                    <i className={`bi ${icon}`} aria-hidden="true"></i>
                    {label}
                  </div>
                  <div style={{ paddingLeft: '2rem' }}>
                    {SERVICES_DROPDOWN.map((service) => (
                      <NavLink
                        key={service.path}
                        to={service.path}
                        className={({ isActive }) => `drawer-link${isActive ? ' active' : ''}`}
                        onClick={closeDrawer}
                      >
                        <i className={`bi ${service.icon}`} aria-hidden="true"></i>
                        {service.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
            }
            
            // Regular nav links
            return (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `drawer-link${isActive ? ' active' : ''}`}
                end={path === '/'}
                onClick={closeDrawer}
              >
                <i className={`bi ${icon}`} aria-hidden="true"></i>
                {label}
              </NavLink>
            )
          })}

          <div className="drawer-divider" role="separator" />

          <span className="drawer-section-label">Quick Links</span>

          <NavLink to="/track" className="drawer-link" onClick={closeDrawer}>
            <i className="bi bi-search" aria-hidden="true"></i>
            Track Booking
          </NavLink>

          <NavLink to="/emergency" className="drawer-link" onClick={closeDrawer}>
            <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
            24/7 Emergency
          </NavLink>

          <div className="drawer-divider" role="separator" />

          <span className="drawer-section-label">Account</span>

          {!user ? (
            <>
              <NavLink to="/login" className="drawer-link" onClick={closeDrawer}>
                <i className="bi bi-box-arrow-in-right"></i>
                Sign In
              </NavLink>
              <NavLink to="/register" className="drawer-link" onClick={closeDrawer}>
                <i className="bi bi-person-plus"></i>
                Create Account
              </NavLink>
            </>
          ) : (
            <>
              <div className="drawer-link static" style={{ cursor: 'default' }}>
                <i className="bi bi-person-circle"></i>
                {user.first_name || user.username}
              </div>
              {PORTAL_MAP[user.role] && (
                <NavLink to={PORTAL_MAP[user.role]} className="drawer-link" onClick={closeDrawer}>
                  <i className="bi bi-grid-1x2"></i>
                  My Portal
                </NavLink>
              )}
              <button className="drawer-link" onClick={handleLogout} style={{ width: '100%', textAlign: 'left' }}>
                <i className="bi bi-box-arrow-right"></i>
                Sign Out
              </button>
            </>
          )}
        </nav>

        {/* Drawer footer */}
        <div className="drawer-footer">
          <Link to="/book-flight" className="drawer-cta" onClick={closeDrawer}>
            <i className="bi bi-airplane" aria-hidden="true"></i>
            Request a Quote
          </Link>

          <div className="drawer-contact-info">
            <a href="mailto:info@nairobijethouse.co.ke" onClick={closeDrawer}>
              <i className="bi bi-envelope-fill" aria-hidden="true"></i>
              info@nairobijethouse.co.ke
            </a>
            <a href="tel:+254700000000" onClick={closeDrawer}>
              <i className="bi bi-telephone-fill" aria-hidden="true"></i>
              +254 724 878 136
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" onClick={closeDrawer}>
              <i className="bi bi-linkedin" aria-hidden="true"></i>
              Follow us on LinkedIn
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}