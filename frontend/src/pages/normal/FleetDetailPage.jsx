// src/pages/public/FleetDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { fetchAllPages, bookingAPI, catalogAPI } from '../../services/api';

// ── Reusable airport dropdown (same lightweight version as Fleet.jsx) ──────────
function AirportDropdown({ items, onSelect }) {
  return (
    <ul style={{
      position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
      zIndex: 10000,
      background: 'var(--color-white)',
      border: '1px solid var(--color-light-gray)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-lg)',
      margin: 0, padding: '0.25rem 0', listStyle: 'none',
      maxHeight: '220px', overflowY: 'auto',
    }}>
      {items.map(a => (
        <li
          key={a.id}
          onMouseDown={() => onSelect(a)}
          style={{ padding: '0.55rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-off-white)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{
            fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem',
            background: 'var(--color-navy)', color: 'white',
            padding: '0.15rem 0.4rem', borderRadius: '3px',
            minWidth: '2.8rem', textAlign: 'center',
          }}>{a.code}</span>
          <span style={{ color: 'var(--color-dark-gray)' }}>
            {a.name}
            <span style={{ color: 'var(--color-mid-gray)', marginLeft: '0.3rem' }}>— {a.city}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Inline Charter Form (shown on the detail page itself) ─────────────────────
function CharterForm({ aircraft }) {
  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  const [airports, setAirports]         = useState([]);
  const [airportsLoading, setAl]        = useState(true);
  const [originQuery, setOriginQuery]   = useState('');
  const [destQuery, setDestQuery]       = useState('');
  const [originOpen, setOriginOpen]     = useState(false);
  const [destOpen, setDestOpen]         = useState(false);

  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    trip_type: 'one_way',
    origin: '', destination: '',
    departure_date: '', departure_time: '', return_date: '',
    passenger_count: 1, special_requests: '',
    catering_requested: false,
    ground_transport_requested: false,
    concierge_requested: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(null);
  const [err, setErr]               = useState('');

  useEffect(() => {
    fetchAllPages('/airports/')
      .then(data => setAirports(Array.isArray(data) ? data : []))
      .catch(() => setAirports([]))
      .finally(() => setAl(false));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filterAirports = q =>
    q.length < 2 ? [] : airports.filter(a => {
      const lq = q.toLowerCase();
      return a.code?.toLowerCase().includes(lq)
          || a.name?.toLowerCase().includes(lq)
          || a.city?.toLowerCase().includes(lq);
    }).slice(0, 8);

  const selectOrigin = a => { set('origin', a.id); setOriginQuery(`${a.code} – ${a.name}, ${a.city}`); setOriginOpen(false); };
  const selectDest   = a => { set('destination', a.id); setDestQuery(`${a.code} – ${a.name}, ${a.city}`); setDestOpen(false); };

  const submit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      const payload = {
        ...form,
        operator_aircraft: aircraft.id,
        preferred_category: aircraft.category,
      };
      if (form.trip_type !== 'round_trip') delete payload.return_date;
      if (!payload.departure_time)         delete payload.departure_time;
      const { data } = await bookingAPI.create(payload);
      setDone(data.booking?.reference);
    } catch (e) {
      const d = e.response?.data;
      if (typeof d === 'object' && d !== null) {
        setErr(Object.entries(d).map(([f,v]) => `${f}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | '));
      } else {
        setErr('Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(26,127,90,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <i className="bi bi-check-lg" style={{ fontSize: '2rem', color: 'var(--color-success)' }}></i>
        </div>
        <h3 style={{ color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Request Submitted!</h3>
        <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          Our team will respond within 2–4 hours with a tailored quote.
        </p>
        <div style={{
          display: 'inline-block', background: 'var(--color-off-white)',
          border: '1px solid var(--color-light-gray)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.2rem' }}>Reference</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-navy)', fontSize: '1rem' }}>
            {String(done).slice(0, 8).toUpperCase()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/track" className="btn-primary-gov btn-sm">
            <i className="bi bi-search"></i> Track Booking
          </Link>
          <Link to="/fleet" className="btn-outline-gov btn-sm">
            <i className="bi bi-grid"></i> Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      {err && (
        <div style={{
          marginBottom: '1rem', padding: '0.75rem 1rem',
          background: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-sm)', color: '#991b1b',
          fontSize: '0.85rem', display: 'flex', gap: '0.5rem',
        }}>
          <i className="bi bi-exclamation-triangle" style={{ flexShrink: 0 }}></i>
          <span>{err}</span>
        </div>
      )}

      {/* Section helper */}
      {(() => {
        const SectionHead = ({ icon, label }) => (
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '2px',
            textTransform: 'uppercase', color: 'var(--color-navy)',
            marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i> {label}
          </div>
        );

        return (
          <>
            {/* Contact */}
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionHead icon="bi-person" label="Your Details" />
              <div className="form-row" style={{ gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label-gov">Full Name <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input-gov" value={form.guest_name} onChange={e => set('guest_name', e.target.value)} required placeholder="John Smith" />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Email <span style={{ color: 'red' }}>*</span></label>
                  <input type="email" className="form-input-gov" value={form.guest_email} onChange={e => set('guest_email', e.target.value)} required placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Phone</label>
                  <input className="form-input-gov" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} placeholder="+254 724 878 136" />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Company</label>
                  <input className="form-input-gov" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>

            {/* Flight */}
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionHead icon="bi-airplane" label="Flight Details" />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[['one_way','One Way'],['round_trip','Round Trip'],['multi_leg','Multi-Leg']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => set('trip_type', v)} style={{
                    padding: '0.4rem 1rem', borderRadius: '100px', border: '1px solid',
                    borderColor: form.trip_type === v ? 'var(--color-navy)' : 'var(--color-light-gray)',
                    background:  form.trip_type === v ? 'var(--color-navy)' : 'transparent',
                    color:       form.trip_type === v ? 'white' : 'var(--color-dark-gray)',
                    fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
                  }}>{l}</button>
                ))}
              </div>
              <div className="form-row" style={{ gap: '0.75rem' }}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label-gov">From <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input-gov" value={originQuery}
                    onChange={e => { setOriginQuery(e.target.value); setOriginOpen(true); if (form.origin) set('origin', ''); }}
                    onFocus={() => { if (originQuery.length >= 2) setOriginOpen(true); }}
                    onBlur={() => setTimeout(() => setOriginOpen(false), 160)}
                    placeholder={airportsLoading ? 'Loading airports…' : 'City or airport code…'}
                    disabled={airportsLoading} required autoComplete="off"
                  />
                  {originOpen && filterAirports(originQuery).length > 0 && (
                    <AirportDropdown items={filterAirports(originQuery)} onSelect={selectOrigin} />
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label-gov">To <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input-gov" value={destQuery}
                    onChange={e => { setDestQuery(e.target.value); setDestOpen(true); if (form.destination) set('destination', ''); }}
                    onFocus={() => { if (destQuery.length >= 2) setDestOpen(true); }}
                    onBlur={() => setTimeout(() => setDestOpen(false), 160)}
                    placeholder={airportsLoading ? 'Loading airports…' : 'City or airport code…'}
                    disabled={airportsLoading} required autoComplete="off"
                  />
                  {destOpen && filterAirports(destQuery).length > 0 && (
                    <AirportDropdown items={filterAirports(destQuery)} onSelect={selectDest} />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Departure Date <span style={{ color: 'red' }}>*</span></label>
                  <input type="date" className="form-input-gov" value={form.departure_date} onChange={e => set('departure_date', e.target.value)} min={today} required />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Departure Time</label>
                  <input type="time" className="form-input-gov" value={form.departure_time} onChange={e => set('departure_time', e.target.value)} />
                </div>
                {form.trip_type === 'round_trip' && (
                  <div className="form-group">
                    <label className="form-label-gov">Return Date <span style={{ color: 'red' }}>*</span></label>
                    <input type="date" className="form-input-gov" value={form.return_date} onChange={e => set('return_date', e.target.value)} min={form.departure_date || today} required />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label-gov">Passengers <span style={{ color: 'red' }}>*</span></label>
                  <input type="number" min={1} max={aircraft.passenger_capacity} className="form-input-gov" value={form.passenger_count} onChange={e => set('passenger_count', parseInt(e.target.value) || 1)} required />
                  <div className="form-hint">Max {aircraft.passenger_capacity} for this aircraft</div>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionHead icon="bi-stars" label="Add-ons" />
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  ['catering_requested','bi-cup-hot','In-Flight Catering'],
                  ['ground_transport_requested','bi-car-front','Ground Transport'],
                  ['concierge_requested','bi-headset','Concierge'],
                ].map(([k, icon, label]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-dark-gray)' }}>
                    <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: 'var(--color-navy)' }} />
                    <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i> {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Requests */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <SectionHead icon="bi-chat-text" label="Special Requests" />
              <textarea className="form-input-gov" rows={3} value={form.special_requests} onChange={e => set('special_requests', e.target.value)} placeholder="Dietary requirements, occasions, preferences…" />
            </div>

            <button type="submit" className="btn-primary-gov" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              {submitting
                ? <><div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>&nbsp;Submitting…</>
                : <><i className="bi bi-send"></i> Submit Charter Request</>
              }
            </button>
            <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>
              <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 2–4 hours.
            </p>
          </>
        );
      })()}
    </form>
  );
}

// ── Fleet Detail Page ─────────────────────────────────────────────────────────
export default function FleetDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [ac, setAc]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    catalogAPI.opAircraftDetail(id)
      .then(r => setAc(r.data))
      .catch(err => {
        console.error(err);
        setError(err.response?.status === 404
          ? 'Aircraft not found.'
          : 'Failed to load aircraft details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <PublicNavbar />
      <div className="loading-page" style={{ minHeight: '60vh' }}>
        <div className="spinner-gov"></div>
        <p>Loading aircraft details…</p>
      </div>
      <PublicFooter />
    </>
  );

  if (error || !ac) return (
    <>
      <PublicNavbar />
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <i className="bi bi-airplane" style={{ fontSize: '3rem', color: 'var(--color-mid-gray)' }}></i>
        <h2>{error || 'Aircraft not found'}</h2>
        <Link to="/fleet" className="btn-primary-gov btn-sm">
          <i className="bi bi-arrow-left"></i> Back to Fleet
        </Link>
      </div>
      <PublicFooter />
    </>
  );

  const images = ac.images?.length ? ac.images : (ac.image_url ? [ac.image_url] : []);

  const specs = [
    { icon: 'bi-people',           label: 'Passenger Capacity', value: `${ac.passenger_capacity} seats` },
    { icon: 'bi-arrow-left-right', label: 'Range',              value: `${ac.range_km?.toLocaleString()} km` },
    { icon: 'bi-speedometer2',     label: 'Cruise Speed',       value: ac.cruise_speed_kmh ? `${ac.cruise_speed_kmh?.toLocaleString()} km/h` : '—' },
    { icon: 'bi-luggage',          label: 'Max Baggage',        value: ac.max_baggage_kg ? `${ac.max_baggage_kg} kg` : '—' },
    { icon: 'bi-calendar3',        label: 'Year Built',         value: ac.year_of_manufacture || '—' },
    { icon: 'bi-shield-check',     label: 'Registration',       value: ac.registration_number || '—' },
  ];

  const amenityIcons = {
    'Wi-Fi': 'bi-wifi', 'WiFi': 'bi-wifi',
    'Entertainment': 'bi-tv', 'Catering': 'bi-cup-hot',
    'Bedroom': 'bi-door-open', 'Shower': 'bi-droplet',
    'Bar': 'bi-cup-straw', 'Conference': 'bi-people',
  };

  return (
    <>
      <Helmet>
        <title>{ac.name} | NairobiJetHouse Fleet</title>
        <meta name="description" content={`Charter the ${ac.name} — ${ac.passenger_capacity} seats, ${ac.range_km?.toLocaleString()} km range. ${ac.description?.slice(0, 120) || ''}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.nairobijethouse.com/fleet/${id}`} />
      </Helmet>

      <PublicNavbar />

      {/* Breadcrumb */}
      <div style={{
        background: 'var(--color-navy-dark)',
        padding: '0.75rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</Link>
          <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
          <Link to="/fleet" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Fleet</Link>
          <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
          <span style={{ color: 'var(--color-gold)' }}>{ac.name}</span>
        </div>
      </div>

      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="detail-layout">

            {/* ── Left: Aircraft info ── */}
            <div className="detail-main">

              {/* Image gallery */}
              <div style={{
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                background: 'var(--color-navy-dark)',
                marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-lg)',
              }}>
                {images.length > 0 ? (
                  <>
                    <div style={{ height: '380px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={images[activeImage]}
                        alt={`${ac.name} — view ${activeImage + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Category badge */}
                      <span style={{
                        position: 'absolute', top: '1rem', left: '1rem',
                        background: 'var(--color-gold)', color: 'var(--color-navy)',
                        fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700,
                        letterSpacing: '1px', textTransform: 'uppercase',
                        padding: '0.3rem 0.75rem', borderRadius: '100px',
                      }}>{ac.category_display}</span>
                      {ac.is_featured && (
                        <span style={{
                          position: 'absolute', top: '1rem', right: '1rem',
                          background: 'var(--color-navy)', color: 'var(--color-gold)',
                          fontFamily: 'var(--font-label)', fontSize: '0.65rem', fontWeight: 700,
                          letterSpacing: '1px', textTransform: 'uppercase',
                          padding: '0.3rem 0.75rem', borderRadius: '100px',
                          border: '1px solid var(--color-gold)',
                        }}>Featured</span>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', overflowX: 'auto' }}>
                        {images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            style={{
                              width: '72px', height: '50px', borderRadius: '6px',
                              overflow: 'hidden', border: '2px solid',
                              borderColor: i === activeImage ? 'var(--color-gold)' : 'transparent',
                              cursor: 'pointer', padding: 0, flexShrink: 0,
                            }}
                          >
                            <img src={img} alt={`thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                    <i className="bi bi-airplane" style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.2)' }}></i>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>No image available</span>
                  </div>
                )}
              </div>

              {/* Title + operator */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
                }}>
                  <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                      {ac.name}
                    </h1>
                    <div style={{ color: 'var(--color-gold-dark)', fontWeight: 600, fontSize: '0.85rem' }}>
                      <i className="bi bi-building"></i> {ac.operator_name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                      ${parseFloat(ac.display_hourly_rate || ac.hourly_rate_usd)?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>per hour</div>
                  </div>
                </div>
              </div>

              {/* Quick specs grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '1rem', marginBottom: '2rem',
              }}>
                {specs.map(({ icon, label, value }) => (
                  <div key={label} style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-light-gray)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                      <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}></i>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-mid-gray)' }}>{label}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Features strip */}
              <div style={{
                display: 'flex', gap: '1rem', flexWrap: 'wrap',
                marginBottom: '2rem', padding: '1rem',
                background: 'var(--color-white)',
                border: '1px solid var(--color-light-gray)',
                borderRadius: 'var(--radius-sm)',
              }}>
                {[
                  [ac.wifi_available,   'bi-wifi',    'Wi-Fi'],
                  [ac.pets_allowed,     'bi-heart',   'Pets OK'],
                  [!ac.smoking_allowed, 'bi-slash-circle', 'Non-Smoking'],
                ].filter(([cond]) => cond).map(([, icon, label]) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--color-dark-gray)', fontWeight: 500 }}>
                    <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i> {label}
                  </span>
                ))}
              </div>

              {/* Description */}
              {ac.description && (
                <div style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-light-gray)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem', marginBottom: '1.5rem',
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
                    About This Aircraft
                  </h3>
                  <p style={{ color: 'var(--color-dark-gray)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
                    {ac.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {ac.amenities?.length > 0 && (
                <div style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-light-gray)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem', marginBottom: '1.5rem',
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '1rem' }}>
                    Cabin Amenities
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {ac.amenities.map((am, i) => {
                      const icon = Object.entries(amenityIcons).find(([k]) => am.toLowerCase().includes(k.toLowerCase()))?.[1] || 'bi-star';
                      return (
                        <span key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          background: 'var(--color-off-white)',
                          border: '1px solid var(--color-light-gray)',
                          borderRadius: '100px',
                          padding: '0.3rem 0.85rem',
                          fontSize: '0.8rem', color: 'var(--color-dark-gray)',
                        }}>
                          <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i> {am}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Base airport */}
              {ac.base_airport && (
                <div style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-light-gray)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  fontSize: '0.875rem', color: 'var(--color-dark-gray)',
                }}>
                  <i className="bi bi-geo-alt" style={{ color: 'var(--color-gold)', fontSize: '1.1rem' }}></i>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Base Airport</div>
                    <div>{typeof ac.base_airport === 'object' ? `${ac.base_airport.code} – ${ac.base_airport.name}, ${ac.base_airport.city}` : ac.base_airport}</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Charter form ── */}
            <div className="detail-sidebar">
              <div style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-light-gray)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                position: 'sticky',
                top: '90px',
                boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{
                  background: 'var(--color-navy)',
                  padding: '1.25rem 1.5rem',
                }}>
                  <div style={{ color: 'var(--color-gold)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Charter This Aircraft
                  </div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                    {ac.name}
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                      ['bi-people',           `${ac.passenger_capacity} seats`],
                      ['bi-arrow-left-right', `${ac.range_km?.toLocaleString()} km`],
                      ['bi-tag',              `$${parseFloat(ac.display_hourly_rate || ac.hourly_rate_usd)?.toLocaleString()}/hr`],
                    ].map(([icon, text]) => (
                      <span key={icon} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i> {text}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <CharterForm aircraft={ac} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .detail-layout {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 2.5rem;
          align-items: start;
        }
        .detail-main   { min-width: 0; }
        .detail-sidebar { }

        @media (max-width: 1100px) {
          .detail-layout { grid-template-columns: 1fr; }
          .detail-sidebar > div { position: static !important; }
        }
      `}</style>
    </>
  );
}