import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import MemberSidebar from './MemberSidebar'

export default function MemberLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'M').toUpperCase()
  const fullName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.first_name || user?.username || 'Member'

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <MemberSidebar 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobile={setMobileOpen}
      />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`dash-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        {/* Top Navbar */}
        <nav className="member-navbar">
          <div className="navbar-left">
            <button 
              className="navbar-toggle"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileOpen(true)
                } else {
                  setCollapsed(!collapsed)
                }
              }}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className="bi bi-list"></i>
            </button>
            
            {/* Page Title */}
            <div className="navbar-page-title">
              <span>Member Portal</span>
            </div>
          </div>

          <div className="navbar-right">
            {/* Membership Tier Badge */}
            {user?.membership_tier && (
              <div className="membership-badge-navbar">
                <i className="bi bi-star-fill"></i>
                {user.membership_tier}
              </div>
            )}
            
            {/* Profile Dropdown */}
            <div className="profile-dropdown">
              <button 
                className="profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="profile-avatar">{initial}</div>
                <div className="profile-info">
                  <span className="profile-name">{fullName}</span>
                  <span className="profile-role">
                    {user?.membership_tier ? `${user.membership_tier} Member` : 'Member'}
                  </span>
                </div>
                <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`}></i>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{initial}</div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{fullName}</div>
                      <div className="dropdown-user-email">{user?.email || 'member@nairobi.jet.house'}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => navigate('/member/profile')}>
                    <i className="bi bi-person"></i>
                    <span>My Profile</span>
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/member/payments')}>
                    <i className="bi bi-credit-card"></i>
                    <span>Payments</span>
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="dash-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        /* Member Layout Styles - Consistent with Admin/Operator/Staff/Owner Layout */
        .app-shell {
          display: flex;
          min-height: 100vh;
          background: var(--color-off-white);
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 100;
          width: 40px;
          height: 40px;
          background: var(--color-navy);
          color: var(--color-white);
          border: none;
          border-radius: 8px;
          font-size: 1.2rem;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        /* Main Content Area */
        .dash-main {
          flex: 1;
          margin-left: 260px;
          transition: margin-left var(--transition-base);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .dash-main.sidebar-collapsed {
          margin-left: 72px;
        }

        /* Member Navbar */
        .member-navbar {
          position: sticky;
          top: 0;
          right: 0;
          height: 64px;
          background: var(--color-white);
          border-bottom: 1px solid var(--color-light-gray);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: var(--z-sticky);
        }

        /* Navbar Left */
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .navbar-toggle {
          background: none;
          border: 1px solid var(--color-light-gray);
          color: var(--color-navy);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.45rem 0.55rem;
          border-radius: 8px;
          transition: all var(--transition-fast);
        }

        .navbar-toggle:hover {
          background: var(--color-off-white);
          border-color: var(--color-gold);
          color: var(--color-gold);
        }

        .navbar-page-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-navy);
        }

        /* Navbar Right */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* Membership Badge in Navbar */
        .membership-badge-navbar {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.75rem;
          background: rgba(201,153,46,0.12);
          border: 1px solid rgba(201,153,46,0.25);
          border-radius: 20px;
          font-family: var(--font-label);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-gold);
        }

        .membership-badge-navbar i {
          font-size: 0.65rem;
          color: var(--color-gold);
        }

        /* Profile Dropdown */
        .profile-dropdown {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          transition: background var(--transition-fast);
        }

        .profile-trigger:hover {
          background: var(--color-off-white);
        }

        .profile-avatar {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--color-navy), var(--color-navy-light));
          color: var(--color-gold);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .profile-name {
          font-family: var(--font-label);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-navy);
        }

        .profile-role {
          font-family: var(--font-label);
          font-size: 0.65rem;
          font-weight: 500;
          color: var(--color-mid-gray);
          text-transform: capitalize;
        }

        .profile-trigger i {
          font-size: 0.8rem;
          color: var(--color-mid-gray);
        }

        /* Dropdown Menu */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 280px;
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: 10px;
          box-shadow: var(--shadow-lg);
          z-index: var(--z-dropdown);
          overflow: hidden;
          animation: fadeInUp 0.2s ease;
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--color-off-white);
          border-bottom: 1px solid var(--color-light-gray);
        }

        .dropdown-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--color-navy), var(--color-navy-light));
          color: var(--color-gold);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
        }

        .dropdown-user-info {
          flex: 1;
        }

        .dropdown-user-name {
          font-family: var(--font-label);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-navy);
        }

        .dropdown-user-email {
          font-family: var(--font-label);
          font-size: 0.7rem;
          color: var(--color-mid-gray);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--color-light-gray);
          margin: 0.25rem 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.7rem 1rem;
          font-family: var(--font-label);
          font-size: 0.85rem;
          color: var(--color-dark-gray);
          background: none;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .dropdown-item i {
          font-size: 1rem;
          color: var(--color-mid-gray);
          min-width: 20px;
        }

        .dropdown-item:hover {
          background: var(--color-off-white);
          color: var(--color-navy);
        }

        .dropdown-item:hover i {
          color: var(--color-gold);
        }

        .dropdown-item.logout {
          color: var(--color-error);
        }

        .dropdown-item.logout:hover {
          background: rgba(192, 57, 43, 0.08);
        }

        /* Dash Content */
        .dash-content {
          flex: 1;
          padding: 1.5rem;
          background: var(--color-off-white);
        }

        /* Mobile Overlay */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 20, 43, 0.65);
          backdrop-filter: blur(4px);
          z-index: 699;
          animation: fadeIn 0.2s ease;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }
          
          .dash-main {
            margin-left: 0;
          }
          
          .dash-main.sidebar-collapsed {
            margin-left: 0;
          }
          
          .member-navbar {
            padding: 0 1rem;
          }
          
          .dash-content {
            padding: 1rem;
          }
          
          .profile-info {
            display: none;
          }
          
          .profile-trigger {
            padding: 0.35rem 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .navbar-page-title {
            display: none;
          }
          
          .membership-badge-navbar {
            display: none;
          }
          
          .dropdown-menu {
            width: 260px;
            right: -1rem;
          }
        }
      `}</style>
    </div>
  )
}