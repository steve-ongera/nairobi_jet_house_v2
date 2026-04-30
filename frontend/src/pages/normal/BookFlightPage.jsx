import { useState, useEffect } from 'react';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { bookingAPI, catalogAPI } from '../../services/api';

const CATEGORIES = ['light','midsize','super_midsize','heavy','ultra_long','vip_airliner','turboprop','helicopter'];
const TRIP_TYPES = [['one_way','One Way'],['round_trip','Round Trip'],['multi_leg','Multi-Leg']];

export default function BookFlightPage() {
  const [airports, setAirports] = useState([]);
  const [form, setForm]         = useState({
    guest_name:'', guest_email:'', guest_phone:'', company:'',
    trip_type:'one_way', origin:'', destination:'',
    departure_date:'', departure_time:'', return_date:'',
    passenger_count:1, preferred_category:'',
    special_requests:'', catering_requested:false,
    ground_transport_requested:false, concierge_requested:false,
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    catalogAPI.airports().then(r => setAirports(r.data.results || r.data)).catch(()=>{});
  }, []);

  const set = (k,v) => setForm(p => ({...p, [k]:v}));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form };
      if (form.trip_type !== 'round_trip') delete payload.return_date;
      const { data } = await bookingAPI.create(payload);
      setSuccess(data.booking?.reference);
    } catch(e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Submission failed.');
    } finally { setLoading(false); }
  };

  if (success) return (
    <>
      <PublicNavbar />
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',paddingTop:80}}>
        <div style={{textAlign:'center',maxWidth:480,padding:32}}>
          <div style={{fontSize:'3rem',marginBottom:24}}>✈</div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'2rem',marginBottom:12}}>Booking Submitted</h2>
          <p style={{color:'var(--muted)',marginBottom:24}}>
            Our team will contact you within 2–4 hours with a tailored quote.
          </p>
          <div className="alert alert-info" style={{marginBottom:24}}>
            Reference: <strong>{String(success).slice(0,8).toUpperCase()}</strong>
          </div>
          <a href="/track" className="btn btn-gold">Track Your Booking</a>
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
            <h1 style={{fontFamily:'var(--font-display)',fontSize:'2.5rem',fontWeight:300}}>Charter a Private Jet</h1>
            <p style={{color:'var(--muted)'}}>Complete the form below and our team will respond within 2–4 hours.</p>
          </div>

          {error && <div className="alert alert-error mb-6">{error}</div>}

          <form className="booking-form-section" onSubmit={submit}>
            <h3 className="form-section-title">Contact Information</h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.guest_name} onChange={e=>set('guest_name',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" value={form.guest_email} onChange={e=>set('guest_email',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.guest_phone} onChange={e=>set('guest_phone',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input className="form-control" value={form.company} onChange={e=>set('company',e.target.value)} />
              </div>
            </div>

            <h3 className="form-section-title" style={{marginTop:28}}>Flight Details</h3>
            <div className="form-grid-3" style={{marginBottom:20}}>
              {TRIP_TYPES.map(([v,l]) => (
                <label key={v} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:'0.875rem'}}>
                  <input type="radio" name="trip_type" value={v} checked={form.trip_type===v} onChange={()=>set('trip_type',v)} />
                  {l}
                </label>
              ))}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">From *</label>
                {airports.length ? (
                  <select className="form-control" value={form.origin} onChange={e=>set('origin',e.target.value)} required>
                    <option value="">Select airport</option>
                    {airports.map(a => <option key={a.id} value={a.id}>{a.code} – {a.name}</option>)}
                  </select>
                ) : (
                  <input className="form-control" placeholder="Origin airport / city" value={form.origin} onChange={e=>set('origin',e.target.value)} required />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">To *</label>
                {airports.length ? (
                  <select className="form-control" value={form.destination} onChange={e=>set('destination',e.target.value)} required>
                    <option value="">Select airport</option>
                    {airports.map(a => <option key={a.id} value={a.id}>{a.code} – {a.name}</option>)}
                  </select>
                ) : (
                  <input className="form-control" placeholder="Destination airport / city" value={form.destination} onChange={e=>set('destination',e.target.value)} required />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Departure Date *</label>
                <input type="date" className="form-control" value={form.departure_date} onChange={e=>set('departure_date',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Departure Time</label>
                <input type="time" className="form-control" value={form.departure_time} onChange={e=>set('departure_time',e.target.value)} />
              </div>
              {form.trip_type === 'round_trip' && (
                <div className="form-group">
                  <label className="form-label">Return Date *</label>
                  <input type="date" className="form-control" value={form.return_date} onChange={e=>set('return_date',e.target.value)} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Passengers *</label>
                <input type="number" min={1} max={200} className="form-control" value={form.passenger_count} onChange={e=>set('passenger_count',parseInt(e.target.value))} required />
              </div>
            </div>

            <div className="form-group" style={{marginTop:20}}>
              <label className="form-label">Preferred Aircraft Category</label>
              <select className="form-control" value={form.preferred_category} onChange={e=>set('preferred_category',e.target.value)}>
                <option value="">No preference</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>

            <h3 className="form-section-title" style={{marginTop:28}}>Add-on Services</h3>
            <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:20}}>
              {[
                ['catering_requested','🍽 Catering'],
                ['ground_transport_requested','🚗 Ground Transport'],
                ['concierge_requested','👤 Concierge'],
              ].map(([k,l]) => (
                <label key={k} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:'0.875rem'}}>
                  <input type="checkbox" checked={form[k]} onChange={e=>set(k,e.target.checked)} />
                  {l}
                </label>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests</label>
              <textarea className="form-control" rows={3} value={form.special_requests} onChange={e=>set('special_requests',e.target.value)} placeholder="Any specific requirements..." />
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