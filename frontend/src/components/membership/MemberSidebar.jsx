import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function MemberSidebar({ collapsed, setCollapsed, mobileOpen, setMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'M').toUpperCase()

  const navItems = [
    { to: '/member', end: true, icon: 'bi-grid-1x2', label: 'Dashboard' },
    { to: '/member/book', icon: 'bi-airplane', label: 'Book a Flight' },
    { to: '/member/fleet', icon: 'bi-airplane-fill', label: 'Browse Fleet' },
    { to: '/member/routes', icon: 'bi-geo-alt', label: 'Saved Routes' },
    { to: '/member/payments', icon: 'bi-credit-card', label: 'Payments' },
    { to: '/member/profile', icon: 'bi-person', label: 'Profile' },
  ]

  return (
    <aside className={`sidebar sidebar-member${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="bi bi-airplane-fill" />
        </div>
        {!collapsed && (
          <div>
            <div className="sidebar-logo-text">Nairobi<span>JH</span></div>
            <div className="sidebar-role-badge">Member Portal</div>
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

      {/* Membership Tier Badge (optional) */}
      {!collapsed && user?.membership_tier && (
        <div className="sidebar-membership">
          <div className="membership-badge-sidebar">
            <i className="bi bi-star-fill" />
            {user.membership_tier} Member
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.first_name || user?.username || 'Member'}</div>
              <div className="sidebar-user-role">
                {user?.membership_tier ? `${user.membership_tier} Member` : 'Premium Member'}
              </div>
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