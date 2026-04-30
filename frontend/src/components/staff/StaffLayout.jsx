import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const to = p => `/staff/${p}`;
  const link = (path, icon, label) => (
    <NavLink to={to(path)} className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
      <span className="icon">{icon}</span>{label}
    </NavLink>
  );
  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">NJH<span>.</span><span style={{fontSize:'0.65rem',marginLeft:'auto',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Staff</span></div>
        <div className="sidebar-section">
          <NavLink to="/staff" end className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}><span className="icon">⊞</span>Dashboard</NavLink>
          {link('bookings','✈','Bookings')}
          {link('inquiries','📥','Inquiries')}
          {link('email','📧','Send Email')}
        </div>
        <div className="sidebar-footer">
          <div style={{marginBottom:8}}>{user?.first_name || user?.username}</div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
        </div>
      </aside>
      <main className="portal-main"><Outlet /></main>
    </div>
  );
}