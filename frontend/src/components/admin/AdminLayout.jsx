// AdminLayout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminNavbar from './AdminNavbar'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobile]   = useState(false)

  return (
    <div className="app-shell">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobile={setMobile}
      />
      
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobile(false)} />
      )}
      
      <main className={`dash-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        <AdminNavbar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          setMobile={setMobile}
        />
        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}