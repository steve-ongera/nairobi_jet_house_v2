// AdminLayout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

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
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(11,29,58,0.45)', zIndex: 699 }}
          onClick={() => setMobile(false)}
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