import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'  // ✅ CORRECT

const NAV = [
  { section: 'Overview' },
  { to: '/admin',           icon: 'bi-grid-1x2',      label: 'Dashboard',        end: true },

  { section: 'Bookings' },
  { to: '/admin/bookings',  icon: 'bi-airplane',       label: 'Flight Bookings' },
  { to: '/admin/charters',  icon: 'bi-water',          label: 'Yacht Charters' },
  { to: '/admin/marketplace',icon:'bi-shop',            label: 'Marketplace' },

  { section: 'Inquiries' },
  { to: '/admin/inquiries', icon: 'bi-envelope-open',  label: 'All Inquiries' },

  { section: 'Operators', badge: 'V2' },
  { to: '/admin/operators', icon: 'bi-building',        label: 'Charter Operators' },
  { to: '/admin/payouts',   icon: 'bi-cash-stack',      label: 'Payouts' },

  { section: 'Platform' },
  { to: '/admin/users',     icon: 'bi-people',          label: 'Users' },
  { to: '/admin/email-logs',icon: 'bi-envelope',        label: 'Email Logs' },
  { to: '/admin/careers',   icon: 'bi-briefcase',       label: 'Careers' },
  { to: '/admin/settings',  icon: 'bi-sliders',         label: 'Settings' },
]

export default function AdminSidebar({ collapsed, setCollapsed, mobileOpen, setMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'A').toUpperCase()

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><i className="bi bi-airplane-fill" /></div>
        {!collapsed && (
          <div>
            <div className="sidebar-logo-text">Nairobi<span>JH</span></div>
            <div className="sidebar-role-badge">Admin</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((item, i) => {
          if (item.section) {
            return collapsed ? <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.5rem 0' }} /> : (
              <div key={i} className="sidebar-section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.section}
                {item.badge && (
                  <span style={{ fontSize: '0.5rem', fontWeight: 700, background: 'var(--gold)', color: 'var(--navy)', padding: '1px 5px', borderRadius: 4 }}>
                    {item.badge}
                  </span>
                )}
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
              {!collapsed && <span>{item.label}</span>}
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
              <div className="sidebar-user-name">{user?.first_name || user?.username}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          )}
          <button className="sidebar-logout" onClick={handleLogout} title="Sign out">
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ marginTop: '0.75rem', width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', padding: '0.35rem', cursor: 'pointer' }}
          >
            <i className="bi bi-arrow-bar-left" /> Collapse
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{ marginTop: '0.5rem', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', cursor: 'pointer' }}
            title="Expand"
          >
            <i className="bi bi-arrow-bar-right" />
          </button>
        )}
      </div>
    </aside>
  )
}