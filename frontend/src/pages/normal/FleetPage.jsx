import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { catalogAPI } from '../../services/api';

const CATS = ['','light','midsize','super_midsize','heavy','ultra_long','vip_airliner','turboprop','helicopter'];

export default function FleetPage() {
  const [aircraft, setAircraft] = useState([]);
  const [cat, setCat]           = useState('');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (cat)    params.category = cat;
    if (search) params.search   = search;
    catalogAPI.opAircraft(params)
      .then(r => setAircraft(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, [cat, search]);

  return (
    <>
      <PublicNavbar />
      <div style={{paddingTop:100,paddingBottom:64,minHeight:'100vh'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:48}}>
            <div className="gold-line" style={{margin:'0 auto 16px'}} />
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'2.5rem',fontWeight:300}}>Our Fleet</h1>
            <p style={{color:'var(--muted)'}}>Approved partner aircraft available for charter.</p>
          </div>

          {/* Filters */}
          <div className="filter-bar" style={{justifyContent:'center',marginBottom:40}}>
            <input className="form-control" style={{maxWidth:240}} placeholder="Search aircraft…" value={search} onChange={e=>setSearch(e.target.value)} />
            <select className="form-control" style={{width:'auto'}} value={cat} onChange={e=>setCat(e.target.value)}>
              {CATS.map(c=><option key={c} value={c}>{c?c.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase()):'All Categories'}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="loading-center"><span className="spinner"/>Loading fleet…</div>
          ) : aircraft.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">✈</div><h3>No aircraft found</h3></div>
          ) : (
            <div className="grid-3">
              {aircraft.map(ac => (
                <div key={ac.id} className="asset-card">
                  <div className="asset-card-img">
                    {ac.image_url ? <img src={ac.image_url} alt={ac.name}/> : '✈'}
                  </div>
                  <div className="asset-card-body">
                    <div className="flex items-center justify-between mb-2">
                      <div className="asset-card-title">{ac.name}</div>
                      <span className="badge badge-gold">{ac.category_display}</span>
                    </div>
                    <div className="asset-card-sub">{ac.operator_name}</div>
                    <div className="asset-card-specs">
                      <div className="spec-item"><div className="spec-label">Pax</div><div className="spec-value">{ac.passenger_capacity}</div></div>
                      <div className="spec-item"><div className="spec-label">Range</div><div className="spec-value">{ac.range_km?.toLocaleString()} km</div></div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="asset-card-price">${parseFloat(ac.display_hourly_rate||ac.hourly_rate_usd)?.toLocaleString()}<span>/hr</span></div>
                      <Link to="/book-flight" className="btn btn-outline btn-sm">Charter</Link>
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