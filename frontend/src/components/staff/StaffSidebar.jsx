import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function StaffSidebar({ collapsed, setCollapsed, mobileOpen, setMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'S').toUpperCase()

  const navItems = [
    { to: '/staff', end: true, icon: 'bi-grid-1x2', label: 'Dashboard' },
    { to: '/staff/bookings', icon: 'bi-airplane', label: 'Bookings' },
    { to: '/staff/inquiries', icon: 'bi-envelope-open', label: 'Inquiries' },
    { to: '/staff/email', icon: 'bi-send', label: 'Send Email' },
    { to: '/staff/operators', icon: 'bi-building', label: 'Operators' },
  ]

  return (
    <aside className={`sidebar sidebar-staff${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        {!collapsed ? (
          <>
            <div className="sidebar-logo-icon">
              <i className="bi bi-airplane-fill"></i>
            </div>
            <div>
              <div className="sidebar-logo-text">Nairobi<span>JH</span></div>
              <div className="sidebar-role-badge">Staff Portal</div>
            </div>
          </>
        ) : (
          <div className="sidebar-logo-icon sidebar-logo-icon-centered">
            <i className="bi bi-airplane-fill"></i>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <i className={`bi ${item.icon}`}></i>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.first_name || user?.username || 'Staff'}</div>
              <div className="sidebar-user-role">Staff</div>
            </div>
          )}
          <button 
            className="sidebar-logout" 
            onClick={handleLogout} 
            title="Sign out"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="sidebar-collapse-btn"
          >
            <i className="bi bi-arrow-bar-left"></i> Collapse
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="sidebar-expand-btn"
            title="Expand"
          >
            <i className="bi bi-arrow-bar-right"></i>
          </button>
        )}
      </div>

      <style>{`
        /* Staff Sidebar Specific Styles - Consistent with Admin/Operator Sidebar */
        .sidebar-staff {
          background: var(--color-navy-dark);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          display: flex;
          flex-direction: column;
          z-index: var(--z-drawer);
          transition: width var(--transition-base);
          overflow-x: hidden;
          overflow-y: auto;
        }

        .sidebar-staff.collapsed {
          width: 72px;
        }

        /* Scrollbar */
        .sidebar-staff::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-staff::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .sidebar-staff::-webkit-scrollbar-thumb {
          background: var(--color-gold);
          border-radius: 4px;
        }

        /* Logo Area */
        .sidebar-staff .sidebar-logo {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .sidebar-staff.collapsed .sidebar-logo {
          justify-content: center;
          padding: 1rem;
        }

        .sidebar-staff .sidebar-logo-icon {
          width: 38px;
          height: 38px;
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-staff .sidebar-logo-icon i {
          font-size: 1.1rem;
          color: var(--color-gold);
        }

        .sidebar-staff .sidebar-logo-icon-centered {
          margin: 0 auto;
        }

        .sidebar-staff .sidebar-logo-text {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-white);
        }

        .sidebar-staff .sidebar-logo-text span {
          color: var(--color-gold);
        }

        .sidebar-staff .sidebar-role-badge {
          font-family: var(--font-label);
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--color-gold);
          margin-top: 2px;
        }

        /* Nav Links */
        .sidebar-staff .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          padding: 0 0.5rem;
        }

        .sidebar-staff .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.85rem;
          border-radius: 8px;
          font-family: var(--font-label);
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          transition: all var(--transition-fast);
          position: relative;
        }

        .sidebar-staff .sidebar-link i {
          font-size: 1.1rem;
          min-width: 20px;
          text-align: center;
          color: rgba(255,255,255,0.4);
          transition: color var(--transition-fast);
        }

        .sidebar-staff .sidebar-link:hover {
          background: rgba(255,255,255,0.07);
          color: var(--color-white);
        }

        .sidebar-staff .sidebar-link:hover i {
          color: var(--color-gold);
        }

        .sidebar-staff .sidebar-link.active {
          background: rgba(201,153,46,0.12);
          color: var(--color-gold-light);
        }

        .sidebar-staff .sidebar-link.active i {
          color: var(--color-gold);
        }

        .sidebar-staff .sidebar-link.active::before {
          content: '';
          position: absolute;
          left: -0.5rem;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--color-gold);
          border-radius: 0 2px 2px 0;
        }

        /* Collapsed Sidebar */
        .sidebar-staff.collapsed .sidebar-link {
          justify-content: center;
          padding: 0.7rem;
        }

        .sidebar-staff.collapsed .sidebar-link i {
          margin: 0;
        }

        /* Footer */
        .sidebar-staff .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin-top: auto;
        }

        .sidebar-staff .sidebar-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-staff .sidebar-avatar {
          width: 36px;
          height: 36px;
          background: var(--color-gold);
          color: var(--color-navy-dark);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sidebar-staff .sidebar-user-info {
          flex: 1;
          min-width: 0;
        }

        .sidebar-staff .sidebar-user-name {
          font-family: var(--font-label);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-white);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-staff .sidebar-user-role {
          font-family: var(--font-label);
          font-size: 0.65rem;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          text-transform: capitalize;
        }

        .sidebar-staff .sidebar-logout {
          background: none;
          border: none;
          color: rgba(255,255,255,0.45);
          font-size: 1rem;
          cursor: pointer;
          padding: 0.25rem;
          transition: color var(--transition-fast);
        }

        .sidebar-staff .sidebar-logout:hover {
          color: var(--color-error);
        }

        .sidebar-staff .sidebar-collapse-btn,
        .sidebar-staff .sidebar-expand-btn {
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.35rem;
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: rgba(255,255,255,0.4);
          font-size: 0.72rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .sidebar-staff .sidebar-collapse-btn:hover,
        .sidebar-staff .sidebar-expand-btn:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
        }

        .sidebar-staff .sidebar-expand-btn {
          margin-top: 0.5rem;
          font-size: 1rem;
        }

        /* Collapsed Footer */
        .sidebar-staff.collapsed .sidebar-user {
          justify-content: center;
        }

        .sidebar-staff.collapsed .sidebar-user-info {
          display: none;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar-staff {
            transform: translateX(-100%);
            transition: transform var(--transition-base);
          }
          
          .sidebar-staff.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  )
}