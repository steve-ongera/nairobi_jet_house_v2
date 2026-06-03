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

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Book a Private Jet Charter | NairobiJetHouse',
  description: 'Request a private jet charter quote. Fill out our simple form and receive a personalised quote within 2-4 hours.',
};

/* ─── Airport Combobox ────────────────────────────────────────────────────── */
function AirportCombobox({ airports, value, onChange, placeholder, required }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selectedAirport = airports.find(a => a.id === value || String(a.id) === String(value));

  useEffect(() => {
    if (!value) {
      setQuery('');
    } else if (selectedAirport) {
      setQuery(`${selectedAirport.code} – ${selectedAirport.name}, ${selectedAirport.city}`);
    }
  }, [value, selectedAirport]);

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

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      if (!value) setQuery('');
    }, 150);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="form-input-gov"
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
            background: 'var(--color-white)',
            border: '1px solid var(--color-light-gray)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
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
                background: i === highlighted ? 'var(--color-off-white)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span className="badge-gov" style={{ minWidth: '2.5rem', textAlign: 'center' }}>
                {a.code}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-dark-gray)' }}>
                {a.name}
                <span style={{ color: 'var(--color-mid-gray)', marginLeft: '0.35rem' }}>
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
          background: 'var(--color-white)',
          border: '1px solid var(--color-light-gray)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          color: 'var(--color-mid-gray)',
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
        <section className="section-padding" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="booking-success">
              <div className="booking-success__icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Booking Submitted</h2>
              <p style={{ color: 'var(--color-mid-gray)', marginBottom: '1.5rem' }}>
                Our team will contact you within 2–4 hours with a tailored quote.
              </p>
              <div className="booking-success__ref">
                <div className="booking-success__ref-label">Reference Number</div>
                <div className="booking-success__ref-value">{String(success).slice(0, 8).toUpperCase()}</div>
              </div>
              <div className="booking-success__actions">
                <Link to="/track" className="btn-primary-gov">
                  <i className="bi bi-search"></i> Track Your Booking
                </Link>
                <Link to="/" className="btn-outline-gov">
                  <i className="bi bi-house"></i> Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
        <PublicFooter />

        <style>{`
          .booking-success {
            text-align: center;
            max-width: 500px;
            margin: 0 auto;
          }
          .booking-success__icon {
            width: 80px;
            height: 80px;
            background: rgba(26,127,90,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }
          .booking-success__icon i {
            font-size: 2.5rem;
            color: var(--color-success);
          }
          .booking-success__ref {
            background: var(--color-off-white);
            border: 1px solid var(--color-light-gray);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .booking-success__ref-label {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: var(--color-gold);
            margin-bottom: 0.25rem;
          }
          .booking-success__ref-value {
            font-family: monospace;
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--color-navy);
          }
          .booking-success__actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          @media (max-width: 480px) {
            .booking-success__actions {
              flex-direction: column;
            }
            .booking-success__actions a {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
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

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">Charter a Private Jet</span>
          <h1>Request Your <em style={{ color: 'var(--color-gold-light)' }}>Personalised Quote</em></h1>
          <p>Complete the form below and our aviation specialists will respond within 2–4 hours with a tailored quote.</p>
        </div>
      </div>

      {/* Form Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container" style={{ maxWidth: 820 }}>

          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit}>
            {/* Contact Information */}
            <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
              <div className="booking-card__header">
                <i className="bi bi-person"></i> Contact Information
              </div>
              <div className="booking-card__body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-gov">Full Name <span className="required">*</span></label>
                    <input
                      className="form-input-gov"
                      value={form.guest_name}
                      onChange={e => set('guest_name', e.target.value)}
                      required
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Email <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-input-gov"
                      value={form.guest_email}
                      onChange={e => set('guest_email', e.target.value)}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Phone</label>
                    <input
                      className="form-input-gov"
                      value={form.guest_phone}
                      onChange={e => set('guest_phone', e.target.value)}
                      placeholder="+254724878136"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Company</label>
                    <input
                      className="form-input-gov"
                      value={form.company}
                      onChange={e => set('company', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
              <div className="booking-card__header">
                <i className="bi bi-airplane"></i> Flight Details
              </div>
              <div className="booking-card__body">
                {/* Trip Type Selection */}
                <div className="tabs-gov" style={{ marginBottom: '1.5rem' }}>
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-gov">From <span className="required">*</span></label>
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
                        className="form-input-gov"
                        placeholder="Origin airport / city"
                        value={form.origin}
                        onChange={e => set('origin', e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">To <span className="required">*</span></label>
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
                        className="form-input-gov"
                        placeholder="Destination airport / city"
                        value={form.destination}
                        onChange={e => set('destination', e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Departure Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input-gov"
                      value={form.departure_date}
                      onChange={e => set('departure_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-gov">Departure Time</label>
                    <input
                      type="time"
                      className="form-input-gov"
                      value={form.departure_time}
                      onChange={e => set('departure_time', e.target.value)}
                    />
                  </div>
                  {form.trip_type === 'round_trip' && (
                    <div className="form-group">
                      <label className="form-label-gov">Return Date <span className="required">*</span></label>
                      <input
                        type="date"
                        className="form-input-gov"
                        value={form.return_date}
                        onChange={e => set('return_date', e.target.value)}
                        min={form.departure_date || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label-gov">Passengers <span className="required">*</span></label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      className="form-input-gov"
                      value={form.passenger_count}
                      onChange={e => set('passenger_count', parseInt(e.target.value))}
                      required
                    />
                    <div className="form-hint">Maximum 200 passengers per aircraft</div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label-gov">Preferred Aircraft Category</label>
                  <select
                    className="form-input-gov"
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
            <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
              <div className="booking-card__header">
                <i className="bi bi-stars"></i> Add-on Services
              </div>
              <div className="booking-card__body">
                <div className="checkbox-group">
                  {[
                    ['catering_requested', 'bi-cup-hot', 'In-Flight Catering'],
                    ['ground_transport_requested', 'bi-car-front', 'Ground Transport'],
                    ['concierge_requested', 'bi-headset', 'Concierge Service'],
                  ].map(([k, icon, label]) => (
                    <label key={k} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form[k]}
                        onChange={e => set(k, e.target.checked)}
                      />
                      <i className={`bi ${icon}`} style={{ color: 'var(--color-gold)' }}></i>
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
              <div className="booking-card__header">
                <i className="bi bi-chat-text"></i> Special Requests
              </div>
              <div className="booking-card__body">
                <div className="form-group">
                  <label className="form-label-gov">Special Requests or Preferences</label>
                  <textarea
                    className="form-input-gov"
                    rows={4}
                    value={form.special_requests}
                    onChange={e => set('special_requests', e.target.value)}
                    placeholder="Dietary requirements, specific aircraft preferences, occasions to celebrate, or any other details we should know..."
                  />
                  <div className="form-hint">We'll do our best to accommodate all requests</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn-primary-gov btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner-gov spinner-sm" style={{ borderTopColor: 'white' }}></div>
                    &nbsp; Submitting Request...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Submit Charter Request
                  </>
                )}
              </button>
              <p className="text-center" style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-mid-gray)' }}>
                <i className="bi bi-shield-check"></i> Your information is secure. We'll respond within 2-4 hours.
              </p>
            </div>
          </form>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .booking-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        
        .booking-card__header {
          background: var(--color-navy);
          color: var(--color-white);
          padding: 1rem 1.5rem;
          font-family: var(--font-label);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .booking-card__header i {
          color: var(--color-gold);
          font-size: 1rem;
        }
        
        .booking-card__body {
          padding: 1.5rem;
        }
        
        .checkbox-group {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--color-dark-gray);
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 17px;
          height: 17px;
          accent-color: var(--color-navy);
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .booking-card__body {
            padding: 1rem;
          }
          
          .checkbox-group {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}