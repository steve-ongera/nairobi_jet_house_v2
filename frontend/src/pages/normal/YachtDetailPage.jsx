// src/pages/normal/YachtDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { fetchAllPages, charterAPI, catalogAPI } from '../../services/api';

// ── Reusable airport dropdown ──────────────────────────────────────────────────
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

// ── Charter Form for Yacht ─────────────────────────────────────────────────────
function YachtCharterForm({ yacht }) {
  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  const [airports, setAirports]         = useState([]);
  const [airportsLoading, setAl]        = useState(true);

  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    departure_port: '',
    destination_port: '',
    charter_start: '',
    charter_end: '',
    guest_count: 1,
    itinerary_description: '',
    special_requests: '',
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

  const submit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      const payload = {
        ...form,
        operator_yacht: yacht.id,
      };
      const { data } = await charterAPI.create(payload);
      setDone(data.charter?.reference);
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
        <h3 style={{ color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Charter Request Submitted!</h3>
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
          <Link to="/yachts" className="btn-outline-gov btn-sm">
            <i className="bi bi-grid"></i> Back to Yachts
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

            {/* Yacht Charter Details */}
            <div style={{ marginBottom: '1.5rem' }}>
              <SectionHead icon="bi-ship" label="Charter Details" />
              <div className="form-row" style={{ gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label-gov">Departure Port <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input-gov" value={form.departure_port} onChange={e => set('departure_port', e.target.value)} required placeholder="e.g. Mombasa, Kenya" />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Destination Port</label>
                  <input className="form-input-gov" value={form.destination_port} onChange={e => set('destination_port', e.target.value)} placeholder="e.g. Zanzibar, Tanzania" />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Start Date <span style={{ color: 'red' }}>*</span></label>
                  <input type="date" className="form-input-gov" value={form.charter_start} onChange={e => set('charter_start', e.target.value)} min={today} required />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">End Date <span style={{ color: 'red' }}>*</span></label>
                  <input type="date" className="form-input-gov" value={form.charter_end} onChange={e => set('charter_end', e.target.value)} min={form.charter_start || today} required />
                </div>
                <div className="form-group">
                  <label className="form-label-gov">Guests <span style={{ color: 'red' }}>*</span></label>
                  <input type="number" min={1} max={yacht.guest_capacity} className="form-input-gov" value={form.guest_count} onChange={e => set('guest_count', parseInt(e.target.value) || 1)} required />
                  <div className="form-hint">Max {yacht.guest_capacity} guests</div>
                </div>
              </div>
            </div>

            {/* Itinerary & Requests */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <SectionHead icon="bi-map" label="Itinerary Description" />
              <textarea className="form-input-gov" rows={3} value={form.itinerary_description} onChange={e => set('itinerary_description', e.target.value)} placeholder="Describe your planned route, stops, and activities..." />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <SectionHead icon="bi-chat-text" label="Special Requests" />
              <textarea className="form-input-gov" rows={2} value={form.special_requests} onChange={e => set('special_requests', e.target.value)} placeholder="Dietary requirements, special occasions, preferred amenities…" />
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

// ── Yacht Detail Page ─────────────────────────────────────────────────────────
export default function YachtDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [yacht, setYacht] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    catalogAPI.opYachtDetail(id)
      .then(r => setYacht(r.data))
      .catch(err => {
        console.error(err);
        setError(err.response?.status === 404
          ? 'Yacht not found.'
          : 'Failed to load yacht details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <PublicNavbar />
      <div className="loading-page" style={{ minHeight: '60vh' }}>
        <div className="spinner-gov"></div>
        <p>Loading yacht details…</p>
      </div>
      <PublicFooter />
    </>
  );

  if (error || !yacht) return (
    <>
      <PublicNavbar />
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <i className="bi bi-ship" style={{ fontSize: '3rem', color: 'var(--color-mid-gray)' }}></i>
        <h2>{error || 'Yacht not found'}</h2>
        <Link to="/yachts" className="btn-primary-gov btn-sm">
          <i className="bi bi-arrow-left"></i> Back to Yachts
        </Link>
      </div>
      <PublicFooter />
    </>
  );

  const images = yacht.images?.length ? yacht.images : (yacht.image_url ? [yacht.image_url] : []);

  const specs = [
    { icon: 'bi-people',           label: 'Guest Capacity', value: `${yacht.guest_capacity} guests` },
    { icon: 'bi-people',           label: 'Crew',           value: `${yacht.crew_count} crew` },
    { icon: 'bi-rulers',           label: 'Length',         value: `${yacht.length_meters}m` },
    { icon: 'bi-house',            label: 'Cabins',         value: yacht.cabin_count ? `${yacht.cabin_count} cabins` : '—' },
    { icon: 'bi-calendar3',        label: 'Year Built',     value: yacht.year_built || '—' },
    { icon: 'bi-geo-alt',          label: 'Home Port',      value: yacht.home_port || '—' },
  ];

  const amenityIcons = {
    'Wi-Fi': 'bi-wifi', 'WiFi': 'bi-wifi',
    'Air Conditioning': 'bi-snow2', 'AC': 'bi-snow2',
    'Jacuzzi': 'bi-droplet', 'Swimming Pool': 'bi-droplet',
    'Entertainment': 'bi-tv', 'TV': 'bi-tv',
    'Catering': 'bi-cup-hot', 'Chef': 'bi-cup-hot',
    'Bar': 'bi-cup-straw', 'Mini Bar': 'bi-cup-straw',
    'Water Sports': 'bi-water', 'Scuba': 'bi-water',
    'Fishing': 'bi-fish', 'Gym': 'bi-heart-pulse',
    'Spa': 'bi-flower1', 'Massage': 'bi-flower1',
    'Sun Deck': 'bi-sun', 'Helipad': 'bi-helicopter',
  };

  const typeDisplay = {
    'sailing': 'Sailing Yacht',
    'motor': 'Motor Yacht',
    'catamaran': 'Catamaran',
    'gulet': 'Gulet',
    'superyacht': 'Superyacht',
    'mega': 'Megayacht (80m+)',
  };

  return (
    <>
      <Helmet>
        <title>{yacht.name} | NairobiJetHouse Yacht Fleet</title>
        <meta name="description" content={`Charter the ${yacht.name} — ${yacht.guest_capacity} guests, ${yacht.length_meters}m. ${yacht.description?.slice(0, 120) || ''}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.nairobijethouse.com/yachts/${id}`} />
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
          <Link to="/yachts" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Yachts</Link>
          <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i>
          <span style={{ color: 'var(--color-gold)' }}>{yacht.name}</span>
        </div>
      </div>

      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="detail-layout">

            {/* ── Left: Yacht info ── */}
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
                        alt={`${yacht.name} — view ${activeImage + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Type badge */}
                      <span style={{
                        position: 'absolute', top: '1rem', left: '1rem',
                        background: 'var(--color-gold)', color: 'var(--color-navy)',
                        fontFamily: 'var(--font-label)', fontSize: '0.7rem', fontWeight: 700,
                        letterSpacing: '1px', textTransform: 'uppercase',
                        padding: '0.3rem 0.75rem', borderRadius: '100px',
                      }}>{typeDisplay[yacht.yacht_type] || yacht.yacht_type}</span>
                      {yacht.is_featured && (
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
                    <i className="bi bi-ship" style={{ fontSize: '4rem', color: 'rgba(255,255,255,0.2)' }}></i>
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
                      {yacht.name}
                    </h1>
                    <div style={{ color: 'var(--color-gold-dark)', fontWeight: 600, fontSize: '0.85rem' }}>
                      <i className="bi bi-building"></i> {yacht.operator_name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                      ${parseFloat(yacht.daily_rate_usd)?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-mid-gray)' }}>per day</div>
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

              {/* Description */}
              {yacht.description && (
                <div style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-light-gray)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem', marginBottom: '1.5rem',
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
                    About This Yacht
                  </h3>
                  <p style={{ color: 'var(--color-dark-gray)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
                    {yacht.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {yacht.amenities?.length > 0 && (
                <div style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-light-gray)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem', marginBottom: '1.5rem',
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '1rem' }}>
                    Yacht Amenities
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                    {yacht.amenities.map((am, i) => {
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

              {/* Home port & flag state */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                {yacht.home_port && (
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
                      <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Home Port</div>
                      <div>{yacht.home_port}</div>
                    </div>
                  </div>
                )}
                {yacht.flag_state && (
                  <div style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-light-gray)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    fontSize: '0.875rem', color: 'var(--color-dark-gray)',
                  }}>
                    <i className="bi bi-flag" style={{ color: 'var(--color-gold)', fontSize: '1.1rem' }}></i>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Flag State</div>
                      <div>{yacht.flag_state}</div>
                    </div>
                  </div>
                )}
              </div>
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
                    Charter This Yacht
                  </div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                    {yacht.name}
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                      ['bi-people',           `${yacht.guest_capacity} guests`],
                      ['bi-people',           `${yacht.crew_count} crew`],
                      ['bi-tag',              `$${parseFloat(yacht.daily_rate_usd)?.toLocaleString()}/day`],
                    ].map(([icon, text]) => (
                      <span key={icon} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i> {text}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <YachtCharterForm yacht={yacht} />
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