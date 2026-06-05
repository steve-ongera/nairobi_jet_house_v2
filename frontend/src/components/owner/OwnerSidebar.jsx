import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { section: 'Overview' },
  { to: '/owner', icon: 'bi-grid-1x2', label: 'Dashboard', end: true },

  { section: 'Fleet' },
  { to: '/owner/aircraft',    icon: 'bi-airplane',        label: 'My Aircraft' },
  { to: '/owner/maintenance', icon: 'bi-tools',           label: 'Maintenance' },

  { section: 'Business' },
  { to: '/owner/bookings', icon: 'bi-calendar-check',  label: 'Bookings' },
  { to: '/owner/revenue',  icon: 'bi-graph-up',         label: 'Revenue' },
  { to: '/owner/reports',  icon: 'bi-file-text',        label: 'Reports' },
]

export default function OwnerSidebar({ collapsed, setCollapsed, mobileOpen, setMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const initial = (user?.first_name?.[0] || user?.company?.[0] || user?.username?.[0] || 'O').toUpperCase()

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo Area */}
      <div className="sidebar-logo">
        {collapsed ? (
          <img src="/nairobijethouse.png" alt="Nairobi Jet House" style={{ height: '2rem', width: 'auto', display: 'block' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/nairobijethouse.png" alt="Nairobi Jet House" style={{ height: '2rem', width: 'auto' }} />
            <div>
              <div className="sidebar-logo-text">Nairobi<span>JetHouse</span></div>
              <div className="sidebar-role-badge">Owner Portal</div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((item, i) => {
          if (item.section) {
            return collapsed ? (
              <div key={i} className="sidebar-divider" />
            ) : (
              <div key={i} className="sidebar-section-label">
                {item.section}
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </div>
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <i className={`bi ${item.icon}`} />
              {!collapsed && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                  {item.label}
                  {item.badge && <span className="sidebar-link-badge">{item.badge}</span>}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.first_name || user?.company || user?.username || 'Owner'}</div>
              <div className="sidebar-user-role">{user?.role || 'Aircraft Owner'}</div>
            </div>
          )}
          <button className="sidebar-logout" onClick={handleLogout} title="Sign out">
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
        {!collapsed ? (
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(true)}>
            <i className="bi bi-arrow-bar-left" /> Collapse
          </button>
        ) : (
          <button className="sidebar-expand-btn" onClick={() => setCollapsed(false)} title="Expand">
            <i className="bi bi-arrow-bar-right" />
          </button>
        )}
      </div>
    </aside>
  )
}