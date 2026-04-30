import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function OperatorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const to = p => `/operator/${p}`;
  const link = (path, icon, label) => (
    <NavLink to={to(path)} className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}>
      <span className="icon">{icon}</span>{label}
    </NavLink>
  );
  return (
    <div className="portal-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">NJH<span>.</span><span style={{fontSize:'0.65rem',marginLeft:'auto',color:'var(--gold)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Operator</span></div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Overview</div>
          <NavLink to="/operator" end className={({isActive}) => `sidebar-link${isActive ? ' active' : ''}`}><span className="icon">⊞</span>Dashboard</NavLink>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Fleet</div>
          {link('aircraft','🛩','My Aircraft')}
          {link('yachts','⛵','My Yachts')}
          {link('availability','📅','Availability')}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Business</div>
          {link('rfq','📋','RFQ Requests')}
          {link('bookings','📦','Bookings')}
          {link('payouts','💰','Payouts')}
        </div>
        <div className="sidebar-section">
          {link('profile','🏢','Company Profile')}
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