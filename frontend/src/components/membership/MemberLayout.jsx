import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const to = p => `/member/${p}`;
  const link = (path, icon, label) => (
    <NavLink to={to(path)} className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
      <span className="icon">{icon}</span>{label}
    </NavLink>
  );
  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">NJH<span>.</span><span style={{fontSize:'0.65rem',marginLeft:'auto',color:'var(--gold)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Member</span></div>
        <div className="sidebar-section">
          <NavLink to="/member" end className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}><span className="icon">⊞</span>Dashboard</NavLink>
          {link('book','✈','Book a Flight')}
          {link('fleet','🛩','Browse Fleet')}
          {link('routes','📍','Saved Routes')}
          {link('payments','💳','Payments')}
          {link('profile','👤','Profile')}
        </div>
        <div className="sidebar-footer">
          <div style={{marginBottom:8,color:'var(--off-white)'}}>{user?.first_name || user?.username}</div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={() => { logout(); navigate('/'); }}>Sign Out</button>
        </div>
      </aside>
      <main className="portal-main"><Outlet /></main>
    </div>
  );
}