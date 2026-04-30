import { useState } from 'react';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { charterAPI } from '../../services/api';

export default function BookYachtPage() {
  const [form, setForm] = useState({
    guest_name:'', guest_email:'', guest_phone:'', company:'',
    departure_port:'', destination_port:'', charter_start:'', charter_end:'',
    guest_count:2, itinerary_description:'', special_requests:'',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState('');
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await charterAPI.create(form);
      setSuccess(data.charter?.reference);
    } catch(e) {
      setError(e.response?.data?.detail || 'Submission failed.');
    } finally { setLoading(false); }
  };

  if (success) return (
    <>
      <PublicNavbar />
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',paddingTop:80}}>
        <div style={{textAlign:'center',maxWidth:480,padding:32}}>
          <div style={{fontSize:'3rem',marginBottom:24}}>⛵</div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'2rem',marginBottom:12}}>Charter Request Received</h2>
          <p style={{color:'var(--muted)',marginBottom:24}}>Our yacht specialists will respond within 4 hours.</p>
          <div className="alert alert-info">Reference: <strong>{String(success).slice(0,8).toUpperCase()}</strong></div>
        </div>
      </div>
      <PublicFooter />
    </>
  );

  return (
    <>
      <PublicNavbar />
      <div style={{paddingTop:100, paddingBottom:64, minHeight:'100vh'}}>
        <div className="container" style={{maxWidth:800}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <div className="gold-line" style={{margin:'0 auto 16px'}} />
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'2.5rem',fontWeight:300}}>Yacht Charter</h1>
            <p style={{color:'var(--muted)'}}>Bespoke yacht experiences across the Indian Ocean and beyond.</p>
          </div>
          {error && <div className="alert alert-error mb-6">{error}</div>}
          <form className="booking-form-section" onSubmit={submit}>
            <h3 className="form-section-title">Contact Information</h3>
            <div className="form-grid-2">
              {[['guest_name','Full Name',true],['guest_email','Email',true],['guest_phone','Phone'],['company','Company']].map(([k,l,req])=>(
                <div key={k} className="form-group">
                  <label className="form-label">{l}{req?' *':''}</label>
                  <input type={k==='guest_email'?'email':'text'} className="form-control" value={form[k]} onChange={e=>set(k,e.target.value)} required={!!req} />
                </div>
              ))}
            </div>
            <h3 className="form-section-title" style={{marginTop:28}}>Charter Details</h3>
            <div className="form-grid-2">
              {[['departure_port','Departure Port *',true],['destination_port','Destination Port']].map(([k,l,req])=>(
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-control" value={form[k]} onChange={e=>set(k,e.target.value)} required={!!req} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Charter Start *</label>
                <input type="date" className="form-control" value={form.charter_start} onChange={e=>set('charter_start',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Charter End *</label>
                <input type="date" className="form-control" value={form.charter_end} onChange={e=>set('charter_end',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Guests *</label>
                <input type="number" min={1} className="form-control" value={form.guest_count} onChange={e=>set('guest_count',parseInt(e.target.value))} required />
              </div>
            </div>
            <div className="form-group" style={{marginTop:20}}>
              <label className="form-label">Itinerary Description</label>
              <textarea className="form-control" rows={3} value={form.itinerary_description} onChange={e=>set('itinerary_description',e.target.value)} placeholder="Describe your preferred route or destinations..." />
            </div>
            <div className="form-group" style={{marginTop:16}}>
              <label className="form-label">Special Requests</label>
              <textarea className="form-control" rows={2} value={form.special_requests} onChange={e=>set('special_requests',e.target.value)} placeholder="Dietary requirements, celebration packages, etc." />
            </div>
            <div style={{marginTop:28}}>
              <button type="submit" className="btn btn-gold btn-lg btn-full" disabled={loading}>
                {loading ? <><span className="spinner"/>&nbsp;Submitting…</> : 'Submit Charter Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}