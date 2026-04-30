import { Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import StaffSidebar from './StaffSidebar'

export default function StaffLayout() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-shell">
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
      >
        <i className="bi bi-list" />
      </button>

      <StaffSidebar 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobile={setMobileOpen}
      />

      {mobileOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className={`dash-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}