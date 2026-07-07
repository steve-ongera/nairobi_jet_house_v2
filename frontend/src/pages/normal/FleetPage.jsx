// src/pages/public/Fleet.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { fetchAllPages, bookingAPI, catalogAPI } from '../../services/api';

const CATS = [
  '', 'light', 'midsize', 'super_midsize',
  'heavy', 'ultra_long', 'vip_airliner', 'turboprop', 'helicopter',
];
const CATEGORY_NAMES = {
  '':             'All Categories',
  light:          'Light Jets',
  midsize:        'Midsize Jets',
  super_midsize:  'Super Midsize',
  heavy:          'Heavy Jets',
  ultra_long:     'Ultra Long Range',
  vip_airliner:   'VIP Airliners',
  turboprop:      'Turboprops',
  helicopter:     'Helicopters',
};

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type':    'ItemList',
  name:        'NairobiJetHouse Fleet',
  description: 'Our network of approved private aircraft available for charter worldwide.',
};

// ── Charter Modal ─────────────────────────────────────────────────────────────
function CharterModal({ aircraft, onClose }) {
  const modalRef = useRef(null);
  const today    = new Date().toISOString().split('T')[0];

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
    passenger_count: 1,
    special_requests: '',
    catering_requested: false,
    ground_transport_requested: false,
    concierge_requested: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(null);
  const [err, setErr]               = useState('');

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on backdrop click
  const handleBackdrop = e => {
    if (e.target === modalRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Load airports for comboboxes
  useEffect(() => {
    fetchAllPages('/airports/')
      .then(data => setAirports(Array.isArray(data) ? data : []))
      .catch(() => setAirports([]))
      .finally(() => setAl(false));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Simple airport filter helper
  const filterAirports = q =>
    q.length < 2 ? [] : airports.filter(a => {
      const lq = q.toLowerCase();
      return a.code?.toLowerCase().includes(lq)
          || a.name?.toLowerCase().includes(lq)
          || a.city?.toLowerCase().includes(lq);
    }).slice(0, 8);

  const selectOrigin = a => {
    set('origin', a.id);
    setOriginQuery(`${a.code} – ${a.name}, ${a.city}`);
    setOriginOpen(false);
  };
  const selectDest = a => {
    set('destination', a.id);
    setDestQuery(`${a.code} – ${a.name}, ${a.city}`);
    setDestOpen(false);
  };

  const submit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      const payload = {
        ...form,
        // Pre-fill the operator aircraft so the booking is linked
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
        const msgs = Object.entries(d)
          .map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
        setErr(msgs);
      } else {
        setErr('Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={modalRef}
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5,20,50,0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '2rem 1rem',
      }}
    >
      <div style={{
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: '640px',
        boxShadow: '0 32px 80px rgba(5,20,50,0.35)',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.22s ease',
      }}>

        {/* Header */}
        <div style={{
          background: 'var(--color-navy)',
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
              Charter Request
            </div>
            <div style={{ color: 'var(--color-white)', fontWeight: 700, fontSize: '1rem' }}>
              {aircraft.name}
              <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400, fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                ({aircraft.registration_number})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'white', width: '32px', height: '32px',
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Aircraft quick-specs strip */}
        <div style={{
          display: 'flex', gap: '1.5rem', padding: '0.85rem 1.5rem',
          background: 'var(--color-off-white)',
          borderBottom: '1px solid var(--color-light-gray)',
          flexWrap: 'wrap',
        }}>
          {[
            ['bi-people',           `${aircraft.passenger_capacity} seats`],
            ['bi-arrow-left-right', `${aircraft.range_km?.toLocaleString()} km range`],
            ['bi-tag',              `$${parseFloat(aircraft.display_hourly_rate || aircraft.hourly_rate_usd)?.toLocaleString()}/hr`],
          ].map(([icon, text]) => (
            <span key={icon} style={{ fontSize: '0.78rem', color: 'var(--color-dark-gray)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i> {text}
            </span>
          ))}
        </div>

        {/* Success state */}
        {done ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(26,127,90,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <i className="bi bi-check-lg" style={{ fontSize: '2rem', color: 'var(--color-success)' }}></i>
            </div>
            <h3 style={{ color: 'var(--color-navy)', marginBottom: '0.5rem' }}>Request Submitted!</h3>
            <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Our team will respond within 2–4 hours with a tailored quote for this aircraft.
            </p>
            <div style={{
              background: 'var(--color-off-white)',
              border: '1px solid var(--color-light-gray)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'inline-block',
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.2rem' }}>
                Reference
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-navy)' }}>
                {String(done).slice(0, 8).toUpperCase()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={onClose} className="btn-outline-gov btn-sm">Close</button>
              <Link to="/track" className="btn-primary-gov btn-sm" onClick={onClose}>
                <i className="bi bi-search"></i> Track Booking
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={submit} style={{ padding: '1.5rem' }}>
            {err && (
              <div style={{
                marginBottom: '1rem', padding: '0.75rem 1rem',
                background: '#fef2f2', border: '1px solid #fca5a5',
                borderRadius: 'var(--radius-sm)',
                color: '#991b1b', fontSize: '0.85rem',
                display: 'flex', gap: '0.5rem',
              }}>
                <i className="bi bi-exclamation-triangle" style={{ flexShrink: 0 }}></i>
                <span>{err}</span>
              </div>
            )}

            {/* Contact */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="bi bi-person" style={{ color: 'var(--color-gold)' }}></i> Your Details
              </div>
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

            {/* Flight details */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="bi bi-airplane" style={{ color: 'var(--color-gold)' }}></i> Flight Details
              </div>

              {/* Trip type */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[['one_way','One Way'],['round_trip','Round Trip'],['multi_leg','Multi-Leg']].map(([v,l]) => (
                  <button
                    key={v} type="button"
                    onClick={() => set('trip_type', v)}
                    style={{
                      padding: '0.4rem 1rem', borderRadius: '100px',
                      border: '1px solid',
                      borderColor: form.trip_type === v ? 'var(--color-navy)' : 'var(--color-light-gray)',
                      background:  form.trip_type === v ? 'var(--color-navy)' : 'transparent',
                      color:       form.trip_type === v ? 'white' : 'var(--color-dark-gray)',
                      fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500,
                    }}
                  >{l}</button>
                ))}
              </div>

              <div className="form-row" style={{ gap: '0.75rem' }}>
                {/* Origin combobox */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label-gov">From <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className="form-input-gov"
                    value={originQuery}
                    onChange={e => { setOriginQuery(e.target.value); setOriginOpen(true); if (form.origin) set('origin', ''); }}
                    onFocus={() => { if (originQuery.length >= 2) setOriginOpen(true); }}
                    onBlur={() => setTimeout(() => setOriginOpen(false), 160)}
                    placeholder={airportsLoading ? 'Loading airports…' : 'City or airport code…'}
                    disabled={airportsLoading}
                    required
                    autoComplete="off"
                  />
                  {originOpen && filterAirports(originQuery).length > 0 && (
                    <AirportDropdown items={filterAirports(originQuery)} onSelect={selectOrigin} />
                  )}
                </div>

                {/* Destination combobox */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label-gov">To <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className="form-input-gov"
                    value={destQuery}
                    onChange={e => { setDestQuery(e.target.value); setDestOpen(true); if (form.destination) set('destination', ''); }}
                    onFocus={() => { if (destQuery.length >= 2) setDestOpen(true); }}
                    onBlur={() => setTimeout(() => setDestOpen(false), 160)}
                    placeholder={airportsLoading ? 'Loading airports…' : 'City or airport code…'}
                    disabled={airportsLoading}
                    required
                    autoComplete="off"
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
                  <input
                    type="number" min={1} max={aircraft.passenger_capacity}
                    className="form-input-gov"
                    value={form.passenger_count}
                    onChange={e => set('passenger_count', parseInt(e.target.value) || 1)}
                    required
                  />
                  <div className="form-hint">Max {aircraft.passenger_capacity} for this aircraft</div>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="bi bi-stars" style={{ color: 'var(--color-gold)' }}></i> Add-ons
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  ['catering_requested',         'bi-cup-hot',   'Catering'],
                  ['ground_transport_requested',  'bi-car-front', 'Ground Transport'],
                  ['concierge_requested',         'bi-headset',   'Concierge'],
                ].map(([k, icon, label]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-dark-gray)' }}>
                    <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: 'var(--color-navy)' }} />
                    <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i>
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Special requests */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label-gov">Special Requests</label>
              <textarea
                className="form-input-gov" rows={3}
                value={form.special_requests}
                onChange={e => set('special_requests', e.target.value)}
                placeholder="Dietary requirements, occasions, preferences…"
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn-outline-gov btn-sm">Cancel</button>
              <button type="submit" className="btn-primary-gov btn-sm" disabled={submitting}>
                {submitting ? (
                  <><div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>&nbsp;Submitting…</>
                ) : (
                  <><i className="bi bi-send"></i> Submit Request</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// Small reusable dropdown for both origin/dest inside the modal
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
          style={{
            padding: '0.55rem 1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            fontSize: '0.85rem',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-off-white)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{
            fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem',
            background: 'var(--color-navy)', color: 'white',
            padding: '0.15rem 0.4rem', borderRadius: '3px', minWidth: '2.8rem',
            textAlign: 'center',
          }}>{a.code}</span>
          <span style={{ color: 'var(--color-dark-gray)' }}>
            {a.name}
            <span style={{ color: 'var(--color-mid-gray)', marginLeft: '0.3rem' }}>
              — {a.city}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Main Fleet Page ───────────────────────────────────────────────────────────
export default function FleetPage() {
  const [aircraft, setAircraft]     = useState([]);
  const [cat, setCat]               = useState('');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [charterAc, setCharterAc]   = useState(null); // aircraft to charter

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = { is_approved: true };
    if (cat)    params.category = cat;
    if (search) params.search   = search;

    // fetchAllPages follows DRF pagination automatically
    fetchAllPages('/operator-aircraft/', params)
      .then(data => {
        if (!cancelled) setAircraft(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Fleet fetch failed:', err.response?.data || err.message);
          setError('Failed to load fleet. Please refresh the page.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [cat, search]);

  return (
    <>
      <Helmet>
        <title>Our Fleet | NairobiJetHouse - Private Aircraft Available for Charter</title>
        <meta name="description" content="Browse our fleet of approved private aircraft available for charter. From light jets to ultra-long-range aircraft." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/fleet" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">Our Fleet</span>
          <h1>Explore Our <em style={{ color: 'var(--color-gold-light)' }}>Aircraft</em></h1>
          <p>Approved partner aircraft available for charter. From nimble light jets to ultra-long-range flagships — we have the right aircraft for every mission.</p>
        </div>
      </div>

      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">

          {/* Filters */}
          <div className="fleet-filters">
            <div className="fleet-search">
              <i className="bi bi-search"></i>
              <input
                className="form-input-gov"
                placeholder="Search by name, model…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-input-gov fleet-category-select"
              value={cat}
              onChange={e => setCat(e.target.value)}
            >
              {CATS.map(c => (
                <option key={c} value={c}>{CATEGORY_NAMES[c]}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              textAlign: 'center', padding: '3rem',
              color: '#991b1b', background: '#fef2f2',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fca5a5',
            }}>
              <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
              {error}
            </div>
          )}

          {/* Loading */}
          {!error && loading && (
            <div className="loading-page">
              <div className="spinner-gov"></div>
              <p>Loading fleet…</p>
            </div>
          )}

          {/* Empty */}
          {!error && !loading && aircraft.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon"><i className="bi bi-airplane"></i></div>
              <h3>No aircraft found</h3>
              <p>No aircraft match your search criteria. Try adjusting your filters.</p>
              <button onClick={() => { setSearch(''); setCat(''); }} className="btn-primary-gov btn-sm">
                <i className="bi bi-arrow-counterclockwise"></i> Clear Filters
              </button>
            </div>
          )}

          {/* Grid */}
          {!error && !loading && aircraft.length > 0 && (
            <>
              <div className="fleet-results-header">
                <div className="text-muted">
                  <i className="bi bi-airplane"></i> {aircraft.length} aircraft available
                </div>
                {(search || cat) && (
                  <button onClick={() => { setSearch(''); setCat(''); }} className="btn-ghost btn-sm">
                    <i className="bi bi-x-circle"></i> Clear filters
                  </button>
                )}
              </div>

              <div className="fleet-grid">
                {aircraft.map(ac => (
                  <AircraftCard
                    key={ac.id}
                    ac={ac}
                    onCharter={() => setCharterAc(ac)}
                  />
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <div className="fleet-cta">
            <h3>Don't see what you're looking for?</h3>
            <p>Our team can source any aircraft for your specific needs. Contact us for personalised assistance.</p>
            <div className="fleet-cta__actions">
              <Link to="/contact" className="btn-gold">
                <i className="bi bi-envelope"></i> Contact Our Team
              </Link>
              <Link to="/private-jet-charter" className="btn-outline-white">
                <i className="bi bi-send"></i> Open Full Request Form
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Charter modal — rendered outside the section so it overlays everything */}
      {charterAc && (
        <CharterModal
          aircraft={charterAc}
          onClose={() => setCharterAc(null)}
        />
      )}

      <FleetStyles />
    </>
  );
}

// ── Aircraft Card ─────────────────────────────────────────────────────────────
function AircraftCard({ ac, onCharter }) {
  return (
    <div className="aircraft-card">
      <div className="aircraft-card__image">
        {ac.image_url
          ? <img src={ac.image_url} alt={ac.name} loading="lazy" />
          : <div className="aircraft-card__placeholder"><i className="bi bi-airplane"></i></div>
        }
        <span className="badge-gold aircraft-card__badge">{ac.category_display}</span>
        {ac.is_featured && (
          <span style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'var(--color-gold)', color: 'var(--color-navy)',
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1px',
            padding: '0.2rem 0.5rem', borderRadius: '100px', textTransform: 'uppercase',
          }}>Featured</span>
        )}
      </div>
      <div className="aircraft-card__body">
        <h3 className="aircraft-card__title">{ac.name}</h3>
        <div className="aircraft-card__operator">{ac.operator_name}</div>
        <div className="aircraft-card__specs">
          <div className="aircraft-card__spec">
            <i className="bi bi-people"></i>
            <span>{ac.passenger_capacity} passengers</span>
          </div>
          <div className="aircraft-card__spec">
            <i className="bi bi-arrow-left-right"></i>
            <span>{ac.range_km?.toLocaleString()} km</span>
          </div>
          {ac.wifi_available && (
            <div className="aircraft-card__spec">
              <i className="bi bi-wifi"></i>
              <span>Wi-Fi</span>
            </div>
          )}
        </div>
        <div className="aircraft-card__price">
          ${parseFloat(ac.display_hourly_rate || ac.hourly_rate_usd)?.toLocaleString()}
          <small> / hour</small>
        </div>
        <div className="aircraft-card__actions">
          <button
            onClick={onCharter}
            className="btn-primary-gov btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <i className="bi bi-airplane"></i> Charter
          </button>
          <Link
            to={`/fleet/${ac.id}`}
            className="btn-outline-gov btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <i className="bi bi-info-circle"></i> Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function FleetStyles() {
  return (
    <style>{`
      .fleet-filters {
        display: flex; gap: 1rem;
        justify-content: center;
        margin-bottom: 2.5rem; flex-wrap: wrap;
      }
      .fleet-search {
        position: relative; width: 100%; max-width: 300px;
      }
      .fleet-search i {
        position: absolute; left: 1rem; top: 50%;
        transform: translateY(-50%);
        color: var(--color-mid-gray); z-index: 1;
      }
      .fleet-search .form-input-gov { padding-left: 2.5rem; }
      .fleet-category-select { width: auto; min-width: 180px; }

      .fleet-results-header {
        display: flex; justify-content: space-between;
        align-items: center; margin-bottom: 1.5rem;
        flex-wrap: wrap; gap: 0.5rem;
      }
      .fleet-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
      }

      /* Cards */
      .aircraft-card {
        background: var(--color-white);
        border: 1px solid var(--color-light-gray);
        border-radius: var(--radius-md);
        overflow: hidden;
        transition: all var(--transition-base);
        position: relative;
      }
      .aircraft-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-4px);
        border-color: rgba(15,45,94,0.12);
      }
      .aircraft-card__image {
        position: relative; height: 200px;
        overflow: hidden; background: var(--color-off-white);
      }
      .aircraft-card__image img {
        width: 100%; height: 100%; object-fit: cover;
        transition: transform 0.4s ease;
      }
      .aircraft-card:hover .aircraft-card__image img {
        transform: scale(1.04);
      }
      .aircraft-card__placeholder {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        font-size: 3rem; color: var(--color-mid-gray);
      }
      .aircraft-card__badge { position: absolute; top: 1rem; left: 1rem; }
      .aircraft-card__body { padding: 1.5rem; }
      .aircraft-card__title {
        font-family: var(--font-heading); font-size: 1.1rem;
        font-weight: 600; color: var(--color-navy); margin-bottom: 0.2rem;
      }
      .aircraft-card__operator {
        font-family: var(--font-label); font-size: 0.72rem;
        color: var(--color-gold-dark); margin-bottom: 1rem; font-weight: 600;
      }
      .aircraft-card__specs { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
      .aircraft-card__spec {
        display: flex; align-items: center; gap: 0.35rem;
        font-family: var(--font-label); font-size: 0.78rem;
        color: var(--color-mid-gray);
      }
      .aircraft-card__spec i { color: var(--color-gold); font-size: 0.82rem; }
      .aircraft-card__price {
        font-family: var(--font-heading); font-size: 1.1rem;
        font-weight: 700; color: var(--color-navy); margin-bottom: 1rem;
      }
      .aircraft-card__price small {
        font-family: var(--font-label); font-size: 0.7rem;
        font-weight: 400; color: var(--color-mid-gray);
      }
      .aircraft-card__actions {
        display: flex; gap: 0.75rem;
        margin-top: 1rem; padding-top: 1rem;
        border-top: 1px solid var(--color-light-gray);
      }

      /* CTA */
      .fleet-cta {
        margin-top: 3rem; padding: 3rem;
        text-align: center;
        background: var(--color-navy);
        border-radius: var(--radius-lg);
        position: relative; overflow: hidden;
      }
      .fleet-cta::before {
        content: ''; position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(201,153,46,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,153,46,0.04) 1px, transparent 1px);
        background-size: 48px 48px; pointer-events: none;
      }
      .fleet-cta h3 { color: var(--color-white); margin-bottom: 0.5rem; position: relative; z-index: 1; }
      .fleet-cta p {
        color: rgba(255,255,255,0.6); margin-bottom: 1.5rem;
        max-width: 500px; margin-left: auto; margin-right: auto;
        position: relative; z-index: 1;
      }
      .fleet-cta__actions {
        display: flex; gap: 1rem;
        justify-content: center; flex-wrap: wrap;
        position: relative; z-index: 1;
      }

      @media (max-width: 768px) {
        .fleet-filters { flex-direction: column; align-items: stretch; }
        .fleet-search  { max-width: 100%; }
        .fleet-category-select { width: 100%; }
        .fleet-grid    { grid-template-columns: 1fr; }
        .fleet-cta     { padding: 2rem; }
        .fleet-cta__actions { flex-direction: column; }
        .fleet-cta__actions a { width: 100%; justify-content: center; }
      }
    `}</style>
  );
}