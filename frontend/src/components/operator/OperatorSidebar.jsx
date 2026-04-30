import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function OperatorSidebar({ collapsed, setCollapsed, mobileOpen, setMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initial = (user?.first_name?.[0] || user?.company?.[0] || user?.username?.[0] || 'O').toUpperCase()

  const navSections = [
    {
      title: 'Overview',
      items: [
        { to: '/operator', end: true, icon: 'bi-grid-1x2', label: 'Dashboard' }
      ]
    },
    {
      title: 'Fleet',
      items: [
        { to: '/operator/aircraft', icon: 'bi-airplane', label: 'My Aircraft' },
        { to: '/operator/yachts', icon: 'bi-water', label: 'My Yachts' },
        { to: '/operator/availability', icon: 'bi-calendar', label: 'Availability' }
      ]
    },
    {
      title: 'Business',
      items: [
        { to: '/operator/rfq', icon: 'bi-file-text', label: 'RFQ Requests' },
        { to: '/operator/bookings', icon: 'bi-calendar-check', label: 'Bookings' },
        { to: '/operator/payouts', icon: 'bi-cash-stack', label: 'Payouts' }
      ]
    },
    {
      title: 'Account',
      items: [
        { to: '/operator/profile', icon: 'bi-building', label: 'Company Profile' }
      ]
    }
  ]

  return (
    <aside className={`sidebar sidebar-operator${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="bi bi-airplane-fill" />
        </div>
        {!collapsed && (
          <div>
            <div className="sidebar-logo-text">Nairobi<span>JH</span></div>
            <div className="sidebar-role-badge">Operator Portal</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {!collapsed && section.title && (
              <div className="sidebar-section-label">{section.title}</div>
            )}
            {section.items.map((item) => (
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
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.first_name || user?.company || user?.username || 'Operator'}</div>
              <div className="sidebar-user-role">Charter Operator</div>
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