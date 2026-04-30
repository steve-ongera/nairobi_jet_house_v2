// ServicesPage.jsx
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const services = [
    { id:'charter', icon:'✈', title:'Private Jet Charter', desc:'Point-to-point jet charter with 100+ aircraft across Africa and globally. Light jets, heavy jets, VIP airliners — all available on demand.', cta:'/book-flight', ctaLabel:'Book Charter' },
    { id:'yacht',   icon:'⛵', title:'Yacht Charter', desc:'Luxury sailing and motor yachts for day trips, week-long island-hopping, or extended expeditions across the Indian Ocean.', cta:'/book-yacht', ctaLabel:'Book Yacht' },
    { id:'cargo',   icon:'📦', title:'Air Cargo', desc:'Time-critical freight specialists — from pharmaceuticals and live animals to gold and oversized machinery. AOG same-day capability.', cta:'/contact', ctaLabel:'Get Quote' },
    { id:'group',   icon:'👥', title:'Group Charter', desc:'Dedicated group solutions for sports teams, corporate incentives, government delegations, and wedding parties.', cta:'/book-flight', ctaLabel:'Enquire' },
    { id:'sales',   icon:'🛩', title:'Aircraft Sales', desc:'Buy, sell, or trade-in private aircraft with access to global listings and our experienced aviation advisory team.', cta:'/contact', ctaLabel:'Enquire' },
    { id:'lease',   icon:'📋', title:'Aircraft Leasing', desc:'Short-term to multi-year dry and wet leases, with competitive rates and AOC support for operators.', cta:'/contact', ctaLabel:'Get Quote' },
  ];
  return (
    <>
      <PublicNavbar />
      <div style={{paddingTop:100,paddingBottom:64,minHeight:'100vh'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:56}}>
            <div className="gold-line" style={{margin:'0 auto 16px'}}/>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'2.5rem',fontWeight:300}}>Our Services</h1>
            <p style={{color:'var(--muted)'}}>Complete private aviation solutions from charter to ownership.</p>
          </div>
          <div className="grid-3">
            {services.map(s=>(
              <div key={s.id} id={s.id} className="card">
                <div className="card-body">
                  <div style={{fontSize:'2.5rem',marginBottom:16}}>{s.icon}</div>
                  <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.5rem',marginBottom:12}}>{s.title}</h2>
                  <p style={{color:'var(--muted)',fontSize:'0.875rem',lineHeight:1.8,marginBottom:20}}>{s.desc}</p>
                  <Link to={s.cta} className="btn btn-outline btn-sm">{s.ctaLabel}</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}