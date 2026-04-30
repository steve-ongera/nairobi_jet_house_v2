import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function OwnerSidebar({ collapsed, setCollapsed, mobileOpen, setMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initial = (user?.first_name?.[0] || user?.company?.[0] || user?.username?.[0] || 'O').toUpperCase()

  const navItems = [
    { to: '/owner', end: true, icon: 'bi-grid-1x2', label: 'Dashboard' },
    { to: '/owner/aircraft', icon: 'bi-airplane', label: 'My Aircraft' },
    { to: '/owner/maintenance', icon: 'bi-tools', label: 'Maintenance' },
    { to: '/owner/bookings', icon: 'bi-calendar-check', label: 'Bookings' },
    { to: '/owner/revenue', icon: 'bi-graph-up', label: 'Revenue' },
    { to: '/owner/reports', icon: 'bi-file-text', label: 'Reports' },
  ]

  return (
    <aside className={`sidebar sidebar-owner${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="bi bi-airplane-fill" />
        </div>
        {!collapsed && (
          <div>
            <div className="sidebar-logo-text">Nairobi<span>JH</span></div>
            <div className="sidebar-role-badge">Owner Portal</div>
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
            <i className={`bi ${item.icon}`} />
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
              <div className="sidebar-user-name">{user?.first_name || user?.company || user?.username || 'Owner'}</div>
              <div className="sidebar-user-role">Aircraft Owner</div>
            </div>
          )}
          <button 
            className="sidebar-logout" 
            onClick={handleLogout} 
            title="Sign out"
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="sidebar-collapse-btn"
          >
            <i className="bi bi-arrow-bar-left" /> Collapse
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="sidebar-expand-btn"
            title="Expand"
          >
            <i className="bi bi-arrow-bar-right" />
          </button>
        )}
      </div>
    </aside>
  )
}