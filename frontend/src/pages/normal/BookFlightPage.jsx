// src/pages/public/BookFlightPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { bookingAPI, catalogAPI } from '../../services/api';

const CATEGORIES = ['light', 'midsize', 'super_midsize', 'heavy', 'ultra_long', 'vip_airliner', 'turboprop', 'helicopter'];
const TRIP_TYPES = [['one_way', 'One Way'], ['round_trip', 'Round Trip'], ['multi_leg', 'Multi-Leg']];

const CATEGORY_NAMES = {
  'light': 'Light Jets',
  'midsize': 'Midsize Jets',
  'super_midsize': 'Super Midsize',
  'heavy': 'Heavy Jets',
  'ultra_long': 'Ultra Long Range',
  'vip_airliner': 'VIP Airliners',
  'turboprop': 'Turboprops',
  'helicopter': 'Helicopters'
};

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Book a Private Jet Charter | NairobiJetHouse',
  description: 'Request a private jet charter quote. Fill out our simple form and receive a personalised quote within 2-4 hours.',
};

/* ─── Airport Combobox ────────────────────────────────────────────────────── */
function AirportCombobox({ airports, value, onChange, placeholder, required }) {
  // value is an airport ID; we need to display the label
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Resolve display label from current value ID
  const selectedAirport = airports.find(a => a.id === value || String(a.id) === String(value));

  // When value changes externally (e.g. form reset), sync query
  useEffect(() => {
    if (!value) {
      setQuery('');
    } else if (selectedAirport) {
      setQuery(`${selectedAirport.code} – ${selectedAirport.name}, ${selectedAirport.city}`);
    }
  }, [value]);

  const filtered = query.length >= 2
    ? airports.filter(a => {
        const q = query.toLowerCase();
        return (
          a.code?.toLowerCase().includes(q) ||
          a.name?.toLowerCase().includes(q) ||
          a.city?.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  const selectAirport = (airport) => {
    onChange(airport.id);
    setQuery(`${airport.code} – ${airport.name}, ${airport.city}`);
    setOpen(false);
    setHighlighted(0);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    setHighlighted(0);
    // Clear selection if user edits the text
    if (value) onChange('');
  };

  const handleKeyDown = (e) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlighted]) selectAirport(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleBlur = (e) => {
    // Delay close so click on list item registers first
    setTimeout(() => {
      setOpen(false);
      // If nothing valid selected, clear the query
      if (!value) setQuery('');
    }, 150);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="form-control"
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (query.length >= 2) setOpen(true); }}
        onBlur={handleBlur}
        placeholder={placeholder || 'Type 2+ letters to search…'}
        required={required}
        autoComplete="off"
      />
      {/* Hidden input to carry the actual ID value for form validation */}
      <input type="hidden" value={value || ''} />

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--white, #fff)',
            border: '1px solid var(--gray-200, #e5e7eb)',
            borderRadius: '0.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            margin: 0,
            padding: '0.25rem 0',
            listStyle: 'none',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {filtered.map((a, i) => (
            <li
              key={a.id}
              onMouseDown={() => selectAirport(a)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                background: i === highlighted ? 'var(--navy-50, #f0f4ff)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'background 0.1s',
              }}
            >
              <span style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.05em',
                color: 'var(--navy, #1a2e52)',
                minWidth: '2.5rem',
              }}>
                {a.code}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-700, #374151)' }}>
                {a.name}
                <span style={{ color: 'var(--gray-400, #9ca3af)', marginLeft: '0.35rem' }}>
                  {a.city}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && query.length >= 2 && filtered.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'var(--white, #fff)',
          border: '1px solid var(--gray-200, #e5e7eb)',
          borderRadius: '0.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          color: 'var(--gray-400, #9ca3af)',
        }}>
          No airports found for "{query}"
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function BookFlightPage() {
  const [airports, setAirports] = useState([]);
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    trip_type: 'one_way', origin: '', destination: '',
    departure_date: '', departure_time: '', return_date: '',
    passenger_count: 1, preferred_category: '',
    special_requests: '', catering_requested: false,
    ground_transport_requested: false, concierge_requested: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    catalogAPI.airports({ limit: 100 }).then(r => setAirports(r.data.results || r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (form.trip_type !== 'round_trip') delete payload.return_date;
      const { data } = await bookingAPI.create(payload);
      setSuccess(data.booking?.reference);
    } catch (e) {
      setError(e.response?.data?.detail || 'Submission failed. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Booking Submitted | NairobiJetHouse</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <PublicNavbar />
        <section className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="success-wrap">
              <div className="success-icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>Booking Submitted</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                Our team will contact you within 2–4 hours with a tailored quote.
              </p>
              <div className="ref-box">
                <div className="ref-label">Reference Number</div>
                <div className="ref-value">{String(success).slice(0, 8).toUpperCase()}</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/track" className="btn btn-navy">
                  <i className="bi bi-search"></i> Track Your Booking
                </Link>
                <Link to="/" className="btn btn-outline-navy">
                  <i className="bi bi-house"></i> Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book a Private Jet | NairobiJetHouse - Charter Request</title>
        <meta name="description" content="Request a private jet charter quote. Fill out our simple form and receive a personalised quote within 2-4 hours. Worldwide private aviation." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/book-flight" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Charter a Private Jet</div>
          <h1>Request Your <em style={{ color: 'var(--gold-light)' }}>Personalised Quote</em></h1>
          <p style={{ maxWidth: 560, marginTop: '0.5rem' }}>
            Complete the form below and our aviation specialists will respond within 2–4 hours with a tailored quote.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>
            {/* Contact Information */}
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-person"></i> Contact Information
                </div>
              </div>
              <div className="detail-card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="req">*</span></label>
                    <input
                      className="form-control"
                      value={form.guest_name}
                      onChange={e => set('guest_name', e.target.value)}
                      required
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="req">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.guest_email}
                      onChange={e => set('guest_email', e.target.value)}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={form.guest_phone}
                      onChange={e => set('guest_phone', e.target.value)}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      className="form-control"
                      value={form.company}
                      onChange={e => set('company', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-airplane"></i> Flight Details
                </div>
              </div>
              <div className="detail-card-body">
                {/* Trip Type Selection */}
                <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
                  {TRIP_TYPES.map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      className={`tab-btn ${form.trip_type === v ? 'active' : ''}`}
                      onClick={() => set('trip_type', v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">From <span className="req">*</span></label>
                    {airports.length ? (
                      <AirportCombobox
                        airports={airports}
                        value={form.origin}
                        onChange={v => set('origin', v)}
                        placeholder="Type city or airport code…"
                        required
                      />
                    ) : (
                      <input
                        className="form-control"
                        placeholder="Origin airport / city"
                        value={form.origin}
                        onChange={e => set('origin', e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">To <span className="req">*</span></label>
                    {airports.length ? (
                      <AirportCombobox
                        airports={airports}
                        value={form.destination}
                        onChange={v => set('destination', v)}
                        placeholder="Type city or airport code…"
                        required
                      />
                    ) : (
                      <input
                        className="form-control"
                        placeholder="Destination airport / city"
                        value={form.destination}
                        onChange={e => set('destination', e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departure Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.departure_date}
                      onChange={e => set('departure_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departure Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={form.departure_time}
                      onChange={e => set('departure_time', e.target.value)}
                    />
                  </div>
                  {form.trip_type === 'round_trip' && (
                    <div className="form-group">
                      <label className="form-label">Return Date <span className="req">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.return_date}
                        onChange={e => set('return_date', e.target.value)}
                        min={form.departure_date || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Passengers <span className="req">*</span></label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      className="form-control"
                      value={form.passenger_count}
                      onChange={e => set('passenger_count', parseInt(e.target.value))}
                      required
                    />
                    <span className="form-hint">Maximum 200 passengers per aircraft</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Preferred Aircraft Category</label>
                  <select
                    className="form-control"
                    value={form.preferred_category}
                    onChange={e => set('preferred_category', e.target.value)}
                  >
                    <option value="">No preference — we'll recommend the best fit</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{CATEGORY_NAMES[c]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Add-on Services */}
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-stars"></i> Add-on Services
                </div>
              </div>
              <div className="detail-card-body">
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {[
                    ['catering_requested', 'bi-cup-hot', 'In-Flight Catering'],
                    ['ground_transport_requested', 'bi-car-front', 'Ground Transport'],
                    ['concierge_requested', 'bi-headset', 'Concierge Service'],
                  ].map(([k, icon, label]) => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form[k]}
                        onChange={e => set(k, e.target.checked)}
                      />
                      <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }}></i>
                      <span style={{ fontSize: '0.875rem' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="detail-card" style={{ marginBottom: '1.5rem' }}>
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-chat-text"></i> Special Requests
                </div>
              </div>
              <div className="detail-card-body">
                <div className="form-group">
                  <label className="form-label">Special Requests or Preferences</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.special_requests}
                    onChange={e => set('special_requests', e.target.value)}
                    placeholder="Dietary requirements, specific aircraft preferences, occasions to celebrate, or any other details we should know..."
                  />
                  <span className="form-hint">We'll do our best to accommodate all requests</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-navy btn-lg btn-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: 'white' }}></span>
                    &nbsp; Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Submit Charter Request
                  </>
                )}
              </button>
              <p className="text-center text-sm" style={{ marginTop: '1rem', color: 'var(--gray-400)' }}>
                <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 2-4 hours.
              </p>
            </div>
          </form>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}