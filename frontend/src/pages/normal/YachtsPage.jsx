import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { catalogAPI } from '../../services/api';

export default function YachtsPage() {
  const [yachts, setYachts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogAPI.opYachts().then(r => setYachts(r.data.results||r.data)).finally(()=>setLoading(false));
  }, []);

  return (
    <>
      <PublicNavbar />
      <div style={{paddingTop:100,paddingBottom:64,minHeight:'100vh'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:48}}>
            <div className="gold-line" style={{margin:'0 auto 16px'}}/>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'2.5rem',fontWeight:300}}>Yacht Collection</h1>
            <p style={{color:'var(--muted)'}}>Exclusive charters across the Indian Ocean and Mediterranean.</p>
          </div>
          {loading ? (
            <div className="loading-center"><span className="spinner"/>Loading…</div>
          ) : yachts.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">⛵</div><h3>No yachts listed</h3></div>
          ) : (
            <div className="grid-3">
              {yachts.map(y => (
                <div key={y.id} className="asset-card">
                  <div className="asset-card-img">{y.image_url ? <img src={y.image_url} alt={y.name}/> : '⛵'}</div>
                  <div className="asset-card-body">
                    <div className="flex items-center justify-between mb-2">
                      <div className="asset-card-title">{y.name}</div>
                      <span className="badge badge-blue">{y.type_display}</span>
                    </div>
                    <div className="asset-card-sub">{y.operator_name} · {y.home_port}</div>
                    <div className="asset-card-specs">
                      <div className="spec-item"><div className="spec-label">Guests</div><div className="spec-value">{y.guest_capacity}</div></div>
                      <div className="spec-item"><div className="spec-label">Length</div><div className="spec-value">{y.length_meters}m</div></div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="asset-card-price">${parseFloat(y.daily_rate_usd)?.toLocaleString()}<span>/day</span></div>
                      <Link to="/book-yacht" className="btn btn-outline btn-sm">Charter</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <PublicFooter />
    </>
  );
}