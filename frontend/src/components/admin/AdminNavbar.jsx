// AdminNavbar.jsx (Updated - No logo)
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AdminNavbar({ collapsed, setCollapsed, setMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = () => { 
    logout(); 
    navigate('/') 
  }

  const handleProfile = () => {
    navigate('/admin/profile')
    setDropdownOpen(false)
  }

  const handleSettings = () => {
    navigate('/admin/settings')
    setDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initial = (user?.first_name?.[0] || user?.username?.[0] || 'A').toUpperCase()
  const fullName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.first_name || user?.username || 'Admin User'

  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        {/* Drawer/Sidebar Toggle Button - 3 lines icon */}
        <button 
          className="navbar-toggle"
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobile(true)
            } else {
              setCollapsed(!collapsed)
            }
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      <div className="navbar-right">
        {/* Profile Dropdown */}
        <div className="profile-dropdown" ref={dropdownRef}>
          <button 
            className="profile-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="profile-avatar">{initial}</div>
            <div className="profile-info">
              <span className="profile-name">{fullName}</span>
              <span className="profile-role">{user?.role || 'Administrator'}</span>
            </div>
            <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`}></i>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{initial}</div>
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{fullName}</div>
                  <div className="dropdown-user-email">{user?.email || 'admin@nairobi.jet.house'}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleProfile}>
                <i className="bi bi-person"></i>
                <span>My Profile</span>
              </button>
              <button className="dropdown-item" onClick={handleSettings}>
                <i className="bi bi-gear"></i>
                <span>Settings</span>
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
  )
}